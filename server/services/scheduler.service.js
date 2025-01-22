const axios = require("axios");

function SchedulerService() {}

SchedulerService.prototype.makeApiRequest = function (
    instanceUrl,
    accessToken,
    endpoint,
    method,
    params,
    isSchedulingApi
) {
    method = method || "GET";
    params = params || {};
    isSchedulingApi = isSchedulingApi !== false;

    if (!instanceUrl) {
        throw new Error("Instance URL is required for API request");
    }

    var apiPath = isSchedulingApi ? "connect/scheduling" : "scheduling";
    var url = instanceUrl + "/services/data/v59.0/" + apiPath + endpoint;

    var config = {
        method: method,
        url: url,
        headers: {
            Authorization: "Bearer " + accessToken,
            "Content-Type": "application/json",
        },
    };

    if (method === "GET") {
        config.params = params;
    } else {
        config.data = params;
    }

    console.log("Making scheduler API request:", {
        url: config.url,
        method: config.method,
        params: config.params,
        data: config.data,
    });

    return axios(config)
        .then(function (response) {
            console.log("Scheduler API response:", {
                status: response.status,
                data: response.data,
            });
            return response.data;
        })
        .catch(function (error) {
            console.error("Error in makeApiRequest:", {
                endpoint: endpoint,
                error: error.message,
                response: error.response && error.response.data,
            });
            throw error;
        });
};

SchedulerService.prototype.getServiceResources = async function (
    accessToken,
    instanceUrl
) {
    if (!instanceUrl) {
        return Promise.reject(
            new Error("Instance URL is required for getServiceResources")
        );
    }

    var query = encodeURIComponent(
        "SELECT Id, Name, RelatedRecordId, ResourceType, IsActive, " +
            "RelatedRecord.FirstName, RelatedRecord.LastName, " +
            "RelatedRecord.Email, RelatedRecord.Title, " +
            "RelatedRecord.LanguageLocaleKey, " +
            "RelatedRecord.SmallPhotoUrl, " +
            "Description " +
            "FROM ServiceResource " +
            "WHERE IsActive = true " +
            "ORDER BY Name ASC"
    );

    return axios({
        method: "GET",
        url: instanceUrl + "/services/data/v59.0/query/?q=" + query,
        headers: {
            Authorization: "Bearer " + accessToken,
            "Content-Type": "application/json",
        },
    })
        .then(function (response) {
            return response.data.records.map(function (resource) {
                return {
                    id: resource.Id,
                    name: resource.Name,
                    relatedRecordId: resource.RelatedRecordId,
                    type:
                        resource.ResourceType === "T"
                            ? "CA"
                            : resource.ResourceType,
                    isActive: resource.IsActive,
                    description: resource.Description,
                    firstName: resource.RelatedRecord
                        ? resource.RelatedRecord.FirstName
                        : "",
                    lastName: resource.RelatedRecord
                        ? resource.RelatedRecord.LastName
                        : "",
                    email: resource.RelatedRecord
                        ? resource.RelatedRecord.Email
                        : "",
                    title: resource.RelatedRecord
                        ? resource.RelatedRecord.Title
                        : "",
                    language: resource.RelatedRecord
                        ? resource.RelatedRecord.LanguageLocaleKey
                        : "",
                    photoUrl: resource.RelatedRecord
                        ? resource.RelatedRecord.SmallPhotoUrl
                        : "",
                };
            });
        })
        .catch(function (error) {
            console.error("Error fetching service resources:", error);
            throw error;
        });
};

