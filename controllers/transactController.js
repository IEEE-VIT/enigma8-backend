const Question = require("../models/questionModel");
const Room = require("../models/roomModel");
const User = require("../models/userModel");
const Journey = require("../models/journeyModel");
const { getQuestionSchema } = require("../config/requestSchema");
const { response } = require("../config/responseSchema");

exports.getQuestion = async(req,res) => { 
  try {       

     const { roomId } = await getQuestionSchema.validateAsync(req.body);
     const email = req.user.email;
     const user= await User.findOne({email})
     const userId= user.userId;
     const currentJourney= await Journey.findOne({roomId: roomId, userId: userId})    
     
  if(currentJourney.roomUnlocked=== false)  
    throw new Error ("Room is locked.")
    
     if(currentJourney.question1 === "unsolved")
    {      
      const currentRoom= await Room.findOne({_id: roomId})           
      const questionId= currentRoom.questionId[0]      
      const question= await Question.findOne({_id: questionId})
      console.log(question) 
      response(res,{text: question.text, media: question.media});
      
    } 

    else if(currentJourney.question2 === "unsolved")
    {
      const currentRoom= await Room.find({_id: roomId})           
      const questionId= currentRoom.questionId[1]      
      const question= await Question.findOne({_id: questionId})      
      response(res,{text: question.text, media: question.media});
    }

    else if(currentJourney.question3 === "unsolved")
    {
      const currentRoom= await Room.find({_id: roomId})           
      const questionId= currentRoom.questionId[2]      
      const question= await Question.findOne({_id: questionId})      
      response(res,{text: question.text, media: question.media});
    } 
  }
  catch(err)
  {
    response(res, {}, 400, err.message, false);
  }
  
}
