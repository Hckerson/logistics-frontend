import { formatDistanceToNowStrict } from "date-fns";
import { POST_COPY } from "@/lib/data/loads/post-copy";
import { postDraftStore } from "@/lib/loads/post-draft-store";
import { openSteps } from "@/lib/loads/post-reducer";
import { POST_PARAMS } from "@/lib/loads/posting";
import type { FlowNotice, PostDraft, PostStart, PostStep } from "@/lib/types";
import { fillTemplate } from "@/lib/utils/fill-template";

interface FlowStart {
    draft: PostDraft;
    step: PostStep;
    notice: FlowNotice;
}

export const opening = (userId: string, start: PostStart, requested: PostStep | null): FlowStart => {
    const stored = start.source === "fresh" ? postDraftStore.snapshot(userId) : null;
    const draft = stored?.kind === "found" ? stored.draft : start.draft;
    const open = openSteps(draft);
    const step = requested && open[requested] ? requested : stored?.kind === "found" ? draft.reached : start.step;
    if (stored?.kind === "found") return { draft, step, notice: { kind: "restored", age: formatDistanceToNowStrict(draft.savedAt, { addSuffix: true }) } };
    return { draft, step, notice: stored?.kind === "corrupt" ? { kind: "corrupt" } : { kind: start.source, load: start.reference ?? "" } };
};

export const urlFor = (step: PostStep) => {
    const url = new URL(window.location.href);
    url.searchParams.set(POST_PARAMS.step, step);
    return `${url.pathname}${url.search}`;
};

export const noticeText = (notice: FlowNotice) => {
    if (notice.kind === "restored") return fillTemplate(POST_COPY.restored, { age: notice.age });
    if (notice.kind === "corrupt") return POST_COPY.corrupt;
    return notice.kind === "fresh" ? null : fillTemplate(POST_COPY.carried[notice.kind], { load: notice.load });
};
