const ApiBuilder = require('claudia-api-builder'),
	api = new ApiBuilder(),
	AWS = require('aws-sdk'),
	translate = new AWS.Translate(),
	BOT_TOKEN = process.env.BOT_TOKEN,
	recastai = require('recastai').default,
	request = new recastai.request(BOT_TOKEN, 'en');
const infoMap = require("./datamap.js");
const docClient = new AWS.DynamoDB.DocumentClient();


module.exports = api;

api.post('/translate', (req, res) => {
	'use strict';
	const originalMessage = req.body.nlp.source;
	return getTranslatedMessage(originalMessage, 'auto', 'en')
		.then(translatedData => Promise.all([request.analyseText(translatedData.TranslatedText), translatedData.SourceLanguageCode]))
		.then(values => {
			getTranslatedAnswerFromDB(returnReplyAfterAnalyse(values[0]), values[1]);
			// let returnedItemForIntent = infoMap[returnReplyAfterAnalyse(values[0])];
			// getTranslatedMessage(returnedItemForIntent, 'en', values[1])
		})
		.then(translatedReply => replyObject(JSON.stringify(translatedReply)))
		// .then(translatedReply => replyObject(translatedReply.TranslatedText));
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

function returnReplyAfterAnalyse(message) {
	const response = message.raw;
	let intentsArray = response.intents;
	if (intentsArray.length == 0) {
		return 'I will forward you to the agent';
	} else {
		intentsArray.sort((i1, i2) => i2.confidence - i1.confidence);
		// return infoMap[intentsArray[0].slug];
		return intentsArray[0].slug;
	}
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

function getTranslatedAnswerFromDB(intent, language) {
	//For scan
	// var params=  {
	// 	"TableName":'event-routing',
	// 	"FilterExpression":'intent = :int',
	// 	"ExpressionAttributeValues": {
	// 		":int": intent,
	// 	}	
	// };
	// docClient.scan(params, function(err, data){
	// 	if(err){
	// 		callback(err, null);
	// 	}else{
	// 		callback(null, data);
	//    }
	// });
	//For query
	let projectExpressionFormation = "#intent, data" + language;
	let params = {
		TableName : "event-routing",
		KeyConditionExpression: "#int = :intent",
		ProjectionExpression: projectExpressionFormation,
		ExpressionAttributeNames:{
			"#int": "intent"
		},
		ExpressionAttributeValues: {
			":intent": intent
		}
	};
	let result = new Promise(function(resolve, reject) {
		docClient.query(params, function(err, data) {
			if (err) {
				reject(err)
			} else {
				console.log("Query succeeded.");
				// data.Items.forEach(function(item) {
				// 	console.log(" -", item.year + ": " + item.title);
				// });
				console.log(data.Items[0]);
				resolve(data.Items[0]);
			}
		});
	});
	return result;
}

