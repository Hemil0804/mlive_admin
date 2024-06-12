const mongoose = require("mongoose");

const segmentSchema = new mongoose.Schema(
    {
        segmentName: {
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
    { collection: "segment", timestamps: true }
);

module.exports = mongoose.model("segment", segmentSchema);