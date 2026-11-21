import "server-only";
import type { z } from "zod";
import { redirect } from "next/navigation";
import { backendFetch, readJson } from "@/lib/api-server";
import { HTTP_STATUS, LOGIN_ROUTE } from "@/lib/constants";
import { routes } from "@/lib/contract/routes";
import type { FacilityOptionDto } from "@/lib/contract/schemas";
import { copyDraft, freshStart, laneDraft, postSearchOf, resumeStart } from "@/lib/loads/post-start";
import type { PostStart } from "@/lib/types";
import { pathSegment } from "@/lib/utils/backend-mutation";
import { loadEnvelopeSchema } from "@/lib/validations/freight";
import { facilitiesEnvelopeSchema } from "@/lib/validations/imports";
import { loadDraftEnvelopeSchema } from "@/lib/validations/posting";

const readData = async <T>(path: string, envelope: z.ZodType<{ data: T }>): Promise<T | null> => {
    const upstream = await backendFetch(path);
    if (upstream.status === HTTP_STATUS.unauthorized) redirect(LOGIN_ROUTE);
    if (!upstream.ok) return null;
    const parsed = envelope.safeParse(await readJson(upstream));
    return parsed.success ? parsed.data.data : null;
};

export const readFacilities = async (): Promise<FacilityOptionDto[]> => (await readData(routes.facilitiesFindAll(), facilitiesEnvelopeSchema)) ?? [];

export const readPostStart = async (search: Record<string, string | string[] | undefined>, facilities: readonly FacilityOptionDto[]): Promise<PostStart> => {
    const { lane, from, draft } = postSearchOf(search);
    const saved = draft ? await readData(routes.loadDraftsFindOne(pathSegment(draft)), loadDraftEnvelopeSchema) : null;
    if (saved) return resumeStart(saved);

    const copied = from ? await readData(routes.loadsFindOne(pathSegment(from)), loadEnvelopeSchema) : null;
    if (copied) return { draft: copyDraft(copied, facilities), step: "lane", source: "copy", reference: copied.id };

    const carried = lane ? laneDraft(lane, facilities) : null;
    if (carried) return { draft: carried, step: "lane", source: "lane", reference: null };

    return freshStart();
};
