exports.transform = (data) => {
    return {
        segment: data?.segment ? data.segment : "",
        symbol: data?.symbol ? data.symbol : "",
        expiryDate: data?.expiryDate ? data.expiryDate : "",
        closingRate: data?.closingRate ? data.closingRate.toString() : "",
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
