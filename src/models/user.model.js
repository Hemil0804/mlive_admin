const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    userName: {
        type: String
    },
    email: {
        type: String,
        index: true
    },
    password: {
        type: String,
        index: true
    },
    city: {
        type: String
    },
    phoneNo: {
        type: Number
    },
    segments: {
        type: [mongoose.Schema.Types.ObjectId]
    },
    profilePic: {
        type: String,
        index: true
    },
    resetToken: {
        type: String
    },
    otp: {
        type: Number
    },
    expirationTime: {
        type: Date
    },
    isEmailVerified: {
        type: Boolean
    },
    userType: {
        type: Number
    },
    clientId: {
        type: mongoose.Schema.Types.ObjectId
    },
    subscriptionType: {
        type: String,
        enum: ["3 days of trial", "1 month", "3 months", "6 months", "1 year"]
    },
    subscriptionStartDate: {
        type: Date
    },
    subscriptionEndDate: {
        type: Date
    },
    status: {
        type: Number,
        default: 1,
        Enum: [1, 2, 3],
        index: true
    }
}, { collection: "user", timestamps: true });

module.exports = mongoose.model("user", UserSchema);
