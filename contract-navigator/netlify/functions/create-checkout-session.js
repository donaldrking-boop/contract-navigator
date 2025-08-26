exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    };
  }

  const { customer_name, customer_email, company } = JSON.parse(event.body);

  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: 'price_18yxfZDogAfrEsaNSZuJ3',
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${event.headers.origin}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${event.headers.origin}/`,
      customer_email: customer_email,
      metadata: {
        customer_name: customer_name,
        company: company
      }
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        sessionId: session.id,
      }),
    };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

