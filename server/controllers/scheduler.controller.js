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
            const territories = await schedulerService.getServiceTerritories(
                req.user.accessToken,
                req.user.instanceUrl
            );
            res.json(territories);
        } catch (error) {
            if (error.response?.status === 401) {
                return res
                    .status(401)
                    .json({ error: "Authentication error with Salesforce" });
            }
            res.status(500).json({
                error: "Error fetching service territories",
            });
        }
    },

    getServiceResources: async (req, res) => {
        if (!req.user?.accessToken) {
            return res.status(401).json({ error: "No access token available" });
        }

        try {
            const resources = await schedulerService.getServiceResources(
                req.user.accessToken
            );
            res.json(resources);
        } catch (error) {
            if (error.response?.status === 401) {
                return res
                    .status(401)
                    .json({ error: "Authentication error with Salesforce" });
            }
            res.status(500).json({ error: "Error fetching service resources" });
        }
    },

    getServiceAppointments: async (req, res) => {
        if (!req.user?.accessToken) {
            return res.status(401).json({ error: "No access token available" });
        }

        try {
            const appointments = await schedulerService.getServiceAppointments(
                req.user.accessToken
            );
            res.json(appointments);
        } catch (error) {
            if (error.response?.status === 401) {
                return res
                    .status(401)
                    .json({ error: "Authentication error with Salesforce" });
            }
            res.status(500).json({
                error: "Error fetching service appointments",
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
            const workGroupTypes = await schedulerService.getWorkGroupTypes(
                req.user.accessToken,
                req.user.instanceUrl
            );

            const response = workGroupTypes.map((type) => ({
                id: type.id,
                name: type.name,
                isActive: type.isActive,
                groupType: type.groupType,
            }));

            res.json(response);
        } catch (error) {
            if (error.response?.status === 401) {
                return res
                    .status(401)
                    .json({ error: "Authentication error with Salesforce" });
            }
            res.status(500).json({ error: "Error fetching work group types" });
        }
    },
};

module.exports = schedulerController;
