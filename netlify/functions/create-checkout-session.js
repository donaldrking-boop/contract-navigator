// File: netlify/functions/create-checkout-session.js
exports.handler = async (event, context) => {
  // Add CORS headers for all responses
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    console.log('Invalid method:', event.httpMethod);
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    // Parse request body
    const requestBody = JSON.parse(event.body);
    console.log('Request body:', requestBody);
    
    const { customer_name, customer_email, company } = requestBody;
    
    // Validate required fields
    if (!customer_email || !customer_name) {
      console.log('Missing required fields:', { customer_name, customer_email });
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields: name and email are required' }),
      };
    }

    // Initialize Stripe with test mode key
    console.log('Initializing Stripe...');
    const stripe = require('stripe')('sk_test_51RqLYw20qgAtFe5ak0aOwTUij1Rje9hysMp9kCngXa1WDkpu0wQndGJaZ9BOPeOQ5LEfnPxTvda8TwYGLyFWa0yy00T4UxNe74');
    console.log('Stripe initialized successfully');
    
    // Log session creation attempt - UPDATE THIS PRICE ID WITH YOUR TEST MODE PRICE
    console.log('Creating checkout session with test mode price');
    console.log('- Customer email:', customer_email);
    console.log('- Customer name:', customer_name);
    console.log('- Company:', company);
    
    const sessionData = {
      payment_method_types: ['card'],
      line_items: [
        {
          price: 'price_1SOEP0qb0ZGT9rQ27gtTzUh',
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${event.headers.origin}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${event.headers.origin}/`,
      customer_email: customer_email,
      metadata: {
        customer_name: customer_name,
        company: company || 'Not provided'
      }
    };
    
    console.log('Session data:', JSON.stringify(sessionData, null, 2));
    
    const session = await stripe.checkout.sessions.create(sessionData);
    console.log('Checkout session created successfully:', session.id);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        sessionId: session.id,
        url: session.url
      }),
    };
  } catch (error) {
    console.error('Detailed error:', {
      message: error.message,
      type: error.type,
      code: error.code,
      stack: error.stack
    });
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to create checkout session',
        details: error.message,
        type: error.type || 'unknown'
      }),
    };
  }
};
