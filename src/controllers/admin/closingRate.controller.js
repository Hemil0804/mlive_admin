const closingRateModel = require("../../models/closingRate.model");
const {
    SERVERERROR,
    SUCCESS,
    FAILURE,
    ACTIVE_STATUS,
    DELETED_STATUS,
    META_STATUS_1,
    META_STATUS_0,
} = require("../../../config/key");
const closingRateValidation = require("../../services/admin/validation/closingRateValidation");
const responseHelper = require("../../helpers/responseHelper");
const closingRateTransformer = require("../../transformers/admin/closingRateTransformer");
const logger = require("../../helpers/loggerService");
const path = require("path");
const XLSX = require("xlsx")
const moment = require("moment-timezone")

exports.importScript = async (req, res) => {
    try {
        let fileName = req.file.originalname.split(".", 1)[0]

        let filePath = path.resolve(__dirname, `../../../public/uploads/admin/closingRate/${req.file.filename}`);
        const workbook = XLSX.readFile(filePath);

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        const options = {
            dateNF: 'dd-mm-yyyy',
            raw: false
        };
        let data = XLSX.utils.sheet_to_json(worksheet, options);

        data = data.reduce((acc, data) => {
            const symbol = data.SYMBOL || data.Symbol;
            let closingPrice = data.CLOSE || data["Closing Price"] || data["Close"];
            const expiryDate = data["Expiry Date"] || data.EXPIRY_DT;

            (acc[symbol] = acc[symbol] || []).push({close: closingPrice.trim(), expiryDate: moment(expiryDate).format("DD/MM/YYYY")});
            return acc;
        }, {});

        let dataFound = await closingRateModel.findOne();
        if (dataFound) {
            dataFound.data[fileName] = data

            dataFound.importDate[fileName] = moment().tz("Asia/Kolkata").format("ddd MMM DD HH:mm:ss z YYYY")

            await closingRateModel.updateOne({}, dataFound);
        }

        return responseHelper.successapi(res, res.__("dataImportedSuccessfully"), META_STATUS_1, SUCCESS);
    } catch (e) {
        logger.logger.error(`Error from catch: ${e}`);
        return responseHelper.error(res, res.__("SomethingWentWrongPleaseTryAgain"), SERVERERROR);
    }
};

exports.list = async (req, res) => {
    try {
        let arr = []
        let date;
        let reqParam = req.body;
        let limit = reqParam?.limit ? reqParam.limit : 10
        let page = reqParam?.page ? reqParam.page : 1
        let sortBy = reqParam.sortBy ? reqParam.sortBy : -1
        let importDate = []

        let closingRateData= await closingRateModel.findOne();
        let closingData = closingRateData.data
        for (let a in closingRateData.importDate) {
            closingRateData.importDate[a] = moment(closingRateData.importDate[a], 'ddd MMM DD HH:mm:ss z YYYY').tz("Asia/Kolkata").format("DD-MM-YYYY hh:mm:ss A")
            importDate.push({name: a, date: closingRateData.importDate[a]})
        }


        let getData = (obj, objName = '') => {
            for (let a in obj) {
                if (!objName && closingRateData?.importDate[a]) {
                    date = closingRateData.importDate[a]
                }

                if (obj.hasOwnProperty(a)) {
                    if (Array.isArray(obj[a])) {
                        obj[a].forEach(item => {
                            if (typeof item === 'object') {
                                let data = {...item}
                                arr.push({
                                    segment: objName,
                                    symbol: a,
                                    expiryDate: data.expiryDate.replaceAll("/", "-"),
                                    closingRate: data.close.replace(',', ''),
                                    updatedAt: date
                                })
                            }
                        });
                    } else if (typeof obj[a] === 'object' && obj[a] !== null) {
                        getData(obj[a], a);
                    }
                }
            }
        }
        getData(closingData)

        if (reqParam.search) {
            arr = arr.filter(a => (a.segment.toLowerCase().includes(reqParam.search.toLowerCase()) || a.symbol.toLowerCase().includes(reqParam.search.toLowerCase()) || a.closingRate.toLowerCase().includes(reqParam.search.toLowerCase())))
        }

        let totalCount = arr.length

        arr.sort((a, b) => {
            if (reqParam.sortKey === "updatedAt" || reqParam.sortKey === "expiryDate" || reqParam.sortKey === "closingRate") {
                let value1 , value2
                if (reqParam.sortKey === "expiryDate") {
                    value1 = moment(a[reqParam.sortKey], "DD/MM/YYYY").format("YYYYMMDD")
                    value2 = moment(b[reqParam.sortKey], "DD/MM/YYYY").format("YYYYMMDD")
                } else if (reqParam.sortKey === "updatedAt") {
                    value1 = new Date(moment(moment(a[reqParam.sortKey], 'DD-MM-YYYY hh:mm:ss A').tz("Asia/Kolkata"))).getTime()
                    value2 = new Date(moment(moment(b[reqParam.sortKey], 'DD-MM-YYYY hh:mm:ss A').tz("Asia/Kolkata"))).getTime()
                } else if (reqParam.sortKey === "closingRate") {
                    value1 = parseFloat(a[reqParam.sortKey])
                    value2 = parseFloat(b[reqParam.sortKey])
                }

                if (reqParam.sortBy === 1) return value1 - value2
                else return value2 - value1
            } else {
                if (a[reqParam.sortKey] < (b[reqParam.sortKey])) return sortBy
                if (a[reqParam.sortKey] > (b[reqParam.sortKey])) return sortBy
            }

            return 0
        })

        arr = arr.slice((page - 1) * limit, page * limit)

        let responseData = await closingRateTransformer.transformListCollection(arr);

        let responseMeta = {
            totalCount: totalCount, importDate
        }

        return responseHelper.successapi(res, res.__("marketTipListFoundSuccessfully"), META_STATUS_1, SUCCESS, responseData, responseMeta);
    } catch (e) {
        logger.logger.error(`Error from catch: ${e}`);
        return responseHelper.error(res, res.__("SomethingWentWrongPleaseTryAgain"), SERVERERROR);
    }
}

