const ApiBuilder = require('claudia-api-builder'),
	api = new ApiBuilder(),
	AWS = require('aws-sdk'),
	translate = new AWS.Translate(),
	BOT_TOKEN = process.env.BOT_TOKEN,
	recastai = require('recastai').default,
	request = new recastai.request(BOT_TOKEN, 'en');
const infoMap = require("./datamap.js");

module.exports = api;

api.post('/translate', (req, res) => {
	const originalMessage = req.body.nlp.source;
	return getTranslatedMessage(originalMessage, 'auto', 'en')
		.then(translatedData => Promise.all([request.analyseText(translatedData.TranslatedText), translatedData.SourceLanguageCode]))
		.then(values => getTranslatedMessage(returnReplyAfterAnalyse(values[0]), 'en', values[1]))
		.then(translatedReply => replyObject(translatedReply.TranslatedText));
},{
  success: { contentType: 'application/json' },
  error: { code: 500 }
});

function getTranslatedMessage(message, sourceLang, targetLang) {
	let result = new Promise(function(resolve, reject){
		let params = {
			'Text': message,
			'SourceLanguageCode': sourceLang, 
			'TargetLanguageCode': targetLang,
		};
		translate.translateText(params, function(err, data) {
			if (err) {
				console.log(err, err.stack);
				reject(err);
			} else {
				console.log(data);
				resolve(data);
			}
				
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

function returnReplyAfterAnalyse(message) {
	const response = message.raw;
	let intentsArray = response.intents;
	if (intentsArray.length == 0) {
		return 'I will forward you to the agent';
	} else {
		intentsArray.sort((i1, i2) => i2.confidence - i1.confidence);
		return infoMap[intentsArray[0].slug];
	}
}