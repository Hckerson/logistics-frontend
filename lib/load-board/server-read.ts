import "server-only";
import { notFound, redirect } from "next/navigation";
import { backendFetch, readJson } from "@/lib/api-server";
import { HTTP_STATUS, LOGIN_ROUTE, REQUEST_FAILED } from "@/lib/constants";
import { routes } from "@/lib/contract/routes";
import type { LoadBookingDto } from "@/lib/contract/schemas";
import { pathSegment } from "@/lib/utils/backend-mutation";
import { loadBookingEnvelopeSchema } from "@/lib/validations/load-board";

const HIDDEN: readonly number[] = [HTTP_STATUS.notFound, HTTP_STATUS.forbidden];

export const readBooking = async (loadId: string): Promise<LoadBookingDto | null> => {
    const upstream = await backendFetch(routes.loadsBooking(pathSegment(loadId)));
    if (HIDDEN.includes(upstream.status)) notFound();
    if (upstream.status === HTTP_STATUS.unauthorized) redirect(LOGIN_ROUTE);
    if (upstream.status === HTTP_STATUS.conflict) return null;

    const envelope = loadBookingEnvelopeSchema.safeParse(await readJson(upstream));
    if (!upstream.ok || !envelope.success) throw new Error(REQUEST_FAILED);
    return envelope.data.data;
};
