const userModel = require('../models/user.model');
const contactUsModel = require('../models/contactUs.model');
const responseHelper = require('../helpers/responseHelper');
const logger = require('../helpers/loggerService');
const ejs = require('ejs');
const path = require('path');
const Mailer = require('../services/Mailer');
const {
    ACTIVE_STATUS,
    META_STATUS_1,
    SUCCESS,
    FAILURE,
    SERVERERROR,
    IMAGE_LINK
} = require('../../config/key')
const userHomeTransformer = require('../transformers/userHome/userHomeTransformer')
const userHomeValidation = require('../services/validation/userHomeValidation')
const Helper = require('../helpers/Helper');
const adminModel = require("../models/admin.model");
var request = require('request'); 
const cmsModel = require('../models/cms.model');
let ObjectId = require('mongodb').ObjectId
const cmsTransformer = require("../transformers/admin/cmsTransformer");

exports.contactUs = async (req, res) => {
    try {
        let reqParam = req.body;
        let validationMessage = await userHomeValidation.contactUsValidation(reqParam);
        let token = reqParam.captchaToken;

        let SECRET_KEY= "6LfpfhImAAAAANrXDTMSQsjnK0y_R2_APiZGPPYb";

        
        var user_ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        var verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + SECRET_KEY + "&response=" + token + "&remoteip=" + user_ip;
        
      
        request(verificationUrl,async function(error,response,body) {

            body = JSON.parse(body);
            // Success will be true or false depending upon captcha validation.
            if(body.success !== undefined && !body.success) {

                return responseHelper.error(res, res.__('Failed captcha verification'), FAILURE);
            }else{

                
                if (validationMessage) return responseHelper.error(res, res.__(validationMessage), FAILURE);
        
                let contactUsData = {
                    firstName: reqParam.firstName,
                    lastName: reqParam.lastName,
                    email: reqParam.email.toLowerCase(),
                    phone: reqParam.phone,
                    countryCode: reqParam.countryCode,
                    message: reqParam.message
                }
        
                let contactUs = new contactUsModel(contactUsData);
                let response = await contactUs.save();
        
                let responseData = await userHomeTransformer.transformContactUsDetails(response);
        
                let locals = {
                    firstName: reqParam.firstName,
                    lastName: reqParam.lastName,
                    email: reqParam.email.toLowerCase(),
                    phone: reqParam.phone,
                    countryCode: reqParam.countryCode,
                    message: reqParam.message,
                    appName: 'InfosecHire',
                    imageLink: `${IMAGE_LINK}`
                    /*privacyPolicy: PRIVACY_POLICY,
                    termsAndCondition: TERMS_AND_CONDITION*/
                };
        
                let emailBody = await ejs.renderFile(path.join(__dirname, '../views/emails/', 'contact_us_user.ejs'), { locals: locals });
        
                 Mailer.sendEmail(reqParam.email, emailBody, 'Thank you for getting in touch');
        
                let  adminFound = await adminModel.find({status: ACTIVE_STATUS});
                if (adminFound) {
                    for (let a of adminFound) {
                        let emailBodyAdmin = await ejs.renderFile(path.join(__dirname, '../views/emails/', 'contact_us_admin.ejs'), { locals: locals });
        
                         Mailer.sendEmail(a.email, emailBodyAdmin, 'Contact Us');
                    }
                }
        
                return responseHelper.successapi(res, res.__('YouResponseHasBeenSubmittedSuccessfully'), META_STATUS_1, SUCCESS, responseData);
            }
          });

       
    } catch (e) {
        logger.logger.error(`Error from catch: ${e}`);
        return responseHelper.error(res, res.__('SomethingWentWrongPleaseTryAgain'), SERVERERROR);
    }
}

exports.cms = async (req, res) => {
    try {
        if (req.query.slug) {
            const cmsList = await cmsModel.findOne({status: ACTIVE_STATUS, slug: req.query.slug});
            let responseData = await cmsTransformer.transformViewCollection(cmsList);

            return responseHelper.successapi(res, res.__("cmsListFoundSuccessfully"), META_STATUS_1, SUCCESS, responseData);
        }else{
            return responseHelper.successapi(res, res.__("nofound"), META_STATUS_1, SUCCESS, responseData);
        }
    } catch (e) {
        logger.logger.error(`Error from catch: ${e}`);
        return responseHelper.error(res, res.__('SomethingWentWrongPleaseTryAgain'), SERVERERROR);
    }
}

