import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:3000/api",
    withCredentials: true,
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
    },
});

// Response interceptor for global error handling and response transformation
api.interceptors.response.use(
    (response) => {
        console.log("API Response:", {
            url: response.config.url,
            method: response.config.method,
            status: response.status,
            responseData: response.data,
        });
        return response.data;
    },
    (error) => {
        console.error("API Error:", {
            url: error.config?.url,
            method: error.config?.method,
            message: error.message,
            status: error.response?.status,
            response: error.response?.data,
        });

        // Handle session expiration
        if (error.response?.status === 401) {
            window.location.href = "/";
            return Promise.reject(new Error("Session expired"));
        }

        // Return a standardized error message
        return Promise.reject(
            new Error(
                error.response?.data?.error ||
                    error.response?.data?.message ||
                    "Unable to connect to server"
            )
        );
    }
);

const ApiService = {
    scheduler: {
        getTerritories: async () => {
            console.log("Fetching territories");
            try {
                const territories = await api.get("/scheduler/territories");
                console.log("Territories response:", territories);
                return territories;
            } catch (error) {
                console.error("Error fetching territories:", error);
                throw error;
            }
        },

        getWorkGroupTypes: async () => {
            console.log("Fetching work group types");
            try {
                const workGroupTypes = await api.get(
                    "/scheduler/work-type-groups"
                );
                console.log("Work group types response:", workGroupTypes);
                return workGroupTypes;
            } catch (error) {
                console.error("Error fetching work group types:", error);
                throw error;
            }
        },

        getResources: async () => {
            console.log("Fetching service resources");
            try {
                const resources = await api.get("/scheduler/resources");
                console.log("Resources response with user data:", resources);
                return resources;
            } catch (error) {
                console.error("Error fetching resources:", error);
                throw error;
            }
        },

        getAppointments: async () => {
            console.log("Fetching appointments");
            try {
                const appointments = await api.get("/scheduler/appointments");
                console.log("Appointments response:", appointments);
                return appointments;
            } catch (error) {
                console.error("Error fetching appointments:", error);
                throw error;
            }
        },

        getAppointmentCandidates: async (params) => {
            console.log("Fetching appointment candidates with params:", params);
            try {
                const candidates = await api.post(
                    "/scheduler/appointment-candidates",
                    params
                );
                console.log("Appointment candidates response:", candidates);
                return candidates;
            } catch (error) {
                console.error("Error fetching appointment candidates:", error);
                throw error;
            }
        },

        getTimeSlots: async (operatingHoursId, workTypeGroupId = null) => {
            console.log("Fetching time slots for:", {
                operatingHoursId,
                workTypeGroupId,
            });
            try {
                const params = workTypeGroupId ? { workTypeGroupId } : {};
                const response = await api.get(
                    `/scheduler/time-slots/${operatingHoursId}`,
                    { params }
                );
                console.log("Time slots response:", response);
                return response;
            } catch (error) {
                console.error("Error fetching time slots:", error);
                throw error;
            }
        },

        createAppointment: async (appointmentData) => {
            console.log("Creating appointment with data:", appointmentData);
            try {
                const response = await api.post(
                    "/scheduler/appointments",
                    appointmentData
                );
                console.log("Create appointment response:", response);
                return response;
            } catch (error) {
                console.error("Error creating appointment:", error);
                throw error;
            }
        },
    },

    customers: {
        getPersonAccounts: async () => {
            console.log("Fetching person accounts");
            try {
                const response = await api.get("/customers/person-accounts");
                console.log("Person accounts response:", response);
                return response;
            } catch (error) {
                console.error("Error fetching person accounts:", error);
                throw error;
            }
        },

        searchPersonAccounts: async (query) => {
            console.log("Searching person accounts with query:", query);
            try {
                const response = await api.get(
                    "/customers/person-accounts/search",
                    {
                        params: { query },
                    }
                );
                console.log("Person accounts search response:", response);
                return response;
            } catch (error) {
                console.error("Error searching person accounts:", error);
                throw error;
            }
        },
    },

    auth: {
        getUserInfo: async () => {
            console.log("Fetching user info");
            try {
                const response = await axios.get(
                    "http://localhost:3000/auth/user-info",
                    { withCredentials: true }
                );
                console.log("User info response:", response.data);
                return response.data;
            } catch (error) {
                console.error("Error fetching user info:", error);
                throw error;
            }
        },

        logout: async () => {
            console.log("Initiating logout");
            try {
                await axios.get("http://localhost:3000/auth/logout", {
                    withCredentials: true,
                });
                window.location.href = "/";
            } catch (error) {
                console.error("Error during logout:", error);
                throw error;
            }
        },
    },
};

export default ApiService;
