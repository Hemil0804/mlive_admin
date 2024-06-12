const express = require("express");
const router = express.Router();
const subAdminController = require("../../controllers/admin/subAdmin.controller");
const { verifyAdminAuthToken } = require("../../middleware/verifyToken");

router.post("/add-edit", verifyAdminAuthToken,  subAdminController.addEdit);
router.post("/list", verifyAdminAuthToken, subAdminController.list);
router.post("/delete", verifyAdminAuthToken, subAdminController.delete);
router.post("/view", verifyAdminAuthToken, subAdminController.view);
router.post("/change-password", verifyAdminAuthToken, subAdminController.changePassword);

module.exports = router;
