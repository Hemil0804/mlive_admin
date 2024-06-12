const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema({
        id: {
            type: String,
            index: true
        },
        e: {
            type: String,
            index: true
        },
        n: {
            type: String,
            index: true
        },
        s: {
            type: String,
            index: true
        },
        i1: {
            type: String,
            default: '0'
        },
        i2: {
            type: String,
            default: '0'
        },
        i3: {
            type: String,
            default: '0'
        },
        i4: {
            type: String,
            default: '0'
        },
        i5: {
            type: String,
            default: '0'
        },
        i6: {
            type: String,
            default: '0'
        },
        i7: {
            type: String,
            default: '0'
        },
        i8: {
            type: String,
            default: '0'
        },
        i9: {
            type: String,
            default: '0'
        },
        i10: {
            type: String,
            default: '0'
        },
        i11: {
            type: String,
            default: '0'
        },
        i12: {
            type: String,
            default: '0'
        },
        i13: {
            type: String,
            default: '0'
        },
        i14: {
            type: String,
            default: '0'
        },
        i15: {
            type: String,
            default: '0'
        },
        i16: {
            type: String,
            default: '0'
        },
        i17: {
            type: String,
            default: '0'
        },
        i18: {
            type: String,
            default: '0'
        },
        i19: {
            type: String,
            default: '0'
        },
        i20: {
            type: String,
            default: '0'
        },
        i21: {
            type: String,
            default: '0'
        },
        iltt: {
            type: String,
            default: '0'
        },
        ix: {
            type: String,
            default: '0'
        },
        stn: {
            type: String,
            default: '0'
        },
        si1: {
            type: String,
            default: '0'
        },
        si2: {
            type: String,
            default: '0'
        },
        si3: {
            type: String,
            default: '0'
        },
        si4: {
            type: String,
            default: '0'
        },
        si5: {
            type: String,
            default: '0'
        },
        si6: {
            type: String,
            default: '0'
        },
        si7: {
            type: String,
            default: '0'
        },
        si8: {
            type: String,
            default: '0'
        },
        si9: {
            type: String,
            default: '0'
        },
        si10: {
            type: String,
            default: '0'
        },
        si11: {
            type: String,
            default: '0'
        },
        si12: {
            type: String,
            default: '0'
        },
        si13: {
            type: String,
            default: '0'
        },
        si14: {
            type: String,
            default: '0'
        },
        si15: {
            type: String,
            default: '0'
        },
        si16: {
            type: String,
            default: '0'
        },
        si17: {
            type: String,
            default: '0'
        },
        si18: {
            type: String,
            default: '0'
        },
        si19: {
            type: String,
            default: '0'
        },
        si20: {
            type: String,
            default: '0'
        },
        si21: {
            type: String,
            default: '0'
        },
}, { collection: "scripts", timestamps: true});
module.exports = mongoose.model("scripts", clientSchema);
