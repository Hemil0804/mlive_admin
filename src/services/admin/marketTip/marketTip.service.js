const marketTipModel = require('../../../models/marketTip.model')
const { ACTIVE_STATUS, INACTIVE_STATUS, DELETED_STATUS } = require('../../../../config/key')
const { searchHelper } = require('../../../helpers/searchHelper')
const { facetHelper } = require('../../../helpers/paginationHelper')

exports.listService = async(data) => {
    try {
        let pipeline = []
        pipeline.push({
            $match: {
                status: { $ne: DELETED_STATUS }
            }
        })

        let obj = {}
        sortBy = data.sortBy ? data.sortBy : -1
        sortBy = parseInt(sortBy)
        let sortKey = data.sortKey ? data.sortKey : 'updatedAt'
        obj[sortKey] = sortBy

        if (data.search) {
            let fieldsArray = ['title', 'description']
            pipeline.push(searchHelper(data.search, fieldsArray))
        }

        pipeline.push({ $sort: obj }, facetHelper(Number(data.skip), Number(data.limit)))

        const result = await marketTipModel.aggregate(pipeline);

        return result
    } catch (e) {
        return false
    }
}