const express = require("express");
const router = express.Router();
const scriptController = require("../../controllers/admin/script.controller");
const { verifyAdminAuthToken } = require("../../middleware/verifyToken");

router.post("/list", verifyAdminAuthToken, scriptController.list);
router.post("/delete", verifyAdminAuthToken, scriptController.delete);
router.post("/refresh", verifyAdminAuthToken, scriptController.refresh);

module.exports = router;