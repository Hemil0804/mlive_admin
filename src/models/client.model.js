const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            index: true
        },
        lastName: {
            type: String,
            index: true
        },
        email: {
            type: String,
            index: true
        },
        phoneNo: {
            type: String,
            index: true
        },
        password: {
            type: String,
            index: true
        },
        userCount: {
            type: Number
        },
        profileImage: {
            type: String,
            index: true
        },
        subAdminId: {
            type: mongoose.Schema.Types.ObjectId
        },
        status: {
            type: Number,
            default: 1,
            enum: [1, 2, 3],
            index: true
        }
    },
    { collection: "client", timestamps: true }
);
module.exports = mongoose.model("client", clientSchema);
