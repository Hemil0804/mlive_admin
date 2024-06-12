const Joi = require('@hapi/joi');
Joi.objectId = require('joi-objectid')(Joi);
const helper = require("../../../helpers/Helper");

module.exports = {
    async createClientValidation(req) {
        const schema = Joi.object({
            firstName: Joi.string().required().min(2),
            lastName: Joi.string().required().min(2),
            email: Joi.string().email().allow("", null),
            phoneNo: Joi.string().length(10).pattern(/^[0-9]+$/),
            password: Joi.string().required().trim().min(6),
            userCount: Joi.number().required().min(1)
        }).unknown(true);
        const {error} = schema.validate(req);
        if (error) {
            return helper.validationMessageKey("validation", error);
        }
        return null;
    },
    async editClientValidation(req) {
        const schema = Joi.object({
            clientId: Joi.objectId().required(),
            firstName: Joi.string().optional().allow("", null),
            lastName: Joi.string().optional().allow("", null),
            email: Joi.string().email().allow("", null),
            phoneNo: Joi.string().length(10).pattern(/^[0-9]+$/),
            password: Joi.string().optional().allow("", null),
            userCount: Joi.number().optional()
        }).unknown(true);
        const {error} = schema.validate(req);
        if (error) {
            return helper.validationMessageKey("validation", error);
        }
        return null;
    },

    async deleteClientValidation(req) {
        const schema = Joi.object({
            clientId: Joi.objectId().required()
        }).unknown(true);
        const {error} = schema.validate(req);
        if (error) {
            return helper.validationMessageKey("validation", error);
        }
        return null;
    },
    async changePasswordClientValidation(req) {
        const schema = Joi.object({
            clientId: Joi.objectId().required(),
            newPassword: Joi.string().required()
        }).unknown(true);
        const { error } = schema.validate(req);
        if (error) {
            return helper.validationMessageKey("validation", error);
        }
        return null;
    },
}
