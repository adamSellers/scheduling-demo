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
    (response) => response.data,
    (error) => {
        if (error.response) {
            if (error.response.status === 401) {
                window.location.href = "/";
                return Promise.reject(new Error("Session expired"));
            }
            const message = error.response.data?.error || "An error occurred";
            return Promise.reject(new Error(message));
        }
        return Promise.reject(new Error("Unable to connect to server"));
    }
);

const ApiService = {
    scheduler: {
        getTerritories: () => api.get("/scheduler/territories"),
        getResources: () => api.get("/scheduler/resources"),
        getAppointments: () => api.get("/scheduler/appointments"),
    },
    profile: {
        getUserInfo: () => api.get("/auth/user-info"),
    },
};

export default ApiService;
