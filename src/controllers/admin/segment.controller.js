const segmentModel = require("../../models/segment.model");
const {
    SERVERERROR,
    SUCCESS,
    FAILURE,
    ACTIVE_STATUS,
    DELETED_STATUS,
    META_STATUS_1,
    META_STATUS_0,
} = require("../../../config/key");
const segmentValidation = require("../../services/admin/validation/segmentValidation");
const responseHelper = require("../../helpers/responseHelper");
const segmentTransformer = require("../../transformers/admin/segmentTransformer");
const logger = require("../../helpers/loggerService");
const Helper = require("../../helpers/Helper")
const {listService} = require("../../services/admin/segment/segment.service")

exports.addEdit = async (req, res) => {
    try {
        let reqParam = req.body;
        let segmentExists;
        let segmentName = reqParam.segmentName;

        if (reqParam.segmentId) {
            let validationMessage = await segmentValidation.editSegmentValidation(reqParam);
            if (validationMessage) return responseHelper.error(res, res.__(validationMessage), FAILURE);

            segmentExists = await segmentModel.findOne({_id: reqParam.segmentId, status: {$ne: DELETED_STATUS}});
            if (!segmentExists) return responseHelper.successapi(res, res.__("segmentNotExists"), META_STATUS_0, SUCCESS);

            if (segmentName) {
                segmentName = segmentName.trim().replace(/[^a-zA-Z0-9\s]/g, "").toLowerCase().replace(/\s/g, '-').replace(/\-\-+/g, '-');

                const segmentExistsName = await segmentModel.findOne({slug: segmentName, _id: {$ne: reqParam.segmentId}, status: {$ne: DELETED_STATUS}});
                if (segmentExistsName) return responseHelper.successapi(res, res.__("segmentNameAlreadyExists"), META_STATUS_0, SUCCESS);
            }

            segmentExists.segmentName = reqParam.segmentName ? reqParam.segmentName : segmentExists.segmentName
            segmentExists.slug = segmentName ? segmentName : segmentExists.slug

        } else {
            let validationMessage = await segmentValidation.createSegmentValidation(reqParam);
            if (validationMessage) return responseHelper.error(res, res.__(validationMessage), FAILURE);

            segmentName = segmentName.trim().replace(/[^a-zA-Z0-9\s]/g, "").toLowerCase().replace(/\s/g, '-').replace(/\-\-+/g, '-');

            const segmentExistsName = await segmentModel.findOne({slug: segmentName, status: {$ne: DELETED_STATUS}});
            if (segmentExistsName) return responseHelper.successapi(res, res.__("segmentNameAlreadyExists"), META_STATUS_0, SUCCESS);

            segmentExists = new segmentModel();

            segmentExists.segmentName = reqParam.segmentName ? reqParam.segmentName.trim() : ""
            segmentExists.slug = segmentName ? segmentName : ""
        }

        const response = await segmentExists.save();

        let responseData = await segmentTransformer.transformViewCollection(response);

        if (reqParam.segmentId) return responseHelper.successapi(res, res.__("segmentUpdatedSuccessfully"), META_STATUS_1, SUCCESS, responseData);

        return responseHelper.successapi(res, res.__("segmentCreatedSuccessfully"), META_STATUS_1, SUCCESS, responseData);

    } catch (e) {
        logger.logger.error(`Error from catch: ${e}`);
        return responseHelper.error(res, res.__("SomethingWentWrongPleaseTryAgain"), SERVERERROR);
    }
};

exports.list = async (req, res) => {
    try {
        let reqParam = req.body;

        const {limitCount, skipCount} = await Helper.getPageAndLimit(reqParam.page, reqParam.limit);

        const listSegment = await listService({
            skip: skipCount,
            limit: limitCount,
            search: reqParam.search,
            status: reqParam.status,
            sortBy: reqParam.sortBy,
            sortKey: reqParam.sortKey
        });

        let response = listSegment[0].data && listSegment[0].data.length > 0 ? listSegment[0].data : [];

        let responseMeta = {
            totalCount: listSegment[0].totalRecords[0]?.count ? listSegment[0].totalRecords[0].count : 0
        }

        let responseData = await segmentTransformer.transformListCollection(response);

        return responseHelper.successapi(res, res.__("segmentListFoundSuccessfully"), META_STATUS_1, SUCCESS, responseData, responseMeta);

    } catch (e) {
        logger.logger.error(`Error from catch: ${e}`);
        return responseHelper.error(res, res.__("SomethingWentWrongPleaseTryAgain"), SERVERERROR);
    }
};

exports.delete = async (req, res) => {
    try {
        let reqParam = req.body;

        let validationMessage = await segmentValidation.editSegmentValidation(reqParam);
        if (validationMessage) return responseHelper.error(res, res.__(validationMessage), FAILURE);

        const deleteSegment = await segmentModel.findOne({_id: reqParam.segmentId, status: ACTIVE_STATUS});
        if (!deleteSegment) return responseHelper.successapi(res, res.__("segmentDoesNotExists"), META_STATUS_0, SUCCESS);

        deleteSegment.status = DELETED_STATUS

        await deleteSegment.save();

        return responseHelper.successapi(res, res.__("segmentDeletedSuccessfully"), META_STATUS_1, SUCCESS);

    } catch (e) {
        logger.logger.error(`Error from catch: ${e}`);
        return responseHelper.error(res, res.__("SomethingWentWrongPleaseTryAgain"), SERVERERROR);
    }
};