const Room = require("../models/roomModel");
const Journey = require("../models/journeyModel");
const { response } = require("../config/responseSchema");
const { createUserSchema } = require("../config/requestSchema");
const mongoose = require("mongoose");

const getRooms = async (req, res) => {
    try{
        const userId = req.user.id;
        const allJourney = await Journey.find({userId});
        const rooms = await Room.find();
        let userRoomIds = [];

        allJourney.forEach(item => {
            userRoomIds.push(item.roomId);
        });
       
        let data = [];
        rooms.forEach(item => {
            if(userRoomIds.find(roomId => roomId == item.id)){
                let jou = allJourney.find(a => a.roomId == item.id)
                data.push([item.id, item.roomNo, item.media, item.title, item.starQuota, jou.roomUnlocked, jou.powerupId, jou.powerupUsed, jou.stars]);
            }
        });

        response(res, {allRooms: data});
        
    }catch(err){
        response(res, {}, 400, err.message, false);
    }
};

module.exports = {getRooms};
