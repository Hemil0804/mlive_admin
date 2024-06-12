const scriptModel = require('../../models/script.model');
const responseHelper = require('../../helpers/responseHelper');
const {
    META_STATUS_1,
    SUCCESS,
    SERVERERROR,
} = require('../../../config/key')
const logger = require('../../helpers/loggerService')

exports.dataFeed = async (req, res) => {
    try {
        let reqParam = req.body;
        console.log('reqParam',reqParam)
        logger.logger.info(`webhook body: ${JSON.stringify(reqParam)}`);
        let fields = req.fields;
        console.log('fields',req.fields);
        logger.logger.info(`webhook fields: ${JSON.stringify(fields)}`);
        return responseHelper.successapi(res, res.__("success"), META_STATUS_1, SUCCESS);
    } catch (e) {
        logger.logger.error(`webhook exception: ${e}`);
        return responseHelper.error(res, res.__("SomethingWentWrongPleaseTryAgain"), SERVERERROR);
    }
}



