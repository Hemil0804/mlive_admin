const express = require("express");
const formidableMiddleware = require('express-formidable');
const router = express.Router();
const serviceController = require("../../controllers/webhook/service.controller");

router.post("/data-feed", formidableMiddleware(), serviceController.dataFeed);
module.exports = router;