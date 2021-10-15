const User = require("../models/userModel");
const Story = require("../models/storyModel");
const { response } = require("../config/responseSchema");

exports.story = async( req, res ) => {
    try {
        const id = req.user.id;
        const userData = User.find({"_id": id});

        let data = [];
        Story.forEach(item => {
            if( item.roomId == userData.currentRoom){
                data.push(item.message);
            }
        });
        response(res, { story: data });
    } catch (err){
        response(res, {}, 400, err.message, false);
    }
};

exports.fullStory = async( req, res ) => {
    try {
        const id = req.user.id;
        const userData = User.find({"_id": id});

        let data = [];
        Story.forEach(item => {
            if( item.roomId <= userData.roomId){
                data.push(item.message);
            }
        });
        response(res, { story: data });
    } catch (err){
        response(res, {}, 400, err.message, false);
    }
};