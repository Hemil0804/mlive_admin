const UserModel = require('../../models/user.model');
const clientModel = require('../../models/client.model');
const segmentModel = require('../../models/segment.model');
const logger = require('../../helpers/loggerService');
const {userService, createOrUpdateUser, userViewService} = require('../../services/client/user/user.service');
const responseHelper = require('../../helpers/responseHelper');
const Helper = require('../../helpers/Helper');
const userValidation = require('../../services/client/validation/userValidation');
const userTransformer = require('../../transformers/client/userTransformer');
const {
    SERVERERROR,
    FAILURE,
    ACTIVE_STATUS,
    DELETED_STATUS,
    META_STATUS_0,
    META_STATUS_1,
    SUCCESS,
    INACTIVE_STATUS
} = require('../../../config/key');
const bcrypt = require('bcryptjs');
const moment = require("moment")
const userModel = require("../../models/user.model")

exports.list = async (req, res) => {
    try {
        let reqParam = req.body;

        const {limitCount, skipCount} = await Helper.getPageAndLimit(reqParam.page, reqParam.limit);

        let userFound = await userModel.find({clientId: req.client._id, status: {$ne: DELETED_STATUS}})

        const listUser = await userService({
            skip: skipCount,
            limit: limitCount,
            search: reqParam.search,
            status: reqParam.status,
            sortBy: reqParam.sortBy,
            sortKey: reqParam.sortKey,
            clientId: req.client._id
        });

        let response = listUser[0]?.data && listUser[0].data.length > 0 ? listUser[0].data : [];

        let responseMeta = {
            totalCount: listUser[0]?.totalRecords[0]?.count ? listUser[0].totalRecords[0].count : 0,
            userCount: req?.client?.userCount ? req.client.userCount : 0,
            isUserLimit: userFound.length < req.client.userCount ? true : false
        }

        const responseData = await userTransformer.transformListCollection(response);

        return responseHelper.successapi(res, res.__('userListFoundSuccessfully'), META_STATUS_1, SUCCESS, responseData, responseMeta);
    } catch (e) {
        logger.logger.error(`Error from catch: ${e}`);
        return responseHelper.error(res, res.__('SomethingWentWrongPleaseTryAgain'), SERVERERROR);
    }
}

exports.addEdit = async (req, res) => {
    try {
        let reqParam = req.body;
        let newPassword;

        let clientFound = await clientModel.findOne({_id: reqParam.clientId, status: {$ne: DELETED_STATUS}})
        if (!clientFound) return responseHelper.successapi(res, res.__("clientNotFound"), META_STATUS_0, SUCCESS);

        if (reqParam.userId) {
            let validationMessage = await userValidation.editUserValidation(reqParam);
            if (validationMessage) return responseHelper.error(res, res.__(validationMessage), FAILURE);

            let userExist = await UserModel.findOne({_id: reqParam.userId, status: {$ne: DELETED_STATUS}});
            if (!userExist) return responseHelper.successapi(res, res.__('userDoesNotExists'), META_STATUS_0, SUCCESS);

            if (reqParam.email) {
                let userFound = await UserModel.findOne({email: reqParam.email.toLowerCase(), _id: {$ne: reqParam.userId}, clientId: reqParam.clientId, status: {$ne: DELETED_STATUS}});
                if (userFound) return responseHelper.successapi(res, res.__('emailAlreadyExist'), META_STATUS_0, SUCCESS);
            }

            if (reqParam.userName) {
                let userNameFound = await UserModel.findOne({userName: reqParam.userName, _id: {$ne: reqParam.userId}, clientId: reqParam.clientId, status: {$ne: DELETED_STATUS}});
                if (userNameFound) return responseHelper.successapi(res, res.__('userNameAlreadyExist'), META_STATUS_0, SUCCESS);
            }
        } else {
            let validationMessage = await userValidation.addUserValidation(reqParam);
            if (validationMessage) return responseHelper.error(res, res.__(validationMessage), FAILURE);

            let userFound = await UserModel.find({clientId: reqParam.clientId, status: ACTIVE_STATUS});
            if (userFound?.length >= clientFound?.userCount) return responseHelper.successapi(res, res.__("youDoNotHaveLimitToAddUser"), META_STATUS_0, SUCCESS)

            let userNameFound = await UserModel.findOne({userName: reqParam.userName, clientId: reqParam.clientId, status: {$ne: DELETED_STATUS}});
            if (userNameFound) return responseHelper.successapi(res, res.__('userNameAlreadyExist'), META_STATUS_0, SUCCESS);
        }

        if (reqParam?.segments?.length > 0) {
            let segmentFound = await segmentModel.findOne({_id: {$in: reqParam.segments}, status: ACTIVE_STATUS});
            if (!segmentFound) return responseHelper.successapi(res, res.__('segmentNotFound'), META_STATUS_0, SUCCESS);
        }

        if (reqParam?.password) {
            newPassword = await bcrypt.hash(reqParam.password.trim(), 8);
            reqParam.password = reqParam.password ? newPassword : ""
        }

        if (!reqParam.status) {
            if (moment(reqParam.subscriptionStartDate).format("YYYYMMDD") === moment().format("YYYYMMDD")) reqParam.status = ACTIVE_STATUS
            else reqParam.status = INACTIVE_STATUS
        }

        let response = await createOrUpdateUser(reqParam);

        const responseData = await userTransformer.transformViewCollection(response);

        if (reqParam.userId) return responseHelper.successapi(res, res.__('userUpdatedSuccessfully'), META_STATUS_1, SUCCESS, responseData);

        return responseHelper.successapi(res, res.__('userCreatedSuccessfully'), META_STATUS_1, SUCCESS, responseData);
    } catch (e) {
        logger.logger.error(`Error from catch: ${e}`);
        return responseHelper.error(res, res.__('SomethingWentWrongPleaseTryAgain'), SERVERERROR);
    }
}

