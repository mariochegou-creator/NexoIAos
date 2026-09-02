// Voz via OpenAI: /api/tts (texto → áudio natural, gpt-4o-mini-tts) e
// /api/stt (áudio → texto, gpt-4o-mini-transcribe). Sem OPENAI_API_KEY as rotas
// respondem 501 e o cliente cai no fallback do navegador.

import type { FastifyInstance } from 'fastify';

const OPENAI_KEY = process.env.OPENAI_API_KEY || '';

export function voiceEnabled(): boolean {
  return Boolean(OPENAI_KEY);
}

const TTS_INSTRUCTIONS =
  'Dono de negócio brasileiro do interior da Bahia falando ao telefone, no meio do expediente. ' +
  'Fala RÁPIDA e fluida, como conversa real — sem pausas longas, sem articular demais, sem tom de locutor ou de assistente. ' +
  'Português brasileiro coloquial, emendando as palavras naturalmente.';

const VOZES_VALIDAS = new Set([
  'alloy', 'ash', 'ballad', 'coral', 'echo', 'fable', 'nova', 'onyx', 'sage', 'shimmer',
]);

export function registerVoiceRoutes(app: FastifyInstance): void {
  app.post<{ Body: { texto: string; voz?: string } }>('/api/tts', async (req, reply) => {
    if (!OPENAI_KEY) return reply.code(501).send({ error: 'OPENAI_API_KEY não configurada' });
    const texto = (req.body?.texto ?? '').trim();
    if (!texto) return reply.code(400).send({ error: 'texto vazio' });
    const voz = VOZES_VALIDAS.has(req.body?.voz ?? '') ? req.body!.voz! : 'ash';

    const res = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: { authorization: `Bearer ${OPENAI_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini-tts',
        voice: voz,
        input: texto,
        instructions: TTS_INSTRUCTIONS,
        speed: 1.15,
        response_format: 'mp3',
      }),
    });
    if (!res.ok) {
      const detalhe = await res.text();
      req.log.error({ detalhe }, 'TTS falhou');
      return reply.code(502).send({ error: 'TTS falhou' });
    }
    const audio = Buffer.from(await res.arrayBuffer());
    return reply.type('audio/mpeg').send(audio);
  });

  app.post('/api/stt', async (req, reply) => {
    if (!OPENAI_KEY) return reply.code(501).send({ error: 'OPENAI_API_KEY não configurada' });
    const audio = req.body as Buffer;
    if (!audio || !Buffer.isBuffer(audio) || audio.length < 100) {
      return reply.code(400).send({ error: 'áudio vazio' });
    }
    const tipo = (req.headers['content-type'] as string) || 'audio/webm';
    // A OpenAI infere o formato pela EXTENSÃO do nome do arquivo — tem que bater com o tipo
    const ext = tipo.includes('mpeg')
      ? 'mp3'
      : tipo.includes('mp4')
        ? 'mp4'
        : tipo.includes('wav')
          ? 'wav'
          : tipo.includes('ogg')
            ? 'ogg'
            : 'webm';
    const form = new FormData();
    form.append('file', new Blob([new Uint8Array(audio)], { type: tipo }), `fala.${ext}`);
    form.append('model', 'gpt-4o-mini-transcribe');
    form.append('language', 'pt');
    form.append(
      'prompt',
      'Ligação de vendas da Nexo IA com dono de negócio local do interior da Bahia. Termos: R1, R2, Google Meu Negócio, WhatsApp, Instagram, iFood.',
    );

    const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { authorization: `Bearer ${OPENAI_KEY}` },
      body: form,
    });
    if (!res.ok) {
      const detalhe = await res.text();
      req.log.error({ detalhe }, 'STT falhou');
      return reply.code(502).send({ error: 'transcrição falhou' });
    }
    const json = (await res.json()) as { text?: string };
    return { texto: (json.text ?? '').trim() };
  });
}
