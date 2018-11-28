const ApiBuilder = require('claudia-api-builder'),
	api = new ApiBuilder(),
	AWS = require('aws-sdk'),
	translate = new AWS.Translate(),
	BOT_TOKEN = process.env.BOT_TOKEN,
	recastai = require('recastai').default,
	request = new recastai.request(BOT_TOKEN, 'en');

module.exports = api;

api.post('/translate', (req, res) => {
	const originalMessage = req.body.nlp.source;
	const conversationId = req.body.conversation.id;

	let testString = 'Jag älskar banana';
	return getTranslatedMessage(originalMessage)
		.then(result => replyObject(result));
},{
  success: { contentType: 'application/json' },
  error: { code: 500 }
});

function getTranslatedMessage(message) {
	let result = new Promise(function(resolve, reject){
		let params = {
			'Text': message,
			'SourceLanguageCode': 'auto', 
			'TargetLanguageCode': 'en',
		};
		translate.translateText(params, function(err, data) {
			if (err) {
				console.log(err, err.stack);
				reject(err);
			}
			else {
				console.log(data);
				resolve(data.TranslatedText);
			}
				
		});
	});
	return result;
}

function getMessage(message) {
	return message;
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