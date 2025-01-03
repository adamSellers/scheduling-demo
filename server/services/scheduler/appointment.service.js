class AppointmentService {
    constructor(apiUtil) {
        this.apiUtil = apiUtil;
    }

    async getServiceAppointments(accessToken, instanceUrl) {
        const query = `
            SELECT Id, AppointmentNumber, Status, SchedStartTime, SchedEndTime, 
            ServiceTerritoryId, ServiceTerritory.Name, Street, City, State, 
            PostalCode, Description, WorkType.Name, WorkTypeId 
            FROM ServiceAppointment 
            WHERE Status NOT IN ('Completed','Canceled') 
            ORDER BY SchedStartTime ASC
        `;

        const records = await this.apiUtil.querySalesforce(
            instanceUrl,
            accessToken,
            query
        );
        return records.map((appointment) => ({
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
    }

    async getAppointmentCandidates(accessToken, instanceUrl, params) {
        try {
            console.log("Getting appointment candidates with params:", params);

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

            console.log("Making request with payload:", requestPayload);

            const response = await this.apiUtil.makeApiRequest(
                instanceUrl,
                accessToken,
                "/getAppointmentCandidates",
                "POST",
                requestPayload,
                true // Use scheduling API
            );

            console.log("Appointment candidates response:", response);

            return response.candidates;
        } catch (error) {
            console.error("Error in getAppointmentCandidates:", error);
            throw error;
        }
    }

    async createServiceAppointment(accessToken, instanceUrl, appointmentData) {
        try {
            const query = `
                SELECT Id, ServiceTerritoryId 
                FROM ServiceResource 
                WHERE Id = '${appointmentData.resourceId}'
            `;

            const [resource] = await this.apiUtil.querySalesforce(
                instanceUrl,
                accessToken,
                query
            );

            if (!resource) {
                throw new Error("Service Resource not found");
            }

            // Format appointment creation payload
            const payload = {
                schedStartTime: appointmentData.startTime,
                schedEndTime: appointmentData.endTime,
                serviceTerritoryId: resource.ServiceTerritoryId,
                serviceResourceId: appointmentData.resourceId,
                accountId: appointmentData.accountId,
                workTypeId: appointmentData.workTypeId,
                status: "Scheduled",
            };

            const response = await this.apiUtil.makeApiRequest(
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
}

module.exports = AppointmentService;
