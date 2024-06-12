const express = require("express");
const router = express.Router();
const userController = require("../../controllers/client/user.controller");
const { verifyClientAuthToken, verifyAuthToken } = require("../../middleware/verifyToken");

router.post("/list", verifyClientAuthToken, userController.list);
router.post("/add-edit", verifyAuthToken, userController.addEdit);
router.post("/view", verifyAuthToken, userController.view);
router.post("/delete", verifyAuthToken, userController.delete);
router.post("/segment-dropdown", verifyAuthToken, userController.segmentListDropdown);
router.post("/change-password", verifyAuthToken, userController.changePassword);

module.exports = router;