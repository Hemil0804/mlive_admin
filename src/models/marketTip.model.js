const mongoose = require("mongoose");

const marketTipSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            index: true
        },
        description: {
            type: String,
            index: true
        },
        slug: {
            type: String,
            index: true
        },
        status: {
            type: Number,
            default: 1,
            enum: [1, 2, 3],
            index: true
        }
    },
    { collection: "marketTip", timestamps: true }
);

module.exports = mongoose.model("marketTip", marketTipSchema);