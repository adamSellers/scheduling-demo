class ResourceService {
    constructor(apiUtil) {
        this.apiUtil = apiUtil;
    }

    async getServiceResources(accessToken, instanceUrl) {
        const query = `
					SELECT Id, Name, RelatedRecordId, ResourceType, IsActive, Description 
					FROM ServiceResource 
					WHERE IsActive = true 
					ORDER BY Name ASC
			`;

        const records = await this.apiUtil.querySalesforce(
            instanceUrl,
            accessToken,
            query
        );
        return records.map((resource) => ({
            id: resource.Id,
            name: resource.Name,
            relatedRecordId: resource.RelatedRecordId,
            type: resource.ResourceType === "T" ? "CA" : resource.ResourceType,
            isActive: resource.IsActive,
            description: resource.Description,
        }));
    }
}
