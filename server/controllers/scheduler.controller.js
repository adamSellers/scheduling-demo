const schedulerService = require("../services/scheduler.service");

const schedulerController = {
    getServiceTerritories: async (req, res, next) => {
        try {
            if (!req.user?.accessToken) {
                return res
                    .status(401)
                    .json({ error: "No access token available" });
            }

            const territories = await schedulerService.getServiceTerritories(
                req.user.accessToken
            );
            res.json(territories);
        } catch (error) {
            console.error("Controller error fetching territories:", error);

            if (error.response?.status === 401) {
                return res.status(401).json({
                    error: "Authentication error with Salesforce",
                });
            }

            if (error.response?.status === 400) {
                return res.status(400).json({
                    error: "Invalid request parameters for service territories",
                    details: error.response.data,
                });
            }

            res.status(500).json({
                error: "Error fetching service territories",
                details: error.message,
            });
        }
    },

    getServiceResources: async (req, res, next) => {
        try {
            if (!req.user?.accessToken) {
                return res
                    .status(401)
                    .json({ error: "No access token available" });
            }

            const resources = await schedulerService.getServiceResources(
                req.user.accessToken
            );
            res.json(resources);
        } catch (error) {
            console.error("Controller error fetching resources:", error);

            if (error.response?.status === 401) {
                return res.status(401).json({
                    error: "Authentication error with Salesforce",
                });
            }

            if (error.response?.status === 400) {
                return res.status(400).json({
                    error: "Invalid request parameters for service resources",
                    details: error.response.data,
                });
            }

            res.status(500).json({
                error: "Error fetching service resources",
                details: error.message,
            });
        }
    },

    getServiceAppointments: async (req, res, next) => {
        try {
            if (!req.user?.accessToken) {
                return res
                    .status(401)
                    .json({ error: "No access token available" });
            }

            const appointments = await schedulerService.getServiceAppointments(
                req.user.accessToken
            );
            res.json(appointments);
        } catch (error) {
            console.error("Controller error fetching appointments:", error);

            if (error.response?.status === 401) {
                return res.status(401).json({
                    error: "Authentication error with Salesforce",
                });
            }

            if (error.response?.status === 400) {
                return res.status(400).json({
                    error: "Invalid request parameters for service appointments",
                    details: error.response.data,
                });
            }

            res.status(500).json({
                error: "Error fetching service appointments",
                details: error.message,
            });
        }
    },
};

module.exports = schedulerController;
