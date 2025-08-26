// File: netlify/functions/create-checkout-session.js
// Debug version with detailed logging

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
    // Log environment check
    console.log('Environment check:');
    console.log('STRIPE_SECRET_KEY present:', !!process.env.STRIPE_SECRET_KEY);
    console.log('STRIPE_SECRET_KEY length:', process.env.STRIPE_SECRET_KEY?.length);
    console.log('SUPABASE_URL present:', !!process.env.SUPABASE_URL);
    
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

    // Initialize Stripe
    console.log('Initializing Stripe...');
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    console.log('Stripe initialized successfully');
    
    // Log session creation attempt
    console.log('Creating checkout session with:');
    console.log('- Price ID: price_18yxfZDogAfrEsaNSZuJ3');
    console.log('- Customer email:', customer_email);
    console.log('- Customer name:', customer_name);
    console.log('- Company:', company);
    console.log('- Origin:', event.headers.origin);
    
    const sessionData = {
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
