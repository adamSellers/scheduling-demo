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

            // Fetch work group types
            const workGroupTypesData =
                await ApiService.scheduler.getWorkGroupTypes();
            console.log("Work group types fetch result:", workGroupTypesData);

            // Fetch territories
            const territoriesData = await ApiService.scheduler.getTerritories();
            console.log("Territories fetch result:", territoriesData);

            setData((prevData) => ({
                ...prevData,
                territories: territoriesData || [],
                workGroupTypes: workGroupTypesData || [],
                // Leave resources and appointments as empty arrays for now
            }));
        } catch (error) {
            console.error("Error fetching Salesforce data:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return {
        ...data,
        loading,
        error,
        refreshData: fetchData,
        clearError: () => setError(null),
    };
};
