const User = require("../models/userModel");
const Powerup = require("../models/powerupModel");
const { createUserSchema } = require("../config/requestSchema");
const { response } = require("../config/responseSchema");
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
    const email = req.user.email;

    const allPowerUp = await Powerup.find({});
    const user = await User.findOne({ email });
    const usedPowerupsSet = new Set(user.usedPowerups);
    const data = allPowerUp.map(({ powerupId, name, details, icon }) => {
      const available_to_use = usedPowerupsSet.has(powerupId) ? false : true;
      return { powerupId, name, details, icon, available_to_use };
    });
    //console.log(data);
    response(res, { powerups: data });
  } catch (err) {
    response(res, {}, 400, err.message, false);
  }
};
