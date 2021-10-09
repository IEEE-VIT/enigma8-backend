const mongoose = require("mongoose");
require('mongoose-type-url');

const roomSchema= new mongoose.Schema({

  roomId: {
    type: String
  },

  roomNo: {
    type: String
  },
  
  
  questionId: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }],

  media: {
    type: mongoose.SchemaTypes.Url
  },

  title: {
    type: String
  },

  starQuota: {
    type: Number
  }
}
);

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;
