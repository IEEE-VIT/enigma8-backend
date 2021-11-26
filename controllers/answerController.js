// const User = require("../models/userModel");
// const Room = require("../models/roomModel");
// const Powerup = require("../models/powerupModel");
// const Journey = require("../models/journeyModel");
const Answer = require("../models/answerlogModel");
const logger = require("../config/logger");
const {
  createUserSchema,
  consumePowerupSchema,
} = require("../config/requestSchema");
const { response } = require("../config/responseSchema");
const mongoose = require("mongoose");

exports.iWonderWhatThisIs = async (req, res) => {
  try {
    console.log("ahahah");
    const { username, roomNo, QNo, check } = req.query;
    if (req.query.enigmaToken !== "lmao") {
      throw new Error("hol up");
    }

    const allAnswers = await Answer.find({
      username,
      // roomNo,
      // QNo,
      // check,
    });
    res.send(allAnswers);
  } catch (err) {
    response(res, {}, 400, err.message, false);
  }
};
