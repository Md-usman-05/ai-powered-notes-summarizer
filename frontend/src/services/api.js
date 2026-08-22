import axios from "axios";

/*
 * Production backend
 */
const PRODUCTION_API_URL =
    "https://notemind-backend-euy4.onrender.com/";

/*
 * Read VITE_API_URL if available.
 */
const configuredApiUrl =
    import.meta.env.VITE_API_URL?.trim();

/*
 * Prevent localhost from ever being used by the deployed frontend.
 */
const isLocalUrl = (url) => {
    if (!url) return false;

    return (
        url.includes("127.0.0.1") ||
        url.includes("localhost")
    );
};

let API_BASE_URL;

if (import.meta.env.PROD) {

    /*
     * Production:
     * Never use localhost.
     */
    if (configuredApiUrl && !isLocalUrl(configuredApiUrl)) {
        API_BASE_URL = configuredApiUrl;
    } else {
        API_BASE_URL = PRODUCTION_API_URL;
    }

} else {

    /*
     * Local development.
     */
    API_BASE_URL =
        configuredApiUrl ||
        "http://127.0.0.1:8000/";
}

console.log("API Base URL:", API_BASE_URL);

const API = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});


/* =========================
   PUBLIC ENDPOINTS
========================= */

const publicEndpoints = [
    "api/login/",
    "api/register/",
    "api/token/refresh/",
    "api/password/forgot/",
    "api/password/verify-otp/",
    "api/password/reset/",
];


/* =========================
   REQUEST INTERCEPTOR
========================= */

API.interceptors.request.use(
    (config) => {

        const url = config.url || "";

        const isPublic = publicEndpoints.some(
            (endpoint) => url.includes(endpoint)
        );

        if (!isPublic) {

            const token =
                localStorage.getItem("access");

            if (token) {

                config.headers =
                    config.headers || {};

                config.headers.Authorization =
                    `Bearer ${token}`;
            }
        }

        return config;
    },

    (error) => Promise.reject(error)
);


/* =========================
   TOKEN REFRESH
========================= */

let refreshPromise = null;


const signOut = () => {

    localStorage.removeItem("access");
    localStorage.removeItem("refresh");

    if (
        window.location.pathname !== "/login"
    ) {

        window.location.assign("/login");
    }
};


/* =========================
   RESPONSE INTERCEPTOR
========================= */

API.interceptors.response.use(

    (response) => response,

    async (error) => {

        const originalRequest =
            error.config;

        const isRefreshRequest =
            originalRequest?.url?.includes(
                "api/token/refresh/"
            );

        /*
         * If access token expired,
         * try refreshing it.
         */
        if (
            error.response?.status === 401 &&
            !originalRequest?._retry &&
            !isRefreshRequest
        ) {

            const refresh =
                localStorage.getItem("refresh");

            if (!refresh) {

                signOut();

                return Promise.reject(error);
            }

            originalRequest._retry = true;

            try {

                refreshPromise ||= API.post(
                    "api/token/refresh/",
                    {
                        refresh,
                    }
                );

                const { data } =
                    await refreshPromise;

                localStorage.setItem(
                    "access",
                    data.access
                );

                originalRequest.headers =
                    originalRequest.headers || {};

                originalRequest.headers.Authorization =
                    `Bearer ${data.access}`;

                return API(originalRequest);

            } catch (refreshError) {

                signOut();

                return Promise.reject(
                    refreshError
                );

            } finally {

                refreshPromise = null;
            }
        }

        return Promise.reject(error);
    }
);


export default API;