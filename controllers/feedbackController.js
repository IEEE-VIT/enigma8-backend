const { getFeedbackSchema } = require("../config/requestSchema");
const User = require("../models/userModel");
const Feedback = require("../models/feedbackModel");
const { response } = require("../config/responseSchema");

exports.getFeedback = async (req, res) => {
    try {
        const id = req.user.id;
        const userData = await User.findOne({"_id": id});
        const email = userData.email;

        if (!req.body.isVITStudent) {
            throw new Error("Please enter if you are VIT student or not");
        }
        else if (!req.body.gameRating) {
            throw new Error("Please enter your rating of Enigma");
        }
        else if (!req.body.userExperience) {
            throw new Error("Please give your experience about Enigma");
        }
        else if (!req.body.featureIdeas) {
            throw new Error("Please enter any feature ideas you have");
        }
        else if (!req.body.other) {
            throw new Error("Please enter other feedback about Enigma");
        }

        const { isVITStudent, gameRating, userExperience, featureIdeas, difficulties, other} = await getFeedbackSchema.validateAsync(
            req.body
        );

        const data = new Feedback({
            isVITStudent,
            gameRating,
            userExperience, 
            featureIdeas,
            difficulties, 
            other
        });

        data.save();
        response(res, {message: "Feedback Sent"});
    } catch ( err ) {
        response(res, {}, 400, err.message, false);
    }
    
};