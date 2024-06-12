exports.transform = (data) => {
    return {
        subAdminId: data?._id ? data._id : "",
        firstName: data?.firstName ? data.firstName : "",
        lastName: data?.lastName ? data.lastName : "",
        phone: data?.phone ? data.phone.toString() : "",
        email: data?.email ? data.email : "",
        userType: data?.userType ? data.userType : 0,
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
