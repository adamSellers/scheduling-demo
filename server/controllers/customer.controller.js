const customerService = require("../services/customer.service");
const axios = require("axios");

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

    getCustomerPhoto: async (req, res) => {
        try {
            const { personAccountId } = req.params;
            const { accessToken, instanceUrl } = req.user;

            if (!instanceUrl) {
                console.error(
                    "No instance_url found in user session",
                    req.user
                );
                return res.status(500).json({
                    error: "Salesforce instance URL not found.",
                });
            }

            console.log("Starting photo fetch for account:", personAccountId);

            // First get the PersonContactId from the Account
            const contactQuery = `${instanceUrl}/services/data/v59.0/query/?q=${encodeURIComponent(
                `SELECT PersonContactId FROM Account WHERE Id = '${personAccountId}'`
            )}`;

            console.log(
                "Making contact query:",
                decodeURIComponent(contactQuery)
            );
            const contactResponse = await axios({
                method: "get",
                url: contactQuery,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            });

            console.log("Contact query response:", contactResponse.data);

            if (
                !contactResponse.data.records ||
                contactResponse.data.records.length === 0
            ) {
                return res.status(404).json({
                    error: "Person Account not found",
                });
            }

            const personContactId =
                contactResponse.data.records[0].PersonContactId;
            console.log("Found PersonContactId:", personContactId);

            // Then query for the User record associated with this Contact
            const userQuery = `${instanceUrl}/services/data/v59.0/query/?q=${encodeURIComponent(
                `SELECT Id, SmallPhotoUrl, FullPhotoUrl FROM User WHERE ContactId = '${personContactId}'`
            )}`;

            console.log("Making user query:", decodeURIComponent(userQuery));
            const userResponse = await axios({
                method: "get",
                url: userQuery,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            });

            console.log("User query response:", userResponse.data);

            if (
                !userResponse.data.records ||
                userResponse.data.records.length === 0
            ) {
                return res.status(404).json({
                    error: "No Experience Cloud user found for this contact",
                });
            }

            const user = userResponse.data.records[0];

            // If we have a photo URL, fetch it
            if (user.FullPhotoUrl || user.SmallPhotoUrl) {
                const photoUrl = user.FullPhotoUrl || user.SmallPhotoUrl;
                console.log("Found photo URL:", photoUrl);

                const photoResponse = await axios({
                    method: "get",
                    url: photoUrl,
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                    responseType: "arraybuffer",
                });

                console.log("Photo response headers:", photoResponse.headers);

                // Set the correct content type from the response
                res.set("Content-Type", photoResponse.headers["content-type"]);
                return res.send(photoResponse.data);
            }

            return res
                .status(404)
                .json({ error: "No photo found for this user" });
        } catch (error) {
            console.error("Error fetching customer photo:", error);
            console.error("Error details:", error.response?.data);
            res.status(error.response?.status || 500).json({
                error: "Failed to fetch user photo",
                details: error.message,
            });
        }
    },
};

module.exports = customerController;
