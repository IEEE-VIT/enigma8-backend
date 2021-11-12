const Notification = require("../models/notificatoinModel");
const { response } = require("../config/responseSchema");

exports.setNotification = async (req, res) => {
    try {

        const data = new Notification({
            text: req.body.text,
            timestamp: req.body.timestamp,
            type: req.body.type,
            metadata: req.body.metadata
        });
        data.save()
        response(res, {message: "Notif set"});
    } catch (err) {
        response(res, {}, 400, err.message, false);
    }
};


exports.notifications = async (req, res) => {
    try {
        const notifs = await Notification.find().sort({ timestamp: -1 });

        response(res, { notifs });

    } catch (err) {
        response(res, {}, 400, err.message, false);
    }
};
