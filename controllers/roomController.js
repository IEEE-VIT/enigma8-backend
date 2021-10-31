const User = require("../models/userModel");
const Room = require("../models/roomModel");
const Journey = require("../models/journeyModel");
const { response } = require("../config/responseSchema");
const { createUserSchema } = require("../config/requestSchema");
const mongoose = require("mongoose");

const unlockRoom = async (req, res) => {
    try {
        const id = req.user.id;
        const roomId = req.body.roomId;

        const Users = await User.find({ "_id": id });
        const rooms = await Room.find({ "_id": roomId });

        let unlock = false;

        if (Users.stars >= rooms.starQuota) {
            unlock = true;
        }

        response(res, { unlock: unlock });

    } catch (err) {
        response(res, {}, 400, err.message, false);
    }
};


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
                info = { "room": item, "journey": jou }
                data.push(info);
            }
            else {
                let jou = {
                    "_id": null,
                    "userId": null,
                    "roomId": null,
                    "stars": 0,
                    "powerupUsed": false,
                    "roomUnlocked": false,
                    "powerupId": null,
                    "questionsStatus": ["locked", "locked", "locked"]
                }
                info = { "room": item, "journey": jou }
                data.push(info);
            }
        });

        response(res, { data });

    } catch (err) {
        response(res, {}, 400, err.message, false);
    }
};

module.exports = { getRooms, unlockRoom };
