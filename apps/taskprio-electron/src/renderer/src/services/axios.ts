import axios, { AxiosHeaders } from "axios";

export const axiosHeaders = (customHeaders?: Record<string, string>): AxiosHeaders => {
    const headers = new AxiosHeaders({
        'Content-Type': 'application/json',
        "Authorization": `Bearer ${localStorage.getItem("access_token")}`
    });
    if (customHeaders) {
        Object.entries(customHeaders).forEach(([key, value]) => {
            headers.set(key, value);
        });
    }
    return headers;
}

export const refreshAxiosInstance = () => {
    axiosInstance = axios.create({
        baseURL: import.meta.env.VITE_TASKPRIO_SERVICE_URL,
        headers : axiosHeaders(),
        withCredentials : true
    })
}

export let axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_TASKPRIO_SERVICE_URL,
    headers : axiosHeaders(),
    withCredentials : true
})