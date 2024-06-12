const marketTipModel = require("../../models/marketTip.model");
const {
    SERVERERROR,
    SUCCESS,
    FAILURE,
    ACTIVE_STATUS,
    DELETED_STATUS,
    META_STATUS_1,
    META_STATUS_0,
} = require("../../../config/key");
const marketTipValidation = require("../../services/admin/validation/marketTipValidation");
const responseHelper = require("../../helpers/responseHelper");
const marketTipTransformer = require("../../transformers/admin/marketTipTransformer");
const logger = require("../../helpers/loggerService");
const Helper = require("../../helpers/Helper")
const {listService} = require("../../services/admin/marketTip/marketTip.service")

exports.addEdit = async (req, res) => {
    try {
        let reqParam = req.body;
        let marketTipExists;
        let title = reqParam.title;

        if (reqParam.marketTipId) {
            let validationMessage = await marketTipValidation.editMarketTipValidation(reqParam);
            if (validationMessage) return responseHelper.error(res, res.__(validationMessage), FAILURE);

            marketTipExists = await marketTipModel.findOne({_id: reqParam.marketTipId, status: {$ne: DELETED_STATUS}});
            if (!marketTipExists) return responseHelper.successapi(res, res.__("marketTipNotExists"), META_STATUS_0, SUCCESS);

            if (title) {
                title = title.trim().replace(/[^a-zA-Z0-9\s]/g, "").toLowerCase().replace(/\s/g, '-').replace(/\-\-+/g, '-');

                const titleExists = await marketTipModel.findOne({slug: title, _id: {$ne: reqParam.marketTipId}, status: {$ne: DELETED_STATUS}});
                if (titleExists) return responseHelper.successapi(res, res.__("titleAlreadyExists"), META_STATUS_0, SUCCESS);
            }
        } else {
            let validationMessage = await marketTipValidation.createMarketTipValidation(reqParam);
            if (validationMessage) return responseHelper.error(res, res.__(validationMessage), FAILURE);

            title = title.trim().replace(/[^a-zA-Z0-9\s]/g, "").toLowerCase().replace(/\s/g, '-').replace(/\-\-+/g, '-');

            const titleExists = await marketTipModel.findOne({slug: title, status: {$ne: DELETED_STATUS}});
            if (titleExists) return responseHelper.successapi(res, res.__("titleAlreadyExists"), META_STATUS_0, SUCCESS);

            marketTipExists = new marketTipModel();
        }

        marketTipExists.title = reqParam?.title ? reqParam.title : marketTipExists.title
        marketTipExists.description = reqParam?.description ? reqParam.description : marketTipExists.description
        marketTipExists.slug = title ? title : marketTipExists.slug

        const response = await marketTipExists.save();

        let responseData = await marketTipTransformer.transformViewCollection(response);

        if (reqParam.marketTipId) return responseHelper.successapi(res, res.__("marketTipUpdatedSuccessfully"), META_STATUS_1, SUCCESS, responseData);

        return responseHelper.successapi(res, res.__("marketTipCreatedSuccessfully"), META_STATUS_1, SUCCESS, responseData);
    } catch (e) {
        logger.logger.error(`Error from catch: ${e}`);
        return responseHelper.error(res, res.__("SomethingWentWrongPleaseTryAgain"), SERVERERROR);
    }
};

exports.list = async (req, res) => {
    try {
        let reqParam = req.body;

        const {limitCount, skipCount} = await Helper.getPageAndLimit(reqParam.page, reqParam.limit);

        const listMarketTip = await listService({
            skip: skipCount,
            limit: limitCount,
            search: reqParam.search,
            status: reqParam.status,
            sortBy: reqParam.sortBy,
            sortKey: reqParam.sortKey
        });

        let response = listMarketTip[0].data && listMarketTip[0].data.length > 0 ? listMarketTip[0].data : [];

        let responseMeta = {
            totalCount: listMarketTip[0].totalRecords[0]?.count ? listMarketTip[0].totalRecords[0].count : 0
        }

        let responseData = await marketTipTransformer.transformListCollection(response);

        return responseHelper.successapi(res, res.__("marketTipListFoundSuccessfully"), META_STATUS_1, SUCCESS, responseData, responseMeta);
    } catch (e) {
        logger.logger.error(`Error from catch: ${e}`);
        return responseHelper.error(res, res.__("SomethingWentWrongPleaseTryAgain"), SERVERERROR);
    }
};

exports.delete = async (req, res) => {
    try {
        let reqParam = req.body;

        let validationMessage = await marketTipValidation.editMarketTipValidation(reqParam);
        if (validationMessage) return responseHelper.error(res, res.__(validationMessage), FAILURE);

        if (typeof reqParam.marketTipId === "string") {
            const deleteMarketTip = await marketTipModel.findOne({_id: reqParam.marketTipId, status: {$ne: DELETED_STATUS}});
            if (!deleteMarketTip) return responseHelper.successapi(res, res.__("marketTipDoesNotExists"), META_STATUS_0, SUCCESS);

            deleteMarketTip.status = DELETED_STATUS

            await deleteMarketTip.save();
        } else {
            if (reqParam?.marketTipId?.length === 0) return responseHelper.successapi(res, res.__("pleaseSelectAtLeastOneMarketTip"), META_STATUS_0, SUCCESS);

            await marketTipModel.updateMany({_id: {$in: reqParam.marketTipId}}, {$set: {status: DELETED_STATUS}});
        }

        return responseHelper.successapi(res, res.__("marketTipDeletedSuccessfully"), META_STATUS_1, SUCCESS);
    } catch (e) {
        logger.logger.error(`Error from catch: ${e}`);
        return responseHelper.error(res, res.__("SomethingWentWrongPleaseTryAgain"), SERVERERROR);
    }
};

exports.view = async (req, res) => {
    try {
        let reqParam = req.body;

        let validationMessage = await marketTipValidation.editMarketTipValidation(reqParam);
        if (validationMessage) return responseHelper.error(res, res.__(validationMessage), FAILURE);

        let marketTipFound = await marketTipModel.findOne({_id: reqParam.marketTipId, status: {$ne: DELETED_STATUS}});
        if (!marketTipFound) return responseHelper.successapi(res, res.__("marketTipNotFound"), META_STATUS_0, SUCCESS);

        let responseData = await marketTipTransformer.transformViewCollection(marketTipFound);

        return responseHelper.successapi(res, res.__("marketTipDetailsFoundSuccessfully"), META_STATUS_1, SUCCESS, responseData);
    } catch (e) {
        logger.logger.error(`Error from catch: ${e}`);
        return responseHelper.error(res, res.__("SomethingWentWrongPleaseTryAgain"), SERVERERROR);
    }
};