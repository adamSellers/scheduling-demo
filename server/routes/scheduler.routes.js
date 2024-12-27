const express = require("express");
const router = express.Router();
const schedulerController = require("../controllers/scheduler.controller");
const AuthMiddleware = require("../middleware/auth.middleware");

router.get(
    "/territories",
    AuthMiddleware.isAuthenticated,
    schedulerController.getServiceTerritories
);

router.get(
    "/resources",
    AuthMiddleware.isAuthenticated,
    schedulerController.getServiceResources
);

router.get(
    "/appointments",
    AuthMiddleware.isAuthenticated,
    schedulerController.getServiceAppointments
);

module.exports = router;
