"use client";
import { useEffect, useRef } from "react";
import StandingBlocker from "@/components/common/standing-blocker";
import { useAnnounce } from "@/components/providers/announcer-provider";
import { useSession } from "@/components/providers/session-provider";
import { STANDING } from "@/lib/billing/constants";
import { consequenceOf, relevantTo } from "@/lib/billing/standing";
import { STANDING_COPY } from "@/lib/data/billing/standing-copy";
import { useAccountStanding } from "@/lib/hooks/use-account-standing";
import { useStandingDismissals } from "@/lib/hooks/use-standing-dismissals";
import type { StandingCapability } from "@/lib/types";
import { fillTemplate } from "@/lib/utils/fill-template";
import { storage } from "@/lib/utils/local-storage";

interface Props {
    capabilities?: readonly StandingCapability[];
}

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const focusAfter = (container: Element | null) => {
    if (!container) return;
    const all = [...document.querySelectorAll<HTMLElement>(FOCUSABLE)];
    const inside = [...container.querySelectorAll<HTMLElement>(FOCUSABLE)];
    const last = inside.at(-1);
    all.at(last ? all.indexOf(last) + 1 : 0)?.focus();
};

export default function AccountStandingNotice({ capabilities }: Props) {
    const owner = useSession()?.id ?? "";
    const standing = useAccountStanding();
    const { dismissed, dismiss } = useStandingDismissals(owner);
    const announce = useAnnounce();
    const list = useRef<HTMLUListElement>(null);
    const told = useRef(false);
    const organisation = standing.data?.organisation.name ?? "";
    const blockers = (standing.data?.blockers ?? []).filter((blocker) => relevantTo(blocker, capabilities) && (blocker.severity === "blocking" || !dismissed.has(blocker.id)));

    useEffect(() => {
        if (told.current || blockers.length === 0) return;
        told.current = true;
        const key = `${STANDING.seenKey}.${owner}`;
        const seen = storage.getItem(key) ?? "";
        const blocking = blockers.filter((blocker) => blocker.severity === "blocking").map((blocker) => blocker.id);
        storage.setItem(key, blocking.join(","));
        const fresh = blocking.some((id) => !seen.split(",").includes(id));
        const message = blockers.map((blocker) => `${STANDING_COPY.types[blocker.type].title}. ${consequenceOf(blocker, organisation)}`).join(" ");
        announce({ message, tone: fresh ? "assertive" : "polite" });
    }, [blockers, owner, organisation, announce]);

    if (!standing.data || blockers.length === 0) return null;

    const close = (id: string) => {
        focusAfter(list.current?.querySelector(`[data-blocker="${CSS.escape(id)}"]`) ?? null);
        dismiss(id);
        announce({ message: STANDING_COPY.dismissed });
    };

    return (
        <section aria-label={fillTemplate(STANDING_COPY.region, { organisation })}>
            <ul ref={list} className="flex flex-col gap-2">
                {blockers.map((blocker) => (
                    <li key={blocker.id} data-blocker={blocker.id}>
                        <StandingBlocker blocker={blocker} organisation={organisation} onDismiss={blocker.severity === "warning" ? () => close(blocker.id) : undefined} />
                    </li>
                ))}
            </ul>
        </section>
    );
}
