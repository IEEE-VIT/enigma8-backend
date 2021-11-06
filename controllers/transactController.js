const Question = require("../models/questionModel");
const Room = require("../models/roomModel");
const User = require("../models/userModel");
const Journey = require("../models/journeyModel");
const { getQuestionSchema } = require("../config/requestSchema");
const { useHintSchema } = require("../config/requestSchema");
const { submitAnswerSchema } = require("../config/requestSchema");
require("dotenv").config();

const { response } = require("../config/responseSchema");
const mongoose = require("mongoose");

exports.getQuestion = async (req, res) => {
  try {
    const { roomId } = await getQuestionSchema.validateAsync(req.body);
    const userId = req.user.id;
    const currentJourney = await Journey.findOne({ roomId, userId });

    if (currentJourney === null) {
      throw new Error("Room is locked.");
    }

    let questionFound = false;
    for (let i = 0; i < 3; i++) {
      if (currentJourney.questionsStatus[i] === "unlocked") {
        questionFound = true;
        const currentRoom = await Room.findOne({ _id: roomId });
        const questionId = currentRoom.questionId[i];
        const question = await Question.findOne({ _id: questionId }).select(
          "text media mediaType questionNo currentRoom"
        );
        response(res, question);
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
    const { roomId } = await useHintSchema.validateAsync(req.body);
    const userId = req.user.id;
    const currentJourney = await Journey.findOne({ roomId, userId });
    if (!currentJourney) throw new Error("Journey doesnt exist");

    for (let i = 0; i < 3; i++) {
      if (currentJourney.questionsStatus[i] === "unlocked") {
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
  } catch (err) {
    response(res, {}, 400, err.message, false);
  }
};

const roomJson = [2, 5, 7, 10, 11]; //stars required for unlocking next room, #the FIRST number(2) indicate the starts reqd to unlock the SECOND room

exports.submitAnswer = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const { id: userId, usedHints, stars } = req.user;

    const { userAnswer, roomId } = await submitAnswerSchema.validateAsync(
      req.body
    );

    const userAnswerLower = userAnswer.toLowerCase();

    const currentJourney = await Journey.findOne({ roomId, userId });
    if (!currentJourney) throw new Error("Journey does not exist");
    console.log("The Journey:", currentJourney);
    let flag = false;
    currentJourney.questionsStatus.map(async (status, i) => {
      if (status === "unlocked") {
        const currentRoom = await Room.findOne({ _id: roomId });
        if (!currentRoom) throw new Error("Couldn't find the room");
        console.log("currentRoom:", currentRoom);

        const questionId = currentRoom.questionId[i];

        const currentQuestion = await Question.findOne({ _id: questionId });
        if (!currentQuestion) throw new Error("Couldn't fetch the question");

        const correctAnswers = new Set(currentQuestion.answers);
        const closeAnswers = new Set(currentQuestion.closeAnswers);

        if (correctAnswers.has(userAnswerLower)) {
          //userAnswer is correct
          // session.startTransaction();
          const effectiveScore = getEffectiveScore(usedHints, questionId);
          await updateScoreStar(userId, effectiveScore, session);
          await updateCurrentQstnStatus(userId, roomId, i, session);
          await updateNextQstnStatus(userId, roomId, i, session);
          const nextRoomUnlocked = await unlockNextRoom(stars, userId, session);
          // await session.commitTransaction();
          // session.endSession();

          response(res, {
            userId,
            questionId,
            nextRoomUnlocked,
            solved: "hurray, correct answer!",
          });
          // } catch (err) {
          //   // await session.abortTransaction();
          //   // session.endSession();
          // }
          flag = true;
        }
        //check if its a close answer
        else if (closeAnswers.has(userAnswerLower)) {
          response(res, { userId, questionId, solved: "close, close answer" });
          flag = true;
        }
        //incorrect answer
        else {
          response(res, {
            userId,
            questionId,
            solved: "sorry, incorrect answer!",
          });
          flag = true;
        }
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
const getEffectiveScore = (usedHints, questionId) => {
  // TODO : dynamic scoring algo

  const baseScore = 50;
  const hintReduction = 5;
  let effectiveScore = baseScore;
  if (hasUsedHints(usedHints, questionId)) effectiveScore -= hintReduction;

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

  console.log(query);
  const updateStatus = await Journey.findOneAndUpdate(
    { userId, roomId },
    { $set: query },
    { session }
  );
  if (!updateStatus) throw new Error("Error updating status of question");
};
const updateNextQstnStatus = async (userId, roomId, questionIndex, session) => {
  //update status of next question from locked to unlocked
  console.log(questionIndex);
  if (questionIndex < 2) {
    const nextQuestion = "questionsStatus." + String(questionIndex + 1);
    const query = {};
    query[nextQuestion] = "unlocked";
    console.log(query);

    const updateStatus = await Journey.findOneAndUpdate(
      { userId, roomId },
      { $set: query },
      { session }
    );
  }
};
const unlockNextRoom = async (star, userId, session) => {
  //if stars enough to unlock the next room
  const currentStar = star + 1; // +1 since its already updated before this is called
  console.log("cj:", currentStar);
  for (let i = 0; i < roomJson.length; i++) {
    if (currentStar == roomJson[i]) {
      //unlock the i+1th room
      const { id: roomId } = await Room.findOne({ roomNo: i + 2 });
      console.log("Room unlocked:", roomId);
      await new Journey({
        userId,
        roomId,
        roomUnlocked: true,
        questionsStatus: ["unlocked", "locked", "locked"],
      }).save({ session });
      return roomId;
    }
  }
  return false;
};
