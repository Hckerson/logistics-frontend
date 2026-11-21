import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { formatDistanceToNowStrict } from "date-fns";
import { useAnnounce } from "@/components/providers/announcer-provider";
import { POST_COPY } from "@/lib/data/loads/post-copy";
import { useFetchDraft, useSaveDraft } from "@/lib/hooks/use-post-load";
import { postDraftStore } from "@/lib/loads/post-draft-store";
import { openSteps, postReducer, type PostAction } from "@/lib/loads/post-reducer";
import { POST_PARAMS, POST_STEPS, stepIndex, toDraftFreight, toDraftStops } from "@/lib/loads/posting";
import type { FreightEntries, LaneEntries, PostDraft, PostStart, PostStep } from "@/lib/types";
import { failureFrom } from "@/lib/utils/action-result";
import { fillTemplate } from "@/lib/utils/fill-template";

export type FlowNotice = { kind: "restored"; age: string } | { kind: "corrupt" } | { kind: PostStart["source"]; load: string };

interface FlowStart {
    draft: PostDraft;
    step: PostStep;
    notice: FlowNotice;
}

const opening = (userId: string, start: PostStart, requested: PostStep | null): FlowStart => {
    const stored = start.source === "fresh" ? postDraftStore.snapshot(userId) : null;
    const draft = stored?.kind === "found" ? stored.draft : start.draft;
    const open = openSteps(draft);
    const step = requested && open[requested] ? requested : stored?.kind === "found" ? draft.reached : start.step;
    if (stored?.kind === "found") return { draft, step, notice: { kind: "restored", age: formatDistanceToNowStrict(draft.savedAt, { addSuffix: true }) } };
    return { draft, step, notice: stored?.kind === "corrupt" ? { kind: "corrupt" } : { kind: start.source, load: start.reference ?? "" } };
};

const urlFor = (step: PostStep) => {
    const url = new URL(window.location.href);
    url.searchParams.set(POST_PARAMS.step, step);
    return `${url.pathname}${url.search}`;
};

export const usePostFlow = (userId: string, start: PostStart, requested: PostStep | null) => {
    const [first] = useState(() => opening(userId, start, requested));
    const [draft, dispatch] = useReducer(postReducer, first.draft);
    const [step, setStep] = useState(first.step);
    const [moved, setMoved] = useState(false);
    const [stale, setStale] = useState(false);
    const announce = useAnnounce();
    const save = useSaveDraft();
    const fetchDraft = useFetchDraft();
    const leave = useRef<() => PostAction | null>(() => null);

    useEffect(() => {
        if (first.notice.kind === "restored") announce({ message: fillTemplate(POST_COPY.restored, { age: first.notice.age }) });
    }, [announce, first.notice]);

    useEffect(() => postDraftStore.save(userId, draft), [userId, draft]);

    useEffect(() => {
        window.history.replaceState(window.history.state, "", urlFor(first.step));
        const back = () => {
            const wanted = POST_STEPS.find((candidate) => candidate === new URL(window.location.href).searchParams.get(POST_PARAMS.step));
            if (wanted) setStep(wanted);
        };
        window.addEventListener("popstate", back);
        return () => window.removeEventListener("popstate", back);
    }, [first.step]);

    const go = useCallback((next: PostStep) => {
        const stash = leave.current();
        if (stash) dispatch(stash);
        leave.current = () => null;
        window.history.pushState(window.history.state, "", urlFor(next));
        setStep(next);
        setMoved(true);
        announce({ message: fillTemplate(POST_COPY.stepAnnounce, { current: String(stepIndex(next) + 1), total: String(POST_STEPS.length), title: POST_COPY.steps[next] }) });
    }, [announce]);

    const persist = async (lane: LaneEntries, freight: FreightEntries | null) => {
        try {
            return await save.mutateAsync({ draftId: draft.draftId, version: draft.version, stops: toDraftStops(lane), freight: freight && toDraftFreight(freight) });
        } catch (error) {
            if (failureFrom(error)?.errorClass === "precondition") setStale(true);
            throw error;
        }
    };

    const resolveStale = async (keep: boolean) => {
        if (!draft.draftId) return;
        const saved = await fetchDraft.mutateAsync(draft.draftId);
        dispatch(keep ? { type: "rebase", version: saved.version } : { type: "replace", saved });
        setStale(false);
    };

    const onLeave = useCallback((stash: () => PostAction | null) => {
        leave.current = stash;
    }, []);

    const finish = () => postDraftStore.clear(userId);

    return { draft, dispatch, step, go, onLeave, moved, notice: first.notice, persist, saving: save.isPending, stale, resolveStale, resolving: fetchDraft.isPending, finish };
};

export type PostFlow = ReturnType<typeof usePostFlow>;
