const Question = require("../models/questionModel");
const Room = require("../models/roomModel");
const User = require("../models/userModel");
const Journey = require("../models/journeyModel");
const { createUserSchema } = require("../config/requestSchema");
const { response } = require("../config/responseSchema");

exports.getQuestion = async(req,res) => {
 console.log("helloooo");
  try {    
    
     const currentJourney= await Journey.find({roomId: req.body.roomId})     
     const email = req.user.email;

     if(currentJourney[0].question1 === "unsolved")
    {      
      const currentRoom= await Room.find({_id: req.body.roomId})           
      const questionId= currentRoom[0].questionId[0]      
      const question= await Question.findOne({_id: questionId}) 
      // response(res,questiontext);
      res.status(200).json(question.text)
    } 
    else if(currentJourney[0].question2 === "unsolved")
    {
      const currentRoom= await Room.find({_id: req.body.roomId})           
      const questionId= currentRoom[0].questionId[1]      
      const question= await Question.findOne({_id: questionId})      
     // response(res,questiontext);
     res.status(200).json(question.text)
    }

    else if(currentJourney[0].question3 === "unsolved")
    {
      const currentRoom= await Room.find({_id: req.body.roomId})           
      const questionId= currentRoom[0].questionId[2]      
      const question= await Question.findOne({_id: questionId})      
      // response(res,questiontext);
      res.status(200).json(question.text)
    } 
  }
  catch(err)
  {
    response(res, {}, 400, err.message, false);
  }
}
