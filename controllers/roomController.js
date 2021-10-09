const Room = require("../models/roomModel");
const jou = require("../models/journeyModel");
const { createUserSchema } = require("../config/requestSchema");
const { response } = require("../config/responseSchema");

const getRooms = async (req, res) => {
    try{
        const userid = req.Journey.userId;
        
    }catch(err){
        response(res, {}, 400, err.message, false);
    }
};

module.exports = getRooms;