SchedulerService.prototype.getServiceAppointments = function (
    accessToken,
    instanceUrl
) {
    if (!instanceUrl) {
        return Promise.reject(
            new Error("Instance URL is required for getServiceAppointments")
        );
    }

    // Construct the SOQL query
    var query = encodeURIComponent(
        "SELECT Id, AppointmentNumber, Status, SchedStartTime, SchedEndTime, " +
            "ServiceTerritoryId, ServiceTerritory.Name, Street, City, State, " +
            "PostalCode, Description, WorkType.Name, WorkTypeId, " +
            "AccountId, Account.Name, " +
            "(SELECT ServiceResourceId, ServiceResource.Name FROM AssignedResources " +
            "WHERE ServiceResource.IsActive = true) " +
            "FROM ServiceAppointment " +
            "WHERE Status NOT IN ('Completed','Canceled') " +
            "ORDER BY SchedStartTime ASC"
    );

    console.log("Executing SOQL Query:", decodeURIComponent(query));

    return axios({
        method: "GET",
        url: instanceUrl + "/services/data/v59.0/query/?q=" + query,
        headers: {
            Authorization: "Bearer " + accessToken,
            "Content-Type": "application/json",
        },
    })
        .then(function (response) {
            console.log("Raw Salesforce Response:", {
                totalSize: response.data.totalSize,
                done: response.data.done,
                sampleRecord: response.data.records[0],
            });

            return response.data.records.map(function (appointment) {
                // Get the primary assigned resource if available
                const assignedResource =
                    appointment.AssignedResources?.records?.[0];

                return {
                    id: appointment.Id,
                    appointmentNumber: appointment.AppointmentNumber,
                    status: appointment.Status,
                    scheduledStartTime: appointment.SchedStartTime,
                    scheduledEndTime: appointment.SchedEndTime,
                    serviceTerritory: appointment.ServiceTerritory
                        ? appointment.ServiceTerritory.Name
                        : "Unassigned",
                    location: {
                        street: appointment.Street,
                        city: appointment.City,
                        state: appointment.State,
                        postalCode: appointment.PostalCode,
                    },
                    description: appointment.Description,
                    workTypeName: appointment.WorkType
                        ? appointment.WorkType.Name
                        : null,
                    workTypeId: appointment.WorkTypeId,

                    // Customer relationship fields
                    accountId: appointment.AccountId,
                    accountName: appointment.Account?.Name,

                    // Service Resource fields
                    serviceResourceId:
                        assignedResource?.ServiceResourceId || null,
                    serviceResourceName:
                        assignedResource?.ServiceResource?.Name || null,

                    // Raw data for debugging
                    _raw: {
                        hasAccount: !!appointment.Account,
                        hasAssignedResources:
                            appointment.AssignedResources?.records?.length > 0,
                    },
                };
            });
        })
        .catch(function (error) {
            console.error("Error in getServiceAppointments:", {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                query: decodeURIComponent(query),
            });
            throw error;
        });
};

