const clientModel = require("../../models/client.model")
const {
    SERVERERROR,
    SUCCESS,
    FAILURE,
    ACTIVE_STATUS,
    DELETED_STATUS,
    META_STATUS_1,
    META_STATUS_0,
} = require("../../../config/key");
const clientValidation = require("../../services/admin/validation/clientValidation");
const responseHelper = require("../../helpers/responseHelper");
const clientTransformer = require("../../transformers/admin/clientTransformer");
const logger = require("../../helpers/loggerService");
const {clientService, createOrUpdateClient, viewClientService} = require('../../services/admin/client/client.service');
const Helper = require('../../helpers/Helper');
const bcrypt = require("bcryptjs");

exports.addEdit = async (req, res) => {
    try {
        let reqParam = req.body;
        let clientExists, newPassword

        if (reqParam.clientId) {
            let validationMessage = await clientValidation.editClientValidation(reqParam);
            if (validationMessage) return responseHelper.error(res, res.__(validationMessage), FAILURE);

            clientExists = await clientModel.findOne({ _id: reqParam.clientId, status: {$ne: DELETED_STATUS} });
            if (!clientExists) return responseHelper.successapi(res, res.__("clientNotExists"), META_STATUS_0, SUCCESS);

            if (reqParam.email) {
                let emailExists = await clientModel.findOne({_id: {$ne: reqParam.clientId}, email: reqParam.email, status: {$ne: DELETED_STATUS}});
                if (emailExists) return responseHelper.successapi(res, res.__("emailAlreadyExists"), META_STATUS_0, SUCCESS);
            }

            if (reqParam.phoneNo) {
                let phoneNoExists = await clientModel.findOne({_id: {$ne: reqParam.clientId}, phoneNo: reqParam.phoneNo, status: {$ne: DELETED_STATUS}});
                if (phoneNoExists) return responseHelper.successapi(res, res.__("phoneNumberAlreadyExists"), META_STATUS_0, SUCCESS);
            }

            reqParam.status = reqParam?.status ? reqParam.status : clientExists.status
        } else {
            let validationMessage = await clientValidation.createClientValidation(reqParam);
            if (validationMessage) return responseHelper.error(res, res.__(validationMessage), FAILURE);

            let emailExists = await clientModel.findOne({email: reqParam.email, status: {$ne: DELETED_STATUS}});
            if (emailExists) return responseHelper.successapi(res, res.__("emailAlreadyExists"), META_STATUS_0, SUCCESS)

            let phoneNoExists = await clientModel.findOne({phoneNo: reqParam.phoneNo, status: {$ne: DELETED_STATUS}});
            if (phoneNoExists) return responseHelper.successapi(res, res.__("phoneNumberAlreadyExists"), META_STATUS_0, SUCCESS);

            reqParam.status = ACTIVE_STATUS
        }

        if (reqParam?.password) {
            newPassword = await bcrypt.hash(reqParam.password.trim(), 8);
            reqParam.password = reqParam.password ? newPassword : ""
        }

        reqParam.subAdminId = req.admin._id

        // const response = await clientExists.save();
        let response = await createOrUpdateClient(reqParam);

        let responseData = await clientTransformer.transformViewCollection(response);

        if (reqParam.clientId) return responseHelper.successapi(res, res.__("clientUpdatedSuccessfully"), META_STATUS_1, SUCCESS, responseData);

        return responseHelper.successapi(res, res.__("clientCreatedSuccessfully"), META_STATUS_1, SUCCESS, responseData);

    } catch (e) {
        logger.logger.error(`Error from catch: ${e}`);
        return responseHelper.error(res, res.__("SomethingWentWrongPleaseTryAgain"), SERVERERROR);
    }
};

exports.list = async (req, res) => {
    try {
        let reqParam = req.body;
        const {limitCount, skipCount} = Helper.getPageAndLimit(reqParam.page, reqParam.limit);

        const listClient = await clientService({
            skip: skipCount,
            limit: limitCount,
            search: reqParam.search,
            sortBy: reqParam.sortBy,
            sortKey: reqParam.sortKey,
            status: reqParam.status
        });

        let response = listClient[0].data && listClient[0].data.length > 0 ? listClient[0].data : [];

        let responseMeta = {
            totalCount: listClient[0].totalRecords[0]?.count ? listClient[0].totalRecords[0].count : 0
        }

        let responseData = await clientTransformer.transformListCollection(response);

        return responseHelper.successapi(res, res.__("clientListFoundSuccessfully"), META_STATUS_1, SUCCESS, responseData, responseMeta);

    } catch (e) {
        logger.logger.error(`Error from catch: ${e}`);
        return responseHelper.error(res, res.__("SomethingWentWrongPleaseTryAgain"), SERVERERROR);
    }
};

exports.view = async (req, res) => {
    try {
        let reqParam = req.body;

        let validationMessage = await clientValidation.deleteClientValidation(reqParam);
        if (validationMessage) return responseHelper.error(res, res.__(validationMessage), FAILURE);

        let response = await viewClientService({clientId: reqParam.clientId})

        response = response?.length > 0 ? response[0] : null

        let responseData = await clientTransformer.transformViewCollection(response);

        return responseHelper.successapi(res, res.__("clientFoundSuccessfully"), META_STATUS_1, SUCCESS, responseData);
    } catch (e) {
        logger.logger.error(`Error from catch: ${e}`);
        return responseHelper.error(res, res.__("SomethingWentWrongPleaseTryAgain"), SERVERERROR);
    }
};

exports.delete = async (req, res) => {
    try {
        let reqParam = req.body;

        let validationMessage = await clientValidation.deleteClientValidation(reqParam);
        if (validationMessage) return responseHelper.error(res, res.__(validationMessage), FAILURE);

        let deleteClient = await clientModel.findOne({ _id: reqParam.clientId, status: {$ne: DELETED_STATUS} });
        if (!deleteClient) return responseHelper.successapi(res, res.__("clientDoesNotExists"), META_STATUS_0, SUCCESS);

        deleteClient.status = DELETED_STATUS

        await deleteClient.save();

        return responseHelper.successapi(res, res.__("clientDeletedSuccessfully"), META_STATUS_1, SUCCESS);
    } catch (e) {
        logger.logger.error(`Error from catch: ${e}`);
        return responseHelper.error(res, res.__("SomethingWentWrongPleaseTryAgain"), SERVERERROR);
    }
};

exports.changePassword = async (req, res) => {
    try {
        let reqParam = req.body;

        let passwordValidation = await clientValidation.changePasswordClientValidation(reqParam);
        if (passwordValidation) return responseHelper.error(res, res.__(passwordValidation), FAILURE);

        let clientExist = await clientModel.findOne({_id: reqParam.clientId, status: {$ne: DELETED_STATUS}});
        if (!clientExist) return responseHelper.successapi(res, res.__("clientNotExist"), META_STATUS_0, SUCCESS);

        const newPassword = await bcrypt.hash(reqParam.newPassword.trim(), 8);
        await clientExist.updateOne({password: newPassword});

        return responseHelper.successapi(res, res.__("passwordChangedSuccessfully"), META_STATUS_1, SUCCESS);
    } catch (e) {
        logger.logger.error(`Error from catch: ${e}`);
        return responseHelper.error(res, res.__("SomethingWentWrongPleaseTryAgain"), SERVERERROR);
    }
};