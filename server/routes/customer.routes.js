const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customer.controller");
const AuthMiddleware = require("../middleware/auth.middleware");

// Make sure all routes are authenticated
router.use(AuthMiddleware.isAuthenticated);

// Get all person accounts
router.get("/person-accounts", customerController.getPersonAccounts);

// Search person accounts
router.get("/person-accounts/search", customerController.searchPersonAccounts);

module.exports = router;
