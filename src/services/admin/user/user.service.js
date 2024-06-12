const UserModel = require('../../../models/user.model')
const {ACTIVE_STATUS, INACTIVE_STATUS, DELETED_STATUS} = require('../../../../config/key')
const {searchHelper} = require('../../../helpers/searchHelper')
const {facetHelper} = require('../../../helpers/paginationHelper')
let ObjectId = require("mongodb").ObjectId;

exports.userService = async (data) => {
    try {
        let pipeline = []

        pipeline.push(
            {
                $match: {
                    clientId: ObjectId(data.clientId),
                    status: {$ne: DELETED_STATUS}
                }
            },
            {
                $lookup: {
                    from: "segment",
                    let: {segmentId: "$segments"},
                    pipeline: [{
                        $match: {
                            $expr: {
                                $and: [
                                    { $in: ['$_id', '$$segmentId'] },
                                    { $eq: ['$status', ACTIVE_STATUS] }
                                ]
                            }
                        }
                    }],
                    as: 'segmentData'
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
            let fieldsArray = ['firstName', 'lastName', 'userName', "email", "city"]
            pipeline.push(searchHelper(data.search, fieldsArray))
        }

        pipeline.push({$sort: obj}, facetHelper(Number(data.skip), Number(data.limit)))

        let result = await UserModel.aggregate(pipeline);

        return result
    } catch (e) {
        return false
    }
}