const adminModel = require("../../models/admin.model");
const responseHelper = require("../../helpers/responseHelper");
const adminValidation = require("../../services/admin/validation/adminValidation");
const {
    SERVERERROR,
    SUCCESS,
    FAILURE,
    ACTIVE_STATUS,
    DELETED_STATUS,
    META_STATUS_1,
    META_STATUS_0,
    ADMIN_WEB_LINK,
    IMAGE_LINK
} = require("../../../config/key");
const adminTransformer = require("../../transformers/admin/adminTransformer");
const {JWT_AUTH_TOKEN_SECRET, JWT_EXPIRES_IN, RESET_TOKEN_EXPIRES} = require("../../../config/key");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const path = require("path");
const Mailer = require("../../services/Mailer");
const logger = require("../../helpers/loggerService");
const ejs = require("ejs");
const Helper = require('../../helpers/Helper');
const jwtTokenModel = require("../../models/jwtToken.model");

exports.login = async (req, res) => {
    try {
        let reqParam = req.body;

        let validationMessage = await adminValidation.loginValidation(reqParam);
        if (validationMessage) return responseHelper.error(res, res.__(validationMessage), FAILURE);

        let adminExists = await adminModel.findOne({email: reqParam.email.toLowerCase(), status: {$ne: DELETED_STATUS}});
        if (!adminExists) return responseHelper.successapi(res, res.__("adminNotRegisteredWithEmail"), META_STATUS_0, SUCCESS);

        if (bcrypt.compareSync(reqParam.password, adminExists.password)) {
            let tokenObject = {
                _id: adminExists._id,
                firstName: adminExists.firstName,
                lastName: adminExists.lastName,
                email: adminExists.email,
                phone: adminExists.phone,
                userType: adminExists.userType
            };

            const adminData = await adminTransformer.transformListCollection(adminExists);
            let tokenData = await jwt.sign({tokenObject}, JWT_AUTH_TOKEN_SECRET, {expiresIn: JWT_EXPIRES_IN});

            let checkDeviceToken = await jwtTokenModel.aggregate([
                {
                    $match: {
                        userId: adminExists._id,
                        token: tokenData
                    }
                }
            ])
            if (checkDeviceToken.length == 0) {
                if (tokenData) {
                    await jwtTokenModel.create({
                        userId: adminExists._id,
                        token: tokenData,
                        userType: adminExists.userType
                    })
                }
            }

            return responseHelper.successapi(res, res.__("adminLoggedInSuccessfully"), META_STATUS_1, SUCCESS, adminData, {tokenData});
        } else {
            return responseHelper.successapi(res, res.__("adminWrongPassword"), META_STATUS_0, SUCCESS);
        }
    } catch (e) {
        logger.logger.error(`Error from catch: ${e}`);
        return responseHelper.error(res, res.__("SomethingWentWrongPleaseTryAgain"), SERVERERROR);
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        let reqParam = req.body;

        let validationMessage = await adminValidation.forgotPasswordValidation(reqParam);
        if (validationMessage) return responseHelper.error(res, res.__(validationMessage), FAILURE);

        let adminExists = await adminModel.findOne({email: reqParam.email.toLowerCase(), status: ACTIVE_STATUS});
        if (!adminExists) return responseHelper.successapi(res, res.__("emailIdNotExists"), META_STATUS_0, SUCCESS);

        const resetToken = await jwt.sign({_id: adminExists._id}, JWT_AUTH_TOKEN_SECRET, {expiresIn: RESET_TOKEN_EXPIRES});

        await adminExists.updateOne({resetToken: resetToken});

        let locals = {
            username: adminExists.firstName,
            tokenUrl: `${ADMIN_WEB_LINK}reset-password/${resetToken}`,
            imageLink: `${IMAGE_LINK}`
        };
        const emailBody = await ejs.renderFile(path.join(__dirname, "../../views/emails", "forgot-password.ejs"), {locals: locals});

        Mailer.sendEmail(reqParam.email, emailBody, "Forgot password");

        return responseHelper.successapi(res, res.__("resetPWDLinkMail"), META_STATUS_1, SUCCESS);
    } catch (e) {
        logger.logger.error(`Error from catch: ${e}`);
        return responseHelper.error(res, res.__("SomethingWentWrongPleaseTryAgain"), SERVERERROR);
    }
};

