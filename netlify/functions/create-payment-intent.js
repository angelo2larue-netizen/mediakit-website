// YUKIA — Stripe PaymentIntent creator
// Receives the cart from the browser, recomputes the total server-side
// (NEVER trust the price sent from the client), and creates a PaymentIntent.

// Server-side product catalog — the source of truth for prices.
// Keep this in sync with the data-id / data-price attributes in index.html.
const PRODUCTS = {
  'phantom-tee':    { name: 'PHANTOM TEE',    price: 8500  }, // amounts in cents
  'shadow-cargo':   { name: 'SHADOW CARGO',   price: 14500 },
  'revolt-hoodie':  { name: 'REVOLT HOODIE',  price: 17500 },
  'y2k-bomber':     { name: 'Y2K BOMBER',     price: 29500 },
  'kinetic-pants':  { name: 'KINETIC PANTS',  price: 22000 },
};

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS, body: 'Method Not Allowed' };
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: 'STRIPE_SECRET_KEY env var not set on Netlify.' }),
    };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Invalid JSON body.' }) };
  }

  const items = Array.isArray(payload.items) ? payload.items : [];
  if (items.length === 0) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Cart is empty.' }) };
  }

  // Recompute total from the server catalog — never trust client prices.
  let amount = 0;
  const lineNames = [];
  for (const item of items) {
    const product = PRODUCTS[item.id];
    if (!product) {
      return {
        statusCode: 400,
        headers: CORS,
        body: JSON.stringify({ error: `Unknown product: ${item.id}` }),
      };
    }
    const qty = Math.max(1, Math.min(99, parseInt(item.qty, 10) || 1));
    amount += product.price * qty;
    lineNames.push(`${product.name} x${qty}`);
  }

  if (amount < 50) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Amount too small.' }) };
  }

  // Build form-encoded body for Stripe API.
  const params = new URLSearchParams();
  params.append('amount', String(amount));
  params.append('currency', 'eur');
  params.append('automatic_payment_methods[enabled]', 'true');
  params.append('description', `YUKIA order: ${lineNames.join(', ')}`);

  const customer = payload.customer || {};
  if (customer.email) params.append('receipt_email', customer.email);
  if (customer.name) params.append('shipping[name]', customer.name);
  if (customer.address) params.append('shipping[address][line1]', customer.address);
  if (customer.city) params.append('shipping[address][city]', customer.city);
  if (customer.zip) params.append('shipping[address][postal_code]', customer.zip);
  params.append('shipping[address][country]', 'FR');

  // Useful metadata for the Stripe dashboard
  params.append('metadata[items]', lineNames.join(' | '));
  if (customer.email) params.append('metadata[customer_email]', customer.email);

  try {
    const resp = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });
    const data = await resp.json();
    if (!resp.ok) {
      return {
        statusCode: resp.status,
        headers: CORS,
        body: JSON.stringify({ error: data.error?.message || 'Stripe error' }),
      };
    }
    return {
      statusCode: 200,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientSecret: data.client_secret, amount }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: err.message || 'Unknown server error' }),
    };
  }
};
