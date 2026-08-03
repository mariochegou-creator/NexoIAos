import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { registerSessionRoutes } from './routes/sessions.ts';

const app = Fastify({ logger: true });

const ACCESS_CODE = process.env.APP_ACCESS_CODE || '';

app.addHook('onRequest', async (req, reply) => {
  if (!ACCESS_CODE) return;
  if (!req.url.startsWith('/api/') || req.url === '/api/health') return;
  if (req.headers['x-access-code'] !== ACCESS_CODE) {
    return reply.code(401).send({ error: 'código de acesso inválido' });
  }
});

app.get('/api/health', async () => ({
  ok: true,
  anthropic: Boolean(process.env.ANTHROPIC_API_KEY),
  supabase: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY),
}));

registerSessionRoutes(app);

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
