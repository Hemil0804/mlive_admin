const Helper = require("../../helpers/Helper");
exports.transform = async (data) => {
    return {
        clientId: data?._id ? data._id : "",
        firstName: data?.firstName ? data.firstName : "",
        lastName: data?.lastName ? data.lastName : "",
        profileImage: data ?.profileImage ? await Helper.getUrl(data.profileImage, 'client')  : await Helper.getDefaultUserImageUrl(),
        email: data?.email ? data.email : "",
        phoneNo: data?.phoneNo ? data.phoneNo : 0,
        status: data?.status ? data.status : 0
    }
}

exports.transformListCollection =  async(arrayData)   => {
    let data = null;
    if (arrayData) {
        data = await this.transform(arrayData);
    }
    return data;
};


