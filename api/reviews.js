export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

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
    const data = await upstream.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to reach Judge.me API', detail: err.message });
  }
}
