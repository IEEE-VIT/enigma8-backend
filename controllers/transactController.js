const Question = require("../models/questionModel");
const Room = require("../models/roomModel");
const User = require("../models/userModel");
const Journey = require("../models/journeyModel");
const { getQuestionSchema } = require("../config/requestSchema");
const { useHintSchema } = require("../config/requestSchema");
const { submitAnswerSchema } = require("../config/requestSchema");
const constants = require("../config/constants");
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

exports.submitAnswer = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const { id: userId, usedHints, stars } = req.user;

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
            const effectiveScore = await getEffectiveScore(
              usedHints,
              questionId
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
const getEffectiveScore = async (usedHints, questionId) => {
  const { solvedCount: noOfSolves } = await Question.findOne({
    id: questionId,
  });

  let score;
  const maxScore = constants.maxScore;
  const groupedSolves = noOfSolves / constants.groupBy;

  const shouldBeScore = maxScore - groupedSolves * constants.perSolve;
  if (shouldBeScore < constants.minScore) {
    score = constants.minScore;
  } else {
    score = shouldBeScore;
  }

  let effectiveScore = score;
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
