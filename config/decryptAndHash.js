const CryptoJS = require("crypto-js");

const secretKey = "glfyle";

exports.hashAnswer = (inputText) => {
  let hashedValue = CryptoJS.SHA256(inputText).toString();
  return hashedValue;
};

exports.getDecryptedQuestion = async (ques) => {
  let decryptedQuestion = {};

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
  // console.log(decryptedQuestion);
  return decryptedQuestion;
};

const decryptWithAes = (encryptedText) => {
  let originalText = CryptoJS.AES.decrypt(encryptedText, secretKey).toString(
    CryptoJS.enc.Utf8
  );
  return originalText;
};

exports.checkIfHashExistsInArray = (userAnswer, hashedArray) => {
  const hashedAnswer = CryptoJS.SHA256(userAnswer).toString();
  if (hashedArray.includes(hashedAnswer)) {
    console.log(true);
    return true;
  }
  console.log(false);
  return false;
};

// addQuestion();
// getDecryptedQuestion();

// checkIfHashExistsInArray("a1", hashedAns);
// checkIfHashExistsInArray("a2", hashedAns);
// checkIfHashExistsInArray("A1", hashedAns);
