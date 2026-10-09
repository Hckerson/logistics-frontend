import { AxiosError, type AxiosAdapter, type AxiosResponse } from "axios";
import { mockRequest } from "@/lib/mocks/router";

const parseData = (data: unknown): unknown => {
    if (typeof data !== "string") return data ?? null;
    try {
        return JSON.parse(data);
    } catch {
        return data;
    }
};

export const mockAdapter: AxiosAdapter = async (config) => {
    const { status, body, headers = {} } = await mockRequest({
        method: config.method ?? "get",
        path: config.url ?? "",
        body: parseData(config.data),
    });
    const response: AxiosResponse = { data: body, status, statusText: "", headers, config, request: null };
    const valid = config.validateStatus ? config.validateStatus(status) : status >= 200 && status < 300;
    if (valid) return response;
    throw new AxiosError(`Request failed with status code ${status}`, AxiosError.ERR_BAD_RESPONSE, config, null, response);
};
