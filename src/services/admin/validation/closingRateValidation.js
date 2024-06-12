const Joi = require('@hapi/joi');
Joi.objectId = require('joi-objectid')(Joi);
const helper = require("../../../helpers/Helper");

module.exports = {
    async deleteClosingRateValidation(req) {
        const schema = Joi.object({
            segment: Joi.array().required()
        }).unknown(true);
        const {error} = schema.validate(req);
        if (error) {
            return helper.validationMessageKey("validation", error);
        }
        return null;
    },
    async deleteSingleRecordValidation(req) {
        const schema = Joi.object({
            segment: Joi.string().required(),
            symbol: Joi.string().required(),
            expiryDate: Joi.string().required()
        }).unknown(true);
        const {error} = schema.validate(req);
        if (error) {
            return helper.validationMessageKey("validation", error);
        }
        return null;
    }
}
