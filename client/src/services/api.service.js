import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:3000/api",
    withCredentials: true,
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
    },
});

api.interceptors.response.use(
    (response) => {
        console.log("API Response:", {
            url: response.config.url,
            data: response.data,
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
        getTerritories: () => api.get("/scheduler/territories"),
        getResources: () => api.get("/scheduler/resources"),
        getAppointments: () => api.get("/scheduler/appointments"),
        getWorkGroupTypes: () => {
            console.log("Calling getWorkGroupTypes API");
            return api.get("/scheduler/work-type-groups");
        },
    },
    profile: {
        getUserInfo: () => api.get("/auth/user-info"),
    },
};

export default ApiService;
