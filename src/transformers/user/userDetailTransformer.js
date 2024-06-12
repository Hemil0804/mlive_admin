const Helper = require("../../helpers/Helper");

exports.transformUser = async (data) => {
    return {
        userId: data?._id ? data._id : '',
        profilePic: data?.profilePic ? await Helper.getUrl(data.profilePic, 'user/profilePic') : await Helper.defaultUserImageUrl(),
        firstName: data?.firstName ? data.firstName : '',
        lastName: data?.lastName ? data.lastName : '',
        email: data?.email ? data.email : '',
        phone: data?.phone ? data.phone : 0,
        countryCode: data?.countryCode ? data.countryCode : 0,
        city: data?.city ? data.city : '',
        status: data?.status ? data.status : 0,
        isEmailVerified: data?.isEmailVerified ? data.isEmailVerified : 0,
        isPhoneVerified: data?.isPhoneVerified ? data.isPhoneVerified : 0
    }
}

exports.transformUserDetails = async (arrayData) => {
    let userData = null

    if (arrayData) {
        userData = await this.transformUser(arrayData)
    }
    return userData
}






