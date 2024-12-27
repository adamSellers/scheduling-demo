const axios = require("axios");

class SchedulerService {
    constructor() {
        this.baseUrl = process.env.SF_LOGIN_URL;
        this.cachedWorkGroupTypes = null;
    }

    async makeApiRequest(accessToken, endpoint, method = "GET", params = {}) {
        const config = {
            method,
            url: `${this.baseUrl}/services/data/v59.0/connect/scheduling${endpoint}`,
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            params: method === "GET" ? params : undefined,
            data: method !== "GET" ? params : undefined,
        };

        try {
            const response = await axios(config);
            return response.data;
        } catch (error) {
            console.error("Error in makeApiRequest:", {
                endpoint,
                error: error.message,
                response: error.response?.data,
            });
            throw error;
        }
    }

    async getServiceTerritories(accessToken, instanceUrl) {
        // First get all work type groups
        const workGroupTypes = await this.getWorkGroupTypes(
            accessToken,
            instanceUrl
        );

        // Setup date parameters
        const startDate = new Date().toISOString();
        const endDate = new Date(
            Date.now() + 24 * 60 * 60 * 1000
        ).toISOString();

        // Fetch territories for each work type group
        const territoriesPromises = workGroupTypes.map(async (workGroup) => {
            try {
                const response = await axios({
                    method: "GET",
                    url: `${instanceUrl}/services/data/v59.0/connect/scheduling/service-territories`,
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                    params: {
                        territoryOption: "All",
                        scheduleStartDate: startDate,
                        scheduleEndDate: endDate,
                        workTypeGroupId: workGroup.id,
                    },
                });

                return response.data.result.serviceTerritories;
            } catch (error) {
                console.error(
                    `Error fetching territories for work group ${workGroup.id}:`,
                    error
                );
                return [];
            }
        });

        // Wait for all requests to complete
        const allTerritories = await Promise.all(territoriesPromises);

        // Flatten and remove duplicates based on territory ID
        const uniqueTerritories = Array.from(
            new Map(
                allTerritories
                    .flat()
                    .map((territory) => [territory.id, territory])
            ).values()
        );

        // Transform the data into the required format
        return uniqueTerritories.map((territory) => ({
            id: territory.id,
            name: territory.name,
            operatingHours: territory.operatingHoursId || "Default Hours",
            address: `${territory.street || ""}, ${territory.city || ""}, ${
                territory.state || ""
            }`.trim(),
            status: "Active", // All returned territories are active
        }));
    }

    async getServiceResources(accessToken, instanceUrl) {
        const territories = await this.getServiceTerritories(
            accessToken,
            instanceUrl
        );

        if (!territories.length) {
            return [];
        }

        const params = {
            territoryIds: territories.map((t) => t.id).join(","),
            startTime: new Date().toISOString(),
            endTime: new Date(
                Date.now() + 7 * 24 * 60 * 60 * 1000
            ).toISOString(),
            workTypeId: process.env.SF_DEFAULT_WORKTYPE_ID,
        };

        const availabilityData = await this.makeApiRequest(
            accessToken,
            "/available-territory-slots",
            "GET",
            params
        );

        return (
            availabilityData.resources?.map((resource) => ({
                name: resource.name,
                type: resource.resourceType || "Technician",
                territory: resource.territoryName || "Unassigned",
                availability: resource.isAvailable
                    ? "Available"
                    : "Unavailable",
            })) || []
        );
    }

    async getServiceAppointments(accessToken) {
        const params = {
            startTime: new Date().toISOString(),
            endTime: new Date(
                Date.now() + 7 * 24 * 60 * 60 * 1000
            ).toISOString(),
            workTypeGroupId: process.env.SF_DEFAULT_WORKTYPE_GROUP_ID,
            workTypeId: process.env.SF_DEFAULT_WORKTYPE_ID,
        };

        const appointments = await this.makeApiRequest(
            accessToken,
            "/service-appointments",
            "GET",
            params
        );

        return (
            appointments?.map((appointment) => ({
                appointmentNumber: appointment.appointmentNumber || "N/A",
                scheduledTime: appointment.scheduledStartTime,
                serviceTerritory:
                    appointment.serviceTerritory?.name || "Unassigned",
                assignedResource:
                    appointment.assignedResource?.name || "Unassigned",
                status: appointment.status || "Unknown",
            })) || []
        );
    }

    async getWorkGroupTypes(accessToken, instanceUrl) {
        if (this.cachedWorkGroupTypes) {
            return this.cachedWorkGroupTypes;
        }

        const query = encodeURIComponent(
            "SELECT Id, Name, IsActive, GroupType FROM WorkTypeGroup WHERE IsActive = true ORDER BY Name DESC"
        );

        const response = await axios({
            method: "GET",
            url: `${instanceUrl}/services/data/v59.0/query/?q=${query}`,
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
        });

        const workGroupTypes = response.data.records.map((workGroup) => ({
            id: workGroup.Id,
            name: workGroup.Name,
            isActive: workGroup.IsActive,
            groupType: workGroup.GroupType || "Standard",
        }));

        this.cachedWorkGroupTypes = workGroupTypes;
        return workGroupTypes;
    }
}

module.exports = new SchedulerService();
