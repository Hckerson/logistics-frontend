import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useAnnounce } from "@/components/providers/announcer-provider";
import { recordLocationConsent } from "@/lib/actions/record-location-consent";
import { INVITE_COPY } from "@/lib/data/auth/invite";
import { CONSENT_QUEUE_KEY, LOCATION_DECISIONS, PERMISSION_PROBE } from "@/lib/team/constants";
import type { LocationDecision, LocationOutcome } from "@/lib/types";
import { storage } from "@/lib/utils/local-storage";

const queuedDecision = () => LOCATION_DECISIONS.find((decision) => decision === storage.getItem(CONSENT_QUEUE_KEY));

export function useLocationConsent() {
    const { mutate, isPending } = useMutation({ mutationFn: (decision: LocationDecision) => recordLocationConsent(decision) });
    const announce = useAnnounce();
    const [outcome, setOutcome] = useState<LocationOutcome | null>(null);
    const [queued, setQueued] = useState(false);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        const replay = () => {
            const decision = queuedDecision();
            if (decision) mutate(decision, { onSuccess: (result) => result.ok && storage.removeItem(CONSENT_QUEUE_KEY) });
        };
        replay();
        window.addEventListener("online", replay);
        return () => window.removeEventListener("online", replay);
    }, [mutate]);

    const settle = (next: LocationOutcome) => {
        setOutcome(next);
        announce({ message: INVITE_COPY.location.outcomes[next].label });
    };

    const probe = () => {
        if (!("geolocation" in navigator)) return settle("blocked");
        navigator.geolocation.getCurrentPosition(
            () => settle("on"),
            (error) => settle(error.code === error.PERMISSION_DENIED ? "blocked" : "on"),
            PERMISSION_PROBE,
        );
    };

    const proceed = (decision: LocationDecision) => (decision === "granted" ? probe() : settle("declined"));

    const hold = (decision: LocationDecision) => {
        storage.setItem(CONSENT_QUEUE_KEY, decision);
        setQueued(true);
        proceed(decision);
    };

    const decide = (decision: LocationDecision) => {
        setFailed(false);
        if (!navigator.onLine) return hold(decision);
        mutate(decision, {
            onSuccess: (result) => (result.ok ? proceed(decision) : setFailed(true)),
            onError: () => hold(decision),
        });
    };

    return { decide, outcome, queued, failed, pending: isPending };
}
