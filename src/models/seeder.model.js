const mongoose = require("mongoose");

const seederSchema = new mongoose.Schema({
    name: {
        type: String,
        index: true
    },
    status: {
        type: Number,
        enum: [1, 2],
        default: 1
    }
}, { collection: "seeder", timestamps: true });

module.exports = mongoose.model("seeder", seederSchema);