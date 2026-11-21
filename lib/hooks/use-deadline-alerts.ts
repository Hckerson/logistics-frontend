import { useEffect, useRef } from "react";
import { useAnnounce } from "@/components/providers/announcer-provider";
import { TIME_MS } from "@/lib/constants";
import { useNow } from "@/lib/hooks/use-now";

interface Alerts {
    deadline: string | null;
    marks: readonly { minutes: number; message: string }[];
    expired: string;
}

export const useDeadlineAlerts = ({ deadline, marks, expired }: Alerts) => {
    const now = useNow();
    const announce = useAnnounce();
    const said = useRef(new Set<string>());
    const end = deadline ? Date.parse(deadline) : null;
    const left = end === null || now === null ? null : end - now;
    const passed = left === null ? null : [...marks.filter((mark) => left <= mark.minutes * TIME_MS.minute).map((mark) => mark.message), ...(left <= 0 ? [expired] : [])].at(-1);

    useEffect(() => {
        said.current = new Set();
    }, [deadline]);

    useEffect(() => {
        if (!passed || said.current.has(passed)) return;
        said.current.add(passed);
        announce({ message: passed, tone: passed === expired ? "assertive" : "polite" });
    }, [announce, expired, passed]);

    return { left, live: left === null ? deadline !== null : left > 0 };
};
