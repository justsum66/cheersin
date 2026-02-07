#!/usr/bin/env node
/**
 * One-off test: OpenRouter + Pinecone.
 * Run: node scripts/test-keys.mjs [OPENROUTER_KEY] [PINECONE_KEY] [PINECONE_URL]
 * Or set env vars OPENROUTER_API_KEY, PINECONE_API_KEY, PINECONE_API_URL.
 */
const [,, openRouterKeyArg, pineconeKeyArg, pineconeUrlArg] = process.argv;
const openRouterKey = (openRouterKeyArg || process.env.OPENROUTER_API_KEY || '').trim();
const pineconeKey = (pineconeKeyArg || process.env.PINECONE_API_KEY || '').trim();
const pineconeUrl = (pineconeUrlArg || process.env.PINECONE_API_URL || '').trim().replace(/\/+$/, '');

async function testOpenRouter() {
  if (!openRouterKey) return { ok: false, msg: 'OPENROUTER_API_KEY not set' };
  try {
    const r = await fetch('https://openrouter.ai/api/v1/models', {
      headers: { Authorization: `Bearer ${openRouterKey}` },
    });
    const text = await r.text();
    return { ok: r.ok, status: r.status, body: text.slice(0, 200) };
  } catch (e) {
    return { ok: false, msg: e.message };
  }
}

async function testPinecone() {
  if (!pineconeKey || !pineconeUrl) return { ok: false, msg: 'PINECONE_API_KEY or PINECONE_API_URL not set' };
  const tryAuth = async (headers) => {
    const r = await fetch(`${pineconeUrl}/describe_index_stats`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Pinecone-Api-Version': '2025-10', ...headers },
      body: '{}',
    });
    return { ok: r.ok, status: r.status, body: (await r.text()).slice(0, 300) };
  };
  try {
    let out = await tryAuth({ 'Api-Key': pineconeKey });
    if (!out.ok && pineconeKey.startsWith('pcsk_')) {
      const bearer = await tryAuth({ 'Authorization': `Bearer ${pineconeKey}` });
      if (bearer.ok) return bearer;
    }
    return out;
  } catch (e) {
    return { ok: false, msg: e.message };
  }
}

const [or, pc] = await Promise.all([testOpenRouter(), testPinecone()]);
console.log(JSON.stringify({ OpenRouter: or, Pinecone: pc }, null, 2));
