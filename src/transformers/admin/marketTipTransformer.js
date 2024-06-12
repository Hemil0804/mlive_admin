exports.transform = (data) => {
    return {
        marketTipId: data?._id ? data._id : "",
        title: data?.title ? data.title : "",
        description: data?.description ? data.description : "",
        slug: data?.slug ? data.slug : "",
        createdAt: data?.createdAt ? data.createdAt.getTime() : 0,
        status: data?.status ? data.status : 0
    };
};

exports.transformViewCollection = (arrayData) => {
    let data = null;
    if (arrayData) {
        data = this.transform(arrayData);
    }
    arrayData = data;
    return arrayData;
};

exports.transformListCollection = (arrayData) => {
    let data = [];
    if (arrayData && arrayData.length > 0) {
        arrayData.forEach((a) => {
            data.push(this.transform(a));
        });
    }
    arrayData = data;
    return arrayData;
};
