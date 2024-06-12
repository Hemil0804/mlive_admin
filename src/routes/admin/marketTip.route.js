const express = require("express");
const router = express.Router();
const marketTipController = require("../../controllers/admin/marketTip.controller");
const { verifyAdminAuthToken } = require("../../middleware/verifyToken");

router.post("/list", verifyAdminAuthToken, marketTipController.list);
router.post("/add-edit", verifyAdminAuthToken, marketTipController.addEdit);
router.post("/delete", verifyAdminAuthToken, marketTipController.delete);
router.post("/view", verifyAdminAuthToken, marketTipController.view);

module.exports = router;