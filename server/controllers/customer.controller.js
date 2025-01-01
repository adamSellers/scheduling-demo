const customerService = require("../services/customer.service");

const customerController = {
    getPersonAccounts: async (req, res) => {
        if (!req.user?.accessToken) {
            return res.status(401).json({ error: "No access token available" });
        }

        if (!req.user?.instanceUrl) {
            return res
                .status(401)
                .json({ error: "No Salesforce instance URL available" });
        }

        try {
            console.log("Fetching person accounts with:", {
                hasAccessToken: !!req.user?.accessToken,
                instanceUrl: req.user?.instanceUrl,
            });

            const personAccounts = await customerService.getPersonAccounts(
                req.user.accessToken,
                req.user.instanceUrl
            );

            console.log("Person accounts response:", {
                count: personAccounts?.length,
                first: personAccounts?.[0],
            });

            res.json(personAccounts);
        } catch (error) {
            console.error("Person accounts fetch error:", {
                message: error.message,
                data: error.response?.data,
            });
            if (error.response?.status === 401) {
                return res
                    .status(401)
                    .json({ error: "Authentication error with Salesforce" });
            }
            res.status(500).json({
                error: "Error fetching person accounts",
                details: error.message,
            });
        }
    },

    searchPersonAccounts: async (req, res) => {
        if (!req.user?.accessToken || !req.user?.instanceUrl) {
            return res.status(401).json({ error: "Authentication required" });
        }

        const { query } = req.query;
        if (!query) {
            return res.status(400).json({ error: "Search query is required" });
        }

        try {
            const results = await customerService.searchPersonAccounts(
                req.user.accessToken,
                req.user.instanceUrl,
                query
            );
            res.json(results);
        } catch (error) {
            console.error("Search error:", error);
            res.status(500).json({
                error: "Error searching person accounts",
                details: error.message,
            });
        }
    },
};

module.exports = customerController;
