const prompt = require("prompt");
require("dotenv").config();
const connectToMongo = require("../models/db");
const Question = require("../models/questionModel");

//connect to mongoDB
connectToMongo().on("connected", () => {});

//use || operator to enter multiple values

prompt.start();

prompt.get(
  [
    "questionNo",
    "text",
    "media",
    "mediaType",
    "answers",
    "closeAnswers",
    "hint",
    "hangman",
    "doubleHint",
    "urlHint",
    "javelin",
    "revealCipher",
    "newHieroglyphsCloseAnswer",
  ],
  async (err, result) => {
    if (err) {
      console.log("Error");
    }

    var questionn = new Question({
      questionNo: result.questionNo,

      text: result.text,
      media: result.media,
      mediaType: result.mediaType,
      answers: result.answers.split("||"),
      closeAnswers: result.closeAnswers.split("||"),
      hint: result.hint,
      hangman: result.hangman,
      doubleHint: result.doubleHint,
      urlHint: result.urlHint,
      javelin: result.javelin,
      revealCipher: result.revealCipher,
<<<<<<< HEAD
      newCloseAnswer: result.newCloseAnswer,
=======
      newHieroglyphsCloseAnswer: result.newHieroglyphsCloseAnswer,
>>>>>>> 898b4afe20aedc7b5930bc29e41e79cb3727947b
    });

    try {
      await questionn.save();
      console.log("question added");
    } catch (e) {
      console.log("error updating question");
    }
  }
);
