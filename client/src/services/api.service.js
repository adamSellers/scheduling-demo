import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:3000/api",
    withCredentials: true,
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
    },
});

// Response interceptor
api.interceptors.response.use(
    (response) => {
        console.log("API Response:", {
            url: response.config.url,
            responseData: response.data,
        });
        return response.data;
    },
    (error) => {
        console.error("API Error:", {
            url: error.config?.url,
            message: error.message,
            response: error.response?.data,
        });
        if (error.response?.status === 401) {
            window.location.href = "/";
            return Promise.reject(new Error("Session expired"));
        }
        return Promise.reject(
            new Error(
                error.response?.data?.error || "Unable to connect to server"
            )
        );
    }
);

const ApiService = {
    scheduler: {
        getTerritories: async () => {
            console.log("Calling getTerritories API");
            const territories = await api.get("/scheduler/territories");
            console.log("Territories API response:", territories);
            return territories;
        },
        getWorkGroupTypes: async () => {
            console.log("Calling getWorkGroupTypes API");
            const workGroupTypes = await api.get("/scheduler/work-type-groups");
            console.log("Work group types API response:", workGroupTypes);
            return workGroupTypes;
        },
        getResources: async () => {
            console.log("Calling getResources API");
            const resources = await api.get("/scheduler/resources");
            console.log("Resources API response:", resources);
            return resources;
        },
        getAppointments: async () => {
            console.log("Calling getAppointments API");
            const appointments = await api.get("/scheduler/appointments");
            console.log("Appointments API response:", appointments);
            return appointments;
        },
        getAppointmentCandidates: async (params) => {
            console.log(
                "Calling getAppointmentCandidates API with params:",
                params
            );
            const candidates = await api.post(
                "/scheduler/appointment-candidates",
                params
            );
            console.log("Appointment candidates API response:", candidates);
            return candidates;
        },
        getTimeSlots: async (operatingHoursId, workTypeGroupId = null) => {
            console.log(
                "Fetching time slots for operating hours:",
                operatingHoursId
            );
            const params = workTypeGroupId ? { workTypeGroupId } : {};
            const response = await api.get(
                `/scheduler/time-slots/${operatingHoursId}`,
                { params }
            );
            console.log("Time slots API response:", response);
            return response;
        },
    },
    customers: {
        getPersonAccounts: async () => {
            console.log("Fetching person accounts");
            const response = await api.get("/customers/person-accounts");
            console.log("Person accounts response:", response);
            return response;
        },
    },
};

export default ApiService;
