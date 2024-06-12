const Joi = require('@hapi/joi');
Joi.objectId = require('joi-objectid')(Joi);
const helper = require("../../../helpers/Helper");

module.exports = {
    async addUserValidation(req) {
        const schema = Joi.object({
            userName: Joi.string().required(),
            firstName: Joi.string().optional().allow("", null),
            lastName: Joi.string().optional().allow("", null),
            email: Joi.string().email().allow("", null),
            password: Joi.string().required(),
            phoneNo: Joi.string().required().length(10).pattern(/^[0-9]+$/),
            city: Joi.string().optional().allow("", null),
            segments: Joi.array().required(),
            subscriptionType: Joi.string().required().valid("3 days of trial", "1 month", "3 months", "6 months", "1 year"),
            subscriptionStartDate: Joi.string().required(),
            subscriptionEndDate: Joi.string().required(),
            status: Joi.number().optional().allow(1, 2)
        }).unknown(true);
        const { error } = schema.validate(req);
        if (error) {
            return helper.validationMessageKey("validation", error);
        }
        return null;
    },
    async editUserValidation(req) {
        const schema = Joi.object({
            userId: Joi.objectId().required(),
            userName: Joi.string().optional().allow("", null),
            firstName: Joi.string().optional().allow("", null),
            lastName: Joi.string().optional().allow("", null),
            email: Joi.string().email().allow("", null),
            password: Joi.string().optional().allow("", null),
            phoneNo: Joi.string().length(10).pattern(/^[0-9]+$/),
            city: Joi.string().optional().allow("", null),
            segments: Joi.array().optional().allow("", null),
            subscriptionType: Joi.string().optional().allow("", null),
            subscriptionStartDate: Joi.string().optional().allow("", null),
            subscriptionEndDate: Joi.string().optional().allow("", null),
            status: Joi.number().optional().allow(1, 2)
        }).unknown(true);
        const { error } = schema.validate(req);
        if (error) {
            return helper.validationMessageKey("validation", error);
        }
        return null;
    },
    async changePasswordValidation(req) {
        const schema = Joi.object({
            password: Joi.string().required(),
            newPassword: Joi.string().required(),
            confirmPassword: Joi.string().required()
        }).unknown(true);
        const { error } = schema.validate(req);
        if (error) {
            return helper.validationMessageKey("validation", error);
        }
        return null;
    },
    async changePasswordUserValidation(req) {
        const schema = Joi.object({
            userId: Joi.objectId().required(),
            newPassword: Joi.string().required()
        }).unknown(true);
        const { error } = schema.validate(req);
        if (error) {
            return helper.validationMessageKey("validation", error);
        }
        return null;
    },
}