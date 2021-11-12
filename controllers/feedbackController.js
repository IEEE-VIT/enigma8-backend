const { getFeedbackSchema } = require("../config/requestSchema");
const Feedback = require("../models/feedbackModel");
const { response } = require("../config/responseSchema");

exports.getFeedback = async (req, res) => {
    try {
        const id = req.user.id;

        const { isVITStudent, gameRating, userExperience, featureIdeas, difficulties, other} = await getFeedbackSchema.validateAsync(
            req.body
        );

        const data = Feedback.create({
            isVITStudent,
            gameRating,
            userExperience, 
            featureIdeas,
            difficulties, 
            other
        });

        response(res, {message: "Feedback Sent"});
    } catch ( err ) {
        response(res, {}, 400, err.message, false);
    }
    
};