const axios = require("axios");

class SalesforceApiUtil {
    static async makeApiRequest(
        instanceUrl,
        accessToken,
        endpoint,
        method = "GET",
        params = {},
        isSchedulingApi = true
    ) {
        if (!instanceUrl) {
            throw new Error("Instance URL is required for API request");
        }

        // Ensure slash consistency
        const cleanEndpoint = endpoint.startsWith("/")
            ? endpoint
            : `/${endpoint}`;

        // Build the full URL with the correct path for Salesforce Scheduler API
        const url = `${instanceUrl}/services/data/v59.0${
            isSchedulingApi ? "/scheduling" : ""
        }${cleanEndpoint}`;

        const config = {
            method,
            url,
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            ...(method === "GET" ? { params } : { data: params }),
        };

        try {
            console.log("Making Salesforce API request:", {
                url,
                method,
                headers: config.headers,
                params: config.params,
                data: config.data,
            });

            const response = await axios(config);

            console.log("Salesforce API response:", {
                status: response.status,
                data: response.data,
            });

            return response.data;
        } catch (error) {
            console.error("Error in makeApiRequest:", {
                url,
                error: error.message,
                response: error.response?.data,
                status: error.response?.status,
                config: error.config,
            });
            throw error;
        }
    }

    static async querySalesforce(instanceUrl, accessToken, query) {
        if (!instanceUrl) {
            throw new Error("Instance URL is required for Salesforce query");
        }

        const encodedQuery = encodeURIComponent(query);
        try {
            console.log("Making Salesforce SOQL query:", {
                query: query,
            });

            const response = await axios({
                method: "GET",
                url: `${instanceUrl}/services/data/v59.0/query/?q=${encodedQuery}`,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            });

            console.log("SOQL query response:", {
                totalSize: response.data.totalSize,
                records: response.data.records?.length,
            });

            return response.data.records;
        } catch (error) {
            console.error("Error in Salesforce query:", {
                query,
                error: error.message,
                response: error.response?.data,
                status: error.response?.status,
            });
            throw error;
        }
    }

    static async getServiceTerritories(instanceUrl, accessToken, workGroupIds) {
        try {
            // First, query service territories
            const query = `
                SELECT Id, Name, OperatingHoursId, IsActive,
                       Street, City, State, PostalCode, Country
                FROM ServiceTerritory
                WHERE IsActive = true
                ORDER BY Name ASC
            `;

            const territories = await this.querySalesforce(
                instanceUrl,
                accessToken,
                query
            );

            // Transform territories into expected format
            return territories.map((territory) => ({
                id: territory.Id,
                name: territory.Name,
                operatingHours: territory.OperatingHoursId,
                status: territory.IsActive ? "Active" : "Inactive",
                address: [
                    territory.Street,
                    territory.City,
                    territory.State,
                    territory.PostalCode,
                    territory.Country,
                ]
                    .filter(Boolean)
                    .join(", "),
            }));
        } catch (error) {
            console.error("Error fetching service territories:", error);
            throw error;
        }
    }

    static async getAppointmentCandidates(instanceUrl, accessToken, params) {
        try {
            // Format request according to Salesforce Scheduler API specs
            const requestPayload = {
                startTime: params.startTime,
                endTime: params.endTime,
                territoryIds: params.territoryIds,
                workTypeGroupId: params.workTypeGroupId,
                schedulingPolicyId: params.schedulingPolicyId || null,
                accountId: params.accountId || null,
                allowConcurrentScheduling: false,
            };

            const response = await this.makeApiRequest(
                instanceUrl,
                accessToken,
                "/getAppointmentCandidates",
                "POST",
                requestPayload,
                true // Use scheduling API
            );

            return response.candidates;
        } catch (error) {
            console.error("Error getting appointment candidates:", error);
            throw error;
        }
    }

    static async getWorkTypeGroups(instanceUrl, accessToken) {
        try {
            const query = `
                SELECT Id, Name, IsActive, GroupType
                FROM WorkTypeGroup
                WHERE IsActive = true
                ORDER BY Name ASC
            `;

            const workGroups = await this.querySalesforce(
                instanceUrl,
                accessToken,
                query
            );

            return workGroups.map((group) => ({
                id: group.Id,
                name: group.Name,
                isActive: group.IsActive,
                groupType: group.GroupType || "Standard",
            }));
        } catch (error) {
            console.error("Error fetching work type groups:", error);
            throw error;
        }
    }

    static async getServiceResources(instanceUrl, accessToken) {
        try {
            const query = `
                SELECT Id, Name, RelatedRecordId, ResourceType, IsActive, 
                       RelatedRecord.FirstName, RelatedRecord.LastName,
                       RelatedRecord.Email, RelatedRecord.Title,
                       RelatedRecord.LanguageLocaleKey,
                       RelatedRecord.SmallPhotoUrl,
                       LastKnownLocationDate
                FROM ServiceResource
                WHERE IsActive = true
                ORDER BY Name ASC
            `;

            const resources = await this.querySalesforce(
                instanceUrl,
                accessToken,
                query
            );

            return resources.map((resource) => ({
                id: resource.Id,
                name: resource.Name,
                resourceType: resource.ResourceType,
                isActive: resource.IsActive,
                relatedRecordId: resource.RelatedRecordId,
                firstName: resource.RelatedRecord?.FirstName || "",
                lastName: resource.RelatedRecord?.LastName || "",
                email: resource.RelatedRecord?.Email || "",
                title: resource.RelatedRecord?.Title || "",
                language: resource.RelatedRecord?.LanguageLocaleKey || "",
                photoUrl: resource.RelatedRecord?.SmallPhotoUrl || "",
                lastKnownLocation: resource.LastKnownLocationDate,
            }));
        } catch (error) {
            console.error("Error fetching service resources:", error);
            throw error;
        }
    }

    static async createServiceAppointment(
        instanceUrl,
        accessToken,
        appointmentData
    ) {
        try {
            const payload = {
                schedStartTime: appointmentData.startTime,
                schedEndTime: appointmentData.endTime,
                serviceTerritoryId: appointmentData.territoryId,
                serviceResourceId: appointmentData.resourceId,
                accountId: appointmentData.accountId,
                workTypeId: appointmentData.workTypeId,
                status: "Scheduled",
                description: appointmentData.description || null,
            };

            const response = await this.makeApiRequest(
                instanceUrl,
                accessToken,
                "/service-appointments",
                "POST",
                payload,
                true
            );

            return response;
        } catch (error) {
            console.error("Error creating service appointment:", error);
            throw error;
        }
    }

    static async getUserPhoto(instanceUrl, accessToken, userId) {
        try {
            const response = await axios({
                method: "GET",
                url: `${instanceUrl}/services/data/v59.0/connect/user-profiles/${userId}/photo`,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                responseType: "arraybuffer",
            });

            // Convert the binary data to base64
            const base64 = Buffer.from(response.data, "binary").toString(
                "base64"
            );
            return `data:${response.headers["content-type"]};base64,${base64}`;
        } catch (error) {
            console.error("Error fetching user photo:", error);
            return null;
        }
    }
}

module.exports = SalesforceApiUtil;
