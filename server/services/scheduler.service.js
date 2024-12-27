const axios = require("axios");

class SchedulerService {
    constructor() {
        this.baseUrl = process.env.SF_LOGIN_URL;
    }

    async makeApiRequest(accessToken, endpoint, method = "GET", params = {}) {
        try {
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

            const response = await axios(config);
            return response.data;
        } catch (error) {
            console.error("Salesforce API Error:", {
                status: error.response?.status,
                message: error.response?.data,
                endpoint: endpoint,
            });
            throw error;
        }
    }

    async getServiceTerritories(accessToken) {
        try {
            // Get available territories based on a work type
            const params = {
                // These parameters are required for the service territories endpoint
                workTypeId: process.env.SF_DEFAULT_WORKTYPE_ID,
                // Optional parameters for filtering
                startTime: new Date().toISOString(),
                endTime: new Date(
                    Date.now() + 7 * 24 * 60 * 60 * 1000
                ).toISOString(),
            };

            const territories = await this.makeApiRequest(
                accessToken,
                "/service-territories",
                "GET",
                params
            );

            return territories.map((territory) => ({
                name: territory.name,
                operatingHours:
                    territory.operatingHours?.name || "Default Hours",
                address: territory.address
                    ? `${territory.address.street || ""}, ${
                          territory.address.city || ""
                      }, ${territory.address.state || ""}`.trim()
                    : "No Address",
                status: territory.isActive ? "Active" : "Inactive",
            }));
        } catch (error) {
            console.error("Error fetching service territories:", error);
            throw error;
        }
    }

    async getServiceResources(accessToken) {
        try {
            // First get territories to use for resource lookup
            const territories = await this.getServiceTerritories(accessToken);

            if (!territories.length) {
                return [];
            }

            // Get available slots for the first territory
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

            // Transform the response into our desired format
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
        } catch (error) {
            console.error("Error fetching service resources:", error);
            throw error;
        }
    }

    async getServiceAppointments(accessToken) {
        try {
            // For service appointments, we need to specify the time window
            const params = {
                startTime: new Date().toISOString(),
                endTime: new Date(
                    Date.now() + 7 * 24 * 60 * 60 * 1000
                ).toISOString(),
                workTypeId: process.env.SF_DEFAULT_WORKTYPE_ID,
            };

            const appointments = await this.makeApiRequest(
                accessToken,
                "/service-appointments",
                "GET",
                params
            );

            return (appointments || []).map((appointment) => ({
                appointmentNumber: appointment.appointmentNumber || "N/A",
                scheduledTime: appointment.scheduledStartTime,
                serviceTerritory:
                    appointment.serviceTerritory?.name || "Unassigned",
                assignedResource:
                    appointment.assignedResource?.name || "Unassigned",
                status: appointment.status || "Unknown",
            }));
        } catch (error) {
            console.error("Error fetching service appointments:", error);
            throw error;
        }
    }
}

module.exports = new SchedulerService();
