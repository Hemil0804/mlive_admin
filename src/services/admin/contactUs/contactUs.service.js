const { DELETED_STATUS, } = require("../../../../config/key");
const {facetHelper} = require("../../../helpers/paginationHelper");
const {searchHelper} = require("../../../helpers/searchHelper");
const contactUsModel = require("../../../models/contactUs.model");
const ObjectId = require("mongodb").ObjectId;

exports.listContact = async (data) => {
    try {
        let pipeline = [];

        pipeline.push(
            {
                $match: {
                    status: {$ne: DELETED_STATUS}
                }
            },
            {
                $set: {
                    createdAt: {
                        $toLong: "$createdAt"
                    }
                }
            },
            {
                $addFields: {
                    userName: {$concat:["$firstName", " ", "$lastName"]},
                    date: "$createdAt"
                }
            }
        );

        if(data.startDate){
            pipeline.push(
                {
                    $match: {
                        createdAt: {$gte: data.startDate}
                    }
                }
            )
        }
        if(data.endDate){
            pipeline.push(
                {
                    $match: {
                        createdAt: {$lte: data.endDate}
                    }
                }
            )
        }

        let obj = {};
        sortBy = data.sortBy ? data.sortBy : -1;
        sortBy = parseInt(sortBy);
        let sortKey = data.sortKey ? data.sortKey : "updatedAt";
        obj[sortKey] = sortBy;

        if (data.searchKey) {
            let fieldsArray = ["firstName", "lastName", "email", "userName","phone"];
            pipeline.push(searchHelper(data.searchKey, fieldsArray));
        }

        pipeline.push({$sort: obj}, facetHelper(Number(data.skip), Number(data.limit)))

        const result = await contactUsModel.aggregate(pipeline);

        return result;
    } catch (e) {
        return false;
    }
};
