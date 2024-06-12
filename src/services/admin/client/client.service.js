let clientModel = require("../../../models/client.model");
const { ACTIVE_STATUS, DELETED_STATUS, INACTIVE_STATUS } = require('../../../../config/key');
const { searchHelper } = require('../../../helpers/searchHelper')
const { facetHelper } = require('../../../helpers/paginationHelper')
let ObjectId = require("mongodb").ObjectId;

exports.createOrUpdateClient = async (data) => {
    let res;

    if (!data.clientId) {
        res = await clientModel.create(data)
    } else {
        res = await clientModel.findOneAndUpdate({_id: data.clientId}, data, {new: true});
    }
    return res;
}

exports.clientService = async(data) => {
    try {
        let pipeline = [];

        pipeline.push(
            {
                $match: {
                    status: { $ne: DELETED_STATUS }
                }
            },
            {
                $lookup: {
                    from: "user",
                    let: {clientId: "$_id"},
                    pipeline: [{
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$clientId', '$$clientId'] },
                                    { $ne: ['$status', DELETED_STATUS] }
                                ]
                            }
                        }
                    }],
                    as: 'userData'
                }
            },
            {
                $addFields: {
                    totalCount: {$size: "$userData"},
                    activeCount: {
                        $size: {
                            $filter: {
                                input: "$userData",
                                cond: { "$eq": [ "$$this.status", ACTIVE_STATUS ] }
                            }
                        }
                    },
                    inactiveCount: {
                        $size: {
                            $filter: {
                                input: "$userData",
                                cond: { "$eq": [ "$$this.status", INACTIVE_STATUS ] }
                            }
                        }
                    }
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

        const result = await clientModel.aggregate(pipeline);
        return result;
    } catch (e) {
        console.log(e)
        return false;
    }
}

exports.viewClientService = async(data) => {
    try {
        let pipeline = [];

        pipeline.push(
            {
                $match: {
                    _id: ObjectId(data.clientId),
                    status: { $ne: DELETED_STATUS }
                }
            },
            {
                $lookup: {
                    from: "user",
                    let: {clientId: "$_id"},
                    pipeline: [{
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$clientId', '$$clientId'] },
                                    { $ne: ['$status', DELETED_STATUS] }
                                ]
                            }
                        }
                    }],
                    as: 'userData'
                }
            },
            {
                $addFields: {
                    totalCount: {$size: "$userData"},
                    activeCount: {
                        $size: {
                            $filter: {
                                input: "$userData",
                                cond: { "$eq": [ "$$this.status", ACTIVE_STATUS ] }
                            }
                        }
                    },
                    inactiveCount: {
                        $size: {
                            $filter: {
                                input: "$userData",
                                cond: { "$eq": [ "$$this.status", INACTIVE_STATUS ] }
                            }
                        }
                    }
                }
            })

        const result = await clientModel.aggregate(pipeline);

        return result;
    } catch (e) {
        return false;
    }
}
