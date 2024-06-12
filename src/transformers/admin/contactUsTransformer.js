const Helper = require("../../helpers/Helper");

exports.transform = async (data) => {
    return {
        contactId: data?._id ? data._id : "",
        image: await Helper.getDefaultImageUrl(),
        firstName: data?.firstName ? data.firstName : "",
        lastName: data?.lastName ? data.lastName : "",
        email: data?.email ? data.email : "",
        phone: data?.phone ? data.phone : "",
        date: data?.date ? data.date : 0,
        status: data?.status ? data.status : 0
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

exports.transformView = (data) => {
    return {
        contactId: data._id ? data._id : "",
        firstName: data.firstName ? data.firstName : "",
        lastName: data.lastName ? data.lastName : "",
        email: data.email ? data.email : "",
        phone: data.phone ? data.phone : "",
        date: data.updatedAt ? data.updatedAt.getTime() : 0,
        message: data.message ? data.message : "",
        status: data?.status ? data.status : 0
    };
};

exports.transformViewCollection = async(arrayData) => {
    let data = null;
    if (arrayData) {
        data = this.transformView(arrayData);
    }
    return data;
};
