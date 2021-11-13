const { getFeedbackSchema } = require("../config/requestSchema");
const User = require("../models/userModel");
const Feedback = require("../models/feedbackModel");
const { response } = require("../config/responseSchema");
const logger = require("../config/logger");
exports.getFeedback = async (req, res) => {
  try {
    const id = req.user.id;
    const userData = await User.findOne({ _id: id });
    const email = userData.email;

    const {
      isVITStudent,
      gameRating,
      userExperience,
      featureIdeas,
      difficulties,
      other,
    } = await getFeedbackSchema.validateAsync(req.body);

    const data = new Feedback({
      isVITStudent,
      gameRating,
      userExperience,
      featureIdeas,
      difficulties,
      other,
    });

    data.save();
    response(res, { message: "feedback Sent" });
  } catch (err) {
    logger.error(req.user.email + "-> " + err);
    response(res, {}, 400, err.message, false);
  }
};
