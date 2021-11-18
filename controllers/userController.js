const User = require("../models/userModel");
const Room = require("../models/roomModel");
const Powerup = require("../models/powerupModel");
const Journey = require("../models/journeyModel");
const logger = require("../config/logger");
const {
  createUserSchema,
  consumePowerupSchema,
} = require("../config/requestSchema");
const { response } = require("../config/responseSchema");
const mongoose = require("mongoose");

exports.createUser = async (req, res) => {
  try {
    const data = { email: req.user.email, ...req.body };

    if (!data.email) {
      throw new Error("Please enter email");
    } else if (!data.username) {
      throw new Error("Please enter username");
    } else if (!data.outreach) {
      throw new Error("Please enter outreach");
    }

    const { email, username, outreach } = await createUserSchema.validateAsync(
      data
    );

    //check if username already setup for email
    const alreadySet = await User.find({
      email,
      username: { $ne: null },
    }).count();
    if (alreadySet)
      throw new Error(
        "username for this email is already set, it cannot be updated"
      );

    //check if username is available
    const isUsernameDuplicate = await User.find({
      username: { $regex: new RegExp(`^${username}$`), $options: "i" },
    }).count();
    if (isUsernameDuplicate) throw new Error("username not unique");

    //write to db
    const newDoc = await User.findOneAndUpdate(
      { email: email },
      { username, outreach },
      { new: true }
    );
    response(res, newDoc);
    logger.info(`User created! Email:${email} Username:${username}`);
  } catch (err) {
    response(res, {}, 400, err.message, false);
    logger.error(req.user.email + "-> " + err);
  }
};

exports.getPowerups = async (req, res) => {
  try {
    const { usedPowerups } = req.user;

    const allPowerUp = await Powerup.find({});

    const usedPowerupsSet = new Set(usedPowerups.map((id) => id.toHexString())); // a set of Obj ID string

    const data = allPowerUp.map(({ _id, name, detail, icon }) => {
      const available_to_use = usedPowerupsSet.has(_id.toHexString())
        ? false
        : true;
      return { _id, name, detail, icon, available_to_use };
    });

    response(res, { powerups: data });
  } catch (err) {
    response(res, {}, 400, err.message, false);
    logger.error(req.user.email + "-> " + err);
  }
};
exports.getUser = async (req, res) => {
  try {
    const { username, email, score, stars, currentRoomId } = req.user;
    if (!username) throw new Error("user creation flow not complete yet");
    //find user rank
    const allData = await User.find(
      { username: { $ne: null } },
      { username: 1, score: 1 }
    ).sort({ score: -1, scoreLastUpdated: 1 });

    let startRank = 1;
    const rankedData = allData.map(({ username, score }) => {
      return { username, score, rank: startRank++ };
    });

    const { rank } = rankedData.filter(
      ({ username }) => req.user.username === username
    )[0];

    const user = {
      username: username,
      email: email,
      score: score,
      starts: stars,
      rank: rank,
      currentRoomId: currentRoomId,
    };
    response(res, user);
  } catch (err) {
    response(res, {}, 400, err.message, false);
    logger.error(req.user.email + "-> " + err);
  }
};

exports.startJourney = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const userId = req.user.id;

    session.startTransaction();

    if (!req.body.powerupId) {
      throw new Error("Please select a powerup");
    } else if (!req.body.roomId) {
      throw new Error("Please select a Room");
    }

    //JOI validation
    const { powerupId, roomId } = await consumePowerupSchema.validateAsync({
      powerupId: req.body.powerupId,
      roomId: req.body.roomId,
    });

    const checkIfPowerUpExists = await Powerup.findOne({ _id: powerupId });
    if (!checkIfPowerUpExists) throw new Error("please use a valid powerup");

    const alreadyUsedPowerups = new Set(req.user.usedPowerups);
    if (alreadyUsedPowerups.has(powerupId))
      throw new Error("this powerup has already been selected");

    const user = await User.findOneAndUpdate(
      { _id: userId },
      { $addToSet: { usedPowerups: powerupId } },
      { session }
    );
    if (!user) throw new Error("error updating user");

    const room = await Room.findOne({ _id: roomId });
    if (!room) throw new Error("this room doesn't exist");

    if (room.roomNo === "1") {
      const journeyAlreadyExists = await Journey.findOne({
        userId: userId,
        roomId: room.id,
      });

      if (journeyAlreadyExists) throw new Error("you are already in room 1");

      const roomOneJourney = await Journey.create(
        [
          {
            userId,
            roomId: room.id,
            stars: 0,
            powerupUsed: "no",
            roomUnlocked: true,
            powerupId: powerupId,
            questionsStatus: ["unlocked", "locked", "locked"],
            powerupSet: true,
          },
        ],
        { session }
      );
      if (!roomOneJourney) throw new Error("error creating room 1 journey");
    } else {
      const checkIfJourneyExists = await Journey.findOne({ userId, roomId });
      if (!checkIfJourneyExists)
        throw new Error("please unlock the room first");
      if (checkIfJourneyExists.powerupId)
        throw new Error("you have already selected powerup");

      const updatedJourney = await Journey.findOneAndUpdate(
        { userId, roomId },
        { powerupId: powerupId,
        powerupSet: true },
        { session }
      );
      if (!updatedJourney) throw new Error("error updating journey");
    }
    const userCurrentRoom = await User.findOneAndUpdate(
      { _id: userId },
      { currentRoomId: roomId },
      { session }
    );

    if (!userCurrentRoom) throw new Error("error updating current room");
    await session.commitTransaction();
    session.endSession();
    response(res, { powerUp: checkIfPowerUpExists, room });
  } catch (err) {
    console.log(err);
    logger.error(req.user.email + "-> " + err);
    await session.abortTransaction();
    session.endSession();

    response(res, {}, 400, err.message, false);
  }
};

exports.addFCM = async (req, res) => {
  try {
    const { id, username } = req.user;
    const { token, os } = req.body;
    if (!token) throw new Error("Please add token");
    if (!os) throw new Error("Please add os");
    const possibleOs = new Set(["android", "ios", "web"]);
    if (!possibleOs.has(os)) throw new Error("invalid os");

    const user = await User.findOneAndUpdate(
      { _id: id },
      { $addToSet: { fcmToken: { token, os } } }
    );

    response(res, {
      message: "the token was successfully added for user " + username,
    });
  } catch (err) {
    logger.error(req.user.email + "-> " + err);
    response(res, {}, 400, err.message, false);
  }
};
