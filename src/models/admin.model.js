const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
        },
        lastName: {
          type: String,
        },
        email: {
            type: String,
            index: true
        },
        password: {
            type: String,
            index: true
        },
        phone: {
            type: Number,
            index: true
        },
        profilePic: {
            type: String,
            index: true
        },
        resetToken: {
            type: String,
            index: true
        },
        userType: {
            type: Number,
            enum: [1, 2]    // 1: super-admin, 2: sub-admin
        },
        status: {
            type: Number,
            default: 1,
            enum: [1, 2, 3],
            index: true
        }
    },
    { collection: "admin", timestamps: true }
);
module.exports = mongoose.model("admin", adminSchema);
