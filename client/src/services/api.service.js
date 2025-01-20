import axios from "axios";

class ApiService {
    static baseURL = import.meta.env.DEV ? "http://localhost:3000" : "";

    static async makeRequest(endpoint, method = "GET", data = null) {
        try {
            const config = {
                method,
                url: `${this.baseURL}${endpoint}`,
                headers: {
                    "Content-Type": "application/json",
                },
                withCredentials: true,
            };

            if (data && (method === "POST" || method === "PUT")) {
                config.data = data;
            }

            console.log(`Making ${method} request to ${endpoint}:`, { config });
            const response = await axios(config);
            console.log(`Response from ${endpoint}:`, response.data);

            return response.data;
        } catch (error) {
            console.error(`Error in ${method} request to ${endpoint}:`, {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
            });
            throw new Error(error.response?.data?.error || error.message);
        }
    }

    static scheduler = {
        getTerritories: async () => {
            return ApiService.makeRequest("/api/scheduler/territories");
        },

        getResources: async () => {
            return ApiService.makeRequest("/api/scheduler/resources");
        },

        getAppointments: async () => {
            return ApiService.makeRequest("/api/scheduler/appointments");
        },

        getWorkGroupTypes: async () => {
            return ApiService.makeRequest("/api/scheduler/work-type-groups");
        },

        getTimeSlots: async (operatingHoursId, workTypeGroupId = null) => {
            const endpoint = `/api/scheduler/time-slots/${operatingHoursId}${
                workTypeGroupId ? `?workTypeGroupId=${workTypeGroupId}` : ""
            }`;
            return ApiService.makeRequest(endpoint);
        },

        getAppointmentCandidates: async (params) => {
            return ApiService.makeRequest(
                "/api/scheduler/appointment-candidates",
                "POST",
                params
            );
        },

        createAppointment: async (appointmentData) => {
            return ApiService.makeRequest(
                "/api/scheduler/appointments",
                "POST",
                appointmentData
            );
        },
    };

    static customers = {
        getPersonAccounts: async () => {
            return ApiService.makeRequest("/api/customers/person-accounts");
        },

        searchPersonAccounts: async (query) => {
            return ApiService.makeRequest(
                `/api/customers/person-accounts/search?query=${encodeURIComponent(
                    query
                )}`
            );
        },
    };

    static profile = {
        getUserInfo: async () => {
            return ApiService.makeRequest("/auth/user-info");
        },
    };

    static auth = {
        login: async () => {
            window.location.href = `${ApiService.baseURL}/auth/salesforce`;
        },

        logout: async () => {
            window.location.href = `${ApiService.baseURL}/auth/logout`;
        },

        getUserInfo: async () => {
            return ApiService.makeRequest("/auth/user-info");
        },
    };
}

// For development environment hot reloading
if (import.meta.hot) {
    import.meta.hot.accept((newModule) => {
        console.log("ApiService module updated");
    });
}

export default ApiService;
