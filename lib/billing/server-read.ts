import "server-only";
import { notFound, redirect } from "next/navigation";
import { backendFetch, readJson } from "@/lib/api-server";
import { HTTP_STATUS, LOGIN_ROUTE, REQUEST_FAILED } from "@/lib/constants";
import { routes } from "@/lib/contract/routes";
import type { InvoiceDto } from "@/lib/contract/schemas";
import { pathSegment } from "@/lib/utils/backend-mutation";
import { invoiceEnvelopeSchema } from "@/lib/validations/billing";

const HIDDEN: readonly number[] = [HTTP_STATUS.notFound, HTTP_STATUS.forbidden];

export const readInvoice = async (invoiceId: string): Promise<InvoiceDto> => {
    const upstream = await backendFetch(routes.invoicesFindOne(pathSegment(invoiceId)));
    if (HIDDEN.includes(upstream.status)) notFound();
    if (upstream.status === HTTP_STATUS.unauthorized) redirect(LOGIN_ROUTE);

    const envelope = invoiceEnvelopeSchema.safeParse(await readJson(upstream));
    if (!upstream.ok || !envelope.success) throw new Error(REQUEST_FAILED);
    return envelope.data.data;
};
