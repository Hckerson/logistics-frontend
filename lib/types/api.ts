import type { ApiEnvelopeDto } from "@/lib/contract/schemas";

export type Endpoint<TResponse = unknown> = string & {
    readonly __response?: TResponse;
};

export type ApiResponse<TData> = ApiEnvelopeDto & { data: TData };

export type ActionResult<TData> =
    { ok: true; data: TData } | { ok: false; status: number; message: string };
