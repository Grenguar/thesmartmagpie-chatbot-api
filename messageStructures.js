module.exports = {
  textMessageReply: function(message) {
    return {
      replies: [
        {
          type: "text",
          content: message
        }
      ]
    };
  },

  quickReplies: function(title, buttons) {
    return {
      replies: [
        {
          type: "quickReplies",
          content: {
            title: title,
            buttons: buttons
          }
        }
      ]
    };
  },

  pictureReply: function(imageUrl) {
    return {
      replies: [
        {
          type: "picture",
          content: imageUrl
        }
      ]
    };
  },

  videoReply: function(videoUrl) {
    return {
      replies: [
        {
          type: "video",
          content: videoUrl
        }
      ]
    };
  },

  buttonsReply: function(title, buttons) {
    return {
      replies: [
        {
          type: "buttons",
          content: {
            title: title,
            buttons: buttons
          }
        }
      ]
    };
  },

  /* Button types:
   - postback
   - web_url
   - phone_number
  */
  buttonObj: function(title, type, value) {
    if (type === "") {
      return {
        title: title,
        value: value
      };
    }
    return {
      title: title,
      type: type,
      value: value
    };
  },
  //https://cai.tools.sap/docs/concepts/structured-messages
  carouselReply: function(title, subtitle, imageUrl, buttons) {
    return {
      replies: [
        {
          type: "carousel",
          content: [
            {
              title: title,
              subtitle: subtitle,
              imageUrl: imageUrl,
              buttons: buttons
            }
          ]
        }
      ]
    };
  }
};
