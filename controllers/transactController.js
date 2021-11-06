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

/*
Task Involved
...............
1. 

*/

const roomJson = [2, 5, 7, 10, 11]; //stars required for unlocking next room

exports.submitAnswer = async (req, res) => {
  try {
    const { userId, usedHints, star } = req.user;

    const { userAnswer, roomId } = await submitAnswerSchema.validateAsync(
      req.body
    );

    const userAnswerLower = userAnswer.toLowerCase();

    const currentJourney = await Journey.findOne({ roomId, userId });
    if (!currentJourney) throw new Error("Journey does not exist");
    console.log("current Journey", currentJourney);

    currentJourney.questionsStatus.map(async (status, i) => {
      if (status === "unlocked") {
        console.log("The answer is submitted for q no:", i + 1);

        const currentRoom = await Room.findOne({ _id: roomId });
        if (!currentRoom) throw new Error("Couldn't find the room");

        const questionId = currentRoom.questionId[i];

        const currentQuestion = await Question.findOne({ _id: questionId });
        if (!currentQuestion) throw new Error("Couldn't fetch the question");

        const correctAnswers = new Set(currentQuestion.answers);
        const closeAnswers = new Set(currentQuestion.closeAnswers);

        if (correctAnswers.has(userAnswerLower)) {
          //userAnswer is correct
          const effectiveScore = getEffectiveScore(usedHints, questionId);
          console.log(effectiveScore);
          await updateScoreStar(effectiveScore);
          // await updateCurrentQstnStatus(userId,roomId,i);
          // await updateNextQstnStatus(userId,roomId,i);
          // await unlockNextRoom(star,userId);
          response(res, { solved: "hurray, correct answer!" });
        }
        //check if its a close answer
        else if (closeAnswers.has(userAnswerLower)) {
          response(res, { solved: "close, close answer" });
        }
        //incorrect answer
        else response(res, { solved: "sorry, incorrect answer!" });
      }
    });

    throw new Error("all questions of this room has been solved");
  } catch (error) {
    response(res, {}, 400, error.message, false);
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

const updateScoreStar = async (effectiveScore) => {
  //update star and score
  const addStarAndScore = await User.updateOne(
    { _id: userId },
    { $inc: { stars: +1 }, $inc: { score: effectiveScore } }
  );
  if (!addStarAndScore) throw new Error("Error updating stars and score");
};

const updateCurrentQstnStatus = async (userId, roomId, questionIndex) => {
  //update status of current question from unlocked to solved
  const currentQuestion = "questionsStatus." + String(questionIndex);
  const query = {};
  query[currentQuestion] = "solved";

  console.log(query);
  const updateStatus = await Journey.updateOne(
    { userId, roomId },
    { $set: query }
  );
  if (!updateStatus) throw new Error("Error updating status of question");
};
const updateNextQstnStatus = async (userId, roomId, questionIndex) => {
  //update status of next question from locked to unlocked
  const nextQuestion = "questionsStatus." + String(questionIndex + 1);
  const query = {};
  query[nextQuestion] = "unlocked";
  console.log(query);
  if (questionIndex == 1 || questionIndex == 2) {
    const updateStatus = await Journey.updateOne(
      { userId, roomId },
      { $set: query }
    );
  }
};
const unlockNextRoom = async (star, userId) => {
  //if stars enough to unlock the next room
  const currentStar = star + 1; // +1 since its already updated before this is called
  for (let i = 0; i < roomJson.length; i++) {
    if (currentStar == roomJson[i]) {
      //unlock the i+1th room
      const { roomId } = await Room.findOne({ roomNo: i + 1 });
      new JourneySchema({ userId, roomId, roomUnlocked: true }).save();
    }
  }
};
