// YUKIA — Vercel function: Stripe PaymentIntent creator
// Endpoint: /api/create-payment-intent
// Recomputes the cart total server-side from live Stripe prices,
// then creates a PaymentIntent and returns its client_secret.

async function stripeGet(secretKey, path) {
  const resp = await fetch(`https://api.stripe.com/v1${path}`, {
    headers: { 'Authorization': `Bearer ${secretKey}` },
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(data.error?.message || 'Stripe error');
  return data;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return res.status(500).json({ error: 'STRIPE_SECRET_KEY env var not set on Vercel.' });
  }

  // Vercel parses JSON bodies automatically when Content-Type is application/json
  const payload = req.body || {};
  const items = Array.isArray(payload.items) ? payload.items : [];
  if (items.length === 0) {
    return res.status(400).json({ error: 'Cart is empty.' });
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
    return res.status(400).json({ error: err.message });
  }

  if (amount < 50) {
    return res.status(400).json({ error: 'Amount too small.' });
  }

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
      return res.status(resp.status).json({ error: data.error?.message || 'Stripe error' });
    }
    return res.status(200).json({ clientSecret: data.client_secret, amount, currency });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Unknown server error' });
  }
};
