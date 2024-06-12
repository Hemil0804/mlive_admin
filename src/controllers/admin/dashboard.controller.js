const userModel = require("../../models/user.model");
const scriptModel = require("../../models/script.model");
const segmentModel = require("../../models/segment.model");
const adminModel = require("../../models/admin.model");
const clientModel = require("../../models/client.model");
const {
    SERVERERROR,
    SUCCESS,
    FAILURE,
    ACTIVE_STATUS,
    INACTIVE_STATUS,
    DELETED_STATUS,
    META_STATUS_1,
    META_STATUS_0,
    SUPER_ADMIN,
    SUB_ADMIN
} = require("../../../config/key");
const responseHelper = require("../../helpers/responseHelper");
const logger = require("../../helpers/loggerService");

exports.dashboard = async (req, res) => {
    try {
        let statisticsArr = []

        // let totalUserCount = await userModel.find({status: {$ne: DELETED_STATUS}}).countDocuments();
        // let totalActiveUserCount = await userModel.find({status: ACTIVE_STATUS}).countDocuments();
        // let totalInActiveUserCount = await userModel.find({status: INACTIVE_STATUS}).countDocuments();
        let totalScriptCount = await scriptModel.find().countDocuments()
        let totalSegmentCount = await segmentModel.find({status: {$ne: DELETED_STATUS}}).countDocuments();
        let totalClientCount = await clientModel.find({status: {$ne: DELETED_STATUS}}).countDocuments();
        let totalActiveClientCount = await clientModel.find({status: ACTIVE_STATUS}).countDocuments();
        let totalInActiveClientCount = await clientModel.find({status: INACTIVE_STATUS}).countDocuments();

        let response = (type, totalCount, activeCount, inactiveCount, totalIcon, activeIcon, inactiveIcon) => {
            let obj = {}
            obj.countData = []

            obj.type = type
            obj.countData.push({name: "Total", count: totalCount, icon: totalIcon})

            if (activeCount !== undefined) obj.countData.push({name: "Active", count: activeCount, icon: activeIcon})
            if (inactiveCount !== undefined) obj.countData.push({name: "In active", count: inactiveCount, icon: inactiveIcon})

            statisticsArr.push(obj)
        }

        if (req.admin.userType === SUPER_ADMIN) {
            let totalSubAdminCount = await adminModel.find({userType: SUB_ADMIN, status: {$ne: DELETED_STATUS}}).countDocuments();
            let totalActiveSubAdminCount = await adminModel.find({userType: SUB_ADMIN, status: ACTIVE_STATUS}).countDocuments();
            let totalInActiveSubAdminCount = await adminModel.find({userType: SUB_ADMIN, status: INACTIVE_STATUS}).countDocuments();

            await response("sub admin", totalSubAdminCount, totalActiveSubAdminCount, totalInActiveSubAdminCount, "person", "assets/images/icons/active-sub-admin.svg", "assets/images/icons/inactive-sub-admin.svg")
        }

        // await response("user", totalUserCount, totalActiveUserCount, totalInActiveUserCount)
        await response("client", totalClientCount, totalActiveClientCount, totalInActiveClientCount, "supervisor_account", "assets/images/icons/active-client.svg", "assets/images/icons/inactive-client.svg")

        let responseData = {
            statisticsData: statisticsArr,
            totalOnlineUserCount: 0,
            onlineUserIcon: "people",
            totalScriptCount: totalScriptCount,
            scriptIcon: "description",
            totalSegmentCount: totalSegmentCount,
            segmentIcon: "device_hub"
        }
        return responseHelper.successapi(res, res.__("dashboardCountFoundSuccessfully"), META_STATUS_1, SUCCESS, responseData);
    } catch (e) {
        logger.logger.error(`Error from catch: ${e}`);
        return responseHelper.error(res, res.__("SomethingWentWrongPleaseTryAgain"), SERVERERROR);
    }
};