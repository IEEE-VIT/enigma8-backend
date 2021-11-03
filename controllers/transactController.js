const Question = require("../models/questionModel");
const Room = require("../models/roomModel");
const User = require("../models/userModel");
const Journey = require("../models/journeyModel");
const { getQuestionSchema } = require("../config/requestSchema");
const { useHintSchema } = require("../config/requestSchema");
const { response } = require("../config/responseSchema");
const mongoose = require("mongoose");

exports.getQuestion = async (req, res) => {
  try {
    const { roomId } = await getQuestionSchema.validateAsync(req.body);
    const userId = req.user.id;
    const currentJourney = await Journey.findOne({ roomId, userId });    
     
  if(currentJourney === null)  
  {
    throw new Error ("Room is locked.");
  }

  let questionFound= false;
  for(let i=0; i<3;i++)
  {
    if(currentJourney.questionsStatus[i] === "unlocked")
    {      
      questionFound=true;
      const currentRoom= await Room.findOne({_id: roomId});           
      const questionId= currentRoom.questionId[i];      
      const question= await Question.findOne({_id: questionId}).select("text media mediaType questionNo currentRoom");
      response(res,question);      
    } 
  }    
    
    if(questionFound=== false) 
    {
      throw new Error ("You have solved the entire room");
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

exports.submitAnswer= async(req,res) =>{
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const userId= req.user.id;
    const userAnswer= req.body.userAnswer;
    const userAnswerLower= userAnswer.toLowerCase();
    const roomId= req.body.roomId;
    const currentJourney= await Journey.findOne({roomId,userId});

    let i=0;
    let answerState=0;
    for(i=0; i<3;i++){
      if(currentJourney.questionsStatus[i] === "unlocked")
      {    
        const currentRoom= await Room.findOne({_id: roomId});           
        const questionId= currentRoom.questionId[i];      
        const currentQuestion= await Question.findOne({_id: questionId});
        
        // 0= incorrect ans    1= close answer    2= correct answer

        const correctAnswers= new Set(currentQuestion.answers);
        const closeAnswers= new Set(currentQuestion.closeAnswers);
        const currentUserUsedHints = req.user.usedHints.map((id) =>id.toHexString());
        let score=100;
        const roomJson=[2,5,7,10,11];

        //check if hint used, if so deduct points while scoring
        if(correctAnswers.has(userAnswerLower)){
          if(currentUserUsedHints.has(questionId.toHexString()))
            score-=50;
          //update score using dynamic algo 

          const addStarAndScore= await User.updateOne(
            {userId},
            {$inc:{stars:1}, $inc: {score:score}}, 
            {session});

          if(!addStarAndScore) throw new Error("Error updating stars and score");
          answerState= 2;

          const stringg="questionsStatus."+String(i);
          const query={};
          query[stringg]="solved";
          const updateStatus= Journey.updateOne(
            {userId,roomId},
            {$set: query},
            {session});
          if(!updateStatus) throw new Error("Error updating status of question");    

          //change locked to unlocked next question
          const nextQuestion="questionsStatus."+String(i+1);
          const queryyy={};
          queryyy[nextQuestion]="unlocked"; 
          if(i==1 || i==2 )
          {
            const updateStatus= await Journey.updateOne(
              {userId,roomId},
              {$set: queryyy}
            );     
          }
          //if stars enough to unlock the next room(separate function)-> unlock that room then
          
          const currentStar=req.user.star+1;
          for(let i=0;i<length(roomJson);i++)
          {
            if(currentStar==roomJson[i])
            {
              //unlock the i+1th room
              const {roomId}= await Room.findOne({roomNo:i+1});
              new JourneySchema({userId,roomId,roomUnlocked:true}).save();
            }
          }
          
          
        }
        else if(closeAnswers.has(userAnswerLower))
        {
          answerState=1;
        }
        
      }   
    }
    switch(answerState){
      case 1:
        response(res,{solved: "close, close answer"});  
        break;
      case 2:
        response(res,{solved: "hurray, correct answer!"});  
        break;
      default:
        response(res,{solved: "sorry, incorrect answer!"});
    }
  }

  catch(error){
    response(res, {}, 400, error.message, false);
  }    
  
  
};


