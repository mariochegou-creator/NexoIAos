import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { registerSessionRoutes } from './routes/sessions.ts';
import { registerVoiceRoutes, voiceEnabled } from './routes/voice.ts';
import { authEnabled, loginCRM, validarToken } from './auth.ts';

const app = Fastify({ logger: true, bodyLimit: 26_214_400 });

// Áudio bruto do push-to-talk chega como buffer
app.addContentTypeParser(
  ['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'application/octet-stream'],
  { parseAs: 'buffer' },
  (_req, body, done) => done(null, body),
);

// Só colaborador entra: login com o mesmo e-mail/senha do CRM
app.addHook('onRequest', async (req, reply) => {
  if (!authEnabled()) return;
  if (!req.url.startsWith('/api/')) return;
  if (req.url === '/api/health' || req.url === '/api/login') return;
  const token = (req.headers.authorization ?? '').replace(/^Bearer\s+/i, '');
  if (!token || !(await validarToken(token))) {
    return reply.code(401).send({ error: 'faça login com seu e-mail e senha do CRM' });
  }
});

app.post<{ Body: { email: string; senha: string } }>('/api/login', async (req, reply) => {
  if (!authEnabled()) return reply.code(501).send({ error: 'login não configurado' });
  const { email, senha } = req.body ?? {};
  if (!email || !senha) return reply.code(400).send({ error: 'informe e-mail e senha' });
  const res = await loginCRM(email.trim(), senha);
  if ('erro' in res) return reply.code(401).send({ error: res.erro });
  return res;
});

app.get('/api/health', async () => ({
  ok: true,
  anthropic: Boolean(process.env.ANTHROPIC_API_KEY),
  supabase: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY),
  voz: voiceEnabled(),
  login: authEnabled(),
}));

registerSessionRoutes(app);
registerVoiceRoutes(app);

// Frontend buildado (client/dist) servido pelo próprio Fastify
const clientDist = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'client', 'dist');
if (existsSync(clientDist)) {
  app.register(fastifyStatic, { root: clientDist });
  app.setNotFoundHandler((req, reply) => {
    if (req.url.startsWith('/api/')) return reply.code(404).send({ error: 'rota não encontrada' });
    return reply.sendFile('index.html');
  });
} else {
  app.log.warn(`client/dist não encontrado (${clientDist}) — rode "npm run build -w client"`);
}

const port = Number(process.env.PORT || 8787);
app
  .listen({ port, host: '0.0.0.0' })
  .then(() => app.log.info(`Nexo Treino ouvindo em :${port}`))
  .catch((err) => {
    app.log.error(err);
    process.exit(1);
  });
