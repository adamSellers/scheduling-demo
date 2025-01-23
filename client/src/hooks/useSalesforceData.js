import { useState, useEffect } from "react";
import ApiService from "../services/api.service";
import Logger from "../utils/logger";

/**
 * Custom hook for fetching and managing Salesforce data
 * @param {Object} options - Hook options
 * @param {string} [options.customerId] - Optional customer ID to fetch customer-specific appointments
 * @param {boolean} [options.autoFetch=true] - Whether to fetch data automatically on mount
 * @returns {Object} Salesforce data and control functions
 */
export const useSalesforceData = (options = {}) => {
    const { customerId, autoFetch = true } = options;

    // State management
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState({
        territories: [],
        resources: [],
        appointments: [],
        workGroupTypes: [],
        customerAppointments: [],
    });

    /**
     * Main data fetching function
     */
    const fetchData = async () => {
        const fetchStartTime = performance.now();
        Logger.debug("useSalesforceData: Starting data fetch", {
            customerId,
            autoFetch,
            timestamp: new Date().toISOString(),
        });

        setLoading(true);
        setError(null);

        try {
            // Define base fetch promises
            const fetchPromises = [
                {
                    name: "workGroupTypes",
                    promise: ApiService.scheduler.getWorkGroupTypes(),
                },
                {
                    name: "territories",
                    promise: ApiService.scheduler.getTerritories(),
                },
                {
                    name: "resources",
                    promise: ApiService.scheduler.getResources(),
                },
                {
                    name: "appointments",
                    promise: ApiService.scheduler.getAppointments(),
                },
            ];

            // Add customer appointments fetch if customerId is provided
            if (customerId) {
                Logger.debug(
                    "useSalesforceData: Including customer appointments fetch",
                    { customerId }
                );
                fetchPromises.push({
                    name: "customerAppointments",
                    promise:
                        ApiService.scheduler.getCustomerAppointments(
                            customerId
                        ),
                });
            }

            // Execute all fetches in parallel and time them
            const results = await Promise.all(
                fetchPromises.map(async ({ name, promise }) => {
                    const startTime = performance.now();
                    try {
                        const result = await promise;
                        const duration = performance.now() - startTime;
                        Logger.debug(`useSalesforceData: Fetched ${name}`, {
                            duration: `${duration.toFixed(2)}ms`,
                            resultCount: Array.isArray(result)
                                ? result.length
                                : "N/A",
                        });
                        return result;
                    } catch (error) {
                        Logger.error(
                            `useSalesforceData: Error fetching ${name}`,
                            {
                                error,
                                duration: `${(
                                    performance.now() - startTime
                                ).toFixed(2)}ms`,
                            }
                        );
                        throw error;
                    }
                })
            );

            // Destructure results
            const [
                workGroupTypesData,
                territoriesData,
                resourcesData,
                appointmentsData,
                customerAppointmentsData,
            ] = results;

            // Validate data shapes
            const validations = [
                { name: "workGroupTypes", data: workGroupTypesData },
                { name: "territories", data: territoriesData },
                { name: "resources", data: resourcesData },
                { name: "appointments", data: appointmentsData },
            ];

            validations.forEach(({ name, data }) => {
                if (!Array.isArray(data)) {
                    Logger.warn(
                        `useSalesforceData: Invalid ${name} data shape`,
                        {
                            expectedType: "Array",
                            receivedType: typeof data,
                            value: data,
                        }
                    );
                }
            });

            // Update state with the fetched data
            setData({
                territories: territoriesData || [],
                workGroupTypes: workGroupTypesData || [],
                resources: resourcesData || [],
                appointments: appointmentsData || [],
                customerAppointments: customerAppointmentsData || [],
            });

            const totalDuration = performance.now() - fetchStartTime;
            Logger.debug("useSalesforceData: Successfully updated state", {
                duration: `${totalDuration.toFixed(2)}ms`,
                dataStats: {
                    territories: territoriesData?.length || 0,
                    workGroupTypes: workGroupTypesData?.length || 0,
                    resources: resourcesData?.length || 0,
                    appointments: appointmentsData?.length || 0,
                    customerAppointments: customerAppointmentsData?.length || 0,
                },
            });
        } catch (error) {
            const errorDuration = performance.now() - fetchStartTime;
            Logger.error("useSalesforceData: Failed to fetch data", {
                error: error.message,
                stack: error.stack,
                duration: `${errorDuration.toFixed(2)}ms`,
                customerId,
            });
            setError(error.message || "Failed to fetch Salesforce data");
        } finally {
            setLoading(false);
        }
    };

    // Initial data fetch on component mount if autoFetch is true
    useEffect(() => {
        if (autoFetch) {
            Logger.debug("useSalesforceData: Auto-fetching data", {
                customerId,
            });
            fetchData();
        }
    }, [autoFetch, customerId]); // Re-fetch when customerId changes

    // Return data and control functions
    return {
        // Data
        territories: data.territories,
        resources: data.resources,
        appointments: data.appointments,
        workGroupTypes: data.workGroupTypes,
        customerAppointments: data.customerAppointments,

        // Status
        loading,
        error,

        // Control functions
        refreshData: fetchData,
        clearError: () => {
            Logger.debug("useSalesforceData: Clearing error state");
            setError(null);
        },
    };
};

export default useSalesforceData;
