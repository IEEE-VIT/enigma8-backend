const Question = require("../models/questionModel");
const Room = require("../models/roomModel");
const User = require("../models/userModel");
const Journey = require("../models/journeyModel");
const Powerup = require("../models/powerupModel");
const AnswerLog = require("../models/answerlogModel");
const { getQuestionSchema } = require("../config/requestSchema");
const { useHintSchema } = require("../config/requestSchema");
const { submitAnswerSchema } = require("../config/requestSchema");
const constants = require("../config/constants");
require("dotenv").config();
const logger = require("../config/logger");
const answerLogger = require("../config/answerLogger");

const { response } = require("../config/responseSchema");
const {
  getDecryptedQuestion,
  hashAnswer,
} = require("../config/decryptAndHash");

const mongoose = require("mongoose");

exports.getQuestion = async (req, res) => {
  try {
    if (!req.query.roomId) {
      throw new Error("Please enter a roomId");
    }
    const { roomId } = await getQuestionSchema.validateAsync(req.query);
    const userId = req.user.id;
    const currentJourney = await Journey.findOne({ roomId, userId });

    if (currentJourney === null) {
      throw new Error("room is locked");
    }

    let questionFound = false;
    for (let i = 0; i < 3; i++) {
      if (currentJourney.questionsStatus[i] === "unlocked") {
        questionFound = true;
        const currentPowerupId = currentJourney.powerupId;
        const powerupDetails = await Powerup.findOne({ _id: currentPowerupId });
        const powerupUsed = currentJourney.powerupUsed;
        const currentRoom = await Room.findOne({ _id: roomId });
        const questionId = currentRoom.questionId[i];
        let hint = null;
        const encryptedQuestion = await Question.findOne({ _id: questionId });
        const decryptedQues = await getDecryptedQuestion(encryptedQuestion);

        const question = {
          _id: decryptedQues.id,
          text: decryptedQues.text,
          media: decryptedQues.media,
          mediaType: decryptedQues.mediaType,
          questionNo: decryptedQues.questionNo,
          currentRoom: decryptedQues.currentRoom,
        };

        const currentUserUsedHints = req.user.usedHints.map((id) =>
          id.toHexString()
        );

        const alreadyUsedHints = new Set(currentUserUsedHints);
        if (!alreadyUsedHints.has(questionId.toHexString())) {
          hint = null;
        } else if (alreadyUsedHints.has(questionId.toHexString())) {
          hint = decryptedQues.hint;
        }

        response(res, { question, powerupDetails, powerupUsed, hint });
      }
    }

    if (questionFound === false) {
      throw new Error("you have solved the entire room");
    }
  } catch (err) {
    logger.error(req.user.email + "-> " + err);
    response(res, {}, 400, err.message, false);
  }
};
//get question done
exports.useHint = async (req, res) => {
  try {
    if (!req.query.roomId) {
      throw new Error("Plese enter roomId");
    }
    const { roomId } = await useHintSchema.validateAsync(req.query);
    const userId = req.user.id;
    const currentJourney = await Journey.findOne({ roomId, userId });
    if (!currentJourney) throw new Error("journey doesnt exist");

    let flag = false;
    for (let i = 0; i < 3; i++) {
      if (currentJourney.questionsStatus[i] === "unlocked" && !flag) {
        flag = true;

        const currentRoom = await Room.findOne({ _id: roomId });
        const questionId = currentRoom.questionId[i];
        const encryptedQuestion = await Question.findOne({ _id: questionId });
        const decryptedQues = await getDecryptedQuestion(encryptedQuestion);
        const hint = decryptedQues.hint;
        const currentUserUsedHints = req.user.usedHints.map((id) =>
          id.toHexString()
        );

        const alreadyUsedHints = new Set(currentUserUsedHints);
        if (!alreadyUsedHints.has(questionId.toHexString())) {
          const addUsedHints = await User.updateOne(
            { _id: userId },
            { $addToSet: { usedHints: questionId } }
          );
          if (!addUsedHints) throw new Error("unexpected db error");
        }
        response(res, { hint });
      }
    }
    if (!flag) {
      throw new Error("the entire room is solved");
    }
  } catch (err) {
    logger.error(req.user.email + "-> " + err);
    response(res, {}, 400, err.message, false);
  }
};
// get hint done

