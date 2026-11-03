// 뉴스 읽기 훈련용 중계 서버 (Cloudflare Worker)
// - API 키는 이 코드에 넣지 않습니다. Cloudflare 설정의 비밀값(ANTHROPIC_API_KEY)에만 저장합니다.
// - 우리 프로그램 사이트에서 온 요청만 받고, 모델·글자 수를 제한해 다른 용도로 쓰이지 않게 합니다.

const ALLOWED_ORIGINS = ['https://gwangju365rehab.github.io'];
const ALLOWED_MODELS = ['claude-haiku-4-5-20251001'];
const MAX_TOKENS_CAP = 2000;

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const allowed = ALLOWED_ORIGINS.includes(origin);
    const cors = {
      'Access-Control-Allow-Origin': allowed ? origin : ALLOWED_ORIGINS[0],
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Vary': 'Origin'
    };
    const reply = (obj, status) => new Response(JSON.stringify(obj), {
      status, headers: { ...cors, 'Content-Type': 'application/json' }
    });

    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (request.method !== 'POST' || !allowed) return reply({ error: { message: '허용되지 않은 요청입니다.' } }, 403);
    if (!env.ANTHROPIC_API_KEY) return reply({ error: { message: '중계 서버에 API 키가 설정되지 않았습니다.' } }, 500);

    let body;
    try { body = await request.json(); } catch (e) { return reply({ error: { message: '요청 형식이 올바르지 않습니다.' } }, 400); }
    if (!Array.isArray(body.messages)) return reply({ error: { message: 'messages가 없습니다.' } }, 400);

    const model = ALLOWED_MODELS.includes(body.model) ? body.model : ALLOWED_MODELS[0];
    const maxTokens = Math.min(Number(body.max_tokens) || 1500, MAX_TOKENS_CAP);

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({ model, max_tokens: maxTokens, messages: body.messages })
    });
    return new Response(await res.text(), { status: res.status, headers: { ...cors, 'Content-Type': 'application/json' } });
  }
};
