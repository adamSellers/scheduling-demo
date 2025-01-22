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

    getCustomerAppointments: async (req, res) => {
        if (!req.user?.accessToken) {
            return res.status(401).json({ error: "No access token available" });
        }

        if (!req.user?.instanceUrl) {
            return res
                .status(401)
                .json({ error: "No Salesforce instance URL available" });
        }

        const { accountId } = req.params;
        if (!accountId) {
            return res.status(400).json({ error: "Account ID is required" });
        }

        try {
            console.log(
                "Fetching customer appointments for account:",
                accountId
            );
            const appointments = await schedulerService.getCustomerAppointments(
                req.user.accessToken,
                req.user.instanceUrl,
                accountId
            );
            res.json(appointments);
        } catch (error) {
            console.error("Customer appointments fetch error:", {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
            });
            if (error.response?.status === 401) {
                return res
                    .status(401)
                    .json({ error: "Authentication error with Salesforce" });
            }
            res.status(500).json({
                error: "Error fetching customer appointments",
                details: error.message,
            });
        }
    },

    getTimeSlots: async (req, res) => {
        if (!req.user?.accessToken) {
            return res.status(401).json({ error: "No access token available" });
        }

        if (!req.user?.instanceUrl) {
            return res
                .status(401)
                .json({ error: "No Salesforce instance URL available" });
        }

        if (!req.params.operatingHoursId) {
            return res
                .status(400)
                .json({ error: "Operating Hours ID is required" });
        }

        try {
            console.log("Fetching time slots with:", {
                hasAccessToken: !!req.user?.accessToken,
                instanceUrl: req.user?.instanceUrl,
                operatingHoursId: req.params.operatingHoursId,
                workTypeGroupId: req.query.workTypeGroupId,
            });

            const timeSlots = await schedulerService.getTimeSlots(
                req.user.accessToken,
                req.user.instanceUrl,
                req.params.operatingHoursId,
                req.query.workTypeGroupId
            );
            res.json(timeSlots);
        } catch (error) {
            console.error("Time slots fetch error:", {
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
                error: "Error fetching time slots",
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

    createServiceAppointment: async (req, res) => {
        if (!req.user?.accessToken) {
            return res.status(401).json({ error: "No access token available" });
        }

        if (!req.user?.instanceUrl) {
            return res
                .status(401)
                .json({ error: "No Salesforce instance URL available" });
        }

        try {
            // Validate required appointment data
            const { serviceAppointment, assignedResources } = req.body;

            if (!serviceAppointment || !assignedResources) {
                return res.status(400).json({
                    error: "Invalid appointment data",
                    details:
                        "Both serviceAppointment and assignedResources are required",
                });
            }

            // Validate required appointment fields
            const requiredFields = [
                "parentRecordId",
                "workTypeId",
                "serviceTerritoryId",
                "schedStartTime",
                "schedEndTime",
            ];
            const missingFields = requiredFields.filter(
                (field) => !serviceAppointment[field]
            );

            if (missingFields.length > 0) {
                return res.status(400).json({
                    error: "Missing required fields",
                    details: `Required fields missing: ${missingFields.join(
                        ", "
                    )}`,
                });
            }

            // Validate assigned resources
            if (
                !Array.isArray(assignedResources) ||
                assignedResources.length === 0
            ) {
                return res.status(400).json({
                    error: "Invalid assigned resources",
                    details: "At least one assigned resource is required",
                });
            }

            const appointment = await schedulerService.createServiceAppointment(
                req.user.accessToken,
                req.user.instanceUrl,
                req.body
            );

            res.status(201).json(appointment);
        } catch (error) {
            console.error("Error creating service appointment:", {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
            });

            if (error.response?.status === 401) {
                return res
                    .status(401)
                    .json({ error: "Authentication error with Salesforce" });
            }

            res.status(error.response?.status || 500).json({
                error: "Error creating service appointment",
                details: error.message,
                salesforceError: error.response?.data,
            });
        }
    },
};

module.exports = schedulerController;
