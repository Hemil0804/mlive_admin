const moment = require("moment")
const scriptModel = require("../../models/script.model");
const {
    SERVERERROR,
    SUCCESS,
    FAILURE,
    ACTIVE_STATUS,
    DELETED_STATUS,
    META_STATUS_1,
    META_STATUS_0,
} = require("../../../config/key");
const scriptValidation = require("../../services/admin/validation/scriptValidation");
const responseHelper = require("../../helpers/responseHelper");
const scriptTransformer = require("../../transformers/admin/scriptTransformer");
const logger = require("../../helpers/loggerService");
const Helper = require("../../helpers/Helper")
const {listService} = require("../../services/admin/script/script.service")

exports.list = async (req, res) => {
    try {
        let reqParam = req.body;

        const {limitCount, skipCount} = await Helper.getPageAndLimit(reqParam.page, reqParam.limit);

        const listScript = await listService({
            skip: skipCount,
            limit: limitCount,
            search: reqParam.search,
            status: reqParam.status,
            sortBy: reqParam.sortBy,
            sortKey: reqParam.sortKey,
            segment: reqParam.segment
        });

        let response = listScript[0].data && listScript[0].data.length > 0 ? listScript[0].data : [];

        let responseMeta = {
            totalCount: listScript[0].totalRecords[0]?.count ? listScript[0].totalRecords[0].count : 0
        }

        let responseData = await scriptTransformer.transformListCollection(response);

        return responseHelper.successapi(res, res.__("scriptListFoundSuccessfully"), META_STATUS_1, SUCCESS, responseData, responseMeta);

    } catch (e) {
        logger.logger.error(`Error from catch: ${e}`);
        return responseHelper.error(res, res.__("SomethingWentWrongPleaseTryAgain"), SERVERERROR);
    }
};

exports.delete = async (req, res) => {
    try {
        let reqParam = req.body;

        let validationMessage = await scriptValidation.deleteScriptValidation(reqParam);
        if (validationMessage) return responseHelper.error(res, res.__(validationMessage), FAILURE);

        if (reqParam?.scriptId?.length === 0) return responseHelper.successapi(res, res.__("pleaseSelectAtLeastOneScript"), META_STATUS_0, SUCCESS);

        await scriptModel.deleteMany({_id: {$in: reqParam.scriptId}});

        return responseHelper.successapi(res, res.__("scriptDeletedSuccessfully"), META_STATUS_1, SUCCESS);
    } catch (e) {
        logger.logger.error(`Error from catch: ${e}`);
        return responseHelper.error(res, res.__("SomethingWentWrongPleaseTryAgain"), SERVERERROR);
    }
};

// Delete old scripts
exports.refresh = async (req, res) => {
    try {
        let todayDate = moment().format("YYYYMMDD")

        let scriptFound = await scriptModel.find();
        if (scriptFound?.length > 0) {
            for (let a of scriptFound) {
                if (a?.iltt !== '0') {
                    let date = a.iltt.split('-')[0]
                    date = moment(date, "DD/MM/YYYY").format("YYYYMMDD")

                    if (date < todayDate) await scriptModel.deleteOne({_id: a._id})
                }
            }
        }

        return responseHelper.successapi(res, res.__("scriptDeletedSuccessfully"), META_STATUS_1, SUCCESS);
    } catch (e) {
        logger.logger.error(`Error from catch: ${e}`);
        return responseHelper.error(res, res.__("SomethingWentWrongPleaseTryAgain"), SERVERERROR);
    }
}