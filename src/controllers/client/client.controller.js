const adminModel = require("../../models/admin.model");
const responseHelper = require("../../helpers/responseHelper");
const clientValidation = require("../../services/client/validation/clientValidation");
const {
    SERVERERROR,
    SUCCESS,
    FAILURE,
    ACTIVE_STATUS,
    DELETED_STATUS,
    META_STATUS_1,
    META_STATUS_0,
    ADMIN_WEB_LINK,
    CLIENT_WEB_LINK,
    IMAGE_LINK,
    CLIENT
} = require("../../../config/key");
const clientTransformer = require("../../transformers/client/clientTransformer");
const { JWT_AUTH_TOKEN_SECRET, JWT_EXPIRES_IN, RESET_TOKEN_EXPIRES,UNVERIFIED_STATUS } = require("../../../config/key");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const path = require("path");
const Mailer = require("../../services/Mailer");
const logger = require("../../helpers/loggerService");
const ejs = require("ejs");
const Helper = require('../../helpers/Helper');
const jwtTokenModel = require("../../models/jwtToken.model");
const clientModel = require("../../models/client.model");

exports.login = async (req, res) => {
    try {
        let reqParam = req.body;

        let validationMessage = await clientValidation.loginValidation(reqParam);
        if (validationMessage) return responseHelper.error(res, res.__(validationMessage), FAILURE);

        let clientExists = await clientModel.findOne({ phoneNo: reqParam.phoneNo, status: { $ne: DELETED_STATUS } });
        if (!clientExists) return responseHelper.successapi(res, res.__("clientNotRegisteredWithPhone"), META_STATUS_0, SUCCESS);

        if (bcrypt.compareSync(reqParam.password, clientExists.password)) {
            let tokenObject = {
                _id: clientExists._id,
                firstName: clientExists.firstName,
                lastName: clientExists.lastName,
                email: clientExists.email,
                phone: clientExists.phoneNo,
            };

            const clientData = await clientTransformer.transformListCollection(clientExists);
            clientData.userType = CLIENT

            let tokenData = await jwt.sign({ tokenObject }, JWT_AUTH_TOKEN_SECRET, { expiresIn: JWT_EXPIRES_IN });

            let checkDeviceToken = await jwtTokenModel.aggregate([
                {
                    $match: {
                        userId: clientExists._id,
                        token: tokenData
                    }
                }
            ])
            if (checkDeviceToken.length == 0) {
                if (tokenData) {
                    await jwtTokenModel.create({
                        userId: clientExists._id,
                        token: tokenData,
                        userType: 3
                    })
                }
            }

            return responseHelper.successapi(res, res.__("clientLoggedInSuccessfully"), META_STATUS_1, SUCCESS, clientData, {tokenData});
        } else {
            return responseHelper.successapi(res, res.__("clientWrongPassword"), META_STATUS_0, SUCCESS);
        }
    } catch (e) {
        logger.logger.error(`Error from catch: ${e}`);
        return responseHelper.error(res, res.__("SomethingWentWrongPleaseTryAgain"), SERVERERROR);
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        let reqParam = req.body;

        let validationMessage = await clientValidation.forgotPasswordValidation(reqParam);
        if (validationMessage) return responseHelper.error(res, res.__(validationMessage), FAILURE);

        let clientExists = await clientModel.findOne({ email: reqParam.email.toLowerCase(), status: ACTIVE_STATUS });
        if (!clientExists) return responseHelper.successapi(res, res.__("emailIdNotExists"), META_STATUS_0, SUCCESS);

        const resetToken = await jwt.sign({ _id: clientExists._id }, JWT_AUTH_TOKEN_SECRET, {expiresIn: RESET_TOKEN_EXPIRES});

        await clientExists.updateOne({resetToken: resetToken});

        let locals = {
            username: clientExists.firstName,
            tokenUrl: `${CLIENT_WEB_LINK}reset-password/${resetToken}`,
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
        if(!foundAdmin) return responseHelper.successapi(res, res.__("idNotExists"), META_STATUS_0, SUCCESS);

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

exports.viewProfile = async (req,res) => {
    try {
        const viewProfile = await clientModel.findOne({_id: req.client._id, status: ACTIVE_STATUS});
        if (!viewProfile) return responseHelper.successapi(res, res.__("clientNotExists"), META_STATUS_0, SUCCESS);

        let responseData = await clientTransformer.transformListCollection(viewProfile);

        return responseHelper.successapi(res, res.__("clientDetailsFoundSuccessfully"), META_STATUS_1, SUCCESS, responseData);
    } catch (e) {
        logger.logger.error(`Error from catch: ${e}`);
        return responseHelper.error(res, res.__("SomethingWentWrongPleaseTryAgain"), SERVERERROR);
    }
};

exports.changePassword = async (req, res) => {
    try {
        let reqParam = req.body;

        let passwordValidation = await clientValidation.changePasswordValidation(reqParam);
        if (passwordValidation) return responseHelper.error(res, res.__(passwordValidation), FAILURE);

        const foundClient = await clientModel.findOne({_id: req.client._id, status: ACTIVE_STATUS});
        if(!foundClient) return responseHelper.successapi(res, res.__("clientNotExists"), META_STATUS_0, SUCCESS);

        const bcryptMatch = await bcrypt.compareSync(reqParam.oldPassword, foundClient.password);
        if (bcryptMatch) {
             if (reqParam.newPassword.trim() !== reqParam.oldPassword) {
                 const newPassword = await bcrypt.hash(reqParam.newPassword.trim(), 8);
                await foundClient.updateOne({password: newPassword});

                return responseHelper.successapi(res, res.__("passwordUpdatedSuccessfully"), META_STATUS_1, SUCCESS);
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

        let editInfoValidation = await clientValidation.editProfileValidation(reqParam);
        if (editInfoValidation) return responseHelper.error(res, res.__(editInfoValidation), FAILURE);

        const foundClient = await clientModel.findOne({_id: req.client._id, status: ACTIVE_STATUS});
        if(!foundClient) return responseHelper.successapi(res, res.__("clientNotExists"), META_STATUS_0, SUCCESS);

        let oldProfileImage = foundClient.profileImage
        let editAdminProfile = {
            firstName: reqParam?.firstName ? reqParam.firstName : foundClient.firstName,
            lastName: reqParam?.lastName ? reqParam.lastName : foundClient.lastName,
            email: reqParam?.email ? reqParam.email.toLowerCase() : foundClient.email,
            phoneNo: reqParam?.phoneNo ? reqParam.phoneNo : foundClient.phoneNo,
            profileImage : req?.file ? await Helper.getFileName(req.file) : oldProfileImage
        };

        await foundClient.updateOne(editAdminProfile);

        const updatedClientProfile = await clientModel.findOne({_id: req.client._id});

        let clientDetail = await clientTransformer.transformListCollection(updatedClientProfile);

        return responseHelper.successapi(res, res.__("profileEditSuccessfully"), META_STATUS_1, SUCCESS, clientDetail);
    } catch (e) {
        logger.logger.error(`Error from catch: ${e}`);
        return responseHelper.error(res, res.__("SomethingWentWrongPleaseTryAgain"), SERVERERROR);
    }
};

exports.logout = async (req, res) => {
    try {
        await jwtTokenModel.deleteMany({ userId: req.client._id })

        return responseHelper.successapi(res, res.__("logoutSuccessfully"), META_STATUS_1, SUCCESS, '');
    } catch (e) {
        logger.logger.error(`Error from catch: ${e}`);
        return responseHelper.error(res, res.__("SomethingWentWrongPleaseTryAgain"), SERVERERROR);
    }
}