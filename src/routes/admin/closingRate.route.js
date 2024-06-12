const express = require("express");
const router = express.Router();
const closingRateController = require("../../controllers/admin/closingRate.controller");
const { verifyAdminAuthToken } = require("../../middleware/verifyToken");
const { uploadImage, validMulterUploadMiddleware } = require("../../middleware/uploadImage");

router.post("/import-sheet", verifyAdminAuthToken, validMulterUploadMiddleware(uploadImage.single("closingRateFile")), closingRateController.importScript);
router.post("/list", verifyAdminAuthToken, closingRateController.list);
router.post("/delete", verifyAdminAuthToken, closingRateController.delete);
router.post("/segment-list", verifyAdminAuthToken, closingRateController.segmentList);
router.post("/single-delete", verifyAdminAuthToken, closingRateController.deleteSingleRecord);

module.exports = router;