//service to get service appointments that are assigned to customers
SchedulerService.prototype.getCustomerAppointments = function (
    accessToken,
    instanceUrl,
    accountId
) {
    if (!instanceUrl) {
        return Promise.reject(
            new Error("Instance URL is required for getCustomerAppointments")
        );
    }

    if (!accountId) {
        return Promise.reject(
            new Error("AccountId is required for getCustomerAppointments")
        );
    }

    var query = encodeURIComponent(
        "SELECT Id, " +
            "ServiceAppointment.AccountId, " +
            "ServiceAppointment.AppointmentNumber, " +
            "ServiceAppointment.SchedStartTime, " +
            "ServiceAppointment.Status, " +
            "ServiceAppointment.ServiceTerritoryId, " +
            "ServiceAppointment.WorkType.Name, " +
            "ServiceResource.Name " +
            "FROM AssignedResource " +
            "WHERE ServiceAppointment.AccountId = '" +
            accountId +
            "' " +
            "ORDER BY ServiceAppointment.SchedStartTime ASC"
    );

    return axios({
        method: "GET",
        url: instanceUrl + "/services/data/v59.0/query/?q=" + query,
        headers: {
            Authorization: "Bearer " + accessToken,
            "Content-Type": "application/json",
        },
    })
        .then(function (response) {
            return response.data.records.map(function (record) {
                return {
                    id: record.Id,
                    appointmentNumber:
                        record.ServiceAppointment.AppointmentNumber,
                    scheduledStartTime:
                        record.ServiceAppointment.SchedStartTime,
                    status: record.ServiceAppointment.Status,
                    serviceTerritoryId:
                        record.ServiceAppointment.ServiceTerritoryId,
                    workTypeName: record.ServiceAppointment.WorkType.Name,
                    serviceResourceName: record.ServiceResource.Name,
                };
            });
        })
        .catch(function (error) {
            console.error("Error in getCustomerAppointments:", error);
            throw error;
        });
};
SchedulerService.prototype.getCustomerAppointments = function (
    accessToken,
    instanceUrl,
    accountId
) {
    if (!instanceUrl) {
        return Promise.reject(
            new Error("Instance URL is required for getCustomerAppointments")
        );
    }

    if (!accountId) {
        return Promise.reject(
            new Error("AccountId is required for getCustomerAppointments")
        );
    }

    var query = encodeURIComponent(
        "SELECT Id, " +
            "ServiceAppointment.AccountId, " +
            "ServiceAppointment.AppointmentNumber, " +
            "ServiceAppointment.SchedStartTime, " +
            "ServiceAppointment.SchedEndTime, " +
            "ServiceAppointment.Status, " +
            "ServiceAppointment.ServiceTerritoryId, " +
            "ServiceResource.Name " +
            "FROM AssignedResource " +
            "WHERE ServiceAppointment.AccountId = '" +
            accountId +
            "' " +
            "AND ServiceAppointment.Status NOT IN ('Completed','Canceled') " +
            "ORDER BY ServiceAppointment.SchedStartTime ASC"
    );

    console.log(
        "Executing customer appointments query:",
        decodeURIComponent(query)
    );

    return axios({
        method: "GET",
        url: instanceUrl + "/services/data/v59.0/query/?q=" + query,
        headers: {
            Authorization: "Bearer " + accessToken,
            "Content-Type": "application/json",
        },
    })
        .then(function (response) {
            console.log("Customer appointments response:", {
                totalSize: response.data.totalSize,
                done: response.data.done,
            });

            return response.data.records.map(function (assignedResource) {
                return {
                    id: assignedResource.ServiceAppointment.Id,
                    appointmentNumber:
                        assignedResource.ServiceAppointment.AppointmentNumber,
                    scheduledStartTime:
                        assignedResource.ServiceAppointment.SchedStartTime,
                    scheduledEndTime:
                        assignedResource.ServiceAppointment.SchedEndTime,
                    status: assignedResource.ServiceAppointment.Status,
                    serviceTerritoryId:
                        assignedResource.ServiceAppointment.ServiceTerritoryId,
                    serviceResourceName: assignedResource.ServiceResource.Name,
                };
            });
        })
        .catch(function (error) {
            console.error("Error in getCustomerAppointments:", {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                query: decodeURIComponent(query),
            });
            throw error;
        });
};

SchedulerService.prototype.getWorkGroupTypes = async function (
    accessToken,
    instanceUrl
) {
    if (!instanceUrl) {
        throw new Error("Instance URL is required for getWorkGroupTypes");
    }

    try {
        // First, get all work type groups with their associated work types
        const groupQuery = encodeURIComponent(`
            SELECT Id, Name, IsActive, GroupType,
                (SELECT WorkType.Id, WorkType.Name, WorkType.EstimatedDuration, 
                        WorkType.DurationType, WorkType.DurationInMinutes
                 FROM WorkTypeGroupMembers)
            FROM WorkTypeGroup 
            WHERE IsActive = true 
            ORDER BY Name ASC
        `);

        console.log(
            "Making work type groups query:",
            decodeURIComponent(groupQuery)
        );

        const response = await axios({
            method: "GET",
            url: `${instanceUrl}/services/data/v59.0/query/?q=${groupQuery}`,
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
        });

        console.log("Work type groups response:", response.data);

        return response.data.records.map((group) => ({
            id: group.Id,
            name: group.Name,
            isActive: group.IsActive,
            groupType: group.GroupType || "Standard",
            workTypes: (group.WorkTypeGroupMembers?.records || []).map(
                (member) => ({
                    id: member.WorkType.Id,
                    name: member.WorkType.Name,
                    estimatedDuration:
                        member.WorkType.EstimatedDuration ||
                        member.WorkType.DurationInMinutes ||
                        30,
                    durationType: member.WorkType.DurationType || "Minutes",
                })
            ),
        }));
    } catch (error) {
        console.error("Error in getWorkGroupTypes:", error);
        throw error;
    }
};

