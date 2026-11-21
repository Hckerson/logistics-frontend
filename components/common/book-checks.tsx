import Link from "next/link";
import { CheckmarkFilled, WarningAltFilled } from "@carbon/icons-react";
import Panel from "@/components/ui/panel";
import StatusLabel from "@/components/ui/status-label";
import { appRoutes } from "@/lib/app-routes";
import { QUIET_LINK } from "@/lib/auth/constants";
import type { BookingCheckDto } from "@/lib/contract/schemas";
import { BOOKING_COPY } from "@/lib/data/load-board/booking";

interface Props {
    checks: readonly BookingCheckDto[];
}

const { checks: copy } = BOOKING_COPY;

const FIX_ROUTES: Record<NonNullable<BookingCheckDto["fix"]>, string> = {
    onboarding: appRoutes.carrierOnboarding(),
    documents: appRoutes.documents(),
    fleet: appRoutes.fleet(),
    loadBoard: appRoutes.loadBoard(),
};

export default function BookChecks({ checks }: Props) {
    const failing = checks.filter(({ passed }) => !passed);

    return (
        <Panel label={copy.label} aside={<StatusLabel label={failing.length === 0 ? copy.passed : copy.failed} tone={failing.length === 0 ? "success" : "danger"} />}>
            <ul className="flex flex-col">
                {checks.map((check) => (
                    <li key={check.key} className="border-border flex items-start gap-3 border-b py-2.5 text-xs first:pt-0 last:border-b-0 last:pb-0">
                        {check.passed ? <CheckmarkFilled aria-hidden className="text-success mt-px size-4 shrink-0" /> : <WarningAltFilled aria-hidden className="text-error mt-px size-4 shrink-0" />}
                        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                            <span className="flex flex-wrap items-baseline justify-between gap-2">
                                <span className="haulr-label text-text">{copy.keys[check.key]}</span>
                                <span className={check.passed ? "text-text-muted" : "text-error"}>{check.passed ? copy.passed : copy.failed}</span>
                            </span>
                            <span className={check.passed ? "text-text-secondary" : "text-text"}>{check.detail}</span>
                            {!check.passed && check.fix ? (
                                <Link href={FIX_ROUTES[check.fix]} className={`${QUIET_LINK} min-h-9 self-start py-2`}>
                                    {copy.fixes[check.fix]}
                                </Link>
                            ) : null}
                        </span>
                    </li>
                ))}
            </ul>
        </Panel>
    );
}
