const Notifications = require("../models/notificatoinModel");
const Journey = require("../models/journeyModel");
const { response } = require("../config/responseSchema");
const mongoose = require("mongoose");

const internal = async (req, res) => {
    try {
        var text = req.body.text;
        var timestamp = req.body.timestamp;
        var type = req.body.type;
        var metadata = req.body.metadata;

        const { modifiedCount, matchedCount } = await Notifications.updateOne(
            { text: text },
            { timestamp: timestamp },
            { type: type},
            { metadata: metadata}
        );

    } catch (err) {
        response(res, {}, 400, err.message, false);
    }
};


const notifications = async (req, res) => {
    try {
        const notifs = await Notifications.find().sort({ timestamp: -1 });

        response(res, { notifs });

    } catch (err) {
        response(res, {}, 400, err.message, false);
    }
};

module.exports = { internal, notifications };
