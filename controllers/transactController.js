const Question = require("../models/questionModel");
const Room = require("../models/roomModel");
const User = require("../models/userModel");
const Journey = require("../models/journeyModel");
const Powerup = require("../models/powerupModel");
const { getQuestionSchema } = require("../config/requestSchema");
const { useHintSchema } = require("../config/requestSchema");
const { submitAnswerSchema } = require("../config/requestSchema");
const constants = require("../config/constants");
const crypto = require("crypto");
require("dotenv").config();

const { response } = require("../config/responseSchema");
const mongoose = require("mongoose");

const algorithm = process.env.algorithm;
const initVector = process.env.initVector;
const securityKey = process.env.securityKey;

exports.getQuestion = async (req, res) => {
  try {
    const { roomId } = await getQuestionSchema.validateAsync(req.query);
    const userId = req.user.id;
    const currentJourney = await Journey.findOne({ roomId, userId });

    if (currentJourney === null) {
      throw new Error("Room is locked.");
    }
    if (!currentJourney.powerupId)
      throw new Error("Please set room powerup before submiting an answer");

    let questionFound = false;
    for (let i = 0; i < 3; i++) {
      if (currentJourney.questionsStatus[i] === "unlocked") {
        questionFound = true;
        const currentRoom = await Room.findOne({ _id: roomId });
        const questionId = currentRoom.questionId[i];
        const question = await Question.findOne({ _id: questionId });
        const media = question.media;
        const mediaType = question.mediaType;
        const questionNo = question.questionNo;
        // .select(
        //   "text media mediaType questionNo currentRoom"
        // );

        const decipher1 = crypto.createDecipheriv(
          algorithm,
          securityKey,
          initVector
        );
        let text = decipher1.update(question.text, "hex", "utf-8");
        text += decipher1.final("utf8");

        response(res, { text, media, mediaType, questionNo });
      }
    }

    if (questionFound === false) {
      throw new Error("You have solved the entire room");
    }
  } catch (err) {
    response(res, {}, 400, err.message, false);
  }
};

exports.useHint = async (req, res) => {
  try {
    const { roomId } = await useHintSchema.validateAsync(req.query);
    const userId = req.user.id;
    const currentJourney = await Journey.findOne({ roomId, userId });
    if (!currentJourney) throw new Error("Journey doesnt exist");

    let flag = false;
    for (let i = 0; i < 3; i++) {
      if (currentJourney.questionsStatus[i] === "unlocked" && !flag) {
        flag = true;

        const currentRoom = await Room.findOne({ _id: roomId });
        const questionId = currentRoom.questionId[i];
        const question = await Question.findOne({ _id: questionId });
        const hint = question.hint;
        const currentUserUsedHints = req.user.usedHints.map((id) =>
          id.toHexString()
        );

        const alreadyUsedHints = new Set(currentUserUsedHints);
        if (!alreadyUsedHints.has(questionId.toHexString())) {
          const addUsedHints = await User.updateOne(
            { _id: userId },
            { $addToSet: { usedHints: questionId } }
          );
          if (!addUsedHints) throw new Error("Unexpected db error");
        }
        response(res, { hint });
      }
    }
    if (!flag) {
      throw new Error("The entire room is solved");
    }
  } catch (err) {
    response(res, {}, 400, err.message, false);
  }
};

