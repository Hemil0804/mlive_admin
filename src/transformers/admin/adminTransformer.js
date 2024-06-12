const Helper = require("../../helpers/Helper");
exports.transform = async (data) => {
    return {
        adminId: data?._id ? data._id : "",
        firstName: data?.firstName ? data.firstName : "",
        lastName: data?.lastName ? data.lastName : "",
        profilePic: data ?.profilePic ? await Helper.getUrl(data.profilePic, 'admin')  : await Helper.defaultImageUrl(),
        email: data?.email ? data.email : "",
        phone: data?.phone ? data.phone : 0,
        userType: data?.userType ? data.userType : 0,
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


