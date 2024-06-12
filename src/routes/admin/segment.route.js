const express = require("express");
const router = express.Router();
const segmentController = require("../../controllers/admin/segment.controller");
const { verifyAdminAuthToken } = require("../../middleware/verifyToken");

router.post("/list", verifyAdminAuthToken, segmentController.list);
router.post("/add-edit", verifyAdminAuthToken, segmentController.addEdit);
router.post("/delete", verifyAdminAuthToken, segmentController.delete);

module.exports = router;