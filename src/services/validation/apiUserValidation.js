const Joi = require('@hapi/joi')
Joi.objectId = require('joi-objectid')(Joi)
const helper = require('../../helpers/Helper')

module.exports = {
    async signupUserValidation(req) {
        const schema = Joi.object({
            firstName: Joi.string().required().min(2).max(30),
            lastName: Joi.string().required().min(2).max(30),
            email: Joi.string().required().email().min(2).max(30),
            password: Joi.string().required().min(2).max(20)
        }).unknown(true)
        const {error} = schema.validate(req)
        if (error) {
            return helper.validationMessageKey('validation', error)
        }
        return null
    },
    async editProfileValidation(req) {
        const schema = Joi.object({
            firstName: Joi.string().required().min(2).max(20),
            lastName: Joi.string().required().min(2).max(20),
            city: Joi.objectId().required(),
        }).unknown(true)
        const {error} = schema.validate(req)
        if (error) {
            return helper.validationMessageKey('validation', error)
        }
        return null
    },
    async socialSignupUserValidation(req) {
        const schema = Joi.object({
            given_name: Joi.string().required().min(2).max(30),
            family_name: Joi.string().required().min(2).max(30),
            access_token: Joi.string().required(),
            email: Joi.string().required().email().min(2).max(30)
        }).unknown(true)
        const {error} = schema.validate(req)
        if (error) {
            return helper.validationMessageKey('validation', error)
        }
        return null
    },
    async loginUserValidation(req) {
        const schema = Joi.object({
            email: Joi.string().required().email().min(2).max(30),
            password: Joi.string().required().min(2).max(30)
        }).unknown(true)
        const {error} = schema.validate(req)
        if (error) {
            return helper.validationMessageKey('validation', error)
        }
        return null
    },

    async forgotPasswordValidation(req) {
        const schema = Joi.object({
            email: Joi.string().required().email().min(2).max(30)
        }).unknown(true)
        const {error} = schema.validate(req)
        if (error) {
            return helper.validationMessageKey('validation', error)
        }
        return null
    },
    async verifyPhoneValidation(req) {
        const schema = Joi.object({
            phone: Joi.string().required().max(20),
            countryCode: Joi.string().required().max(4)
        }).unknown(true)
        const {error} = schema.validate(req)
        if (error) {
            return helper.validationMessageKey('validation', error)
        }
        return null
    },
    async resetPasswordValidation(req) {
        const schema = Joi.object({
            newPassword: Joi.string().required().trim().min(6),
            confirmPassword: Joi.string().required().trim().min(6)
        }).unknown(true)
        const {error} = schema.validate(req)
        if (error) {
            return helper.validationMessageKey('validation', error)
        }
        return null
    },
    async changePasswordValidation(req) {
        const schema = Joi.object({
            oldPassword: Joi.string().required(),
            newPassword: Joi.string().required().trim().min(6),
            confirmPassword: Joi.string().required().trim().min(6)
        }).unknown(true)
        const {error} = schema.validate(req)
        if (error) {
            return helper.validationMessageKey('validation', error)
        }
        return null
    },
    async verifyUser(req) {
        const schema = Joi.object({
            email: Joi.string().email().required().max(30),
            otp: Joi.number().required().min(6)
        }).unknown(true)
        const {error} = schema.validate(req)
        if (error) {
            return helper.validationMessageKey('validation', error)
        }
        return null
    },
    async verifyPhone(req) {
        const schema = Joi.object({
            phone: Joi.string().required().max(20),
            countryCode: Joi.string().required(),
            otp: Joi.number().required().min(6)
        }).unknown(true)
        const {error} = schema.validate(req)
        if (error) {
            return helper.validationMessageKey('validation', error)
        }
        return null
    },
}
