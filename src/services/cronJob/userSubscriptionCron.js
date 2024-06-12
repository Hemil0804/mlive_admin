const cron = require("node-cron");
const moment = require("moment")
const userModel = require("../../models/user.model");
const {
    SERVERERROR,
    SUCCESS,
    FAILURE,
    ACTIVE_STATUS,
    INACTIVE_STATUS,
    DELETED_STATUS,
    META_STATUS_1,
    META_STATUS_0,
} = require("../../../config/key");
const responseHelper = require("../../helpers/responseHelper");

// Subscribed user
cron.schedule('00 00 * * *', async () => {
    try {
        let userFound = await userModel.find({status: INACTIVE_STATUS});

        if (userFound?.length > 0) {
            for (let a of userFound) {
                if (a?.subscriptionStartDate) {
                    if (moment(a.subscriptionStartDate).format("YYYYMMDD") === moment().format("YYYYMMDD")) {
                        await userModel.findOneAndUpdate({
                            _id: a._id
                        },
                            {
                                $set: {
                                    status: ACTIVE_STATUS
                                }
                            })
                    }
                }
            }

            console.log("Subscribed user cron run successfully")
        }
    } catch (e) {
        console.log("cronJob error -->", e)
    }
});

// Unsubscribed user
cron.schedule('00 00 * * *', async () => {
    try {
        let userFound = await userModel.find({status: ACTIVE_STATUS});

        if (userFound?.length > 0) {
            for (let a of userFound) {
                if (a?.subscriptionEndDate) {
                    if (moment(a.subscriptionEndDate).format("YYYYMMDD") < moment().format("YYYYMMDD")) {
                        await userModel.findOneAndUpdate({
                                _id: a._id
                            },
                            {
                                $set: {
                                    status: INACTIVE_STATUS
                                }
                            })
                    }
                }
            }

            console.log("Unsubscribed user cron run successfully")
        }
    } catch (e) {
        console.log("cronJob error -->", e)
    }
});