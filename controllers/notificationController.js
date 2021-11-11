const Notification = require("../models/notificatoinModel");
const { response } = require("../config/responseSchema");
<<<<<<< HEAD

exports.notifications = async (req, res) => {
    try {
        const notifs = await Notification.find().sort({ timestamp: -1 });

        response(res, { notifs });
=======
const mongoose = require("mongoose");
const logger = require("../config/logger");
const internal = async (req, res) => {
  try {
    var text = req.body.text;
    var timestamp = req.body.timestamp;
    var type = req.body.type;
    var metadata = req.body.metadata;

    const { modifiedCount, matchedCount } = await Notifications.updateOne(
      { text: text },
      { timestamp: timestamp },
      { type: type },
      { metadata: metadata }
    );
  } catch (err) {
    response(res, {}, 400, err.message, false);
  }
};

const notifications = async (req, res) => {
  try {
    const notifs = await Notifications.find().sort({ timestamp: -1 });
>>>>>>> 4c0265b (logger basics)

    response(res, { notifs });
  } catch (err) {
    response(res, {}, 400, err.message, false);
  }
};
