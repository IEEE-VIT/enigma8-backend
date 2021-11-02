const { getFeedbackSchema } = require("../config/requestSchema");
const User = require("../models/userModel");
const Feedback = require("../models/feedbackModel");
const { response } = require("../config/responseSchema");

exports.getFeedback = async (req, res) => {
    try {
        const id = req.user.id;
        const userData = await User.find({"_id": id});
        const email = userData[0].email;

        const { text } = await getFeedbackSchema.validateAsync(
            req.body
        );

        const data = new Feedback({
            email: email,
            text: text
        });

        data.save();
        response(res, {message: "Feedback Sent"});
    } catch ( err ) {
        response(res, {}, 400, err.message, false);
    }
    
};