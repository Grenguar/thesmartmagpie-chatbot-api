const ApiBuilder = require("claudia-api-builder"),
  api = new ApiBuilder(),
  AWS = require("aws-sdk"),
  translate = new AWS.Translate(),
  recastai = require("recastai").default,
  request = new recastai.request(process.env.BOT_TOKEN, "en"),
  docClient = new AWS.DynamoDB.DocumentClient(),
  messageStructures = require("./src/messageStructures.js");

module.exports = api;

api.post(
  "/translate",
  async (req, res) => {
    "use strict";
    const originalMessage = req.body.nlp.source;
    const translatedMessageObj = await getTranslatedMessage(
      originalMessage,
      "auto",
      "en"
    );
    const originalMsgLanguage = translatedMessageObj.SourceLanguageCode;
    const analysedText = await request.analyseText(
      translatedMessageObj.TranslatedText
    );
    const intentFromtranslatedMessage = await getIntentFromEngMessage(
      analysedText
    );
    const responseFromDb = await getTranslatedAnswerToUser(
      intentFromtranslatedMessage,
      originalMsgLanguage
    );
    if (supportedLanguageByDb(originalMsgLanguage)) {
      if (isJsonFormattedAnswer(intentFromtranslatedMessage)) {
        return messageStructures.customContentReply(JSON.parse(responseFromDb));
      }
      return messageStructures.textMessageReply(responseFromDb);
    } else {
      const translatedBotAnswer = await getTranslatedMessage(
        responseFromDb,
        "en",
        originalMsgLanguage
      );
      const translatedText = translatedBotAnswer.TranslatedText;
      if (isJsonFormattedAnswer(intentFromtranslatedMessage)) {
        return messageStructures.customContentReply(JSON.parse(responseFromDb));
      }
      return messageStructures.textMessageReply(translatedText);
    }
  },
  {
    success: { contentType: "application/json" },
    error: { code: 500 }
  }
);

function getTranslatedMessage(message, sourceLang, targetLang) {
  return (result = new Promise(function(resolve, reject) {
    let params = {
      Text: message,
      SourceLanguageCode: sourceLang,
      TargetLanguageCode: targetLang
    };
    translate.translateText(params, function(err, data) {
      if (err) {
        console.log(err, err.stack);
        reject(err);
      } else {
        resolve(data);
      }
    });
  }));
}

function getTranslatedAnswerToUser(intent, language) {
  const fallbackLanguage = "en";
  const supportedLanguage = supportedLanguageByDb(language);
  const languageToQueryFromDb = supportedLanguage ? language : fallbackLanguage;
  const projectExpressionFormation = "#int, " + languageToQueryFromDb;
  const params = {
    TableName: process.env.TABLE_NAME,
    KeyConditionExpression: "#int = :intent",
    ProjectionExpression: projectExpressionFormation,
    ExpressionAttributeNames: {
      "#int": "intent"
    },
    ExpressionAttributeValues: {
      ":intent": intent
    }
  };
  let dbResponse = new Promise(function(resolve, reject) {
    docClient.query(params, function(err, data) {
      if (err) {
        console.log("Unable to query. Error:", JSON.stringify(err, null, 2));
        reject(err);
      } else {
        let responseFromDb = data.Items[0];
        resolve(responseFromDb[languageToQueryFromDb]);
      }
    });
  });
  return dbResponse;
}

function supportedLanguageByDb(language) {
  return (
    language === "en" ||
    language === "sv" ||
    language === "ru" ||
    language === "fi"
  );
}

function getIntentFromEngMessage(message) {
  const response = message.raw;
  let intentsArray = response.intents;
  if (intentsArray.length == 0) {
    return "repeat";
  } else {
    intentsArray.sort((i1, i2) => i2.confidence - i1.confidence);
    return intentsArray[0].slug;
  }
}

function isJsonFormattedAnswer(intent) {
  return intent === "demo" || intent === "repeat";
}
