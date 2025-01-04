const express = require("express");
const router = express.Router();
const schedulerController = require("../controllers/scheduler.controller");
const AuthMiddleware = require("../middleware/auth.middleware");

// Make sure all routes are authenticated
router.use(AuthMiddleware.isAuthenticated);

// Basic CRUD routes
router.get("/territories", schedulerController.getServiceTerritories);
router.get("/resources", schedulerController.getServiceResources);
router.get("/appointments", schedulerController.getServiceAppointments);
router.get("/work-type-groups", schedulerController.getWorkGroupTypes);

// Appointment scheduling routes
router.get("/time-slots/:operatingHoursId", schedulerController.getTimeSlots);
router.post(
    "/appointment-candidates",
    schedulerController.getAppointmentCandidates
);
router.post("/appointments", schedulerController.createServiceAppointment);

module.exports = router;
