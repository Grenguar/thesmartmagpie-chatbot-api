const ApiBuilder = require('claudia-api-builder'),
	api = new ApiBuilder(),
	request = require('request-promise')
	AWS = require('aws-sdk'),
	translate = new AWS.Translate();

module.exports = api;

api.post('/hello', function () {
	let testString = 'Jag älskar banana';
	return getTranslatedMessage(testString);
},{
  success: { contentType: 'application/json' },
  error: { code: 500 }
});

function getTranslatedMessage(message) {
	let result = new Promise(function(resolve, reject){
		let params = {
			'Text': message, /* required */
			'SourceLanguageCode': 'auto', /* required */
			'TargetLanguageCode': 'en', /* required */
		};
		translate.translateText(params, function(err, data) {
			if (err) console.log(err, err.stack);
			else     
				resolve(replyObject(data.TranslatedText));
		});
	});
	return result;
}

function replyObject(message) {
	return {
		"replies": [
			{
				"type": "text",
				"content": message
			}
		]
	}
}


