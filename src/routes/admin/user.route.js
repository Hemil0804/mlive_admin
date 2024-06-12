const express = require("express");
const router = express.Router();
const userController = require("../../controllers/admin/user.controller");
const { verifyAdminAuthToken } = require("../../middleware/verifyToken");

router.post("/list", verifyAdminAuthToken, userController.list);

module.exports = router;