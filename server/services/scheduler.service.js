const axios = require("axios");

class SchedulerService {
    constructor() {
        this.cachedWorkGroupTypes = null;
    }

    async makeApiRequest(
        instanceUrl,
        accessToken,
        endpoint,
        method = "GET",
        params = {}
    ) {
        if (!instanceUrl) {
            throw new Error("Instance URL is required for API request");
        }

        const config = {
            method,
            url: `${instanceUrl}/services/data/v59.0/connect/scheduling${endpoint}`,
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

    async getServiceResources(accessToken, instanceUrl) {
        if (!instanceUrl) {
            throw new Error("Instance URL is required for getServiceResources");
        }

        const territories = await this.getServiceTerritories(
            accessToken,
            instanceUrl
        );

        if (!territories.length) {
            return [];
        }

        const startDate = new Date().toISOString();
        const endDate = new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
        ).toISOString();

        const params = {
            territoryIds: territories.map((t) => t.id).join(","),
            startTime: startDate,
            endTime: endDate,
            workTypeId: process.env.SF_DEFAULT_WORKTYPE_ID,
        };

        try {
            const availabilityData = await this.makeApiRequest(
                instanceUrl,
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
        } catch (error) {
            console.error("Error fetching service resources:", error);
            throw error;
        }
    }

    async getServiceAppointments(accessToken, instanceUrl) {
        if (!instanceUrl) {
            throw new Error(
                "Instance URL is required for getServiceAppointments"
            );
        }

        const params = {
            startTime: new Date().toISOString(),
            endTime: new Date(
                Date.now() + 7 * 24 * 60 * 60 * 1000
            ).toISOString(),
            workTypeGroupId: process.env.SF_DEFAULT_WORKTYPE_GROUP_ID,
            workTypeId: process.env.SF_DEFAULT_WORKTYPE_ID,
        };

        try {
            const appointments = await this.makeApiRequest(
                instanceUrl,
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
        } catch (error) {
            console.error("Error fetching service appointments:", error);
            throw error;
        }
    }

    async getServiceTerritories(accessToken, instanceUrl) {
        if (!instanceUrl) {
            throw new Error(
                "Instance URL is required for getServiceTerritories"
            );
        }

        console.log("Starting getServiceTerritories:", {
            hasAccessToken: !!accessToken,
            instanceUrl,
        });

        // First get all work type groups
        const workGroupTypes = await this.getWorkGroupTypes(
            accessToken,
            instanceUrl
        );

        console.log("Got work group types for territories:", {
            count: workGroupTypes?.length,
            workGroupTypes: workGroupTypes?.map((wg) => ({
                id: wg.id,
                name: wg.name,
            })),
        });

        if (!workGroupTypes?.length) {
            console.log(
                "No work group types found, returning empty territories array"
            );
            return [];
        }

        // Setup date parameters
        const startDate = new Date().toISOString();
        const endDate = new Date(
            Date.now() + 24 * 60 * 60 * 1000
        ).toISOString();

        // Fetch territories for each work type group
        const territoriesPromises = workGroupTypes.map(async (workGroup) => {
            try {
                console.log(
                    `Fetching territories for work group: ${workGroup.name} (${workGroup.id})`
                );

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

                console.log(
                    `Territory response for work group ${workGroup.id}:`,
                    {
                        status: response.status,
                        territoryCount:
                            response.data?.result?.serviceTerritories?.length,
                    }
                );

                return response.data.result.serviceTerritories;
            } catch (error) {
                console.error(
                    `Error fetching territories for work group ${workGroup.id}:`,
                    error.message,
                    error.response?.data
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

        console.log("Final territories result:", {
            totalCount: uniqueTerritories.length,
            firstTerritory: uniqueTerritories[0],
        });

        // Transform the data into the required format
        return uniqueTerritories.map((territory) => ({
            id: territory.id,
            name: territory.name,
            operatingHours: territory.operatingHoursId || "Default Hours",
            address: `${territory.street || ""}, ${territory.city || ""}, ${
                territory.state || ""
            }`.trim(),
            status: "Active",
        }));
    }

    async getWorkGroupTypes(accessToken, instanceUrl) {
        if (!instanceUrl) {
            console.error("No instanceUrl provided to getWorkGroupTypes");
            throw new Error("Instance URL is required for getWorkGroupTypes");
        }

        console.log("Starting getWorkGroupTypes:", {
            hasAccessToken: !!accessToken,
            instanceUrl,
        });

        const query = encodeURIComponent(
            "SELECT Id, Name, IsActive, GroupType FROM WorkTypeGroup WHERE IsActive = true ORDER BY Name DESC"
        );

        try {
            console.log(
                `Making SOQL query to: ${instanceUrl}/services/data/v59.0/query/?q=${query}`
            );

            const response = await axios({
                method: "GET",
                url: `${instanceUrl}/services/data/v59.0/query/?q=${query}`,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            });

            console.log("Work group types raw response:", {
                status: response.status,
                totalSize: response.data?.totalSize,
                recordCount: response.data?.records?.length,
                firstRecord: response.data?.records?.[0],
            });

            const workGroupTypes = response.data.records.map((workGroup) => ({
                id: workGroup.Id,
                name: workGroup.Name,
                isActive: workGroup.IsActive,
                groupType: workGroup.GroupType || "Standard",
            }));

            console.log("Processed work group types:", workGroupTypes);
            return workGroupTypes;
        } catch (error) {
            console.error("Error in getWorkGroupTypes:", {
                message: error.message,
                response: error.response?.data,
                statusCode: error.response?.status,
            });
            throw error;
        }
    }
}

module.exports = new SchedulerService();
