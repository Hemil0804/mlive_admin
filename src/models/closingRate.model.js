const mongoose = require("mongoose");

const closingRateSchema = new mongoose.Schema({
    importDate: {
        type: Object
    },
    data: {
        type: Object
    },
    status: {
        type: Number,
        enum: [1, 2, 3],
        default: 1
    }
}, { collection: "closingRate", timestamps: true });

module.exports = mongoose.model("closingRate", closingRateSchema);