const Joi = require('@hapi/joi');
Joi.objectId = require('joi-objectid')(Joi);
const helper = require("../../../helpers/Helper");

module.exports = {
    async createSegmentValidation(req) {
        const schema = Joi.object({
            segmentName: Joi.string().required()
        }).unknown(true);
        const {error} = schema.validate(req);
        if (error) {
            return helper.validationMessageKey("validation", error);
        }
        return null;
    },
    async editSegmentValidation(req) {
        const schema = Joi.object({
            segmentId: Joi.objectId().required()
        }).unknown(true);
        const {error} = schema.validate(req);
        if (error) {
            return helper.validationMessageKey("validation", error);
        }
        return null;
    }
}
