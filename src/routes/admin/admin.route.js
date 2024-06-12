const express = require("express");
const router = express.Router();
const adminController = require("../../controllers/admin/admin.controller");
const { adminVerifyResetToken, verifyAdminAuthToken } = require("../../middleware/verifyToken");
const { uploadImage, validMulterUploadMiddleware } = require("../../middleware/uploadImage");

router.post("/login", adminController.login);
router.post("/forgot-password", adminController.forgotPassword);
router.post("/reset-password/:token", adminVerifyResetToken, adminController.resetPassword);
router.post("/view-profile", verifyAdminAuthToken, adminController.viewProfile);
router.post("/change-password", verifyAdminAuthToken, adminController.changePassword);
router.post("/edit-profile", verifyAdminAuthToken, validMulterUploadMiddleware(uploadImage.single("profilePic")), adminController.editProfile);
router.post("/logout", verifyAdminAuthToken, adminController.logout);
module.exports = router;