exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: 'Method Not Allowed' };
  }

  try {
    const { customer_name, customer_email, company } = JSON.parse(event.body);
    
    const stripe = require('stripe')('sk_test_51RqLYw20qgAtFe5ak0aOwTUij1Rje9hysMp9kCngXa1WDkpu0wQndGJaZ9BOPeOQ5LEfnPxTvda8TwYGLyFWa0yy00T4UxNe74');
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: 'price_1SOEP0qb0ZGT9rQ27gtTzUh',
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${event.headers.origin}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${event.headers.origin}/`,
      customer_email: customer_email,
      metadata: { customer_name, company: company || 'Not provided' }
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ sessionId: session.id }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
