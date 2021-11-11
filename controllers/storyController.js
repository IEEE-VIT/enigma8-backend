const User = require("../models/userModel");
const Room = require("../models/roomModel");
const Story = require("../story.json");
const { response } = require("../config/responseSchema");
const { getStorySchema } = require("../config/requestSchema");

exports.story = async (req, res) => {
    try {
        const currentRoomId = req.user.currentRoomId;
        const { roomId } = await getStorySchema.validateAsync(
            req.query
        );

        const roomData = await Room.findOne({ "_id": roomId });
        const currentRoomData = await Room.findOne({ "_id": currentRoomId });

        if ( roomData.roomNo > currentRoomData.roomNo) throw new Error("Requested story is not from current room");

        let data = [];
        Story.forEach(item => {
            if (item.roomNo === roomData.roomNo) {
                data.push(item);
            }
        });
        response(res, { story: data });
    } catch (err) {
        response(res, {}, 400, err.message, false);
    }
};

exports.fullStory = async (req, res) => {
    try {
        const currentRoomId = req.user.currentRoomId;
        const { roomId } = await getStorySchema.validateAsync(
            req.query
        );

        const roomData = await Room.findOne({ "_id": roomId });
        const currentRoomData = await Room.findOne({ "_id": currentRoomId });

        if ( roomData.roomNo > currentRoomData.roomNo) {
            throw new Error("Requested story is not from current room");
        }

        let data = [];
        Story.forEach(item => {
            if (item.roomNo <= roomData.roomNo) {
                data.push(item);
            }
        });
        response(res, { story: data });
    } catch (err) {
        response(res, {}, 400, err.message, false);
    }
};