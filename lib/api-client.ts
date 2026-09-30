import axios from "axios";
import { API_BASE_URL, AUTH_ROUTE_PREFIX, LOGIN_ROUTE } from "@/lib/constants";
import type { ApiResponse, Endpoint } from "@/lib/types/api";
import type { AxiosInstance, AxiosRequestConfig, AxiosError } from "axios";

const defaultConfig: AxiosRequestConfig = {
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
};

export const apiClient: AxiosInstance = axios.create(defaultConfig);

const sameOriginClient: AxiosInstance = axios.create({
    headers: defaultConfig.headers,
});

export const local = {
    post: async <T>(url: string, body: unknown) =>
        (await sameOriginClient.post<T>(url, body)).data,
    delete: async <T>(url: string) =>
        (await sameOriginClient.delete<T>(url)).data,
};

const request = async <T>(
    config: AxiosRequestConfig,
): Promise<ApiResponse<T>> => {
    const response = await apiClient.request<ApiResponse<T>>({
        ...defaultConfig,
        ...config,
    });

    return response.data;
};

export const query = {
    get: <T = unknown>(url: Endpoint<T>, config?: AxiosRequestConfig) =>
        request<T>({ method: "GET", url, ...config }),
    post: <T = unknown>(
        url: Endpoint<T>,
        body: unknown,
        config?: AxiosRequestConfig,
    ) => request<T>({ method: "POST", url, data: body, ...config }),
    patch: <T = unknown>(
        url: Endpoint<T>,
        body: unknown,
        config?: AxiosRequestConfig,
    ) => request<T>({ method: "PATCH", url, data: body, ...config }),
    put: <T = unknown>(
        url: Endpoint<T>,
        body: unknown,
        config?: AxiosRequestConfig,
    ) => request<T>({ method: "PUT", url, data: body, ...config }),
    delete: <T = unknown>(url: Endpoint<T>, config?: AxiosRequestConfig) =>
        request<T>({ method: "DELETE", url, ...config }),
};

apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            if (
                typeof window !== "undefined" &&
                !window.location.pathname.startsWith(AUTH_ROUTE_PREFIX)
            ) {
                window.location.href = LOGIN_ROUTE;
            }
        }
        return Promise.reject(error);
    },
);
