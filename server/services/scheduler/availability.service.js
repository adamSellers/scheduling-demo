class AvailabilityService {
    constructor(apiUtil) {
        this.apiUtil = apiUtil;
    }

    async getTimeSlots(
        accessToken,
        instanceUrl,
        operatingHoursId,
        workTypeGroupId = null
    ) {
        let query = `
					SELECT Id, TimeSlotNumber, StartTime, EndTime, 
					DayOfWeek, Type, MaxAppointments, WorkTypeGroupId
					FROM TimeSlot 
					WHERE OperatingHoursId = '${operatingHoursId}'
			`;

        if (workTypeGroupId) {
            query += ` AND (WorkTypeGroupId = '${workTypeGroupId}' OR WorkTypeGroupId = null)`;
        }

        const records = await this.apiUtil.querySalesforce(
            instanceUrl,
            accessToken,
            query
        );
        return records.map((slot) => ({
            id: slot.Id,
            name: slot.TimeSlotNumber,
            startTime: slot.StartTime,
            endTime: slot.EndTime,
            dayOfWeek: slot.DayOfWeek,
            type: slot.Type,
            maxAppointments: slot.MaxAppointments,
            workTypeGroupId: slot.WorkTypeGroupId,
        }));
    }

    async getWorkGroupTypes(accessToken, instanceUrl) {
        const query = `
					SELECT Id, Name, IsActive, GroupType 
					FROM WorkTypeGroup 
					WHERE IsActive = true 
					ORDER BY Name DESC
			`;

        const records = await this.apiUtil.querySalesforce(
            instanceUrl,
            accessToken,
            query
        );
        return records.map((workGroup) => ({
            id: workGroup.Id,
            name: workGroup.Name,
            isActive: workGroup.IsActive,
            groupType: workGroup.GroupType || "Standard",
        }));
    }
}
