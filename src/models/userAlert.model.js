const mongoose = require('mongoose');

const userAlertSchema = new mongoose.Schema({
  _id: {
    type: String,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  scriptId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  type: {
    type: String,
  },
  direction: {
    type: Number, // Specify the type
    default: 1,
    enum: [1, 2, 3],
    index: true,
  },
  value: {
    type: Number,
  },
  status: {
    type: Number, // Specify the type
    default: 1,
    enum: [1, 2, 3],
    index: true,
  },
  _class: {
    type: String,
    default: 'com.live.market.model.userAlert',
  },
}, { collection: 'userAlert', timestamps: true });

module.exports = mongoose.model('userAlert', userAlertSchema);
