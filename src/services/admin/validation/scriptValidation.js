const Joi = require('@hapi/joi');
Joi.objectId = require('joi-objectid')(Joi);
const helper = require("../../../helpers/Helper");

module.exports = {
    async deleteScriptValidation(req) {
        const schema = Joi.object({
            scriptId: Joi.required()
        }).unknown(true);
        const {error} = schema.validate(req);
        if (error) {
            return helper.validationMessageKey("validation", error);
        }
        return null;
    }
}
