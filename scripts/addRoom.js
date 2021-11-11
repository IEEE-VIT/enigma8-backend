const prompt = require("prompt");
require("dotenv").config();
const connectToMongo = require("../models/db");
const Room = require("../models/roomModel");

//connect to mongoDB
connectToMongo().on("connected", () => {});

//use || operator to enter multiple values

prompt.start();

prompt.get(
  ["roomNo", "questionId", "media", "title", "starQuota"],
  async (err, result) => {
    if (err) {
      console.log("Error");
    }

    var roomm = new Room({
      roomNo: result.roomNo,
      questionId: result.questionId.split("||"),
      media: result.media,
      title: result.title,
      starQuota: result.starQuota,
    });

    try {
      await roomm.save();
      console.log("room added");
    } catch (e) {
      console.log("error updating question");
    }
  }
);
