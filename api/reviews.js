export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { api_token, page = 1, per_page = 100, product_id } = req.query;
  if (!api_token) return res.status(400).json({ error: 'api_token is required' });

  const SHOP_DOMAIN = 'purestnest.myshopify.com';

  const url = new URL('https://judge.me/api/v1/reviews');
  url.searchParams.set('api_token', api_token);
  url.searchParams.set('shop_domain', SHOP_DOMAIN);
  url.searchParams.set('per_page', String(per_page));
  url.searchParams.set('page', String(page));
  if (product_id) url.searchParams.set('product_id', product_id);

  try {
    const upstream = await fetch(url.toString(), {
      headers: { 'Accept': 'application/json', 'User-Agent': 'ThePurestCo-ReviewMiner/1.0' },
    });

    if (!upstream.ok) {
      const errorText = await upstream.text();
      return res.status(upstream.status).json({ error: `Judge.me API error: ${upstream.status}`, detail: errorText });
    }

    // Parse JSON then re-serialize to guarantee clean UTF-8 output
    const data = await upstream.json();

    // Fix any double-encoded UTF-8 strings recursively
    function fixEncoding(obj) {
      if (typeof obj === 'string') {
        try {
          // Attempt to fix latin1-misread UTF-8 (common with Judge.me)
          return decodeURIComponent(escape(obj));
        } catch {
          return obj;
        }
      }
      if (Array.isArray(obj)) return obj.map(fixEncoding);
      if (obj && typeof obj === 'object') {
        const fixed = {};
        for (const [k, v] of Object.entries(obj)) fixed[k] = fixEncoding(v);
        return fixed;
      }
      return obj;
    }

    const fixed = fixEncoding(data);
    return res.status(200).json(fixed);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to reach Judge.me API', detail: err.message });
  }
}
