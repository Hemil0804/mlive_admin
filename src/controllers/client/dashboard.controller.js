const userModel = require("../../models/user.model");
const {
    SERVERERROR,
    SUCCESS,
    FAILURE,
    ACTIVE_STATUS,
    INACTIVE_STATUS,
    DELETED_STATUS,
    META_STATUS_1,
    META_STATUS_0
} = require("../../../config/key");
const responseHelper = require("../../helpers/responseHelper");
const logger = require("../../helpers/loggerService");

exports.dashboard = async (req, res) => {
    try {
        let statisticsArr = []

        let totalUserCount = await userModel.find({clientId: req.client._id, status: {$ne: DELETED_STATUS}}).countDocuments();
        let totalActiveUserCount = await userModel.find({clientId: req.client._id, status: ACTIVE_STATUS}).countDocuments();
        let totalInActiveUserCount = await userModel.find({clientId: req.client._id, status: INACTIVE_STATUS}).countDocuments();

        let response = (type, totalCount, activeCount, inactiveCount, totalIcon, activeIcon, inactiveIcon) => {
            let obj = {}
            obj.countData = []

            obj.type = type
            obj.countData.push({name: "Total", count: totalCount, icon: totalIcon})

            if (activeCount !== undefined) obj.countData.push({name: "Active", count: activeCount, icon: activeIcon})
            if (inactiveCount !== undefined) obj.countData.push({name: "In active", count: inactiveCount, icon: inactiveIcon})

            statisticsArr.push(obj)
        }

        await response("user", totalUserCount, totalActiveUserCount, totalInActiveUserCount, "supervisor_account", "assets/images/icons/active-user.svg", "assets/images/icons/inactive-user.svg")

        let responseData = {
            statisticsData: statisticsArr,
            totalOnlineUserCount: 0,
            onlineUserIcon: "people"
        }

        return responseHelper.successapi(res, res.__("dashboardCountFoundSuccessfully"), META_STATUS_1, SUCCESS, responseData);
    } catch (e) {
        console.log(e)
        logger.logger.error(`Error from catch: ${e}`);
        return responseHelper.error(res, res.__("SomethingWentWrongPleaseTryAgain"), SERVERERROR);
    }
};