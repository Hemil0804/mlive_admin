const express = require("express");
const router = express.Router();
const alertController = require("../../controllers/admin/alert.controller");
const { verifyAdminAuthToken, verifyAuthToken } = require("../../middleware/verifyToken");

router.post("/list", verifyAdminAuthToken, alertController.list);
module.exports = router;
