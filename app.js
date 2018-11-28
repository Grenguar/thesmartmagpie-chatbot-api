const ApiBuilder = require('claudia-api-builder'),
  api = new ApiBuilder();

module.exports = api;


api.post('/hello', function () {
  return {
		"replies": [
			{
				"type": "text",
				"content": "Test success!"
			}
		]
	};
},{
  success: { contentType: 'application/json' },
  error: { code: 500 }
});



