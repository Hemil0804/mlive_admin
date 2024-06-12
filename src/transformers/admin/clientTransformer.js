exports.transform = (data) => {
    return {
        clientId: data?._id ? data._id : "",
        firstName: data?.firstName ? data.firstName : "",
        lastName: data?.lastName ? data.lastName : "",
        phoneNo: data?.phoneNo ? data.phoneNo : "",
        email: data?.email ? data.email : "",
        userCount: data?.userCount ? data.userCount : "",
        totalCount: data?.totalCount ? data.totalCount : 0,
        activeCount: data?.activeCount ? data.activeCount : 0,
        inactiveCount: data?.inactiveCount ? data.inactiveCount : 0,
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
