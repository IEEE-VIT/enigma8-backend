const Notification = require("../models/notificatoinModel");
const { response } = require("../config/responseSchema");
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
    logger.err(req.user.email + "-> " + err);
    response(res, {}, 400, err.message, false);
  }
};

const notifications = async (req, res) => {
  try {
    const notifs = await Notifications.find().sort({ timestamp: -1 });

    response(res, { notifs });
  } catch (err) {
    logger.err(req.user.email + "-> " + err);
    response(res, {}, 400, err.message, false);
  }
};
module.exports = { notifications };
