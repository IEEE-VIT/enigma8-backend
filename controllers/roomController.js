const Room = require("../models/roomModel");
const Journey = require("../models/journeyModel");
const { response } = require("../config/responseSchema");
const logger = require("../config/logger");
const checkIfRoomUnlocked = async (req, res) => {
  try {
    const roomId = req.query.roomId;
    if (!roomId) {
      throw new Error("please specify a room id");
    }
    const room = await Room.findOne({ _id: roomId });

    if (!room) {
      throw new Error("no such room found");
    }

    let unlock = false;
    let starsNeeded = 0;

    if (req.user.stars >= room.starQuota) {
      unlock = true;
    } else {
      starsNeeded = room.starQuota - req.user.stars;
    }

    response(res, { unlock, starsNeeded });
  } catch (err) {
    logger.error(req.user.email + "-> " + err);
    response(res, {}, 400, err.message, false);
  }
};

const getRooms = async (req, res) => {
  try {
    const userId = req.user.id;
    const allJourney = await Journey.find({ userId });
    const rooms = await Room.find();
    let userRoomIds = [];

    allJourney.forEach((item) => {
      userRoomIds.push(item.roomId);
    });

    let info = {};
    let data = [];
    rooms.forEach((item) => {
      if (userRoomIds.find((roomId) => roomId == item.id)) {
        let jou = allJourney.find((a) => a.roomId == item.id);
        info = { room: item, journey: jou };
        data.push(info);
      } else {
        let jou = {
          _id: null,
          userId: null,
          roomId: null,
          stars: 0,
          powerupUsed: "no",
          roomUnlocked: false,
          powerupId: null,
          questionsStatus: ["locked", "locked", "locked"],
        };
        info = { room: item, journey: jou };
        data.push(info);
      }
    });

    response(res, { data });
  } catch (err) {
    logger.err(req.user.email + "-> " + err);
    response(res, {}, 400, err.message, false);
  }
};

module.exports = { getRooms, checkIfRoomUnlocked };