exports.delete = async (req, res) => {
    try {
        let reqParam = req.body;

        let validationMessage = await closingRateValidation.deleteClosingRateValidation(reqParam);
        if (validationMessage) return responseHelper.error(res, res.__(validationMessage), FAILURE);

        let closingRateFound = await closingRateModel.findOne();
        if (reqParam?.segment?.length > 0) {
            for (let a of reqParam.segment) {
                if (closingRateFound && closingRateFound?.data[a]) delete closingRateFound.data[a]
                if (closingRateFound && closingRateFound?.importDate[a]) delete closingRateFound.importDate[a]
            }

            await closingRateModel.findOneAndUpdate({}, {$set: {data: closingRateFound.data, importDate: closingRateFound.importDate}})
        } else return responseHelper.successapi(res, res.__("pleaseSelectAtLeastOneSegment"), META_STATUS_0, SUCCESS);

        return responseHelper.successapi(res, res.__("dataDeletedSuccessfully"), META_STATUS_1, SUCCESS)
    } catch (e) {
        logger.logger.error(`Error from catch: ${e}`);
        return responseHelper.error(res, res.__("SomethingWentWrongPleaseTryAgain"), SERVERERROR);
    }
}

exports.segmentList = async (req, res) => {
    try {
        let response = [];

        let closingRateFound = await closingRateModel.findOne();
        if (closingRateFound) {
            let segmentName = Object.keys(closingRateFound.data)

            segmentName.forEach(a => response.push({name: a}))
        } else return responseHelper.successapi(res, res.__("dataNotFound"), META_STATUS_0, SUCCESS)

        return responseHelper.successapi(res, res.__("segmentListFoundSuccessfully"), META_STATUS_1, SUCCESS, response)
    } catch (e) {
        logger.logger.error(`Error from catch: ${e}`);
        return responseHelper.error(res, res.__("SomethingWentWrongPleaseTryAgain"), SERVERERROR);
    }
}

exports.deleteSingleRecord = async (req, res) => {
    try {
        let reqParam = req.body

        let validationMessage = await closingRateValidation.deleteSingleRecordValidation(reqParam);
        if (validationMessage) return responseHelper.error(res, res.__(validationMessage), FAILURE);

        let closingRateFound = await closingRateModel.findOne();
        if (closingRateFound && closingRateFound?.data[reqParam.segment]) {
            let data = closingRateFound.data[reqParam.segment][reqParam.symbol]
            if (data && data?.length > 0) {
                data = data.filter(a => a.expiryDate !== reqParam.expiryDate.replaceAll('-', '/'))
                closingRateFound.data[reqParam.segment][reqParam.symbol] = data

                await closingRateModel.findOneAndUpdate({}, {$set: {data: closingRateFound.data}})
            } else return responseHelper.successapi(res, res.__("dataNotFound"), META_STATUS_0, SUCCESS);
        } else return responseHelper.successapi(res, res.__("dataNotFound"), META_STATUS_0, SUCCESS);

        return responseHelper.successapi(res, res.__("dataDeletedSuccessfully"), META_STATUS_1, SUCCESS)
    } catch (e) {
        logger.logger.error(`Error from catch: ${e}`);
        return responseHelper.error(res, res.__("SomethingWentWrongPleaseTryAgain"), SERVERERROR);
    }
}