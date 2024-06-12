const logger = require('../../helpers/loggerService');
const {userService} = require('../../services/admin/user/user.service');
const responseHelper = require('../../helpers/responseHelper');
const Helper = require('../../helpers/Helper');
const userTransformer = require('../../transformers/client/userTransformer');
const {
    SERVERERROR,
    META_STATUS_1,
    SUCCESS,
    DELETED_STATUS,
    META_STATUS_0
} = require('../../../config/key');
const clientModel = require("../../models/client.model")
const userModel = require("../../models/user.model")

exports.list = async (req, res) => {
    try {
        let reqParam = req.body;

        const {limitCount, skipCount} = await Helper.getPageAndLimit(reqParam.page, reqParam.limit);

        let clientFound = await clientModel.findOne({_id: reqParam.clientId, status: {$ne: DELETED_STATUS}})
        if (!clientFound) return responseHelper.successapi(res, res.__("clientNotFound"), META_STATUS_0, SUCCESS);

        let userFound = await userModel.find({clientId: reqParam.clientId, status: {$ne: DELETED_STATUS}})

        const listUser = await userService({
            skip: skipCount,
            limit: limitCount,
            search: reqParam.search,
            status: reqParam.status,
            sortBy: reqParam.sortBy,
            sortKey: reqParam.sortKey,
            clientId: reqParam.clientId
        });

        let response = listUser[0].data && listUser[0].data.length > 0 ? listUser[0].data : [];

        let responseMeta = {
            totalCount: listUser[0].totalRecords[0]?.count ? listUser[0].totalRecords[0].count : 0,
            userCount: clientFound?.userCount ? clientFound.userCount : 0,
            isUserLimit: userFound.length < clientFound.userCount ? true : false
        }

        const responseData = await userTransformer.transformListCollection(response);

        return responseHelper.successapi(res, res.__('userListFoundSuccessfully'), META_STATUS_1, SUCCESS, responseData, responseMeta);
    } catch (e) {
        logger.logger.error(`Error from catch: ${e}`);
        return responseHelper.error(res, res.__('SomethingWentWrongPleaseTryAgain'), SERVERERROR);
    }
}