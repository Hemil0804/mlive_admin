const Joi = require("joi");
const helper = require("../../../helpers/Helper");

module.exports = {
    async loginValidation(req) {
        const schema = Joi.object({
            phoneNo: Joi.string().required(),
            password: Joi.string().required()
        }).unknown(true);
        const { error } = schema.validate(req);
        if (error) {
            return helper.validationMessageKey("Validation", error);
        }
        return null;
    },
    async forgotPasswordValidation(req) {
        const schema = Joi.object({
            email: Joi.string().required().email(),
        }).unknown(true);
        const { error } = schema.validate(req);
        if (error) {
            return helper.validationMessageKey("validation", error);
        }
        return null;
    },
    async resetPasswordValidation(req) {
        const schema = Joi.object({
            newPassword: Joi.string().required().trim().min(6)
        }).unknown(true);
        const { error } = schema.validate(req);
        if (error) {
            return helper.validationMessageKey("validation", error);
        }
        return null;
    },
    async changePasswordValidation(req) {
        const schema = Joi.object({
            oldPassword: Joi.string().required(),
            newPassword: Joi.string().required().trim().min(6)
        }).unknown(true);
        const { error } = schema.validate(req);
        if (error) {
            return helper.validationMessageKey("validation", error);
        }
        return null;
    },
    async editProfileValidation(req) {
        const schema = Joi.object({
            firstName: Joi.string().optional().allow('', null),
            lastName: Joi.string().optional().allow('', null),
            email: Joi.string().email().allow('', null),
            phoneNo:Joi.string().length(10).pattern(/^[0-9]+$/),
        }).unknown(true);
        const { error } = schema.validate(req);
        if (error) {
            return helper.validationMessageKey("validation", error);
        }
        return null;
    },
}
