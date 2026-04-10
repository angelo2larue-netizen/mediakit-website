// YUKIA — Stripe product catalog reader
// Fetches active products from Stripe and returns a clean JSON list
// the frontend can render as drop cards.
//
// Add ?debug=1 to the URL to get extra diagnostic info.
//
// Optional Stripe metadata (set on each product):
//   subtitle      → text under the title (default: "DROP 04")
//   color         → lime | pink | orange | cyan | purple
//   sold_out      → "true" to mark as SOLD OUT
//   number        → card number (default: 001, 002, ...)
//   order         → numeric, sorts the list (lower = first)
//   extra_images  → comma-separated extra image filenames or URLs
//                   Filenames are resolved against /assets/images/products/
//                   Example: "jogger-back.jpg, jogger-detail.jpg"
//                   Or full URLs: "https://i.imgur.com/abc.jpg"

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const COLORS = ['lime', 'pink', 'orange', 'cyan', 'purple'];

async function stripeGet(secretKey, path) {
  const resp = await fetch(`https://api.stripe.com/v1${path}`, {
    headers: { 'Authorization': `Bearer ${secretKey}` },
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(data.error?.message || `Stripe ${resp.status}`);
  return data;
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' };
  }

  const debug = event.queryStringParameters && event.queryStringParameters.debug === '1';

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: 'STRIPE_SECRET_KEY not set on Netlify.' }),
    };
  }

  try {
    // 1. Fetch all active products
    const productsResp = await stripeGet(secretKey, '/products?active=true&limit=100');
    const rawProducts = productsResp.data || [];

    // 2. Fetch all active prices in one go
    const pricesResp = await stripeGet(secretKey, '/prices?active=true&limit=100');
    const rawPrices = pricesResp.data || [];

    // Group prices by product id
    const pricesByProduct = {};
    for (const pr of rawPrices) {
      const pid = typeof pr.product === 'string' ? pr.product : pr.product?.id;
      if (!pid) continue;
      if (!pricesByProduct[pid]) pricesByProduct[pid] = [];
      pricesByProduct[pid].push(pr);
    }

    // 3. Build catalog
    const products = [];
    const skipped = [];
    rawProducts.forEach((p, idx) => {
      // Find a usable price: prefer default_price, else first one-time price, else first price
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
      // Combine Stripe-hosted images with extras hosted in the GitHub repo.
      // Extras are listed in the `extra_images` metadata as a comma-separated string.
      // Each entry is either a full URL (http/https) or a filename, which is
      // resolved to /assets/images/products/<filename>.
      const stripeImages = Array.isArray(p.images) ? p.images.filter(Boolean) : [];
      const extras = (meta.extra_images || '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
        .map(entry => {
          if (/^https?:\/\//i.test(entry)) return entry;
          // Normalize: lowercase + accept .jpg/.jpeg interchangeably
          let fname = entry.toLowerCase();
          // If someone wrote .jpg but the real file is .jpeg (or vice versa)
          // we leave it as-is; filesystem match is exact. Normalizing case
          // handles 99% of the uploads.
          return `/assets/images/products/${fname}`;
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
        firstRawProduct: rawProducts[0] || null,
      };
    }

    return {
      statusCode: 200,
      headers: {
        ...CORS,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
      body: JSON.stringify(body),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: err.message || 'Unknown server error' }),
    };
  }
};
