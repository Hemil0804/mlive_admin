const userAlertModel = require("../../models/userAlert.model")
const {
    SERVERERROR,
    SUCCESS,
    FAILURE,
    ACTIVE_STATUS,
    DELETED_STATUS,
    META_STATUS_1,
    META_STATUS_0,
} = require("../../../config/key");
const responseHelper = require("../../helpers/responseHelper");
const Helper = require('../../helpers/Helper');
const userAlertTransformer = require("../../transformers/admin/userAlertTransformer");


exports.list = async (req, res) => {
    console.log('ssss')
    try {
        let reqParam = req.body;
        let limit = reqParam?.limit ? reqParam.limit : 10
        let page = reqParam?.page ? reqParam.page : 1
        let arr=await userAlertModel.find();
        if (reqParam.search) {
            arr = arr.filter(a => (a.direction.includes(reqParam.search) || a.value.includes(reqParam.search) || a.scriptId.includes(reqParam.scriptId)))
        }
        if (reqParam.status) {
            arr = arr.filter(a => (a.status.includes(reqParam.status)))
        }
        arr = arr.slice((page - 1) * limit, page * limit)

        let response = listAlert[0].data && listAlert[0].data.length > 0 ? listAlert[0].data : [];

        let responseMeta = {
            totalCount: listAlert[0].totalRecords[0]?.count ? listAlert[0].totalRecords[0].count : 0
        }

        let responseData = await userAlertTransformer.transformListCollection(response);

        return responseHelper.successapi(res, res.__("AlertListFoundSuccessfully"), META_STATUS_1, SUCCESS, responseData, responseMeta);

    } catch (e) {
        logger.logger.error(`Error from catch: ${e}`);
        return responseHelper.error(res, res.__("SomethingWentWrongPleaseTryAgain"), SERVERERROR);
    }
};