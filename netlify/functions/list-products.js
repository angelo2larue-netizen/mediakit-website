// YUKIA — Stripe product catalog reader
// Fetches active products from Stripe and returns a clean JSON list
// the frontend can render as drop cards.
//
// Optional Stripe metadata you can set on each product:
//   subtitle  → text under the title (default: "DROP 04")
//   color     → lime | pink | orange | cyan | purple  (card variant)
//   sold_out  → "true" to mark as SOLD OUT
//   number    → card number to display (default: index)
//   order     → numeric, sorts the list (lower = first)

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const COLORS = ['lime', 'pink', 'orange', 'cyan', 'purple'];

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' };
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: 'STRIPE_SECRET_KEY not set on Netlify.' }),
    };
  }

  try {
    // Fetch active products with their default_price expanded
    const url = 'https://api.stripe.com/v1/products?active=true&limit=100&expand[]=data.default_price';
    const resp = await fetch(url, {
      headers: { 'Authorization': `Bearer ${secretKey}` },
    });
    const data = await resp.json();
    if (!resp.ok) {
      return {
        statusCode: resp.status,
        headers: CORS,
        body: JSON.stringify({ error: data.error?.message || 'Stripe error' }),
      };
    }

    const products = (data.data || [])
      .filter(p => p.default_price && p.default_price.unit_amount != null)
      .map((p, idx) => {
        const price = p.default_price;
        const meta = p.metadata || {};
        return {
          id: p.id,
          name: p.name,
          subtitle: meta.subtitle || 'DROP 04',
          description: p.description || '',
          image: (p.images && p.images[0]) || null,
          price: price.unit_amount,        // cents
          currency: price.currency,         // 'eur' typically
          color: COLORS.includes(meta.color) ? meta.color : COLORS[idx % COLORS.length],
          number: meta.number || String(idx + 1).padStart(3, '0'),
          soldOut: String(meta.sold_out).toLowerCase() === 'true',
          order: meta.order != null ? Number(meta.order) : idx,
        };
      })
      .sort((a, b) => a.order - b.order);

    return {
      statusCode: 200,
      headers: {
        ...CORS,
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60',
      },
      body: JSON.stringify({ products }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: err.message || 'Unknown server error' }),
    };
  }
};
