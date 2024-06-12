const adminModel = require("../../models/admin.model")
const {
    SERVERERROR,
    SUCCESS,
    FAILURE,
    ACTIVE_STATUS,
    DELETED_STATUS,
    META_STATUS_1,
    META_STATUS_0,
    SUB_ADMIN
} = require("../../../config/key");
const subAdminValidation = require("../../services/admin/validation/subAdminValidation");
const responseHelper = require("../../helpers/responseHelper");
const subAdminTransformer = require("../../transformers/admin/subAdminTransformer");
const logger = require("../../helpers/loggerService");
const {subAdminService, createOrUpdateSubAdmin} = require('../../services/admin/subAdmin/subAdmin.service');
const Helper = require('../../helpers/Helper');
const bcrypt = require("bcryptjs");

exports.addEdit = async (req, res) => {
    try {
        let reqParam = req.body;
        let subAdminExists, newPassword

        if (reqParam.subAdminId) {
            let validationMessage = await subAdminValidation.editSubAdminValidation(reqParam);
            if (validationMessage) return responseHelper.error(res, res.__(validationMessage), FAILURE);

            subAdminExists = await adminModel.findOne({_id: reqParam.subAdminId, userType: SUB_ADMIN, status: {$ne: DELETED_STATUS}});
            if (!subAdminExists) return responseHelper.successapi(res, res.__("subAdminNotExists"), META_STATUS_0, SUCCESS);

            if (reqParam.email) {
                let emailExists = await adminModel.findOne({_id: {$ne: reqParam.subAdminId}, email: reqParam.email, status: {$ne: DELETED_STATUS}});
                if (emailExists) return responseHelper.successapi(res, res.__("emailAlreadyExists"), META_STATUS_0, SUCCESS);
            }

            reqParam.status = reqParam?.status ? reqParam.status : subAdminExists.status
        } else {
            let validationMessage = await subAdminValidation.createSubAdminValidation(reqParam);
            if (validationMessage) return responseHelper.error(res, res.__(validationMessage), FAILURE);

            let emailExists = await adminModel.findOne({email: reqParam.email, status: {$ne: DELETED_STATUS}});
            if (emailExists) return responseHelper.successapi(res, res.__("emailAlreadyExists"), META_STATUS_0, SUCCESS)

            reqParam.status = ACTIVE_STATUS
        }

        if (reqParam?.password) {
            newPassword = await bcrypt.hash(reqParam.password.trim(), 8);
            reqParam.password = reqParam.password ? newPassword : ""
        }

        reqParam.userType = SUB_ADMIN
        // const response = await subAdminExists.save();
        let response = await createOrUpdateSubAdmin(reqParam);

        let responseData = await subAdminTransformer.transformViewCollection(response);

        if (reqParam.subAdminId) return responseHelper.successapi(res, res.__("subAdminUpdatedSuccessfully"), META_STATUS_1, SUCCESS, responseData);

        return responseHelper.successapi(res, res.__("subAdminCreatedSuccessfully"), META_STATUS_1, SUCCESS, responseData);

    } catch (e) {
        logger.logger.error(`Error from catch: ${e}`);
        return responseHelper.error(res, res.__("SomethingWentWrongPleaseTryAgain"), SERVERERROR);
    }
};

exports.list = async (req, res) => {
    try {
        let reqParam = req.body;

        const {limitCount, skipCount} = Helper.getPageAndLimit(reqParam.page, reqParam.limit);

        const listSubAdmin = await subAdminService({
            skip: skipCount,
            limit: limitCount,
            search: reqParam.search,
            sortBy: reqParam.sortBy,
            sortKey: reqParam.sortKey,
            status: reqParam.status
        });

        let response = listSubAdmin[0].data && listSubAdmin[0].data.length > 0 ? listSubAdmin[0].data : [];

        let responseMeta = {
            totalCount: listSubAdmin[0].totalRecords[0]?.count ? listSubAdmin[0].totalRecords[0].count : 0
        }

        let responseData = await subAdminTransformer.transformListCollection(response);

        return responseHelper.successapi(res, res.__("subAdminListFoundSuccessfully"), META_STATUS_1, SUCCESS, responseData, responseMeta);
    } catch (e) {
        logger.logger.error(`Error from catch: ${e}`);
        return responseHelper.error(res, res.__("SomethingWentWrongPleaseTryAgain"), SERVERERROR);
    }
};

exports.view = async (req, res) => {
    try {
        let reqParam = req.body;

        let validationMessage = await subAdminValidation.deleteSubAdminValidation(reqParam);
        if (validationMessage) return responseHelper.error(res, res.__(validationMessage), FAILURE);

        const subAdminList = await adminModel.findOne({status: ACTIVE_STATUS, userType: SUB_ADMIN, _id: reqParam.subAdminId});
        if (!subAdminList) return responseHelper.successapi(res, res.__('subAdminDoesNotExists'), META_STATUS_0, SUCCESS);

        let responseData = await subAdminTransformer.transformViewCollection(subAdminList);

        return responseHelper.successapi(res, res.__("subAdminFoundSuccessfully"), META_STATUS_1, SUCCESS, responseData);
    } catch (e) {
        logger.logger.error(`Error from catch: ${e}`);
        return responseHelper.error(res, res.__("SomethingWentWrongPleaseTryAgain"), SERVERERROR);
    }
};

exports.delete = async (req, res) => {
    try {
        let reqParam = req.body;

        let validationMessage = await subAdminValidation.deleteSubAdminValidation(reqParam);
        if (validationMessage) return responseHelper.error(res, res.__(validationMessage), FAILURE);

        let deleteSubAdmin = await adminModel.findOne({_id: reqParam.subAdminId, userType: SUB_ADMIN, status: {$ne: DELETED_STATUS}});
        if (!deleteSubAdmin) return responseHelper.successapi(res, res.__("subAdminDoesNotExists"), META_STATUS_0, SUCCESS);

        deleteSubAdmin.status = DELETED_STATUS

        await deleteSubAdmin.save();

        return responseHelper.successapi(res, res.__("subAdminDeletedSuccessfully"), META_STATUS_1, SUCCESS);
    } catch (e) {
        logger.logger.error(`Error from catch: ${e}`);
        return responseHelper.error(res, res.__("SomethingWentWrongPleaseTryAgain"), SERVERERROR);
    }
};

exports.changePassword = async (req, res) => {
    try {
        let reqParam = req.body;

        let passwordValidation = await subAdminValidation.changePasswordSubAdminValidation(reqParam);
        if (passwordValidation) return responseHelper.error(res, res.__(passwordValidation), FAILURE);

        let subAdminExist = await adminModel.findOne({_id: reqParam.subAdminId, status: {$ne: DELETED_STATUS}});
        if (!subAdminExist) return responseHelper.successapi(res, res.__("subAdminNotExist"), META_STATUS_0, SUCCESS);

        const newPassword = await bcrypt.hash(reqParam.newPassword.trim(), 8);
        await subAdminExist.updateOne({password: newPassword});

        return responseHelper.successapi(res, res.__("passwordChangedSuccessfully"), META_STATUS_1, SUCCESS);
    } catch (e) {
        logger.logger.error(`Error from catch: ${e}`);
        return responseHelper.error(res, res.__("SomethingWentWrongPleaseTryAgain"), SERVERERROR);
    }
};