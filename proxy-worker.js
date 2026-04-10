/**
 * Cloudflare Worker — OpenAI CORS Proxy for Karen English Tutor
 *
 * Deploy steps:
 *   1. Go to https://dash.cloudflare.com → Workers & Pages → Create application
 *   2. Paste this script, deploy
 *   3. Copy the worker URL (e.g. https://karen-proxy.your-name.workers.dev)
 *   4. In the app Settings → Proxy URL → paste the URL
 *
 * This worker forwards requests to api.openai.com and adds CORS headers,
 * allowing Telegram mobile WebView to reach the OpenAI API.
 *
 * Security: The worker only proxies to api.openai.com — it cannot be
 * used to reach arbitrary URLs. Your OpenAI API key travels encrypted
 * inside the Authorization header directly to OpenAI.
 */

const OPENAI_BASE = 'https://api.openai.com';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

export default {
  async fetch(request) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);

    // Only proxy paths that start with /v1/
    if (!url.pathname.startsWith('/v1/')) {
      return new Response('Not found', { status: 404, headers: CORS_HEADERS });
    }

    const targetUrl = `${OPENAI_BASE}${url.pathname}${url.search}`;

    // Forward the request to OpenAI
    const proxyRequest = new Request(targetUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body,
    });

    try {
      const response = await fetch(proxyRequest);

      // Clone response and add CORS headers
      const newHeaders = new Headers(response.headers);
      Object.entries(CORS_HEADERS).forEach(([k, v]) => newHeaders.set(k, v));

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: { message: err.message } }), {
        status: 502,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }
  },
};
