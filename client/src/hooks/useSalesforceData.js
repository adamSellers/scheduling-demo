import { useState, useEffect } from "react";
import ApiService from "../services/api.service";

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
        setLoading(true);
        setError(null);

        try {
            console.log("Starting to fetch Salesforce data...", {
                hasCustomerId: !!customerId,
            });

            // Define base fetch promises
            const fetchPromises = [
                ApiService.scheduler.getWorkGroupTypes(),
                ApiService.scheduler.getTerritories(),
                ApiService.scheduler.getResources(),
                ApiService.scheduler.getAppointments(),
            ];

            // Add customer appointments fetch if customerId is provided
            if (customerId) {
                console.log(
                    "Including customer appointments fetch for ID:",
                    customerId
                );
                fetchPromises.push(
                    ApiService.scheduler.getCustomerAppointments(customerId)
                );
            }

            // Execute all fetches in parallel
            const results = await Promise.all(fetchPromises);
            const [
                workGroupTypesData,
                territoriesData,
                resourcesData,
                appointmentsData,
                customerAppointmentsData,
            ] = results;

            // Log the results for debugging
            console.log("Work group types fetch result:", workGroupTypesData);
            console.log("Territories fetch result:", territoriesData);
            console.log("Resources fetch result:", resourcesData);
            console.log("Appointments fetch result:", appointmentsData);
            if (customerAppointmentsData) {
                console.log(
                    "Customer appointments fetch result:",
                    customerAppointmentsData
                );
            }

            // Validate the data
            if (!Array.isArray(workGroupTypesData)) {
                console.warn(
                    "Work group types data is not an array:",
                    workGroupTypesData
                );
            }
            if (!Array.isArray(territoriesData)) {
                console.warn(
                    "Territories data is not an array:",
                    territoriesData
                );
            }
            if (!Array.isArray(resourcesData)) {
                console.warn("Resources data is not an array:", resourcesData);
            }
            if (!Array.isArray(appointmentsData)) {
                console.warn(
                    "Appointments data is not an array:",
                    appointmentsData
                );
            }
            if (customerId && !Array.isArray(customerAppointmentsData)) {
                console.warn(
                    "Customer appointments data is not an array:",
                    customerAppointmentsData
                );
            }

            // Update state with the fetched data
            setData({
                territories: territoriesData || [],
                workGroupTypes: workGroupTypesData || [],
                resources: resourcesData || [],
                appointments: appointmentsData || [],
                customerAppointments: customerAppointmentsData || [],
            });

            console.log("Successfully updated Salesforce data state", {
                hasCustomerAppointments: !!customerAppointmentsData?.length,
            });
        } catch (error) {
            console.error("Error fetching Salesforce data:", {
                message: error.message,
                stack: error.stack,
                response: error.response?.data,
            });
            setError(error.message || "Failed to fetch Salesforce data");
        } finally {
            setLoading(false);
        }
    };

    // Initial data fetch on component mount if autoFetch is true
    useEffect(() => {
        if (autoFetch) {
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
        clearError: () => setError(null),
    };
};

export default useSalesforceData;
