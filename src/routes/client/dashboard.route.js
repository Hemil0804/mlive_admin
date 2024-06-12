const express = require("express");
const router = express.Router();
const dashboardController = require("../../controllers/client/dashboard.controller");
const { verifyClientAuthToken } = require("../../middleware/verifyToken");

router.post("/statistics", verifyClientAuthToken,  dashboardController.dashboard);

module.exports = router;