const ApiBuilder = require('claudia-api-builder'),
	api = new ApiBuilder(),
	AWS = require('aws-sdk'),
	translate = new AWS.Translate(),
	BOT_TOKEN = process.env.BOT_TOKEN,
	recastai = require('recastai').default,
	request = new recastai.request(BOT_TOKEN, 'en'),
	docClient = new AWS.DynamoDB.DocumentClient();

module.exports = api;

api.post('/translate', (req, res) => {
	'use strict';
	const originalMessage = req.body.nlp.source;
	return getTranslatedMessage(originalMessage, 'auto', 'en')
		.then(translatedData => Promise.all([request.analyseText(translatedData.TranslatedText), translatedData.SourceLanguageCode]))
		.then(values => getTranslatedAnswerToUser(getIntentFromEngMessage(values[0]), values[1]))
		.then(translatedReply => replyObject(translatedReply));
},{
  success: { contentType: 'application/json' },
  error: { code: 500 }
});

function getTranslatedMessage(message, sourceLang, targetLang) {
	return result = new Promise(function(resolve, reject){
		let params = {
			Text : message,
			SourceLanguageCode : sourceLang, 
			TargetLanguageCode : targetLang
		};
		translate.translateText(params, function(err, data) {
			if (err) {
				console.log(err, err.stack);
				reject(err);
			} else {
				console.log("Translated data from: " + JSON.stringify(data));
				resolve(data);
			}
		});
	});
}

function getTranslatedAnswerToUser(intent, language) {
	const fallbackLanguage = 'en';
	const supportedLanguage = supportedLanguageByDb(language);
	const languageToQueryFromDb = supportedLanguage ? language : fallbackLanguage;
	const projectExpressionFormation = "#int, " + languageToQueryFromDb;
	const params = {
		TableName : "event-routing",
		KeyConditionExpression : "#int = :intent",
		ProjectionExpression : projectExpressionFormation,
		ExpressionAttributeNames: {
			"#int" : "intent"
		},
		ExpressionAttributeValues: {
			":intent" : intent
		}
	};
	let dbResponse = new Promise(function(resolve, reject) {
		docClient.query(params, function(err, data) {
			if (err) {
				console.log("Unable to query. Error:", JSON.stringify(err, null, 2));
				reject(err);
			} else {
				let responseFromDb = data.Items[0];
				console.log("Query succeeded. Data: " + JSON.stringify(responseFromDb));
				resolve(responseFromDb[languageToQueryFromDb]);
			}
		});
	});
	if (language !== 'en' && !supportedLanguage) {
		//Unsupported language branch is not working properly - it returns undefined.
		let transMsg = getTranslatedMessage(dbResponse, fallbackLanguage, language);
		return transMsg.TranslatedText;
	} else {
		return dbResponse;
	}
}

function supportedLanguageByDb(language) {
	return language === "sv" || language === "ru" || language === "fi";
}

function getIntentFromEngMessage(message) {
	const response = message.raw;
	let intentsArray = response.intents;
	if (intentsArray.length == 0) {
		return "agent";
	} else {
		intentsArray.sort((i1, i2) => i2.confidence - i1.confidence);
		return intentsArray[0].slug;
	}
}

function replyObject(message) {
	return {
		replies: [
			{
				type : "text",
				content : message
			}
		]
	}
}

