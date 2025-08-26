exports.handler = async (event, context) => {
  console.log('Test function called');
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({ message: 'Test successful' }),
  };
};
