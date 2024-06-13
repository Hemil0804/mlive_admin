exports.transform = (data) => {
    return {
        scriptId: data?.scriptId ? data.scriptId : "",
        userId: data?.userId ? data.userId : "",
        status: data?.status ? data.status : "",
        direction: data?.direction ? data.direction : "",
        value: data?.value ? data.value : "",
        type: data?.type ? data.type : "",
        createdAt: data?.createdAt ? data.createdAt : "",
        updatedAt: data?.updatedAt ? data.updatedAt : ""
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
