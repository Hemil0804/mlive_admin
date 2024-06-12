const mongoose = require("mongoose");

const jwtTokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        index: true
    },
    token: {
        type: String,
        index: true
    },
    userType: {
        type: Number,
        enum: [1, 2, 3, 4], // 1: super admin, 2: sub-admin, 3: client, 4: user
    },
    status: {
        type: Number,
        enum: [1, 2, 3],
        default: 1
    }
}, { collection: "jwtToken", timestamps: true });

module.exports = mongoose.model("jwtToken", jwtTokenSchema);