const multer = require("multer");
require("dotenv").config();
const path = require("path");
const fs = require("fs-extra");
const {SERVERERROR, FAILURE, APP_URL} = require("../../config/key");
const responseHelper = require("../helpers/responseHelper");

var imgPath = path.join(__dirname, "../../public/uploads/user");
let filePath;

var storage = multer.diskStorage({
    destination: function (req, file, cb) {

        if (file.fieldname == 'profilePic') {
            imgPath = path.join(__dirname, "../../public/uploads/admin");
        }

        if (file.fieldname == 'closingRateFile') {
            imgPath = path.join(__dirname, "../../public/uploads/admin/closingRate");
        }

        if (file.fieldname == 'profileImage') {
            imgPath = path.join(__dirname, "../../public/uploads/client");
        }

        if (!fs.existsSync(imgPath)) {
            // eslint-disable-next-line handle-callback-err
            fs.mkdirSync(imgPath, {recursive: true}, (err) => {
            });
        }
        cb(null, imgPath);
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
    },
});

module.exports.uploadImage = multer({
    storage: storage,
    limits: {
        fileSize: 60 * 1024 * 1024,
    },
    fileFilter(req, file, cb) {
        if (file.fieldname == 'eventPdf') {
            if (!file.originalname.match(/\.(pdf)$/)) {
                return cb(new Error("Please upload an pdf!"), false);
            }
        } else if (file.fieldname == 'closingRateFile') {
            if (!file.originalname.match(/\.(xls|XLS|xlsx|XLSX)$/)) {
                return cb(new Error("Please upload an file!"), false);
            }
        } else {
            if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|MOV|mov|mp4|MP4|mpeg|MPEG|webm|WEBM|svg+xml|svg)$/)) {
                return cb(new Error("Please upload an image!"), false);
            }
        }
        cb(undefined, true);
    },
});


let fileStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.fieldname === 'importfile') {
            filePath = path.join(__dirname, "../../public/uploads/");
        }
        if (!fs.existsSync(filePath)) {
            fs.mkdirSync(filePath, {recursive: true}, (err) => {
            });
        }
        cb(null, filePath);
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
    },
});

module.exports.uploadFile = multer({
    storage: fileStorage,
    limits: {
        fileSize: 1024 * 1024 * 1024,
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(xls|xlsx|XLSX)$/)) {
            return cb(new Error("Upload proper file!"), false);
        }

        cb(undefined, true);
    },
});

module.exports.validMulterUploadMiddleware = (multerUploadFunction) => {
    return (req, res, next) =>
        multerUploadFunction(req, res, (err) => {
            // handle Multer error

            if (err && err.name && err.name === "MulterError") {
                return responseHelper.error(res, res.__("SomethingWentWrongPleaseTryAgain"), SERVERERROR);
            }

            if (err) {
                // handle other errors
                return responseHelper.error(res, res.__("UploadValidImage"), FAILURE);
            }
            next();
        });
};