exports.submitAnswer = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const { id: userId, usedHints, stars, username } = req.user;

    if (!req.body.userAnswer) {
      throw new Error("Please enter an Answer");
    } else if (!req.body.roomId) {
      throw new Error("Please select a Room");
    }

    if (!req.body.userAnswer) {
      throw new Error("Please enter an Answer");
    } else if (!req.body.roomId) {
      throw new Error("Please select a Room");
    }

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
    if (!currentJourney) throw new Error("journey does not exist");
    if (!currentJourney.powerupId)
      throw new Error("please set room powerup before submiting an answer");
    let flag = false;
    currentJourney.questionsStatus.map(async (status, i) => {
      if (status === "unlocked" && !flag) {
        flag = true;
        const currentRoom = await Room.findOne({ _id: roomId });
        if (!currentRoom) throw new Error("couldn't find the room");

        const questionId = currentRoom.questionId[i];
        responseJson["questionId"] = questionId.toHexString();

        const encryptedCurrentQuestion = await Question.findOne({
          _id: questionId,
        });
        if (!encryptedCurrentQuestion)
          throw new Error("couldn't fetch the question");
        const hashOfCorrectAnswers = new Set(encryptedCurrentQuestion.answers);
        const hashOfCloseAnswers = new Set(
          encryptedCurrentQuestion.closeAnswers
        );

        const hashedInputAnswer = hashAnswer(userAnswerLower);

        if (hashOfCorrectAnswers.has(hashedInputAnswer)) {
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
            answerLogger.info(
              `??? CORRECT UserID: ${userId},QID:${questionId}, roomId:${roomId}, Answer:${hashedInputAnswer}, score:${effectiveScore}`
            );

            logger.info(
              `$UserId:${userId} -> Correct answer submitted. Effective Score:${effectiveScore}`
            );
            // check for race condition!
            const getJourneyStatusToVerify = await Journey.findOne({
              roomId,
              userId,
            }).session(session);
            if (getJourneyStatusToVerify.questionsStatus[i] !== "unlocked") {
              throw new Error(
                "The answer for this question has already been submitted!"
              );
            }

            await updateScoreStar(userId, effectiveScore, session);
            await updateCurrentQstnStatus(userId, roomId, i, session);
            await updateNextQstnStatus(userId, roomId, i, session);

            await incrementQuestionModelSolvedCount(questionId, session);
            const nextRoomId = await getNextRoomId(stars);
            await unlockNextRoom(userId, nextRoomId, session);

            await new AnswerLog({
              username: username,
              roomNo: currentRoom.roomNo,
              check: "correct",
              answer: hashedInputAnswer,
              effectiveScore: effectiveScore,
              QNo: encryptedCurrentQuestion.questionNo,
            }).save();
            await session.commitTransaction();
            responseJson.correctAnswer = true;
            responseJson.scoreEarned = effectiveScore;
            responseJson.nextRoomUnlocked = nextRoomId ? true : false; //if next room id exist and if answer is correct then next room is unlocked
            responseJson.nextRoomId = nextRoomId || null;
          } catch (err) {
            logger.error(req.user.email + "-> " + err);
            await session.abortTransaction();
          } finally {
            session.endSession();
          }
        }
        //check if its a close answer
        else if (hashOfCloseAnswers.has(hashedInputAnswer)) {
          answerLogger.info(
            `???? CLOSE UserID: ${userId},QID:${questionId}, roomId:${roomId}, Answer:${hashedInputAnswer}`
          );
          await new AnswerLog({
            username: username,
            roomNo: currentRoom.roomNo,
            check: "close",
            answer: hashedInputAnswer,
            effectiveScore: 0,
            QNo: encryptedCurrentQuestion.questionNo,
          }).save();
          console.log("close answer");
          responseJson.closeAnswer = true;
        }
        //incorrect answer
        else {
          answerLogger.info(
            `??? FAIL UserID: ${userId},QID:${questionId}, roomId:${roomId}, Answer:${userAnswer}`
          );
          await new AnswerLog({
            username: username,
            roomNo: currentRoom.roomNo,
            check: "incorrect",
            answer: userAnswer,
            effectiveScore: 0,
            QNo: encryptedCurrentQuestion.questionNo,
          }).save();
        }
        console.log("Final response:");
        response(res, responseJson);
      }
    });

    if (!flag) response(res, {}, 400, "this room is all solved", false);
  } catch (err) {
    logger.error(req.user.email + "-> " + err);
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
  // noOfSolved is never encrypted hence no need to decrypt only so it's fine!
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
  if (!addStarAndScore) throw new Error("error updating stars and score");
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
  if (!updateStatus) throw new Error("error updating status of question");
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
  if (nextRoomId) {
    await new Journey({
      userId,
      roomId: nextRoomId,
      roomUnlocked: true,
      questionsStatus: ["unlocked", "locked", "locked"],
      powerupSet: "no",
    }).save({ session });
    logger.info(
      `userId:${userId} -> Unlocking new room on correct answer. roomId:${nextRoomId}`
    );
  }
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
    if (currentStar == roomJson[i]) {
      //unlock the i+1th room
      const { id } = await Room.findOne({ roomNo: i + 2 });

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
    if (!currentRoom) throw new Error("invalid room");

    const currentJourney = await Journey.findOne({ roomId, userId });
    if (currentJourney === null) throw new Error("room is locked.");

    if (currentJourney.powerupUsed === "yes")
      throw new Error("powerup already used");

    const powerupId = currentJourney.powerupId;
    const powerUp = await Powerup.findOne({ _id: powerupId });
    if (!powerUp) throw new Error("please select a valid powerup");

    let currentEncryptedQuestion;

    let questionFound = false;
    for (let i = 0; i < 3; i++) {
      if (currentJourney.questionsStatus[i] === "unlocked" && !questionFound) {
        questionFound = true;
        const questionId = currentRoom.questionId[i];
        currentEncryptedQuestion = await Question.findOne({ _id: questionId });
        currentDecryptedQuestion = await getDecryptedQuestion(
          currentEncryptedQuestion
        );
      }
    }
    if (!questionFound) throw new Error("entire room is solved");

    let text;
    let data;
    let imgUrl;
    let scoring_powerups = false;

    switch (powerUp.beAlias) {
      case "hangman":
        text = "The Hangman is";
        data = currentDecryptedQuestion.hangman;
        imgUrl = null;
        break;
      case "double_hint":
        text = "The Double Hint is";
        data = currentDecryptedQuestion.doubleHint;
        imgUrl = null;
        break;
      case "url_hint":
        text = "The URL is";
        data = currentDecryptedQuestion.urlHint;
        imgUrl = null;
        break;
      case "javelin":
        text = "The Javelin is";
        data = null;
        imgUrl = currentDecryptedQuestion.javelin;
        break;
      case "reveal_cipher":
        text = "The Cipher used is";
        data = currentDecryptedQuestion.revealCipher;
        imgUrl = null;
        break;
      case "new_close_answer":
        text = "The Hieroglyphs Close answer for this is";
        data = null;
        imgUrl = currentDecryptedQuestion.newHieroglyphsCloseAnswer;
        break;
      case "free_hint":
        text =
          "Free Hint activated! Use hint for this question without losing any points";
        data = null;
        scoring_powerups = true;
        imgUrl = null;
        break;
      case "full_score":
        text =
          "Full Score activated! Earn total points for this question without relative scoring. Time is on your side.";
        data = null;
        scoring_powerups = true;
        imgUrl = null;
        break;
    }
    const updatedJourney = await Journey.findOneAndUpdate(
      { userId: userId, roomId },
      { powerupUsed: "active" }
    );
    if (!updatedJourney) throw new Error("error in using powerup");

    response(res, { powerUp, text, data, imgUrl });
  } catch (err) {
    logger.error(req.user.email + "-> " + err);
    response(res, {}, 400, err.message, false);
  }
};
