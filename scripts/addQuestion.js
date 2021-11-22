require("dotenv").config();
const connectToMongo = require("../models/db");
const Question = require("../models/questionModel");
const CryptoJS = require("crypto-js");

//connect to mongoDB
connectToMongo().on("connected", () => {});

//use || operator to enter multiple values

const secretKey = process.env.ENCRPYTION_SECRET_KEY;

const encryptWithAes = (text) => {
  let ciphertext = CryptoJS.AES.encrypt(text, secretKey).toString();
  return ciphertext;
};

const hashAnswer = (arrayOfPlainText) => {
  let arrayOfHashes = [];
  arrayOfPlainText.forEach((element) => {
    let hashedValue = CryptoJS.SHA256(element).toString();
    arrayOfHashes.push(hashedValue);
  });
  return arrayOfHashes;
};

const decryptWithAes = (encryptedText) => {
  let originalText = CryptoJS.AES.decrypt(encryptedText, secretKey).toString(
    CryptoJS.enc.Utf8
  );
  return originalText;
};

const addQuestion = async () => {
  const qNo = "102";
  const text = "lmao text";
  const media = "https://image.com/lmao.png";
  const mediaType = "image/png";
  const hint = "ahaha";
  const hangman = "aajsccs";
  const doubleHint = "cvsdfvs";
  const urlHint = "sfvgdfgb";
  const javelin = "bfdgrbdfgb";
  const revealCipher = "fsgvsg";
  const newHieroglyphsCloseAnswer = "gsrgbdgd";
  const answers = ["a1", "A1", "ans1"];
  const closeAnswers = ["ca1", "CA1", "closeans1"];

  await Question.create({
    questionNo: qNo,
    text: encryptWithAes(text),
    media: encryptWithAes(media),
    mediaType: encryptWithAes(mediaType),
    answers: hashAnswer(answers),
    closeAnswers: hashAnswer(closeAnswers),
    solvedCount: 0,
    hint: encryptWithAes(hint),
    hangman: encryptWithAes(hangman),
    doubleHint: encryptWithAes(doubleHint),
    urlHint: encryptWithAes(urlHint),
    javelin: encryptWithAes(javelin),
    revealCipher: encryptWithAes(revealCipher),
    newHieroglyphsCloseAnswer: encryptWithAes(newHieroglyphsCloseAnswer),
  })
    .then((ques) => {
      console.log(ques);
    })
    .catch((err) => {
      console.log(err);
    });
};

// let hashedAns = [];
// let hashedCls = [];

const getDecryptedQuestion = async () => {
  let decryptedQuestion = {};
  await Question.findOne({ questionNo: 102 })
    .then((ques) => {
      decryptedQuestion.questionNo = ques.questionNo;
      decryptedQuestion.roomId = ques.roomId;

      decryptedQuestion.text = decryptWithAes(ques.text);
      decryptedQuestion.media = decryptWithAes(ques.media);
      decryptedQuestion.mediaType = decryptWithAes(ques.mediaType);
      decryptedQuestion.hint = decryptWithAes(ques.hint);
      decryptedQuestion.hangman = decryptWithAes(ques.hangman);
      decryptedQuestion.doubleHint = decryptWithAes(ques.doubleHint);
      decryptedQuestion.urlHint = decryptWithAes(ques.urlHint);
      decryptedQuestion.javelin = decryptWithAes(ques.javelin);
      decryptedQuestion.revealCipher = decryptWithAes(ques.revealCipher);
      decryptedQuestion.newHieroglyphsCloseAnswer = decryptWithAes(
        ques.newHieroglyphsCloseAnswer
      );
      hashedAns = ques.answers;
      hashedCls = ques.closeAnswers;
      console.log(decryptedQuestion);
    })
    .catch((err) => {
      console.log(err);
    });
};

const checkIfHashExistsInArray = (userAnswer, hashedArray) => {
  const hashedAnswer = CryptoJS.SHA256(userAnswer).toString();
  if (hashedArray.includes(hashedAnswer)) {
    console.log(true);
    return true;
  }
  console.log(false);
  return false;
};

// addQuestion();
getDecryptedQuestion();

// checkIfHashExistsInArray("a1", hashedAns);
// checkIfHashExistsInArray("a2", hashedAns);
// checkIfHashExistsInArray("A1", hashedAns);
