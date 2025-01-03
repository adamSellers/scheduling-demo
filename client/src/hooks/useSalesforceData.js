import { useState, useEffect } from "react";
import ApiService from "../services/api.service";

export const useSalesforceData = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState({
        territories: [],
        resources: [],
        appointments: [],
        workGroupTypes: [],
    });

    const fetchData = async () => {
        setLoading(true);
        setError(null);

        try {
            console.log("Starting to fetch data in useSalesforceData...");

            // Fetch all data in parallel for better performance
            const [
                workGroupTypesData,
                territoriesData,
                resourcesData,
                appointmentsData,
            ] = await Promise.all([
                ApiService.scheduler.getWorkGroupTypes(),
                ApiService.scheduler.getTerritories(),
                ApiService.scheduler.getResources(),
                ApiService.scheduler.getAppointments(),
            ]);

            // Log the results for debugging
            console.log("Work group types fetch result:", workGroupTypesData);
            console.log("Territories fetch result:", territoriesData);
            console.log("Resources fetch result:", resourcesData);
            console.log("Appointments fetch result:", appointmentsData);

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

            // Update state with the fetched data
            setData({
                territories: territoriesData || [],
                workGroupTypes: workGroupTypesData || [],
                resources: resourcesData || [],
                appointments: appointmentsData || [],
            });

            console.log("Successfully updated Salesforce data state");
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

    // Initial data fetch on component mount
    useEffect(() => {
        fetchData();
    }, []);

    // Expose data and control functions
    return {
        territories: data.territories,
        resources: data.resources,
        appointments: data.appointments,
        workGroupTypes: data.workGroupTypes,
        loading,
        error,
        refreshData: fetchData,
        clearError: () => setError(null),
    };
};

export default useSalesforceData;
