let adminModel = require("../../../models/admin.model");
const { ACTIVE_STATUS, DELETED_STATUS, SUB_ADMIN } = require('../../../../config/key');
const { searchHelper } = require('../../../helpers/searchHelper')
const { facetHelper } = require('../../../helpers/paginationHelper')
let ObjectId = require("mongodb").ObjectId;

exports.createOrUpdateSubAdmin = async (data) => {
    let res;

    if (!data.subAdminId) {
        res = await adminModel.create(data)
    } else {
        res = await adminModel.findOneAndUpdate({_id: data.subAdminId}, data, {new: true});
    }
    return res;
}

exports.subAdminService = async(data) => {
    try {
        let pipeline = [];

        pipeline.push({
            $match: {
                userType: SUB_ADMIN,
                status: { $ne: DELETED_STATUS }
            }
        })

        if (data.status) {
            pipeline.push(
                {
                    $match: {
                        status: data.status
                    }
                }
            )
        }

        let obj = {}
        sortBy = data.sortBy ? data.sortBy : -1
        sortBy = parseInt(sortBy)
        let sortKey = data.sortKey ? data.sortKey : 'updatedAt'
        obj[sortKey] = sortBy

        if (data.search) {
            let fieldsArray = ['firstName','lastName']
            pipeline.push(searchHelper(data.search, fieldsArray))
        }

        pipeline.push({ $sort: obj }, facetHelper(Number(data.skip), Number(data.limit)))

        const result = await adminModel.aggregate(pipeline);
        return result;
    } catch (e) {
        return false;
    }
}