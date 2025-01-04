const axios = require("axios");

class CustomerService {
    async getPersonAccounts(accessToken, instanceUrl) {
        if (!instanceUrl) {
            throw new Error("Instance URL is required for getPersonAccounts");
        }

        try {
            const query = encodeURIComponent(
                `SELECT Id, Name, PersonEmail, Phone, IsPersonAccount 
                 FROM Account 
                 WHERE IsPersonAccount = true 
                 ORDER BY Name ASC 
                 LIMIT 100`
            );

            const response = await axios({
                method: "GET",
                url: `${instanceUrl}/services/data/v59.0/query/?q=${query}`,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            });

            return response.data.records.map((account) => ({
                id: account.Id,
                name: account.Name || "No Name",
                email: account.PersonEmail || "No Email",
                phone: account.Phone || "No Phone",
                customerStatus: "Active", // We can enhance this later with real status logic
            }));
        } catch (error) {
            console.error("Error in getPersonAccounts:", {
                message: error.message,
                response: error.response?.data,
            });
            throw error;
        }
    }

    async searchPersonAccounts(accessToken, instanceUrl, searchQuery) {
        if (!instanceUrl) {
            throw new Error(
                "Instance URL is required for searchPersonAccounts"
            );
        }

        try {
            const query = encodeURIComponent(
                `SELECT Id, Name, PersonEmail, Phone 
                 FROM Account 
                 WHERE IsPersonAccount = true 
                 AND Name LIKE '%${searchQuery}%' 
                 ORDER BY Name ASC 
                 LIMIT 100`
            );

            const response = await axios({
                method: "GET",
                url: `${instanceUrl}/services/data/v59.0/query/?q=${query}`,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            });

            return response.data.records.map((account) => ({
                id: account.Id,
                salesforceId: account.Id, // Explicitly include Salesforce ID
                name: account.Name || "No Name",
                email: account.PersonEmail || "No Email",
                phone: account.Phone || "No Phone",
            }));
        } catch (error) {
            console.error("Error in searchPersonAccounts:", error);
            throw error;
        }
    }
}

module.exports = new CustomerService();
