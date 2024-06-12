const Joi = require('@hapi/joi');
Joi.objectId = require('joi-objectid')(Joi);
const helper = require("../../../helpers/Helper");

module.exports = {
    async createCmsValidation(req) {
        const schema = Joi.object({
            title: Joi.string().required(),
            description: Joi.string().required()
        }).unknown(true);
        const {error} = schema.validate(req);
        if (error) {
            return helper.validationMessageKey("validation", error);
        }
        return null;
    },
    async editCmsValidation(req) {
        const schema = Joi.object({
            cmsId: Joi.objectId().required()
        }).unknown(true);
        const {error} = schema.validate(req);
        if (error) {
            return helper.validationMessageKey("validation", error);
        }
        return null;
    }
}
