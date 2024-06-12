const express = require("express");
const router = express.Router();
const clientController = require("../../controllers/admin/client.controller");
const { verifyAdminAuthToken, verifyAuthToken } = require("../../middleware/verifyToken");

router.post("/add-edit", verifyAdminAuthToken,  clientController.addEdit);
router.post("/list", verifyAdminAuthToken, clientController.list);
router.post("/view", verifyAdminAuthToken, clientController.view);
router.post("/delete", verifyAdminAuthToken, clientController.delete);
router.post("/change-password", verifyAdminAuthToken, clientController.changePassword);

module.exports = router;
