const Room = require("../models/roomModel");
const Journey = require("../models/journeyModel");
const { response } = require("../config/responseSchema");
const { createUserSchema } = require("../config/requestSchema");

const getRooms = async (req, res) => {
    try{
        const userId = req.user.email;
        const userRoms = await Journey.find({userId});
        const rooms = await Room.find({});
        const userRooms = new Set(userRoms.roomId);
       
        const data = [];
        rooms.forEach(item => {
            if(userRooms.has(item.roomId)){
                let jou = userRoms.find(a => a.roomId == item.RoomId)
                data.push([item.roomId, item.roomNo, item.media, item.title, item.star_quota, jou.roomUnlocked, jou.power_up_id, jou.power_up_id, jou.stars]);
            }
        });

        response(res, { rooms : data});
        
    }catch(err){
        response(res, {}, 400, err.message, false);
    }
};

module.exports = {getRooms};