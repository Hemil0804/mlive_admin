const express = require("express");
const router = express.Router();
const clientController = require("../../controllers/client/client.controller");
const { verifyClientAuthToken,clientVerifyResetToken } = require("../../middleware/verifyToken");
const { uploadImage, validMulterUploadMiddleware } = require("../../middleware/uploadImage");

router.post("/login", clientController.login);
router.post("/forgot-password", clientController.forgotPassword);
router.post("/reset-password/:token", clientVerifyResetToken, clientController.resetPassword);
router.post("/view-profile", verifyClientAuthToken, clientController.viewProfile);
router.post("/change-password", verifyClientAuthToken, clientController.changePassword);
router.post("/edit-profile", verifyClientAuthToken, validMulterUploadMiddleware(uploadImage.single("profileImage")), clientController.editProfile);
router.post("/logout", verifyClientAuthToken, clientController.logout);
module.exports = router;