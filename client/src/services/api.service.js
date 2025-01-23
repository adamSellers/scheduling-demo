import axios from "axios";
import Logger from "../utils/logger";

class ApiService {
    static baseURL = import.meta.env.DEV ? "http://localhost:3000" : "";

    static handleAuthError() {
        Logger.info("Auth error detected, redirecting to login");
        const loginPath = "/";
        if (window.location.pathname !== loginPath) {
            window.location.href = loginPath;
        }
    }

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

            Logger.logApiRequest(method, endpoint, config);
            const response = await axios(config);
            Logger.logApiResponse(endpoint, response.data);

            return response.data;
        } catch (error) {
            Logger.logApiError(endpoint, error);

            if (error.response?.status === 401) {
                ApiService.handleAuthError();
                throw new Error("Authentication expired. Please log in again.");
            }

            throw new Error(error.response?.data?.error || error.message);
        }
    }

    static scheduler = {
        getTerritories: async () => {
            Logger.debug("Fetching territories");
            return ApiService.makeRequest("/api/scheduler/territories");
        },

        getResources: async () => {
            Logger.debug("Fetching resources");
            return ApiService.makeRequest("/api/scheduler/resources");
        },

        getAppointments: async () => {
            Logger.debug("Fetching appointments");
            return ApiService.makeRequest("/api/scheduler/appointments");
        },

        getCustomerAppointments: async (accountId) => {
            Logger.debug("Fetching customer appointments", { accountId });
            return ApiService.makeRequest(
                `/api/scheduler/appointments/customer/${accountId}`
            );
        },

        getWorkGroupTypes: async () => {
            Logger.debug("Fetching work group types");
            return ApiService.makeRequest("/api/scheduler/work-type-groups");
        },

        getTimeSlots: async (operatingHoursId, workTypeGroupId = null) => {
            Logger.debug("Fetching time slots", {
                operatingHoursId,
                workTypeGroupId,
            });
            const endpoint = `/api/scheduler/time-slots/${operatingHoursId}${
                workTypeGroupId ? `?workTypeGroupId=${workTypeGroupId}` : ""
            }`;
            return ApiService.makeRequest(endpoint);
        },

        getAppointmentCandidates: async (params) => {
            Logger.debug("Fetching appointment candidates", { params });
            return ApiService.makeRequest(
                "/api/scheduler/appointment-candidates",
                "POST",
                params
            );
        },

        createAppointment: async (appointmentData) => {
            Logger.debug("Creating appointment", { appointmentData });
            return ApiService.makeRequest(
                "/api/scheduler/appointments",
                "POST",
                appointmentData
            );
        },
    };

    static customers = {
        getPersonAccounts: async () => {
            Logger.debug("Fetching person accounts");
            return ApiService.makeRequest("/api/customers/person-accounts");
        },

        searchPersonAccounts: async (query) => {
            Logger.debug("Searching person accounts", { query });
            return ApiService.makeRequest(
                `/api/customers/person-accounts/search?query=${encodeURIComponent(
                    query
                )}`
            );
        },

        getCustomerPhoto: async (personAccountId) => {
            Logger.debug("Fetching customer photo", { personAccountId });
            try {
                const response = await axios({
                    method: "GET",
                    url: `${ApiService.baseURL}/api/customers/photo/${personAccountId}`,
                    responseType: "blob",
                    withCredentials: true,
                    headers: {
                        Accept: "image/png,image/jpeg,image/jpg",
                        "Cache-Control": "no-cache",
                        Pragma: "no-cache",
                    },
                });

                if (response.data) {
                    const blob = new Blob([response.data], {
                        type: response.headers["content-type"],
                    });
                    return URL.createObjectURL(blob);
                }
                Logger.warn("No photo data received for customer", {
                    personAccountId,
                });
                return null;
            } catch (error) {
                if (error.response?.status === 401) {
                    ApiService.handleAuthError();
                }
                Logger.error("Error fetching customer photo:", error);
                return null;
            }
        },
    };

    static profile = {
        getUserInfo: async () => {
            Logger.debug("Fetching user info");
            return ApiService.makeRequest("/auth/user-info");
        },
    };

    static auth = {
        login: async () => {
            Logger.info("Initiating Salesforce login");
            window.location.href = `${ApiService.baseURL}/auth/salesforce`;
        },

        logout: async () => {
            Logger.info("Logging out user");
            window.location.href = `${ApiService.baseURL}/auth/logout`;
        },

        getUserInfo: async () => {
            Logger.debug("Fetching auth user info");
            return ApiService.makeRequest("/auth/user-info");
        },
    };
}

// For development environment hot reloading
if (import.meta.hot) {
    import.meta.hot.accept((newModule) => {
        Logger.debug("ApiService module updated");
    });
}

export default ApiService;
