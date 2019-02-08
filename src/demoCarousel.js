module.exports = {
  returnCarouselObj: function(language) {
    const messageStructures = require("./messageStructures.js");
    let buttonsTickets = [
        messageStructures.buttonObj(
          "Register now",
          "web_url",
          "https://audiovisualexpo.messukeskus.com/info/?lang=en"
        )
      ],
      cardTickets = messageStructures.cardObj(
        "Tickets",
        "You could register online",
        "http://www.kitchenerribandbeerfest.com/userContent/images/Ribfest/ticket%20green2.png",
        buttonsTickets
      ),
      buttonsLocation = [
        messageStructures.buttonObj(
          "Open map",
          "web_url",
          "http://www.people2join.com/wp-content/uploads/2016/06/Messukeskus.png"
        )
      ],
      cardLocation = messageStructures.cardObj(
        "Location",
        "How to find the venue",
        "https://goo.gl/maps/yJihJoWTwF62",
        buttonsLocation
      ),
      buttonsSchedule = [
        messageStructures.buttonObj(
          "Learn more",
          "web_url",
          "https://audiovisualexpo.messukeskus.com/whats-on/?lang=en"
        )
      ],
      cardSchedule = messageStructures.cardObj(
        "Schedule",
        "Information about event timetable",
        "https://cdn1.sph.harvard.edu/wp-content/uploads/sites/1266/2014/09/schedule.jpg",
        buttonsSchedule
      ),
      cardAskMe = messageStructures.cardObj(
        "Ask me",
        "Write a free-text message to me",
        "https://medias2.prestastore.com/835054-pbig/chat-bot-for-social-networking.jpg",
        []
      );
    const carousel = {
      type: "carousel",
      content: [cardTickets, cardLocation, cardSchedule, cardAskMe]
    };
    return carousel;
  }
};
