const Room = require("../models/roomModel");
<<<<<<< HEAD
const Journey = require("../models/journeyModel");
const { response } = require("../config/responseSchema");
const { createUserSchema } = require("../config/requestSchema");

const getRooms = async (req, res) => {
    try{
        const userId = req.user.id;
        const userRoms = await Journey.find({userId});
        const rooms = await Room.find();
        const userRooms = new Set(userRoms.roomId);
       
        let data = [];
        rooms.forEach(item => {
            if(userRooms.has(item.roomId)){
                let jou = userRoms.find(a => a.roomId == item.RoomId)
                data.push([item.roomId, item.roomNo, item.media, item.title, item.star_quota, jou.roomUnlocked, jou.power_up_id, jou.power_up_id, jou.stars]);
            }
        });

        response(res, { rooms : data});
=======
const jou = require("../models/journeyModel");
const { createUserSchema } = require("../config/requestSchema");
const { response } = require("../config/responseSchema");

const getRooms = async (req, res) => {
    try{
        const userid = req.Journey.userId;
>>>>>>> fa13e28 (abstract array for rooms)
        
    }catch(err){
        response(res, {}, 400, err.message, false);
    }
};

<<<<<<< HEAD
module.exports = {getRooms};
=======
module.exports = getRooms;
>>>>>>> fa13e28 (abstract array for rooms)
