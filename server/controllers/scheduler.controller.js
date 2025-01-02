const schedulerService = require("../services/scheduler.service");

const schedulerController = {
    getServiceTerritories: async (req, res) => {
        if (!req.user?.accessToken) {
            return res.status(401).json({ error: "No access token available" });
        }

        if (!req.user?.instanceUrl) {
            return res
                .status(401)
                .json({ error: "No Salesforce instance URL available" });
        }

        try {
            console.log("Fetching territories with:", {
                hasAccessToken: !!req.user?.accessToken,
                instanceUrl: req.user?.instanceUrl,
            });

            const territories = await schedulerService.getServiceTerritories(
                req.user.accessToken,
                req.user.instanceUrl
            );

            console.log("Territory response:", {
                count: territories?.length,
                first: territories?.[0],
            });

            res.json(territories);
        } catch (error) {
            console.error("Territory fetch error:", {
                message: error.message,
                data: error.response?.data,
            });
            if (error.response?.status === 401) {
                return res
                    .status(401)
                    .json({ error: "Authentication error with Salesforce" });
            }
            res.status(500).json({
                error: "Error fetching service territories",
                details: error.message,
            });
        }
    },

    getWorkGroupTypes: async (req, res) => {
        if (!req.user?.accessToken) {
            return res.status(401).json({ error: "No access token available" });
        }

        if (!req.user?.instanceUrl) {
            return res
                .status(401)
                .json({ error: "No Salesforce instance URL available" });
        }

        try {
            console.log("Starting work group types fetch");
            const workGroupTypes = await schedulerService.getWorkGroupTypes(
                req.user.accessToken,
                req.user.instanceUrl
            );

            console.log("Work group types from service:", workGroupTypes);

            res.json(workGroupTypes);
        } catch (error) {
            console.error("Work group types fetch error:", {
                message: error.message,
                data: error.response?.data,
            });
            if (error.response?.status === 401) {
                return res
                    .status(401)
                    .json({ error: "Authentication error with Salesforce" });
            }
            res.status(500).json({
                error: "Error fetching work group types",
                details: error.message,
            });
        }
    },

    getServiceResources: async (req, res) => {
        if (!req.user?.accessToken) {
            return res.status(401).json({ error: "No access token available" });
        }

        if (!req.user?.instanceUrl) {
            return res
                .status(401)
                .json({ error: "No Salesforce instance URL available" });
        }

        try {
            console.log("Starting service resources fetch");
            const resources = await schedulerService.getServiceResources(
                req.user.accessToken,
                req.user.instanceUrl
            );
            console.log("Service resources response:", {
                count: resources?.length,
                firstResource: resources?.[0],
            });
            res.json(resources);
        } catch (error) {
            console.error("Resource fetch error:", {
                message: error.message,
                response: error.response?.data,
                statusCode: error.response?.status,
            });
            if (error.response?.status === 401) {
                return res
                    .status(401)
                    .json({ error: "Authentication error with Salesforce" });
            }
            res.status(500).json({
                error: "Error fetching service resources",
                details: error.message,
            });
        }
    },

    getServiceAppointments: async (req, res) => {
        if (!req.user?.accessToken) {
            return res.status(401).json({ error: "No access token available" });
        }

        if (!req.user?.instanceUrl) {
            return res
                .status(401)
                .json({ error: "No Salesforce instance URL available" });
        }

        try {
            const appointments = await schedulerService.getServiceAppointments(
                req.user.accessToken,
                req.user.instanceUrl
            );
            res.json(appointments);
        } catch (error) {
            console.error("Appointment fetch error:", error);
            if (error.response?.status === 401) {
                return res
                    .status(401)
                    .json({ error: "Authentication error with Salesforce" });
            }
            res.status(500).json({
                error: "Error fetching service appointments",
                details: error.message,
            });
        }
    },

    getBusinessHours: async (req, res) => {
        if (!req.user?.accessToken) {
            return res.status(401).json({ error: "No access token available" });
        }

        if (!req.user?.instanceUrl) {
            return res
                .status(401)
                .json({ error: "No Salesforce instance URL available" });
        }

        if (!req.params.id) {
            return res
                .status(400)
                .json({ error: "Business Hours ID is required" });
        }

        try {
            console.log("Fetching business hours with:", {
                hasAccessToken: !!req.user?.accessToken,
                instanceUrl: req.user?.instanceUrl,
                businessHoursId: req.params.id,
            });

            const businessHours = await schedulerService.getBusinessHours(
                req.user.accessToken,
                req.user.instanceUrl,
                req.params.id
            );
            res.json(businessHours);
        } catch (error) {
            console.error("Business hours fetch error:", {
                message: error.message,
                response: error.response?.data,
                stack: error.stack,
            });

            if (error.response?.status === 401) {
                return res
                    .status(401)
                    .json({ error: "Authentication error with Salesforce" });
            }

            res.status(500).json({
                error: "Error fetching business hours",
                details: error.message,
                code: error.response?.status,
            });
        }
    },

    getAppointmentCandidates: async (req, res) => {
        if (!req.user?.accessToken) {
            return res.status(401).json({ error: "No access token available" });
        }

        if (!req.user?.instanceUrl) {
            return res
                .status(401)
                .json({ error: "No Salesforce instance URL available" });
        }

        try {
            const candidates = await schedulerService.getAppointmentCandidates(
                req.user.accessToken,
                req.user.instanceUrl,
                req.body
            );
            res.json(candidates);
        } catch (error) {
            console.error("Appointment candidates fetch error:", error);
            if (error.response?.status === 401) {
                return res
                    .status(401)
                    .json({ error: "Authentication error with Salesforce" });
            }
            res.status(500).json({
                error: "Error fetching appointment candidates",
                details: error.message,
            });
        }
    },
};

module.exports = schedulerController;
