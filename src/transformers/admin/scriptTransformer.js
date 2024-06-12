exports.transform = (data) => {
    return {
        scriptId: data?._id ? data._id : "",
        scriptName: data?.id ? data.id : "",
        segmentName: data?.e ? data.e : ""
    };
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
