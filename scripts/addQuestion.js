const prompt = require("prompt");
require("dotenv").config();
const connectToMongo = require("../models/db");
const Question = require("../models/questionModel");
const crypto = require("crypto");

//connect to mongoDB
connectToMongo().on("connected", () => {});

const algorithm = process.env.algorithm;
const initVector = process.env.initVector;
const securityKey = process.env.securityKey;
const cipher = crypto.createCipheriv(algorithm, securityKey, initVector);

// const decipher = crypto.createDecipheriv(algorithm, securityKey, initVector);
// const text="6725e93d41be557b9464afc08b12219d";

// let decryptedData = decipher.update(text, "hex", "utf-8");

// decryptedData += decipher.final("utf8");

// console.log("Decrypted message: " + decryptedData);

// use || operator to enter multiple values

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
    "newCloseAnswer",
  ],
  async (err, result) => {
    if (err) {
      console.log("Error");
    }

    let message1 = result.text;
    const cipher1 = crypto.createCipheriv(algorithm, securityKey, initVector);
    let cipheredQuestiontext = cipher1.update(message1, "utf-8", "hex");
    cipheredQuestiontext += cipher1.final("hex");

    let message2 = result.media;
    const cipher2 = crypto.createCipheriv(algorithm, securityKey, initVector);
    let cipheredQuestionmedia = cipher2.update(message2, "utf-8", "hex");
    cipheredQuestionmedia += cipher2.final("hex");

    let message3 = result.answers;
    const cipher3 = crypto.createCipheriv(algorithm, securityKey, initVector);
    let cipheredQuestionanswers = cipher3.update(message3, "utf-8", "hex");
    cipheredQuestionanswers += cipher3.final("hex");

    let message4 = result.closeAnswers;
    const cipher4 = crypto.createCipheriv(algorithm, securityKey, initVector);
    let cipheredQuestioncloseAnswers = cipher4.update(message4, "utf-8", "hex");
    cipheredQuestioncloseAnswers += cipher4.final("hex");

    let message5 = result.hint;
    const cipher5 = crypto.createCipheriv(algorithm, securityKey, initVector);
    let cipheredQuestionhint = cipher5.update(message5, "utf-8", "hex");
    cipheredQuestionhint += cipher5.final("hex");

    let message6 = result.hangman;
    const cipher6 = crypto.createCipheriv(algorithm, securityKey, initVector);
    let cipheredQuestionhangman = cipher6.update(message6, "utf-8", "hex");
    cipheredQuestionhangman += cipher6.final("hex");

    let message7 = result.urlHint;
    const cipher7 = crypto.createCipheriv(algorithm, securityKey, initVector);
    let cipheredQuestionurlHint = cipher7.update(message7, "utf-8", "hex");
    cipheredQuestionurlHint += cipher7.final("hex");

    let message8 = result.javelin;
    const cipher8 = crypto.createCipheriv(algorithm, securityKey, initVector);
    let cipheredQuestionjavelin = cipher8.update(message8, "utf-8", "hex");
    cipheredQuestionjavelin += cipher8.final("hex");

    let message9 = result.revealCipher;
    const cipher9 = crypto.createCipheriv(algorithm, securityKey, initVector);
    let cipheredQuestionrevealCipher = cipher9.update(message9, "utf-8", "hex");
    cipheredQuestionrevealCipher += cipher9.final("hex");

    let message10 = result.newCloseAnswer;
    const cipher10 = crypto.createCipheriv(algorithm, securityKey, initVector);
    let cipheredQuestionnewCloseAnswer = cipher10.update(
      message10,
      "utf-8",
      "hex"
    );
    cipheredQuestionnewCloseAnswer += cipher10.final("hex");

    let message11 = result.doubleHint;
    const cipher11 = crypto.createCipheriv(algorithm, securityKey, initVector);
    let cipheredQuestiondoubleHint = cipher11.update(message11, "utf-8", "hex");
    cipheredQuestiondoubleHint += cipher11.final("hex");

    var questionn = new Question({
      questionNo: result.questionNo,

      text: cipheredQuestiontext,
      media: cipheredQuestionmedia,
      mediaType: result.mediaType,
      answers: cipheredQuestionanswers,
      closeAnswers: cipheredQuestioncloseAnswers,
      hint: cipheredQuestionhint,
      hangman: cipheredQuestionhangman,
      doubleHint: cipheredQuestiondoubleHint,
      urlHint: cipheredQuestionurlHint,
      javelin: cipheredQuestionjavelin,
      revealCipher: cipheredQuestionrevealCipher,
      newCloseAnswer: cipheredQuestionnewCloseAnswer,
    });

    try {
      await questionn.save();
      console.log("question added");
    } catch (e) {
      console.log("error updating question");
    }
  }
);
