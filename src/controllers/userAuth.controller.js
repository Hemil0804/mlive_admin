const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const userModel = require('../models/user.model');
const responseHelper = require('../helpers/responseHelper');
const logger = require('../helpers/loggerService')
const userAuthValidation = require('../services/validation/apiUserValidation');
const {userAuthService, recentJobApplication} = require('../services/userAuth/userAuth.service');
const {
    ACTIVE_STATUS,
    INACTIVE_STATUS,
    DELETED_STATUS,
    META_STATUS_0,
    META_STATUS_1,
    SUCCESS,
    FAILURE,
    JWT_AUTH_TOKEN_SECRET,
    JWT_EXPIRES_IN,
    SERVERERROR,
    IMAGE_LINK,
    UNVERIFIED_STATUS,
    APP_WEB_LINK,
    OTP_TIMEOUT,
} = require('../../config/key')
const userDetailTransformer = require('../transformers/user/userDetailTransformer')
const Mailer = require('../services/Mailer');
const moment = require('moment');
const ejs = require('ejs');
const path = require('path');
const Helper = require('../helpers/Helper');

let ObjectId = require('mongodb').ObjectId
const fs = require('fs-extra');
const jwtTokenModel = require('../models/jwtToken.model');

exports.login = async(req, res) => {
    try {
        let reqParam = req.body;

        let validationMessage = await userAuthValidation.loginUserValidation(reqParam);
        if (validationMessage) return responseHelper.error(res, res.__(validationMessage), FAILURE);

        let foundUser = await userModel.findOne({ email: reqParam.email.toLowerCase(), status: { $ne: DELETED_STATUS } });
        if (!foundUser) return responseHelper.successapi(res, res.__('emailOrPasswordIsWrong'), META_STATUS_0, SUCCESS);
        if(foundUser.status == INACTIVE_STATUS){
            return responseHelper.successapi(res, res.__('yourAccountDisabled'), META_STATUS_0, SUCCESS);
        }
        if(foundUser.userType){
            return responseHelper.successapi(res, res.__('registerWithGoogle'), META_STATUS_0, SUCCESS);
        }

        if (bcrypt.compareSync(reqParam.password, foundUser.password)) {

            let tokenObject = {
                _id: foundUser._id,
                firstName: foundUser.firstName,
                lastName: foundUser.lastName,
                email: foundUser.email,
                status: foundUser.status
            }

            let tokenData = await jwt.sign({ tokenObject }, JWT_AUTH_TOKEN_SECRET, { expiresIn: JWT_EXPIRES_IN });


            let userService = await userAuthService({userId: foundUser._id});
            let userData = await userDetailTransformer.transformUserDetails(userService[0]);

            let isEmailVerified = foundUser.isEmailVerified ? foundUser.isEmailVerified : false;
            if(isEmailVerified === false){
                let otp = await Helper.otpFunction2();
                const expirationTime = moment().add(20, "minutes").toDate();
                await userModel.findOneAndUpdate({email: foundUser.email.toLowerCase(), status: {$in: [ACTIVE_STATUS, UNVERIFIED_STATUS]}}, {$set: {otp,expirationTime}},{new: true});

                let locals = {
                    username : (foundUser.firstName).charAt(0).toUpperCase()+(foundUser.firstName).slice(1),
                    link: `${APP_WEB_LINK}`,
                    imageLink : `${IMAGE_LINK}`,
                    otp: otp
                };

                let emailBody = await ejs.renderFile(
                    path.join(
                        __dirname, "../views/emails/", "email-verification.ejs"
                    ), {locals:locals}
                );

                 Mailer.sendEmail( userData.email, emailBody, "Email verification");

                return responseHelper.successapi(res, res.__('emailVerfied'), META_STATUS_1, SUCCESS, userData, { tokenData: tokenData, isEmailVerified, otpTimeOut: OTP_TIMEOUT });
            }else{
                return responseHelper.successapi(res, res.__('userLoggedInSuccessfully'), META_STATUS_1, SUCCESS, userData, { tokenData: tokenData, isEmailVerified, otpTimeOut: OTP_TIMEOUT });
            }


        } else
            return responseHelper.successapi(res, res.__('emailOrPasswordIsWrong'), META_STATUS_0, SUCCESS);

    } catch (e) {
        console.log(`Error from catch: ${e}`,e)
        logger.logger.error(`Error from catch: ${e}`);
        return responseHelper.error(res, res.__('SomethingWentWrongPleaseTryAgain'), SERVERERROR);
    }
}

exports.viewProfile = async(req, res) => {
    try {
        const foundUser = await userModel.findOne({ _id: req.user._id, status: ACTIVE_STATUS });
        if (!foundUser) return responseHelper.successapi(res, res.__("unauthorizedUser"), META_STATUS_0, SUCCESS);

        let userService = await userAuthService({userId: foundUser._id});


        let responseData = await userDetailTransformer.transformUserDetails(userService[0]);
        console.log('responseData',responseData);
        return responseHelper.successapi(res, res.__("profileViewedSuccessfully"), META_STATUS_1, SUCCESS, responseData);
    } catch (e) {
        logger.logger.error(`Error from catch: ${e}`);
        return responseHelper.error(res, res.__("SomethingWentWrongPleaseTryAgain"), SERVERERROR);
    }
};

exports.logout = async (req, res) => {
    try {
        let reqParam = req.body;
        console.log('reqParam',req.token)
        let userId = req.user._id;
        let token = req.token;

        let tokenData = new jwtTokenModel();
        tokenData.userId = userId,
        tokenData.token = token,
        tokenData.userType = 1,
        tokenData.status = 1
        await tokenData.save();

        return responseHelper.successapi(res, res.__("logoutSuccessfully"), META_STATUS_1, SUCCESS, '');
    } catch (e) {
        logger.logger.error(`Error from catch: ${e}`);
        return responseHelper.error(res, res.__("SomethingWentWrongPleaseTryAgain"), SERVERERROR);
    }
}



