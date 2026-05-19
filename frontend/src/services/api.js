import axios from "axios"

const API = axios.create({

    baseURL: "http://127.0.0.1:8000/",

})

const publicEndpoints = [
    "api/login/",
    "api/register/",
]

API.interceptors.request.use(

    (config) => {

        const url = config.url || ""
        const isPublicEndpoint = publicEndpoints.some(
            (endpoint) => url.includes(endpoint)
        )

        if (isPublicEndpoint) {
            delete config.headers.Authorization
            return config
        }

        const token = localStorage.getItem(
            "access"
        )

        if (token) {

            config.headers.Authorization =
                `Bearer ${token}`
        }

        return config
    }

)

API.interceptors.response.use(
    (response) => response,
    (error) => {
        const detail = error.response?.data?.detail
        const code = error.response?.data?.code

        if (
            error.response?.status === 401 &&
            (
                code === "token_not_valid" ||
                detail === "Given token not valid for any token type"
            )
        ) {
            localStorage.removeItem("access")
            localStorage.removeItem("refresh")
        }

        return Promise.reject(error)
    }
)

export default API
