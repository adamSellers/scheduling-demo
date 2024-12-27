const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

router.get("/salesforce", authController.initiateAuth);
router.get("/salesforce/callback", authController.handleCallback);
router.get("/logout", authController.logout);
router.get("/user-info", authController.getUserInfo);

module.exports = router;
