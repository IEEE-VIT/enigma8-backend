const Room = require("../models/roomModel");
const Journey = require("../models/journeyModel");
const { response } = require("../config/responseSchema");
const { createUserSchema } = require("../config/requestSchema");
const mongoose = require("mongoose");

const getRooms = async (req, res) => {
    try {
        const userId = req.user.id;
        const allJourney = await Journey.find({ userId });
        const rooms = await Room.find();
        let userRoomIds = [];

        allJourney.forEach(item => {
            userRoomIds.push(item.roomId);
        });

        let info = {};
        let data = [];
        rooms.forEach(item => {
            if (userRoomIds.find(roomId => roomId == item.id)) {
                let jou = allJourney.find(a => a.roomId == item.id)
                info = {"room": item, "journey":jou}
                data.push(info);
            }
            else {
                let jou = {
                    "_id" : null,
                    "roomUnlocked": false,
                    "powerupId": null,
                    "powerupUsed": false,
                    "stars": 0,
                    "question1": "locked",
                    "question2": "locked",
                    "question3": "locked"
                }
                info = {"room": item, "journey":jou}
                data.push(info);
            }
        });

        response(res, { allRooms: data });

    } catch (err) {
        response(res, {}, 400, err.message, false);
    }
};

module.exports = { getRooms };