exports.delete = async (req, res) => {
    try {
        let reqParam = req.body;

        let validationMessage = await userValidation.editUserValidation(reqParam);
        if (validationMessage) return responseHelper.error(res, res.__(validationMessage), FAILURE);

        let userExist = await UserModel.findOne({_id: reqParam.userId, status: {$ne: DELETED_STATUS}});
        if (!userExist) return responseHelper.successapi(res, res.__('userNotFound'), META_STATUS_0, SUCCESS);

        userExist.status = DELETED_STATUS

        await userExist.save();

        return responseHelper.successapi(res, res.__('userDeletedSuccessfully'), META_STATUS_1, SUCCESS);
    } catch (e) {
        logger.logger.error(`Error from catch: ${e}`);
        return responseHelper.error(res, res.__('SomethingWentWrongPleaseTryAgain'), SERVERERROR);
    }
}

exports.view = async (req, res) => {
    try {
        let reqParam = req.body;

        let validationMessage = await userValidation.editUserValidation(reqParam);
        if (validationMessage) return responseHelper.error(res, res.__(validationMessage), FAILURE);

        let userExist = await UserModel.findOne({_id: reqParam.userId, status: {$ne: DELETED_STATUS}}).lean();
        if (!userExist) return responseHelper.successapi(res, res.__('userDoesNotExists'), META_STATUS_0, SUCCESS);

        let response = await userViewService({userId: reqParam.userId})

        response = response?.length > 0 ? response[0] : null

        const responseData = await userTransformer.transformViewCollection(response);

        return responseHelper.successapi(res, res.__('userDetailsFoundSuccessfully'), META_STATUS_1, SUCCESS, responseData);
    } catch (e) {
        logger.logger.error(`Error from catch: ${e}`);
        return responseHelper.error(res, res.__('SomethingWentWrongPleaseTryAgain'), SERVERERROR);
    }
}

exports.segmentListDropdown = async (req, res) => {
    try {
        let segmentList = await segmentModel.find({status: ACTIVE_STATUS});

        let response = segmentList.length > 0 ? segmentList : [];

        return responseHelper.successapi(res, res.__("segmentListFoundSuccessfully"), META_STATUS_1, SUCCESS, response);
    } catch (e) {
        logger.logger.error(`Error from catch: ${e}`);
        return responseHelper.error(res, res.__("SomethingWentWrongPleaseTryAgain"), SERVERERROR);
    }
}

exports.changePassword = async (req, res) => {
    try {
        let reqParam = req.body;

        let passwordValidation = await userValidation.changePasswordUserValidation(reqParam);
        if (passwordValidation) return responseHelper.error(res, res.__(passwordValidation), FAILURE);

        let userExist = await UserModel.findOne({_id: reqParam.userId, status: {$ne: DELETED_STATUS}});
        if (!userExist) return responseHelper.successapi(res, res.__("userNotExist"), META_STATUS_0, SUCCESS);

        const newPassword = await bcrypt.hash(reqParam.newPassword.trim(), 8);
        await userExist.updateOne({password: newPassword});

        return responseHelper.successapi(res, res.__("passwordChangedSuccessfully"), META_STATUS_1, SUCCESS);
    } catch (e) {
        logger.logger.error(`Error from catch: ${e}`);
        return responseHelper.error(res, res.__("SomethingWentWrongPleaseTryAgain"), SERVERERROR);
    }
};