exports.submitAnswer = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const { id: userId, usedHints, stars, usedPowerups } = req.user;

    const { userAnswer, roomId } = await submitAnswerSchema.validateAsync(
      req.body
    );
    let responseJson = {
      correctAnswer: false,
      closeAnswer: false,
      scoreEarned: 0,
      nextRoomUnlocked: false,
      nextRoomId: null,
    };
    const userAnswerLower = userAnswer.toLowerCase();

    const currentJourney = await Journey.findOne({ roomId, userId });
    if (!currentJourney) throw new Error("Journey does not exist");
    if (!currentJourney.powerupId)
      throw new Error("Please set room powerup before submiting an answer");
    let flag = false;
    currentJourney.questionsStatus.map(async (status, i) => {
      if (status === "unlocked" && !flag) {
        flag = true;
        const currentRoom = await Room.findOne({ _id: roomId });
        if (!currentRoom) throw new Error("Couldn't find the room");

        const questionId = currentRoom.questionId[i];
        responseJson["questionId"] = questionId.toHexString();

        const currentQuestion = await Question.findOne({ _id: questionId });
        if (!currentQuestion) throw new Error("Couldn't fetch the question");
        const nextRoomId = await getNextRoomId(stars);
        const correctAnswers = new Set(currentQuestion.answers);
        const closeAnswers = new Set(currentQuestion.closeAnswers);

        if (correctAnswers.has(userAnswerLower)) {
          //userAnswer is correct
          try {
            session.startTransaction();

            //hints and powerups logic goes here
            const effectiveScore = await getEffectiveScore(
              usedHints,
              questionId,
              currentJourney.powerupId,
              currentJourney.powerupUsed,
              currentJourney.id,
              session
            );
            await updateScoreStar(userId, effectiveScore, session);
            await updateCurrentQstnStatus(userId, roomId, i, session);
            await updateNextQstnStatus(userId, roomId, i, session);

            await incrementQuestionModelSolvedCount(questionId, session);
            await unlockNextRoom(userId, nextRoomId, session);

            await session.commitTransaction();
            responseJson.correctAnswer = true;
            responseJson.scoreEarned = effectiveScore;
            responseJson.nextRoomUnlocked = nextRoomId ? true : false; //if next room id exist and if answer is correct then next room is unlocked
            responseJson.nextRoomId = nextRoomId || null;
          } catch (err) {
            await session.abortTransaction();
          } finally {
            session.endSession();
          }
        }
        //check if its a close answer
        else if (closeAnswers.has(userAnswerLower)) {
          responseJson.closeAnswer = true;
        }
        //incorrect answer
        else {
        }
        response(res, responseJson);
      }
    });

    if (!flag) response(res, {}, 400, "This room is all solved", false);
  } catch (err) {
    response(res, {}, 400, err.message, false);
  }
};
const hasUsedHints = (usedHints, questionId) => {
  const currentUserUsedHints = new Set(usedHints.map((id) => id.toHexString()));
  //Now checking if user used a hint, if so then deduct points
  if (currentUserUsedHints.has(questionId.toHexString())) return true;
  return false;
};
const getEffectiveScore = async (
  usedHints,
  questionId,
  powerupId,
  powerupUsed,
  journeyId,
  session
) => {
  const { beAlias } = await Powerup.findOne({ _id: powerupId });
  let powerUpActiveFlag = false;
  //First figure out if a powerUp is active i.e. if Journey.powerupUsed = active
  if (powerupUsed === "active") {
    powerUpActiveFlag = true;
    //change to Yes
    const tesmp = await Journey.findOneAndUpdate(
      { _id: journeyId },
      { powerupUsed: "yes" },
      { session }
    );
  }

  //Full Score powerup
  //Effective score is the full score if this powerup is used
  if (beAlias === "full_score" && powerUpActiveFlag) return constants.maxScore;

  const { solvedCount: noOfSolves } = await Question.findOne({
    _id: questionId,
  });

  let score;
  const maxScore = constants.maxScore;
  const groupedSolves = Math.floor(noOfSolves / constants.groupBy);

  const shouldBeScore = maxScore - groupedSolves * constants.perSolve;
  score =
    shouldBeScore < constants.minScore ? constants.minScore : shouldBeScore;

  let effectiveScore = score;

  //Free Hint powerup
  //If user use this hint, dont reduce the score because of hint useage
  if (beAlias === "free_hint" && powerUpActiveFlag) return effectiveScore;

  if (hasUsedHints(usedHints, questionId))
    effectiveScore -= constants.hintReduction;

  return effectiveScore;
};

const updateScoreStar = async (userId, effectiveScore, session) => {
  //update star and score
  const addStarAndScore = await User.findOneAndUpdate(
    { _id: userId },
    { $inc: { stars: 1, score: effectiveScore } },
    { session }
  );
  if (!addStarAndScore) throw new Error("Error updating stars and score");
};

const updateCurrentQstnStatus = async (
  userId,
  roomId,
  questionIndex,
  session
) => {
  //update status of current question from unlocked to solved
  const currentQuestion = "questionsStatus." + String(questionIndex);
  const query = {};
  query[currentQuestion] = "solved";

  const updateStatus = await Journey.findOneAndUpdate(
    { userId, roomId },
    { $set: query },
    { session }
  );
  if (!updateStatus) throw new Error("Error updating status of question");
};
const updateNextQstnStatus = async (userId, roomId, questionIndex, session) => {
  //update status of next question from locked to unlocked
  if (questionIndex < 2) {
    const nextQuestion = "questionsStatus." + String(questionIndex + 1);
    const query = {};
    query[nextQuestion] = "unlocked";

    const updateStatus = await Journey.findOneAndUpdate(
      { userId, roomId },
      { $set: query },
      { session }
    );
  }
};
const unlockNextRoom = async (userId, nextRoomId, session) => {
  if (nextRoomId)
    await new Journey({
      userId,
      roomId: nextRoomId,
      roomUnlocked: true,
      questionsStatus: ["unlocked", "locked", "locked"],
    }).save({ session });
};

