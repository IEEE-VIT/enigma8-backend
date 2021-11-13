const Notification = require("../models/notificatoinModel");
const { response } = require("../config/responseSchema");

exports.notifications = async (req, res) => {
  try {
    const notifs = await Notification.find().sort({ timestamp: -1 });

    response(res, { notifs });
  } catch (err) {
    response(res, {}, 400, err.message, false);
  }
};
