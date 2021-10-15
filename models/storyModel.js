const mongoose = require("mongoose");

const storySchema = new mongoose.Schema({
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Room",
    },
    sender: {
        type: String,
    },
    message: {
        type: String,
    },

    index: {
        type: Number,
    },
});

const Story = mongoose.model("Story", storySchema);

module.exports = Story;
