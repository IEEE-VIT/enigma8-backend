const User = require("../models/userModel");
const Room = require("../models/roomModel");
const Story = require("../story.json");
const { response } = require("../config/responseSchema");
const { getStorySchema } = require("../config/requestSchema");
const logger = require("../config/logger");
exports.story = async (req, res) => {
  try {
    const currentRoomId = req.user.currentRoomId;
    if (!currentRoomId) {
      throw new Error("Please start playing Enigma first!");
    }

    const { roomId } = await getStorySchema.validateAsync(req.query);
    if (!req.query.roomId) {
      throw new Error("Please select a room");
    }

    const roomData = await Room.findOne({ id: roomId });
    const currentRoomData = await Room.findOne({ _id: currentRoomId });

    if (roomData.roomNo > currentRoomData.roomNo)
      throw new Error("Requested story is not from current room");

    let data = [];
    Story.forEach((item) => {
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
    if (!currentRoomId) {
      throw new Error("Please start playing Enigma first!");
    }

    const currentRoomData = await Room.findOne({ _id: currentRoomId });
    const currRoomNo = parseInt(currentRoomData.roomNo, 10);

    let data = [];
    Story.forEach((item) => {
      const objRoomNo = parseInt(item.roomNo, 10);
      if (objRoomNo <= currRoomNo) {
        data.push(item);
      }
    });
    response(res, { story: data });
  } catch (err) {
    logger.error(req.user.email + "-> " + err);
    response(res, {}, 400, err.message, false);
  }
};