SchedulerService.prototype.getServiceTerritories = function (
    accessToken,
    instanceUrl
) {
    var self = this;

    if (!instanceUrl) {
        return Promise.reject(
            new Error("Instance URL is required for getServiceTerritories")
        );
    }

    return this.getWorkGroupTypes(accessToken, instanceUrl).then(function (
        workGroupTypes
    ) {
        if (!workGroupTypes || !workGroupTypes.length) {
            return [];
        }

        // Setup date parameters
        var startDate = new Date().toISOString();
        var endDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

        // Fetch territories for each work type group
        var territoriesPromises = workGroupTypes.map(function (workGroup) {
            return axios({
                method: "GET",
                url:
                    instanceUrl +
                    "/services/data/v59.0/connect/scheduling/service-territories",
                headers: {
                    Authorization: "Bearer " + accessToken,
                    "Content-Type": "application/json",
                },
                params: {
                    territoryOption: "All",
                    scheduleStartDate: startDate,
                    scheduleEndDate: endDate,
                    workTypeGroupId: workGroup.id,
                },
            })
                .then(function (response) {
                    return response.data.result.serviceTerritories;
                })
                .catch(function (error) {
                    console.error(
                        "Error fetching territories for work group " +
                            workGroup.id +
                            ":",
                        error
                    );
                    return [];
                });
        });

        return Promise.all(territoriesPromises).then(function (allTerritories) {
            // Flatten and remove duplicates based on territory ID
            var uniqueTerritoriesMap = {};
            allTerritories.flat().forEach(function (territory) {
                if (territory.id) {
                    uniqueTerritoriesMap[territory.id] = territory;
                }
            });

            return Object.values(uniqueTerritoriesMap).map(function (
                territory
            ) {
                return {
                    id: territory.id,
                    name: territory.name,
                    operatingHours:
                        territory.operatingHoursId || "Default Hours",
                    address: [territory.street, territory.city, territory.state]
                        .filter(function (part) {
                            return part;
                        })
                        .join(", "),
                    status: "Active",
                };
            });
        });
    });
};

SchedulerService.prototype.getAppointmentCandidates = function (
    accessToken,
    instanceUrl,
    params
) {
    if (!instanceUrl) {
        return Promise.reject(
            new Error("Instance URL is required for getAppointmentCandidates")
        );
    }

    return axios({
        method: "POST",
        url:
            instanceUrl +
            "/services/data/v59.0/scheduling/getAppointmentCandidates",
        headers: {
            Authorization: "Bearer " + accessToken,
            "Content-Type": "application/json",
        },
        data: params,
    })
        .then(function (response) {
            if (
                !response.data.candidates ||
                !Array.isArray(response.data.candidates)
            ) {
                console.error("Unexpected response format:", response.data);
                return [];
            }

            return response.data.candidates.map(function (candidate) {
                return {
                    startTime: candidate.startTime,
                    endTime: candidate.endTime,
                    territoryId: candidate.territoryId,
                    resources: candidate.resources,
                };
            });
        })
        .catch(function (error) {
            console.error("Error in getAppointmentCandidates:", error);
            throw error;
        });
};

SchedulerService.prototype.createServiceAppointment = function (
    accessToken,
    instanceUrl,
    appointmentData
) {
    if (!instanceUrl) {
        return Promise.reject(
            new Error("Instance URL is required for createServiceAppointment")
        );
    }

    return this.makeApiRequest(
        instanceUrl,
        accessToken,
        "/service-appointments",
        "POST",
        appointmentData,
        true
    );
};

module.exports = new SchedulerService();
