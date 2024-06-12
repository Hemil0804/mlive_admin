// const mongoose = require("mongoose");

// const scriptHistorySchema = new mongoose.Schema({
//     script: {
//         type: Object
//     }
// }, { collection: "scriptHistory", timestamps: true });

// module.exports = mongoose.model("scriptHistory", scriptHistorySchema);

const mongoose = require('mongoose');

const scriptHistorySchema = new mongoose.Schema({
  _id: String,
  script: {
    type: Object,
  },
  createdDate: {
    type: Date,
  },
  _class: {
    type: String,
    default: 'com.live.market.model.ScriptHistory',
  },
}, { collection: 'scriptHistory', timestamps: true });

module.exports = mongoose.model('scriptHistory', scriptHistorySchema);
