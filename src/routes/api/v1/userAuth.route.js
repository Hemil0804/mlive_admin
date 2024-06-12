const express = require('express')
const router = express.Router()
const userController = require('../../../controllers/userAuth.controller')
const {
    verifyAuthToken,
} = require('../../../middleware/verifyToken')



router.post("/login", userController.login);
router.post("/view-profile", verifyAuthToken, userController.viewProfile);
router.post("/logout", verifyAuthToken, userController.logout);

module.exports = router
