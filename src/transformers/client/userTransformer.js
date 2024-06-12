exports.transform = async (data) => {
    return {
        userId: data?._id ? data._id : '',
        firstName: data?.firstName ? data.firstName : '',
        lastName: data?.lastName ? data.lastName : '',
        userName: data?.userName ? data.userName : '',
        email: data?.email ? data.email : '',
        phoneNo: data?.phoneNo ? data.phoneNo.toString() : "",
        segmentData: data?.segmentData?.length > 0 ? this.transformSegmentCollection(data.segmentData) : [],
        city: data?.city ? data.city : "",
        subscriptionType: data?.subscriptionType ? data.subscriptionType : "",
        subscriptionStartDate: data?.subscriptionStartDate ? data.subscriptionStartDate.getTime() : 0,
        subscriptionEndDate: data?.subscriptionEndDate ? data.subscriptionEndDate.getTime() : 0,
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

exports.transformListCollection = async (arrayData) => {
    let data = [];
    if (arrayData && arrayData.length > 0) {
        for (let a of arrayData) {
            data.push(await this.transform(a));
        }
    }
    arrayData = data;
    return arrayData;
};

const segmentTransform = (data) => {
    return {
        _id: data?._id ? data._id : "",
        segmentName: data?.segmentName ? data.segmentName : ""
    };
};

exports.transformSegmentCollection = (arrayData) => {
    let data = [];
    if (arrayData && arrayData.length > 0) {
        for (let a of arrayData) {
            data.push(segmentTransform(a));
        }
    }
    arrayData = data;
    return arrayData;
};