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
        params = {},
        isSchedulingApi = true
    ) {
        if (!instanceUrl) {
            throw new Error("Instance URL is required for API request");
        }

        const config = {
            method,
            url: `${instanceUrl}/services/data/v59.0/${
                isSchedulingApi ? "connect/scheduling" : "scheduling"
            }${endpoint}`,
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

        try {
            const query = encodeURIComponent(
                "SELECT Id, Name, RelatedRecordId, ResourceType, IsActive, Description FROM ServiceResource WHERE IsActive = true ORDER BY Name ASC"
            );

            const response = await axios({
                method: "GET",
                url: `${instanceUrl}/services/data/v62.0/query/?q=${query}`,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            });

            return response.data.records.map((resource) => ({
                id: resource.Id,
                name: resource.Name,
                relatedRecordId: resource.RelatedRecordId,
                type:
                    resource.ResourceType === "T"
                        ? "CA"
                        : resource.ResourceType,
                isActive: resource.IsActive,
                description: resource.Description,
            }));
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

        const query = encodeURIComponent(
            `SELECT Id, AppointmentNumber, Status, SchedStartTime, SchedEndTime, 
            ServiceTerritoryId, ServiceTerritory.Name, Street, City, State, 
            PostalCode, Description, WorkType.Name, WorkTypeId 
            FROM ServiceAppointment 
            WHERE Status NOT IN ('Completed','Canceled') 
            ORDER BY SchedStartTime ASC`
        );

        try {
            const response = await axios({
                method: "GET",
                url: `${instanceUrl}/services/data/v59.0/query/?q=${query}`,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            });

            return response.data.records.map((appointment) => ({
                id: appointment.Id,
                appointmentNumber: appointment.AppointmentNumber,
                status: appointment.Status,
                scheduledStartTime: appointment.SchedStartTime,
                scheduledEndTime: appointment.SchedEndTime,
                serviceTerritory:
                    appointment.ServiceTerritory?.Name || "Unassigned",
                location: {
                    street: appointment.Street,
                    city: appointment.City,
                    state: appointment.State,
                    postalCode: appointment.PostalCode,
                },
                description: appointment.Description,
                workTypeName: appointment.WorkType?.Name,
                workTypeId: appointment.WorkTypeId,
            }));
        } catch (error) {
            console.error("Error in getServiceAppointments:", {
                message: error.message,
                response: error.response?.data,
                statusCode: error.response?.status,
            });
            throw error;
        }
    }

    async getServiceTerritories(accessToken, instanceUrl) {
        if (!instanceUrl) {
            throw new Error(
                "Instance URL is required for getServiceTerritories"
            );
        }

        const workGroupTypes = await this.getWorkGroupTypes(
            accessToken,
            instanceUrl
        );

        if (!workGroupTypes?.length) {
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
            status: "Active",
        }));
    }

    async getWorkGroupTypes(accessToken, instanceUrl) {
        if (!instanceUrl) {
            throw new Error("Instance URL is required for getWorkGroupTypes");
        }

        const query = encodeURIComponent(
            "SELECT Id, Name, IsActive, GroupType FROM WorkTypeGroup WHERE IsActive = true ORDER BY Name DESC"
        );

        try {
            const response = await axios({
                method: "GET",
                url: `${instanceUrl}/services/data/v59.0/query/?q=${query}`,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            });

            return response.data.records.map((workGroup) => ({
                id: workGroup.Id,
                name: workGroup.Name,
                isActive: workGroup.IsActive,
                groupType: workGroup.GroupType || "Standard",
            }));
        } catch (error) {
            console.error("Error in getWorkGroupTypes:", error);
            throw error;
        }
    }

    async getAppointmentCandidates(accessToken, instanceUrl, params) {
        if (!instanceUrl) {
            throw new Error(
                "Instance URL is required for getAppointmentCandidates"
            );
        }

        try {
            const response = await axios({
                method: "POST",
                url: `${instanceUrl}/services/data/v59.0/scheduling/getAppointmentCandidates`,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                data: params,
            });

            if (
                !response?.data?.candidates ||
                !Array.isArray(response.data.candidates)
            ) {
                console.error("Unexpected response format:", response.data);
                return [];
            }

            return response.data.candidates.map((candidate) => ({
                startTime: candidate.startTime,
                endTime: candidate.endTime,
                territoryId: candidate.territoryId,
                resources: candidate.resources,
            }));
        } catch (error) {
            console.error("Error in getAppointmentCandidates:", error);
            throw error;
        }
    }

    async getBusinessHours(accessToken, instanceUrl, businessHoursId) {
        if (!instanceUrl) {
            throw new Error("Instance URL is required for getBusinessHours");
        }

        if (!businessHoursId) {
            throw new Error("Business Hours ID is required");
        }

        try {
            console.log("Fetching business hours with params:", {
                instanceUrl,
                hasAccessToken: !!accessToken,
                businessHoursId,
            });

            const query = encodeURIComponent(`
                SELECT 
                    Id, Name, TimeZoneSidKey,
                    MondayStartTime, MondayEndTime,
                    TuesdayStartTime, TuesdayEndTime,
                    WednesdayStartTime, WednesdayEndTime,
                    ThursdayStartTime, ThursdayEndTime,
                    FridayStartTime, FridayEndTime,
                    SaturdayStartTime, SaturdayEndTime,
                    SundayStartTime, SundayEndTime,
                    IsActive
                FROM BusinessHours 
                WHERE Id = '${businessHoursId}'
                AND IsActive = true
            `);

            console.log("Making query:", query);

            const response = await axios({
                method: "GET",
                url: `${instanceUrl}/services/data/v59.0/query/?q=${query}`,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            });

            console.log("Business hours response:", response.data);

            if (!response.data.records || response.data.records.length === 0) {
                throw new Error(
                    `No active business hours found for ID: ${businessHoursId}`
                );
            }

            return response.data.records[0];
        } catch (error) {
            console.error("Error fetching business hours:", {
                error,
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                config: error.config,
            });
            throw new Error(`Error fetching business hours: ${error.message}`);
        }
    }

    isWithinBusinessHours(businessHours, dateTime) {
        if (!businessHours || !dateTime) {
            return false;
        }

        const date = new Date(dateTime);
        const days = [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
        ];
        const day = days[date.getDay()];

        const startTimeField = `${day}StartTime`;
        const endTimeField = `${day}EndTime`;

        if (!businessHours[startTimeField] || !businessHours[endTimeField]) {
            return false;
        }

        // Convert the date to territory timezone for comparison
        const timeString = date.toLocaleTimeString("en-US", {
            hour12: false,
            timeZone: businessHours.TimeZoneSidKey,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });

        return (
            timeString >= businessHours[startTimeField] &&
            timeString <= businessHours[endTimeField]
        );
    }
}

module.exports = new SchedulerService();
