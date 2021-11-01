const Room = require("../models/roomModel");
const Story = require("../story.json");
const { response } = require("../config/responseSchema");
const { getStorySchema } = require("../config/requestSchema");

exports.story = async( req, res ) => {
    try {
        const { roomId } = await getStorySchema.validateAsync(
            req.query
        );
        const roomData = await Room.find({ "_id": roomId});

        let data = [];
        Story.forEach(item => {
            if( item.roomNo == roomData[0].roomNo){
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
        const { roomId } = await getStorySchema.validateAsync(
            req.query
        );
        const roomData = await Room.find({ "_id": roomId});

        let data = [];
        Story.forEach(item => {
            if( item.roomNo <= roomData[0].roomNo){
                data.push(item.message);
            }
        });
        response(res, { story: data });
    } catch (err){
        response(res, {}, 400, err.message, false);
    }
};