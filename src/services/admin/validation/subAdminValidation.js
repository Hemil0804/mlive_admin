const Joi = require('@hapi/joi');
Joi.objectId = require('joi-objectid')(Joi);
const helper = require("../../../helpers/Helper");

module.exports = {
    async createSubAdminValidation(req) {
        const schema = Joi.object({
            firstName: Joi.string().required().min(2),
            lastName: Joi.string().required().min(2),
            email: Joi.string().email().allow("", null),
            phone: Joi.string().length(10).pattern(/^[0-9]+$/),
            password: Joi.string().required().trim().min(6)
        }).unknown(true);
        const {error} = schema.validate(req);
        if (error) {
            return helper.validationMessageKey("validation", error);
        }
        return null;
    },
    async editSubAdminValidation(req) {
        const schema = Joi.object({
            subAdminId: Joi.objectId().required(),
            firstName: Joi.string().optional().allow("", null),
            lastName: Joi.string().optional().allow("", null),
            email: Joi.string().email().allow("", null),
            phone: Joi.string().length(10).pattern(/^[0-9]+$/),
            password: Joi.string().optional().allow("", null)
        }).unknown(true);
        const {error} = schema.validate(req);
        if (error) {
            return helper.validationMessageKey("validation", error);
        }
        return null;
    },

    async deleteSubAdminValidation(req) {
        const schema = Joi.object({
            subAdminId: Joi.objectId().required()
        }).unknown(true);
        const {error} = schema.validate(req);
        if (error) {
            return helper.validationMessageKey("validation", error);
        }
        return null;
    },
    async changePasswordSubAdminValidation(req) {
        const schema = Joi.object({
            subAdminId: Joi.objectId().required(),
            newPassword: Joi.string().required()
        }).unknown(true);
        const { error } = schema.validate(req);
        if (error) {
            return helper.validationMessageKey("validation", error);
        }
        return null;
    }
}