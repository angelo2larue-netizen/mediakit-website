// YUKIA — Stripe PaymentIntent creator
// Receives the cart from the browser, recomputes the total server-side
// against live Stripe product prices (NEVER trust client prices), and
// creates a PaymentIntent.

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

async function stripeGet(secretKey, path) {
  const resp = await fetch(`https://api.stripe.com/v1${path}`, {
    headers: { 'Authorization': `Bearer ${secretKey}` },
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(data.error?.message || 'Stripe error');
  return data;
}

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

  // Recompute total from Stripe — never trust client prices.
  let amount = 0;
  let currency = null;
  const lineNames = [];
  try {
    for (const item of items) {
      if (!item.id || typeof item.id !== 'string') {
        throw new Error('Missing product id.');
      }
      const product = await stripeGet(secretKey, `/products/${encodeURIComponent(item.id)}?expand[]=default_price`);
      if (!product.active) throw new Error(`Product not available: ${product.name}`);
      if ((product.metadata || {}).sold_out === 'true') {
        throw new Error(`${product.name} is sold out.`);
      }
      const price = product.default_price;
      if (!price || price.unit_amount == null) {
        throw new Error(`No price set for ${product.name}.`);
      }
      const qty = Math.max(1, Math.min(99, parseInt(item.qty, 10) || 1));
      amount += price.unit_amount * qty;
      currency = currency || price.currency;
      lineNames.push(`${product.name} x${qty}`);
    }
  } catch (err) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: err.message }) };
  }

  if (amount < 50) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Amount too small.' }) };
  }

  // Build form-encoded body for Stripe API.
  const params = new URLSearchParams();
  params.append('amount', String(amount));
  params.append('currency', currency || 'eur');
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
      body: JSON.stringify({ clientSecret: data.client_secret, amount, currency }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: err.message || 'Unknown server error' }),
    };
  }
};
