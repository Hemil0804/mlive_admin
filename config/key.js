require("dotenv").config();

let key = (process.env.ENVIRONMENT).toUpperCase();

module.exports = {
    PORT: key == "PROD" ? process.env.PORT_PROD : key == "DEV" ? process.env.PORT_DEV : process.env.PORT_LOCAL,
    DB_AUTH_URL: key == "PROD" ? process.env.DB_AUTH_URL_PROD : key == "DEV" ? process.env.DB_AUTH_URL_DEV : process.env.DB_AUTH_URL_LOCAL,
    JWT_AUTH_TOKEN_SECRET: key == "PROD" ? process.env.JWT_AUTH_TOKEN_SECRET_PROD : key == "DEV" ? process.env.JWT_AUTH_TOKEN_SECRET_DEV : process.env.JWT_AUTH_TOKEN_SECRET_LOCAL,
    JWT_EXPIRES_IN: key == "PROD" ? process.env.JWT_EXPIRES_IN_PROD : key == "DEV" ? process.env.JWT_EXPIRES_IN_DEV : process.env.JWT_EXPIRES_IN_LOCAL,
    RESET_TOKEN_EXPIRES: key == "PROD" ? process.env.RESET_TOKEN_EXPIRES_PROD : key == "DEV" ? process.env.RESET_TOKEN_EXPIRES_DEV : process.env.RESET_TOKEN_EXPIRES_LOCAL,
    USER_FROM: key == "PROD" ? process.env.USER_FROM_PROD : key == "DEV" ? process.env.USER_FROM_DEV : process.env.USER_FROM_LOCAL,
    EMAIL_FROM: key == "PROD" ? process.env.EMAIL_FROM_PROD : key == "DEV" ? process.env.EMAIL_FROM_DEV : process.env.EMAIL_FROM_LOCAL,
    EMAIL_PASSWORD: key == "PROD" ? process.env.EMAIL_PASSWORD_PROD : key == "DEV" ? process.env.EMAIL_PASSWORD_DEV : process.env.EMAIL_PASSWORD_LOCAL,
    EMAIL_SERVICE: key == "PROD" ? process.env.EMAIL_SERVICE_PROD : key == "DEV" ? process.env.EMAIL_SERVICE_DEV : process.env.EMAIL_SERVICE_LOCAL,
    APP_WEB_LINK: key == "PROD" ? process.env.SITE_URL_PROD : key == "DEV" ? process.env.SITE_URL_DEV : process.env.SITE_URL_LOCAL,
    ADMIN_WEB_LINK: key == "PROD" ? process.env.ADMIN_WEB_LINK_PROD : key == "DEV" ? process.env.ADMIN_WEB_LINK_DEV : process.env.ADMIN_WEB_LINK_LOCAL,
    CLIENT_WEB_LINK: key == "PROD" ? process.env.CLIENT_WEB_LINK_PROD : key == "DEV" ? process.env.CLIENT_WEB_LINK_DEV : process.env.CLIENT_WEB_LINK_LOCAL,
    IMAGE_LINK: key == "PROD" ? process.env.IMAGE_LINK_PROD : key == "DEV" ? process.env.IMAGE_LINK_DEV : process.env.IMAGE_LINK_LOCAL,
    APP_URL: key == "PROD" ? process.env.PROJECT_URL_PROD : key == "DEV" ? process.env.PROJECT_URL_DEV : process.env.PROJECT_URL_LOCAL,
    PAGINATION_LIMIT: 10,
    SERVERERROR: 500,
    FAILURE: 400,
    UNAUTHORIZED: 401,
    SUCCESS: 200,
    MAINTANANCE: 503,
    ACTIVE_STATUS: 1,
    INACTIVE_STATUS: 2,
    DELETED_STATUS: 3,
    UNVERIFIED_STATUS: 4,
    META_STATUS_0: 0,
    META_STATUS_1: 1,
    OTP_TIMEOUT: 90,
    BUCKET_URL: process.env.BUCKET_URL ? process.env.BUCKET_URL : '',
    BUCKET_NAME: process.env.BUCKET_NAME ? process.env.BUCKET_NAME : '',
    SUPER_ADMIN: 1,
    SUB_ADMIN: 2,
    CLIENT: 3,
    IS_SSL: process.env.IS_SSL
}