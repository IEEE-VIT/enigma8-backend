const Question = require("../models/questionModel");
const Room = require("../models/roomModel");
const User = require("../models/userModel");
const Journey = require("../models/journeyModel");
const { getQuestionSchema } = require("../config/requestSchema");
const { useHintSchema } = require("../config/requestSchema");
const { response } = require("../config/responseSchema");

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
