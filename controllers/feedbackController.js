const { getFeedbackSchema } = require("../config/requestSchema");
const Feedback = require("../models/feedbackModel");
const { response } = require("../config/responseSchema");

exports.getFeedback = async (req, res) => {

    try {
        const { email, name, text, phone } = await getFeedbackSchema.validateAsync(
            req.body
        );

        const data = new Feedback({
            email: email,
            name: name,
            phone: phone,
            text: text
        });

        data.save();
        response(res, {message: "Feedback Sent"});
    } catch ( err ) {
        response(res, {}, 400, err.message, false);
    }
    
};