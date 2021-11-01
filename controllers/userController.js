const User = require("../models/userModel");
const Powerup = require("../models/powerupModel");
const Journey = require("../models/journeyModel");
const {
  createUserSchema,
  consumePowerupSchema,
} = require("../config/requestSchema");
const { response } = require("../config/responseSchema");
const mongoose = require("mongoose");

exports.createUser = async (req, res) => {
  try {
    // const email = req.user.email;
    const data = { email: req.user.email, ...req.body };

    const { email, username, isCollegeStudent, outreach } =
      await createUserSchema.validateAsync(data);

    //check if username already setup for email
    const alreadySet = await User.find({
      email,
      username: { $ne: null },
    }).count();
    if (alreadySet)
      throw new Error(
        "Username for this email is already set. It cannot be updated"
      );

    //check if username is available
    const isUsernameDuplicate = await User.find({ username }).count();
    if (isUsernameDuplicate) throw new Error("username not unique");

    //write to db
    const { modifiedCount, matchedCount } = await User.updateOne(
      { email: email },
      { username, isCollegeStudent, outreach }
    );
    if (matchedCount === 0) throw new Error("email does not exist");
    else if (modifiedCount === 1)
      response(res, { message: "user profile updated" });
    else throw new Error("unexpected database error");
  } catch (err) {
    response(res, {}, 400, err.message, false);
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
  }
};
exports.getUser = async (req, res) => {
  try {
    const { username, email, score, stars, currentRoomId } = req.user;

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
  }
};

exports.startJourney = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const id = req.user.id;

    //JOI validation
    const { powerupId, roomId } = await consumePowerupSchema.validateAsync({
      powerupId: req.body.powerupId,
      roomId: req.body.roomId,
    });

    session.startTransaction();
    const user = await User.findOneAndUpdate(
      { _id: id },
      { $addToSet: { usedPowerups: powerupId } },
      { session }
    );
    if (!user) throw new Error("Error updating user");
    const journey = await Journey.findOneAndUpdate(
      { userid: id, roomId },
      { powerupId: powerupId },
      { session }
    );

    if (!journey) throw new Error("Error updating journey");
    const currentRoom = await User.findOneAndUpdate(
      { _id: id },
      { currentRoomId: roomId },
      { session }
    );

    if (!currentRoom) throw new Error("Error updating current room");
    await session.commitTransaction();
    session.endSession();
    response(res, { message: "success" });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    response(res, {}, 400, err.message, false);
  }
};

exports.addFCM = async (req, res) => {
  try {
    const { id, username } = req.user;
    const { token } = req.body;

    const user = await User.findOneAndUpdate(
      { _id: id },
      { $addToSet: { fcmToken: token } }
    );

    response(res, {
      message: "The token was successfully added for user " + username,
    });
  } catch (err) {
    response(res, {}, 400, err.message, false);
  }
};
