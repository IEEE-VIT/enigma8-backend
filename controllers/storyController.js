const User = require("../models/userModel");
const Room = require("../models/roomModel");
const Story = require("../story.json");
const { response } = require("../config/responseSchema");
const { getStorySchema } = require("../config/requestSchema");

exports.story = async (req, res) => {
    try {
        const id = req.user.id;
        const Users = await User.find({ "_id": id });
        const currentRoomId = Users[0].currentRoomId;
        const { roomId } = await getStorySchema.validateAsync(
            req.query
        );

        const roomData = await Room.find({ "_id": roomId });
        const currentRoomData = await Room.find({ "_id": currentRoomId });

        if ( roomData[0].roomNo > currentRoomData[0].roomNo) {
            throw new Error("Requested story is not from current room");
        }

        let data = [];
        Story.forEach(item => {
            if (item.roomNo == roomData[0].roomNo) {
                data.push(item.message);
            }
        });
        response(res, { story: data });
    } catch (err) {
        response(res, {}, 400, err.message, false);
    }
};

exports.fullStory = async (req, res) => {
    try {
        const id = req.user.id;
        const Users = await User.find({ "_id": id });
        const currentRoomId = Users[0].currentRoomId;
        const { roomId } = await getStorySchema.validateAsync(
            req.query
        );

        const roomData = await Room.find({ "_id": roomId });
        const currentRoomData = await Room.find({ "_id": currentRoomId });

        if ( roomData[0].roomNo > currentRoomData[0].roomNo) {
            throw new Error("Requested story is not from current room");
        }

        let data = [];
        Story.forEach(item => {
            if (item.roomNo <= roomData[0].roomNo) {
                data.push(item.message);
            }
        });
        response(res, { story: data });
    } catch (err) {
        response(res, {}, 400, err.message, false);
    }
};