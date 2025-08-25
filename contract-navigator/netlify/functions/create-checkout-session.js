exports.handler = async (event, context) => {
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  const { customer_name, customer_email, company } = JSON.parse(event.body);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{ price: 'ACTUAL_WORKING_PRICE_ID_HERE', quantity: 1 }],
    mode: 'subscription',
    success_url: `${event.headers.origin}/success.html?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${event.headers.origin}/`,
    customer_email: customer_email,
  });

  return {
    statusCode: 200,
    body: JSON.stringify({ sessionId: session.id }),
  };
};
