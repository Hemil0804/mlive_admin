const UserModel = require("../../models/user.model");
let ObjectId = require("mongodb").ObjectId;

exports.userAuthService = async(data) => {
    try {
        let pipeline = [];
        pipeline.push({
            $match: {
                _id: ObjectId(data.userId)
            }
        });

        const result = await UserModel.aggregate(pipeline);

        return result;
    } catch (e) {
        return false;
    }
}
