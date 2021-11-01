const mongoose = require("mongoose");

require("mongoose-type-url");

const notificationSchema = new mongoose.Schema({
    text: {
      type: String,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  
    type: {
      type: String,
      enum: ["social", "feedback"],
      default: "social",
    },
    metadata: {
        type: mongoose.SchemaTypes.Url,
    },
  });
  
const Notification = mongoose.model("Notifications", notificationSchema);

module.exports = Notification;
  