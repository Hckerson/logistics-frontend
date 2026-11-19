import { useEffect, useEffectEvent, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { local } from "@/lib/api-client";
import { apiRoutes } from "@/lib/api-routes";
import { HTTP_STATUS, loginRoute, SESSION_IDLE, TIME_MS } from "@/lib/constants";
import { useNow } from "@/lib/hooks/use-now";
import type { SessionPhase, SessionWindow } from "@/lib/types";
import { failureFrom } from "@/lib/utils/action-result";
import { sessionWindowSchema } from "@/lib/validations/auth";

interface LocalWindow {
    issuedAt: number;
    expiresAt: number;
}

const ACTIVITY = ["pointerdown", "keydown"] as const;
const WARNING_MS = SESSION_IDLE.warningMinutes * TIME_MS.minute;
const ACTIVITY_MS = SESSION_IDLE.activityRefreshMinutes * TIME_MS.minute;

const toLocal = ({ issuedAt, expiresAt, serverNow }: SessionWindow): LocalWindow => {
    const skew = new Date().getTime() - serverNow;
    return { issuedAt: issuedAt + skew, expiresAt: expiresAt + skew };
};

const phaseOf = (held: LocalWindow | null, now: number | null): SessionPhase => {
    if (held === null || now === null) return "active";
    if (now >= held.expiresAt) return "expired";
    return now >= held.expiresAt - WARNING_MS ? "warning" : "active";
};

export function useSessionTimeout(initial: SessionWindow) {
    const router = useRouter();
    const pathname = usePathname();
    const now = useNow();
    const [held, setHeld] = useState<LocalWindow | null>(null);
    const [source, setSource] = useState<SessionWindow | null>(null);
    const [ended, setEnded] = useState(false);
    if (now !== null && source !== initial) {
        setSource(initial);
        setHeld(toLocal(initial));
    }
    const channel = useRef<BroadcastChannel | null>(null);
    const phase = ended ? "expired" : phaseOf(held, now);

    const extend = useMutation({
        mutationFn: async () => sessionWindowSchema.parse(await local.patch(apiRoutes.session())),
        onSuccess: (next) => {
            setHeld(toLocal(next));
            channel.current?.postMessage(next);
        },
        onError: (error) => {
            if (failureFrom(error)?.status === HTTP_STATUS.unauthorized) setEnded(true);
        },
    });

    const onActivity = useEffectEvent(() => {
        if (held === null || phase !== "active" || extend.isPending || new Date().getTime() - held.issuedAt < ACTIVITY_MS) return;
        extend.mutate();
    });

    useEffect(() => {
        const shared = new BroadcastChannel(SESSION_IDLE.channel);
        shared.onmessage = (event: MessageEvent<unknown>) => {
            const next = sessionWindowSchema.safeParse(event.data);
            if (next.success) setHeld(toLocal(next.data));
        };
        channel.current = shared;
        return () => {
            shared.close();
            channel.current = null;
        };
    }, []);

    useEffect(() => {
        const listen = () => onActivity();
        ACTIVITY.forEach((type) => document.addEventListener(type, listen, { passive: true }));
        return () => ACTIVITY.forEach((type) => document.removeEventListener(type, listen));
    }, []);

    useEffect(() => {
        if (phase === "expired") router.replace(loginRoute(pathname));
    }, [phase, pathname, router]);

    return { phase, expiresAt: held?.expiresAt ?? null, extend, now };
}
