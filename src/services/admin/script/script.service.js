const scriptModel = require('../../../models/script.model')
const { DELETED_STATUS } = require('../../../../config/key')
const { searchHelper } = require('../../../helpers/searchHelper')
const { facetHelper } = require('../../../helpers/paginationHelper')

exports.listService = async(data) => {
    try {
        let pipeline = []

        if (data.segment) {
            pipeline.push(
                {
                    $match: {
                        e: data.segment
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
            let fieldsArray = ['id', 'e']
            pipeline.push(searchHelper(data.search, fieldsArray))
        }

        pipeline.push({ $sort: obj }, facetHelper(Number(data.skip), Number(data.limit)))

        const result = await scriptModel.aggregate(pipeline);

        return result
    } catch (e) {
        return false
    }
}