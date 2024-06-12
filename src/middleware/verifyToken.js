const jwt = require("jsonwebtoken");
const UserModel = require("../models/user.model");
const AdminModel = require("../models/admin.model");
const ClientModel = require("../models/client.model");
const responseHelper = require("../helpers/responseHelper");
const {JWT_AUTH_TOKEN_SECRET} = require("../../config/key");
const {UNAUTHORIZED, SERVER_ERR, ACTIVE_STATUS, DELETED_STATUS, SUPER_ADMIN, SUB_ADMIN, CLIENT} = require("../../config/key");
const jwtTokenModel = require("../models/jwtToken.model");

exports.verifyAuthToken = async (req, res, next) => {
    try {
        let userDetails;

        if (!req.header("Authorization")) return responseHelper.error(res, res.__("TokenNotFound"), UNAUTHORIZED);
        const token = req.header("Authorization").replace("Bearer ", "");

        let checkToken = await jwtTokenModel.findOne({token: token, userType: {$in: [SUPER_ADMIN, SUB_ADMIN, CLIENT]}});
        if (!checkToken) return responseHelper.error(res, res.__("InvalidToken"), UNAUTHORIZED);

        const decoded = await jwt.verify(token, JWT_AUTH_TOKEN_SECRET);
        if (!decoded) return responseHelper.error(res, res.__("TokenExpired"), UNAUTHORIZED);

        if (checkToken.userType === CLIENT) userDetails = await ClientModel.findOne({_id: decoded.tokenObject._id});
        else userDetails = await AdminModel.findOne({_id: decoded.tokenObject._id});
        if (userDetails === null || userDetails === undefined) return responseHelper.error(res, res.__("TokenExpired"), UNAUTHORIZED);

        if (userDetails.status === ACTIVE_STATUS) {
            req.user = userDetails;
            req.token = token;

            next();
        } else {
            return responseHelper.error(res, res.__("UnauthorizedContent"), UNAUTHORIZED);
        }
    } catch (e) {
        if (e.message === 'jwt malformed') return responseHelper.error(res, res.__('UnauthorizedContent'), UNAUTHORIZED, e);

        return responseHelper.error(res, res.__('TokenExpired'), UNAUTHORIZED, e);
    }
};

exports.verifyAuthTokenForUnVerified = async (req, res, next) => {

    console.log('req.originalUrl---', req.originalUrl)
    if (req.body.isGuest === true) {
        req.isGuest = true;
        next();
    } else {
        if (!req.header("Authorization")) return responseHelper.error(res, res.__("TokenNotFound"), UNAUTHORIZED);
        const token = req.header("Authorization").replace("Bearer ", "");
        let checkToken = await jwtTokenModel.findOne({token: token, userType: 1});
        if (checkToken) return responseHelper.error(res, res.__("InvalidToken"), UNAUTHORIZED);

        jwt.verify(token, JWT_AUTH_TOKEN_SECRET, (err, decoded) => {
            if (err)
                return responseHelper.error(res, res.__("InvalidToken"), UNAUTHORIZED);

            if (!decoded) return responseHelper.error(res, res.__("TokenExpired"), UNAUTHORIZED);

            UserModel.findOne({
                    _id: decoded.tokenObject._id,
                    status: {$ne: DELETED_STATUS},
                },
                (err, user) => {
                    if (err)
                        return responseHelper.error(res, res.__("UnauthorizedContent"), err);

                    if (user === null || user === undefined)
                        return responseHelper.error(res, res.__("TokenExpired"), UNAUTHORIZED);

                    if (user.status === ACTIVE_STATUS) {
                        req.user = user;
                        req.token = token;
                        next();
                    } else {
                        return responseHelper.error(res, res.__("UnauthorizedContent"), UNAUTHORIZED);
                    }
                });
        })
    }
};

exports.verifyResetToken = (req, res, next) => {
    const resetToken = req.params.token;
    if (!resetToken) {
        return responseHelper.error(res, res.__("InvalidToken"), UNAUTHORIZED);
    } else {
        jwt.verify(resetToken, JWT_AUTH_TOKEN_SECRET, async (err, decoded) => {
            if (decoded) {
                const foundUser = await UserModel.findOne({
                    _id: decoded._id,
                    resetToken: resetToken,
                });
                if (foundUser === null || foundUser === undefined) {
                    return responseHelper.error(res, res.__("TokenExpired"), UNAUTHORIZED);
                }

                if (foundUser.status === ACTIVE_STATUS) {
                    req.user = foundUser;
                    req.token = resetToken;
                    next();
                } else {
                    return responseHelper.error(res, res.__("UnauthorizedContent"), UNAUTHORIZED);
                }
            } else {
                return responseHelper.error(res, res.__("TokenExpired"), UNAUTHORIZED);
            }
        });
    }
};

