// YUKIA — Vercel function: Stripe product catalog reader
// Endpoint: /api/list-products
//
// Add ?debug=1 for diagnostic info.
//
// Optional Stripe metadata (set on each product):
//   subtitle      → text under the title (default: "DROP 04")
//   color         → lime | pink | orange | cyan | purple
//   sold_out      → "true" to mark as SOLD OUT
//   number        → card number (default: 001, 002, ...)
//   order         → numeric, sorts the list (lower = first)
//   extra_images  → comma-separated extra image filenames or URLs

const COLORS = ['lime', 'pink', 'orange', 'cyan', 'purple'];

async function stripeGet(secretKey, path) {
  const resp = await fetch(`https://api.stripe.com/v1${path}`, {
    headers: { 'Authorization': `Bearer ${secretKey}` },
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(data.error?.message || `Stripe ${resp.status}`);
  return data;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const debug = req.query && req.query.debug === '1';

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return res.status(500).json({ error: 'STRIPE_SECRET_KEY not set on Vercel.' });
  }

  try {
    const productsResp = await stripeGet(secretKey, '/products?active=true&limit=100');
    const rawProducts = productsResp.data || [];

    const pricesResp = await stripeGet(secretKey, '/prices?active=true&limit=100');
    const rawPrices = pricesResp.data || [];

    const pricesByProduct = {};
    for (const pr of rawPrices) {
      const pid = typeof pr.product === 'string' ? pr.product : pr.product?.id;
      if (!pid) continue;
      if (!pricesByProduct[pid]) pricesByProduct[pid] = [];
      pricesByProduct[pid].push(pr);
    }

    const products = [];
    const skipped = [];
    rawProducts.forEach((p, idx) => {
      let price = null;
      if (p.default_price && typeof p.default_price === 'object') {
        price = p.default_price;
      } else if (p.default_price && typeof p.default_price === 'string') {
        price = (pricesByProduct[p.id] || []).find(pr => pr.id === p.default_price) || null;
      }
      if (!price) {
        const candidates = pricesByProduct[p.id] || [];
        price = candidates.find(pr => pr.type === 'one_time' && pr.unit_amount != null)
              || candidates.find(pr => pr.unit_amount != null)
              || null;
      }

      if (!price || price.unit_amount == null) {
        skipped.push({ id: p.id, name: p.name, reason: 'no usable price' });
        return;
      }

      const meta = p.metadata || {};
      const stripeImages = Array.isArray(p.images) ? p.images.filter(Boolean) : [];
      const extras = (meta.extra_images || '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
        .map(entry => {
          if (/^https?:\/\//i.test(entry)) return entry;
          return `/assets/images/products/${entry.toLowerCase()}`;
        });
      const images = [...stripeImages, ...extras];

      products.push({
        id: p.id,
        name: p.name,
        subtitle: meta.subtitle || 'DROP 04',
        description: p.description || '',
        image: images[0] || null,
        images,
        price: price.unit_amount,
        currency: price.currency,
        color: COLORS.includes(meta.color) ? meta.color : COLORS[idx % COLORS.length],
        number: meta.number || String(idx + 1).padStart(3, '0'),
        soldOut: String(meta.sold_out).toLowerCase() === 'true',
        order: meta.order != null ? Number(meta.order) : idx,
        priceId: price.id,
      });
    });

    products.sort((a, b) => a.order - b.order);

    const body = { products };
    if (debug) {
      body.debug = {
        keyMode: secretKey.startsWith('sk_live_') ? 'live' : (secretKey.startsWith('sk_test_') ? 'test' : 'unknown'),
        rawProductCount: rawProducts.length,
        rawPriceCount: rawPrices.length,
        usableProductCount: products.length,
        skipped,
      };
    }

    // Cache aggressively on Vercel CDN to minimize function invocations.
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).json(body);
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Unknown server error' });
  }
};
