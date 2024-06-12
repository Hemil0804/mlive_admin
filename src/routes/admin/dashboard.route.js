const express = require("express");
const router = express.Router();
const dashboardController = require("../../controllers/admin/dashboard.controller");
const { verifyAdminAuthToken } = require("../../middleware/verifyToken");

router.post("/statistics", verifyAdminAuthToken,  dashboardController.dashboard);

module.exports = router;