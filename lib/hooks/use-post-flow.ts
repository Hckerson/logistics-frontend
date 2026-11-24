import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { useAnnounce } from "@/components/providers/announcer-provider";
import { POST_COPY } from "@/lib/data/loads/post-copy";
import { useFetchDraft, useSaveDraft } from "@/lib/hooks/use-post-load";
import { postDraftStore } from "@/lib/loads/post-draft-store";
import { opening, urlFor } from "@/lib/loads/post-opening";
import { postReducer, type PostAction } from "@/lib/loads/post-reducer";
import { blankDraft, POST_PARAMS, POST_STEPS, stepIndex, toDraftFreight, toDraftStops } from "@/lib/loads/posting";
import type { FlowNotice, FreightEntries, LaneEntries, PostStart, PostStep } from "@/lib/types";
import { failureFrom } from "@/lib/utils/action-result";
import { fillTemplate } from "@/lib/utils/fill-template";

export const usePostFlow = (userId: string, start: PostStart, requested: PostStep | null) => {
    const [first] = useState(() => opening(userId, start, requested));
    const [draft, dispatch] = useReducer(postReducer, first.draft);
    const [step, setStep] = useState(first.step);
    const [moved, setMoved] = useState(false);
    const [stale, setStale] = useState(false);
    const [revision, setRevision] = useState(0);
    const [notice, setNotice] = useState<FlowNotice | null>(first.notice);
    const announce = useAnnounce();
    const save = useSaveDraft();
    const fetchDraft = useFetchDraft();
    const leave = useRef<() => PostAction | null>(() => null);
    const pristine = useRef(first.draft);
    const latest = useRef(draft);

    useEffect(() => {
        if (first.notice.kind === "restored") announce({ message: fillTemplate(POST_COPY.restored, { age: first.notice.age }) });
    }, [announce, first.notice]);

    useEffect(() => {
        latest.current = draft;
        if (draft !== pristine.current) postDraftStore.save(userId, draft);
    }, [userId, draft]);

    useEffect(() => {
        const keep = () => {
            const stash = leave.current();
            const current = stash ? postReducer(latest.current, stash) : latest.current;
            if (document.visibilityState === "hidden" && current !== pristine.current) postDraftStore.save(userId, current);
        };
        document.addEventListener("visibilitychange", keep);
        return () => document.removeEventListener("visibilitychange", keep);
    }, [userId]);

    useEffect(() => {
        window.history.replaceState(window.history.state, "", urlFor(first.step));
        const back = () => {
            const wanted = POST_STEPS.find((candidate) => candidate === new URL(window.location.href).searchParams.get(POST_PARAMS.step));
            if (!wanted) return;
            const stash = leave.current();
            if (stash) dispatch(stash);
            leave.current = () => null;
            setStep(wanted);
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

    const watch = useCallback((error: unknown) => {
        if (failureFrom(error)?.errorClass === "precondition") setStale(true);
    }, []);

    const persist = async (lane: LaneEntries, freight: FreightEntries | null) => {
        try {
            return await save.mutateAsync({ draftId: draft.draftId, version: draft.version, stops: toDraftStops(lane), freight: freight && toDraftFreight(freight) });
        } catch (error) {
            watch(error);
            throw error;
        }
    };

    const resolveStale = async (keep: boolean) => {
        if (!draft.draftId) return;
        const saved = await fetchDraft.mutateAsync(draft.draftId);
        const freight = stepIndex(draft.reached) >= stepIndex("quote") ? toDraftFreight(draft.freight) : null;
        const kept = keep ? await save.mutateAsync({ draftId: saved.id, version: saved.version, stops: toDraftStops(draft.lane), freight }) : null;
        dispatch(kept ? { type: "rebase", saved: kept } : { type: "replace", saved });
        if (!kept) setRevision((current) => current + 1);
        setStale(false);
    };

    const restart = () => {
        leave.current = () => null;
        const blank = blankDraft();
        pristine.current = blank;
        postDraftStore.clear(userId);
        dispatch({ type: "restore", draft: blank });
        setNotice(null);
        setRevision((current) => current + 1);
        go("lane");
    };

    const onLeave = useCallback((stash: () => PostAction | null) => {
        leave.current = stash;
    }, []);

    const finish = () => {
        pristine.current = latest.current;
        postDraftStore.clear(userId);
    };

    return {
        draft,
        dispatch,
        step,
        go,
        onLeave,
        moved,
        notice,
        restart,
        revision,
        persist,
        watch,
        saving: save.isPending,
        stale,
        resolveStale,
        resolving: fetchDraft.isPending || save.isPending,
        finish,
    };
};

export type PostFlow = ReturnType<typeof usePostFlow>;
