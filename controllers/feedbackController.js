const { getFeedbackSchema } = require("../config/requestSchema");
const User = require("../models/userModel");
const Feedback = require("../models/feedbackModel");
const { response } = require("../config/responseSchema");
const logger = require("../config/logger");
exports.getFeedback = async (req, res) => {
  try {
    const email = req.user.email;

    const {
      isVITStudent,
      regNo,
      vitEmail,
      gameRating,
      userExperience,
      featureIdeas,
    } = await getFeedbackSchema.validateAsync(req.body);

    // const doesFeedbackExist = await Feedback.findOne({ email });
    // if (doesFeedbackExist) {
    //   throw new Error("You have already given feedback");
    // }

    const data = new Feedback({
      email,
      isVITStudent,
      regNo,
      vitEmail,
      gameRating,
      userExperience,
      featureIdeas,
    });

    data.save();
    response(res, { message: "feedback Sent" });
  } catch (err) {
    logger.error(req.user.email + "-> " + err);
    response(res, {}, 400, err.message, false);
  }
};

exports.feedbackFilled = async (req, res) => {
  try {
    const email = req.user.email;

    let data;
    const doesFeedbackExist = await Feedback.findOne({ email });
    if (doesFeedbackExist) {
      data = {
        feedbackFilled: true,
      };
    } else {
      data = {
        feedbackFilled: false,
      };
    }
    response(res, { data });
  } catch (err) {
    logger.error(req.user.email + "-> " + err);
    response(res, {}, 400, err.message, false);
  }
};
