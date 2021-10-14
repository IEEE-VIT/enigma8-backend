const User = require("../models/userModel");
const Room = require("../models/roomModel");

const { response } = require("../config/responseSchema");

exports.unlockRoom = async (req, res) => {
    try {
        const id = req.user.id;
        const roomId = req.body.roomId;

        const Users = await User.find({ "_id": id });
        const rooms = await Room.find({ "_id": roomId });

        let unlock = false;

        if (Users.stars >= rooms.starQuota) {
            unlock = true;
        }

        response(res, { unlock: unlock });

    } catch (err) {
        response(res, {}, 400, err.message, false);
    }
};