const getNextRoomId = async (star) => {
  const currentStar = star + 1; // +1 since its already updated before this is called

  const rooms = await Room.find();
  const roomJson = rooms
    .map(({ starQuota }) => {
      return starQuota;
    })
    .slice(1); //stars required for unlocking next room, #the FIRST number indicate the starts reqd to unlock the SECOND room

  for (let i = 0; i < roomJson.length; i++) {
    if (currentStar === roomJson[i]) {
      //unlock the i+1th room
      const { id } = await Room.findOne({ roomNo: i + 1 + 1 });

      return id;
    }
  }
};
const incrementQuestionModelSolvedCount = async (questionId, session) => {
  const res = await Question.findOneAndUpdate(
    { _id: questionId },
    { $inc: { solvedCount: 1 } },
    { session, returnDocument: true }
  );
};

exports.utilisePowerup = async (req, res) => {
  try {
    const { roomId } = await getQuestionSchema.validateAsync(req.query);
    const userId = req.user.id;

    const currentRoom = await Room.findOne({ _id: roomId });
    if (!currentRoom) throw new Error("Invalid Room");

    const currentJourney = await Journey.findOne({ roomId, userId });
    if (currentJourney === null) throw new Error("Room is locked.");

    if (currentJourney.powerupUsed === "yes")
      throw new Error("Powerup already used");

    const powerupId = currentJourney.powerupId;
    const powerUp = await Powerup.findOne({ _id: powerupId });
    if (!powerUp) throw new Error("Please select a valid powerup");

    let currentQuestion;

    let questionFound = false;
    for (let i = 0; i < 3; i++) {
      if (currentJourney.questionsStatus[i] === "unlocked" && !questionFound) {
        questionFound = true;
        const questionId = currentRoom.questionId[i];
        currentQuestion = await Question.findOne({ _id: questionId });
      }
    }
    if (!questionFound) throw new Error("Entire room is solved");

    let data;
    let scoring_powerups = false;

    switch (powerUp.beAlias) {
      case "hangman":
        const decipher2 = crypto.createDecipheriv(
          algorithm,
          securityKey,
          initVector
        );
        let decryptedDatahangman = decipher2.update(
          currentQuestion.hangman,
          "hex",
          "utf-8"
        );
        decryptedDatahangman += decipher2.final("utf8");
        data = decryptedDatahangman;
        break;
      case "double_hint":
        const decipher3 = crypto.createDecipheriv(
          algorithm,
          securityKey,
          initVector
        );
        let decryptedDatadoubleHint = decipher3.update(
          currentQuestion.doubleHint,
          "hex",
          "utf-8"
        );
        decryptedDatadoubleHint += decipher3.final("utf8");
        data = decryptedDatadoubleHint;
        break;
      case "url_hint":
        const decipher4 = crypto.createDecipheriv(
          algorithm,
          securityKey,
          initVector
        );
        let decryptedDataurlHint = decipher4.update(
          currentQuestion.urlHint,
          "hex",
          "utf-8"
        );
        decryptedDataurlHint += decipher4.final("utf8");
        data = decryptedDataurlHint;
        break;
      case "javelin":
        const decipher5 = crypto.createDecipheriv(
          algorithm,
          securityKey,
          initVector
        );
        let decryptedDatajavelin = decipher5.update(
          currentQuestion.javelin,
          "hex",
          "utf-8"
        );
        decryptedDatajavelin += decipher5.final("utf8");
        data = decryptedDatajavelin;
        break;
      case "reveal_cipher":
        const decipher6 = crypto.createDecipheriv(
          algorithm,
          securityKey,
          initVector
        );
        let decryptedDatarevealCipher = decipher6.update(
          currentQuestion.revealCipher,
          "hex",
          "utf-8"
        );
        decryptedDatarevealCipher += decipher6.final("utf8");
        data = decryptedDatarevealCipher;
        break;
      case "new_close_answer":
        const decipher7 = crypto.createDecipheriv(
          algorithm,
          securityKey,
          initVector
        );
        let decryptedDatanewCloseAnswer = decipher7.update(
          currentQuestion.newCloseAnswer,
          "hex",
          "utf-8"
        );
        decryptedDatanewCloseAnswer += decipher7.final("utf8");
        data = decryptedDatanewCloseAnswer;
        break;
      case "free_hint":
        data = "powerup activated";
        scoring_powerups = true;
        break;
      case "full_score":
        data = "powerup activated";
        scoring_powerups = true;
        break;
    }
    const updatedJourney = await Journey.findOneAndUpdate(
      { userId: userId, roomId },
      { powerupUsed: scoring_powerups ? "active" : "yes" }
    );
    if (!updatedJourney) throw new Error("Error in using powerup");

    response(res, { data });
  } catch (err) {
    response(res, {}, 400, err.message, false);
  }
};
