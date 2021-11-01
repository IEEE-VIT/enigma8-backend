const Question = require("../models/questionModel");
const Room = require("../models/roomModel");
const User = require("../models/userModel");
const Journey = require("../models/journeyModel");
const { getQuestionSchema } = require("../config/requestSchema");
const { response } = require("../config/responseSchema");
const mongoose = require("mongoose");

exports.getQuestion = async(req,res) => { 
  try {     

    const { roomId } = await getQuestionSchema.validateAsync(req.body);    
    const userId= req.user.id;
    const currentJourney= await Journey.findOne({roomId, userId})    
     
  if(currentJourney === null)  
  {
    throw new Error ("Room is locked.")
  }

  let questionFound= false;
  for(let i=0; i<3;i++)
  {
    if(currentJourney.questionsStatus[i] === "unlocked")
    {      
      questionFound=true;
      const currentRoom= await Room.findOne({_id: roomId})           
      const questionId= currentRoom.questionId[i]      
      const question= await Question.findOne({_id: questionId}).select('text media mediaType questionNo currentRoom')
      response(res,question)      
    } 
  }    
    
    if(questionFound=== false) 
    {
      throw new Error ("You have solved the entire room")
    }
  }
  catch(err)
  {
    response(res, {}, 400, err.message, false);
  }
  
}

exports.submitAnswer= async(req,res) =>{
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const userId= req.user.id;
    const userAnswer= req.body.userAnswer;
    const userAnswerLower= userAnswer.toLowerCase();
    const roomId= req.body.roomId;
    const currentJourney= await Journey.findOne({roomId,userId})

    let i=0;
    let answerState=0;
    for(i=0; i<3;i++){
      if(currentJourney.questionsStatus[i] === "unlocked")
      {    
        const currentRoom= await Room.findOne({_id: roomId})           
        const questionId= currentRoom.questionId[i]      
        const currentQuestion= await Question.findOne({_id: questionId})
        
        // 0= incorrect ans    1= close answer    2= correct answer

        const correctAnswers= new Set(currentQuestion.answers)
        const closeAnswers= new Set(currentQuestion.closeAnswers)

        if(correctAnswers.has(userAnswerLower)){
         
          //update score using dynamic algo      
          const addStarAndScore= await User.updateOne(
            {userId},
            {$inc:{stars:1}, $inc: {score:100}}, 
            {session});

          if(!addStarAndScore) throw new Error("Error updating stars and score")
          answerState= 2;

          const stringg="questionsStatus."+String(i)
          const query={}
          query[stringg]="solved"
          const updateStatus= Journey.updateOne(
            {userId,roomId},
            {$set: query},
            {session});
          if(!updateStatus) throw new Error("Error updating status of question")    

          //change locked to unlocked next question      
          //if stars enough to unlock the next room(separate function)-> unlock that room then, 1st question as well
          
        }
        else if(closeAnswers.has(userAnswerLower))
        {
          answerState=1;
        }
        
      }   
    }

    if(answerState==1){
      response(res,{solved: "close, close answer"})  
    }
    else if(answerState==2){
      response(res,{solved: "hurray, correct answer!"})  
    }
    else{
      response(res,{solved: "sorry, incorrect answer!"})
    }    

    session.commitTransaction();
  }

  catch(error){
    await session.abortTransaction();
    response(res, {}, 400, error.message, false);
  }    
  session.endSession();
  
}


