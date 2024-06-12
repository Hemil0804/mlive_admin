exports.transform = (data) => {
    return {
        segmentId: data?._id ? data._id : "",
        segmentName: data?.segmentName ? data.segmentName : "",
        slug: data?.slug ? data.slug : "",
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

exports.transformList = (data) => {
    return {
        segmentId: data?._id ? data._id : "",
        segmentName: data?.segmentName ? data.segmentName : "",
        slug: data?.slug ? data.slug : ""
    };
};

exports.transformListCollection = (arrayData) => {
    let data = [];
    if (arrayData && arrayData.length > 0) {
        arrayData.forEach((a) => {
            data.push(this.transformList(a));
        });
    }
    arrayData = data;
    return arrayData;
};