exports.adminVerifyResetToken = (req, res, next) => {
    const resetToken = req.params.token;
    if (!resetToken) {
        return responseHelper.error(res, res.__("InvalidToken"), UNAUTHORIZED);
    } else {
        jwt.verify(resetToken, JWT_AUTH_TOKEN_SECRET, async (err, decoded) => {
            if (decoded) {
                const foundAdmin = await AdminModel.findOne({
                    _id: decoded._id,
                    resetToken: resetToken,
                });
                if (foundAdmin === null || foundAdmin === undefined) {
                    return responseHelper.error(res, res.__("TokenExpired"), UNAUTHORIZED);
                } else {
                    if (foundAdmin.status === ACTIVE_STATUS) {
                        req.admin = foundAdmin;
                        req.token = resetToken;
                        next();
                    } else {
                        return responseHelper.error(res, res.__("UnauthorizedContent"), UNAUTHORIZED);
                    }
                }
            } else {
                return responseHelper.error(res, res.__("TokenExpired"), UNAUTHORIZED);
            }
        });
    }
};

exports.verifyAdminAuthToken = async (req, res, next) => {
    if (!req.header("Authorization")) return responseHelper.error(res, res.__("TokenNotFound"), UNAUTHORIZED);
    const token = req.header("Authorization").replace("Bearer ", "");

    let checkToken = await jwtTokenModel.findOne({token: token, userType: {$in: [SUPER_ADMIN, SUB_ADMIN]}});
    if (!checkToken) return responseHelper.error(res, res.__("InvalidToken"), UNAUTHORIZED);

    jwt.verify(token, JWT_AUTH_TOKEN_SECRET, async (err, decoded) => {
        if (err) return responseHelper.error(res, res.__("InvalidToken"), UNAUTHORIZED);

        if (!decoded) return responseHelper.error(res, res.__("TokenExpired"), UNAUTHORIZED);

        AdminModel.findOne({
                _id: decoded.tokenObject._id,
                status: {$ne: DELETED_STATUS},
            },
            (err, admin) => {
                if (err)
                    return responseHelper.error(res, res.__("UnauthorizedContent"), err);

                if (admin === null || admin === undefined)
                    return responseHelper.error(res, res.__("TokenExpired"), UNAUTHORIZED);

                if (admin.status === ACTIVE_STATUS) {
                    req.admin = admin;
                    req.token = token;
                    if (admin.userType !== 1) {
                        let url = req.baseUrl + req.path;
                        url = url.split("/");
                        let module = url[url.length - 2];
                        if (module === "sub-admin") return responseHelper.error(res, res.__("UnauthorizedContent"), UNAUTHORIZED);
                    }
                    next();
                } else {
                    return responseHelper.error(res, res.__("UnauthorizedContent"), UNAUTHORIZED);
                }
            });
    })
};

exports.verifyClientAuthToken = async (req, res, next) => {
    if (!req.header("Authorization")) return responseHelper.error(res, res.__("TokenNotFound"), UNAUTHORIZED);
    const token = req.header("Authorization").replace("Bearer ", "");

    let checkToken = await jwtTokenModel.findOne({token: token, userType: CLIENT});
    if (!checkToken) return responseHelper.error(res, res.__("InvalidToken"), UNAUTHORIZED);

    jwt.verify(token, JWT_AUTH_TOKEN_SECRET, async (err, decoded) => {
        if (err)
            return responseHelper.error(res, res.__("InvalidToken"), UNAUTHORIZED);

        if (!decoded) return responseHelper.error(res, res.__("TokenExpired"), UNAUTHORIZED);

        ClientModel.findOne({
                _id: decoded.tokenObject._id,
                status: {$ne: DELETED_STATUS},
            },
            (err, client) => {
                if (err)
                    return responseHelper.error(res, res.__("UnauthorizedContent"), err);

                if (client === null || client === undefined)
                    return responseHelper.error(res, res.__("TokenExpired"), UNAUTHORIZED);

                if (client.status === ACTIVE_STATUS) {
                    req.client = client;
                    req.token = token;
                    next();
                } else {
                    return responseHelper.error(res, res.__("UnauthorizedContent"), UNAUTHORIZED);
                }
            });
    })
};

exports.clientVerifyResetToken = (req, res, next) => {
    const resetToken = req.params.token;
    if (!resetToken) {
        return responseHelper.error(res, res.__("InvalidToken"), UNAUTHORIZED);
    } else {
        jwt.verify(resetToken, JWT_AUTH_TOKEN_SECRET, async (err, decoded) => {
            if (decoded) {
                const foundClient = await ClientModel.findOne({
                    _id: decoded._id,
                    resetToken: resetToken,
                });
                if (foundClient === null || foundClient === undefined) {
                    return responseHelper.error(res, res.__("TokenExpired"), UNAUTHORIZED);
                } else {
                    if (foundClient.status === ACTIVE_STATUS) {
                        req.client = foundClient;
                        req.token = resetToken;
                        next();
                    } else {
                        return responseHelper.error(res, res.__("UnauthorizedContent"), UNAUTHORIZED);
                    }
                }
            } else {
                return responseHelper.error(res, res.__("TokenExpired"), UNAUTHORIZED);
            }
        });
    }
};