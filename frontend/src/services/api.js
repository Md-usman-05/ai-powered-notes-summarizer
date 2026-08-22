import axios from "axios";

const API = axios.create({

    baseURL: "http://127.0.0.1:8000/",

});

const publicEndpoints = [

    "api/login/",

    "api/register/",

    "api/token/refresh/",

    "api/password/forgot/",

    "api/password/verify-otp/",

    "api/password/reset/",
];

API.interceptors.request.use(

    (config) => {

        const url = config.url || "";

        const isPublic = publicEndpoints.some(

            (endpoint) => url.includes(endpoint)

        );

        if (!isPublic) {

            const token = localStorage.getItem("access");

            if (token) {

                config.headers.Authorization = `Bearer ${token}`;

            }

        }

        return config;

    },

    (error) => Promise.reject(error)

);

let refreshPromise = null;

const signOut = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    if (window.location.pathname !== "/login") {
        window.location.assign("/login");
    }
};

API.interceptors.response.use(

    (response) => response,

    async (error) => {

        const originalRequest = error.config;
        const isRefreshRequest = originalRequest?.url?.includes("api/token/refresh/");

        if (error.response?.status === 401 && !originalRequest?._retry && !isRefreshRequest) {
            const refresh = localStorage.getItem("refresh");
            if (!refresh) {
                signOut();
                return Promise.reject(error);
            }

            originalRequest._retry = true;
            try {
                refreshPromise ||= API.post("api/token/refresh/", { refresh });
                const { data } = await refreshPromise;
                localStorage.setItem("access", data.access);
                originalRequest.headers.Authorization = `Bearer ${data.access}`;
                return API(originalRequest);
            } catch (refreshError) {
                signOut();
                return Promise.reject(refreshError);
            } finally {
                refreshPromise = null;
            }
        }

        return Promise.reject(error);

    }

);

export default API;