exports.resetPassword = async (req, res) => {
    try {
        let reqParam = req.body;
        const admin = req.admin;

        let validationMessage = await adminValidation.resetPasswordValidation(reqParam);
        if (validationMessage) return responseHelper.error(res, res.__(validationMessage), FAILURE);

        let password = reqParam.newPassword.trim();

        const foundAdmin = await adminModel.findOne({_id: req.admin._id, status: ACTIVE_STATUS});
        if (!foundAdmin) return responseHelper.successapi(res, res.__("idNotExists"), META_STATUS_0, SUCCESS);

        password = await bcrypt.hash(password, 8);

        const bcryptMatch = await bcrypt.compareSync(reqParam.newPassword, foundAdmin.password);
        if (bcryptMatch) return responseHelper.successapi(res, res.__("oldPasswordAndNewPasswordAreSame"), META_STATUS_0, SUCCESS);

        admin.password = password;
        admin.resetToken = "";
        await admin.save();

        return responseHelper.successapi(res, res.__("passwordChangedSuccessfully"), META_STATUS_1, SUCCESS);

    } catch (e) {
        logger.logger.error(`Error from catch: ${e}`);
        return responseHelper.error(res, res.__("SomethingWentWrongPleaseTryAgain"), SERVERERROR);
    }
};

exports.viewProfile = async (req, res) => {
    try {
        const viewProfile = await adminModel.findOne({_id: req.admin._id, status: ACTIVE_STATUS});
        if (!viewProfile) return responseHelper.successapi(res, res.__("adminNotExists"), META_STATUS_0, SUCCESS);

        let responseData = await adminTransformer.transformListCollection(viewProfile);

        return responseHelper.successapi(res, res.__("adminDetailsFoundSuccessfully"), META_STATUS_1, SUCCESS, responseData);
    } catch (e) {
        logger.logger.error(`Error from catch: ${e}`);
        return responseHelper.error(res, res.__("SomethingWentWrongPleaseTryAgain"), SERVERERROR);
    }
};

exports.changePassword = async (req, res) => {
    try {
        let reqParam = req.body;

        let passwordValidation = await adminValidation.changePasswordValidation(reqParam);
        if (passwordValidation) return responseHelper.error(res, res.__(passwordValidation), FAILURE);

        const foundAdmin = await adminModel.findOne({_id: req.admin._id, status: ACTIVE_STATUS});
        if (!foundAdmin) return responseHelper.successapi(res, res.__("adminNotFound"), META_STATUS_0, SUCCESS);

        const bcryptMatch = await bcrypt.compareSync(reqParam.oldPassword, foundAdmin.password);
        if (bcryptMatch) {
            if (reqParam.newPassword.trim() !== reqParam.oldPassword) {
                const newPassword = await bcrypt.hash(reqParam.newPassword.trim(), 8);
                await foundAdmin.updateOne({password: newPassword});

                return responseHelper.successapi(res, res.__("passwordUpdated"), META_STATUS_1, SUCCESS);
            } else {
                return responseHelper.error(res, res.__("passwordAndOldPasswordMatched"), FAILURE);
            }
        } else {
            return responseHelper.error(res, res.__("oldPasswordWrong"), FAILURE);
        }
    } catch (e) {
        logger.logger.error(`Error from catch: ${e}`);
        return responseHelper.error(res, res.__("SomethingWentWrongPleaseTryAgain"), SERVERERROR);
    }
};

exports.editProfile = async (req, res) => {
    try {
        let reqParam = req.body;

        let editInfoValidation = await adminValidation.editProfileValidation(reqParam);
        if (editInfoValidation) return responseHelper.error(res, res.__(editInfoValidation), FAILURE);

        const foundAdmin = await adminModel.findOne({_id: req.admin._id, status: ACTIVE_STATUS});
        if (!foundAdmin) return responseHelper.successapi(res, res.__("adminNotExists"), META_STATUS_0, SUCCESS);

        let oldProfileImage = foundAdmin.profilePic
        let editAdminProfile = {
            firstName: reqParam?.firstName ? reqParam.firstName : foundAdmin.firstName,
            lastName: reqParam?.lastName ? reqParam.lastName : foundAdmin.lastName,
            email: reqParam?.email ? reqParam.email.toLowerCase() : foundAdmin.email,
            phone: reqParam?.phone ? reqParam.phone : foundAdmin.phone,
            profilePic: req?.file ? await Helper.getFileName(req.file) : oldProfileImage
        };

        await foundAdmin.updateOne(editAdminProfile);

        const updatedAdminProfile = await adminModel.findOne({_id: req.admin._id});

        let adminDetail = await adminTransformer.transformListCollection(updatedAdminProfile);

        return responseHelper.successapi(res, res.__("profileEditSuccessfully"), META_STATUS_1, SUCCESS, adminDetail);
    } catch (e) {
        logger.logger.error(`Error from catch: ${e}`);
        return responseHelper.error(res, res.__("SomethingWentWrongPleaseTryAgain"), SERVERERROR);
    }
};

exports.logout = async (req, res) => {
    try {
        await jwtTokenModel.deleteMany({ userId: req.admin._id })

        return responseHelper.successapi(res, res.__("logoutSuccessfully"), META_STATUS_1, SUCCESS, '');
    } catch (e) {
        logger.logger.error(`Error from catch: ${e}`);
        return responseHelper.error(res, res.__("SomethingWentWrongPleaseTryAgain"), SERVERERROR);
    }
}