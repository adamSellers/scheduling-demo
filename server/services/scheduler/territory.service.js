class TerritoryService {
    constructor(apiUtil) {
        this.apiUtil = apiUtil;
    }

    async getServiceTerritories(accessToken, instanceUrl, workGroupTypes) {
        if (!workGroupTypes?.length) return [];

        const startDate = new Date().toISOString();
        const endDate = new Date(
            Date.now() + 24 * 60 * 60 * 1000
        ).toISOString();

        const territoriesPromises = workGroupTypes.map(async (workGroup) => {
            try {
                const response = await this.apiUtil.makeApiRequest(
                    instanceUrl,
                    accessToken,
                    "/service-territories",
                    "GET",
                    {
                        territoryOption: "All",
                        scheduleStartDate: startDate,
                        scheduleEndDate: endDate,
                        workTypeGroupId: workGroup.id,
                    }
                );
                return response.result.serviceTerritories;
            } catch (error) {
                console.error(
                    `Error fetching territories for work group ${workGroup.id}:`,
                    error
                );
                return [];
            }
        });

        const allTerritories = await Promise.all(territoriesPromises);
        const uniqueTerritories = Array.from(
            new Map(
                allTerritories
                    .flat()
                    .map((territory) => [territory.id, territory])
            ).values()
        );

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
}
