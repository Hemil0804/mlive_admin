module.exports.facetHelper = function (skip, limit) {
    return 	{
        $facet: {
            data: [
                {
                    $skip: Number(skip) < 0 ? 0 : Number(skip) || 0,
                },
                {
                    $limit: Number(limit) < 0 ? 10 : Number(limit) || 10,
                }
            ],
            totalRecords: [
                {
                    $count: "count",
                },
            ],
        }
    }
};

module.exports.countHelper = function () {
    return {
        $project: {
            data: 1,
            totalCount: { $arrayElemAt: ["$totalRecords.count", 0] },
        },
    };
};

module.exports.sortHelper = function (data,defaultColumn="rank",defaultSort=1) {
    let sortBy = {};
    let column = !data.column ? defaultColumn : data.column
    if (column === "fullPrice") {
        column = "price";
    }
    let sort = !data.sort ? defaultSort : data.sort
    sortBy["fieldType"] = 1;
    sortBy[column] = sort;
    return sortBy
};
