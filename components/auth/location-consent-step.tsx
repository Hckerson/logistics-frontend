"use client";
import { useId } from "react";
import { Location } from "@carbon/icons-react";
import ConsoleLink from "@/components/auth/console-link";
import OutcomeStep from "@/components/auth/outcome-step";
import { CONSOLE_ACTION } from "@/lib/auth/constants";
import { INVITE_COPY } from "@/lib/data/auth/invite";
import { useLocationConsent } from "@/lib/hooks/use-location-consent";

const { location } = INVITE_COPY;
const QUIET_ACTION =
    "border-border-dark text-text hover:border-text-muted focus-visible:outline-text flex h-12 w-full cursor-pointer items-center justify-center border px-4 text-sm transition-colors focus-visible:outline-2 disabled:cursor-wait";

export default function LocationConsentStep() {
    const headingId = useId();
    const consent = useLocationConsent();

    if (consent.outcome) {
        const result = location.outcomes[consent.outcome];
        return (
            <OutcomeStep tone={consent.outcome === "blocked" ? "error" : "accent"} label={result.label} body={result.body}>
                {consent.queued ? <p className="text-text-muted text-xs">{location.outcomes.queued.body}</p> : null}
                <ConsoleLink href={location.next.href} label={location.next.label} />
            </OutcomeStep>
        );
    }

    return (
        <div className="haulr-boot-rows flex flex-col gap-5">
            <section aria-labelledby={headingId} className="flex flex-col gap-3">
                <h2 id={headingId} className="haulr-label text-accent flex items-center gap-2">
                    <Location aria-hidden className="size-3.5" />
                    {location.heading}
                </h2>
                <ul className="flex flex-col gap-2">
                    {location.points.map((point) => (
                        <li key={point} className="text-text-secondary flex gap-3 text-sm">
                            <span aria-hidden className="bg-accent mt-2 size-1 shrink-0 rounded-full" />
                            {point}
                        </li>
                    ))}
                </ul>
            </section>
            <div className="flex flex-col gap-2">
                <button type="button" disabled={consent.pending} onClick={() => consent.decide("granted")} className={`${CONSOLE_ACTION} disabled:cursor-wait`}>
                    {consent.pending ? location.pending : location.allow}
                    <Location aria-hidden className="size-4" />
                </button>
                <button type="button" disabled={consent.pending} onClick={() => consent.decide("declined")} className={QUIET_ACTION}>
                    {location.decline}
                </button>
            </div>
            {consent.failed ? (
                <p role="alert" className="text-error text-xs">
                    {location.failed}
                </p>
            ) : null}
        </div>
    );
}
