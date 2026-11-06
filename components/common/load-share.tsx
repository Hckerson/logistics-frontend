"use client";
import { useState } from "react";
import ReasonDialog from "@/components/common/reason-dialog";
import SectionState from "@/components/common/section-state";
import ShareLink from "@/components/common/share-link";
import ShareSendForm from "@/components/common/share-send-form";
import Button from "@/components/ui/button";
import Panel from "@/components/ui/panel";
import { useSession } from "@/components/providers/session-provider";
import { can } from "@/lib/auth/capabilities";
import { hasAnyRole, ROLE_GROUPS } from "@/lib/auth/roles";
import type { LoadDto } from "@/lib/contract/schemas";
import { LOAD_RECORD_COPY } from "@/lib/data/loads/record-copy";
import { useLoad } from "@/lib/hooks/use-loads";
import { useNow } from "@/lib/hooks/use-now";
import { useShareTrackingLink, useTrackingLinks } from "@/lib/hooks/use-tracking";
import { deliveredAt, linkExpiry } from "@/lib/loads/tracking";
import { stopMoment } from "@/lib/loads/view";
import { UI_COPY } from "@/lib/ui/copy";
import { errorMessage, failureFrom } from "@/lib/utils/action-result";
import { fillTemplate } from "@/lib/utils/fill-template";

interface Props {
    initial: LoadDto;
}

const { share: copy } = LOAD_RECORD_COPY;

export default function LoadShare({ initial }: Props) {
    const { data: load = initial } = useLoad(initial.id, initial);
    const roles = useSession()?.roles ?? [];
    const allowed = can(roles, "shareTrackingLink");
    const links = useTrackingLinks(load.id, allowed);
    const create = useShareTrackingLink(load.id);
    const now = useNow();
    const [asking, setAsking] = useState(false);

    if (!allowed) return null;

    const staff = hasAnyRole(roles, ROLE_GROUPS.internal);
    const expiry = linkExpiry(deliveredAt(load.stops));
    const closed = expiry !== null && now !== null && Date.parse(expiry) <= now;
    const zone = load.stops[load.stops.length - 1].facility.timeZone;
    const failure = create.isError ? failureFrom(create.error) : null;

    const make = (reason?: string) => create.mutate({ reason }, { onSuccess: () => setAsking(false) });

    return (
        <Panel label={copy.label}>
            <SectionState label={copy.label} query={links}>
                {(list) => {
                    const active = list.find((link) => link.active);
                    const revoked = list.filter((link) => link.revokedAt !== null);
                    return (
                        <>
                            {active ? <ShareLink load={load} link={active} staff={staff} /> : null}
                            {active ? <ShareSendForm loadId={load.id} /> : null}
                            {!active && closed ? <p className="text-text-muted text-xs">{copy.closed}</p> : null}
                            {!active && !closed ? (
                                <>
                                    <p className="text-text-secondary text-xs">{copy.exposes}</p>
                                    <Button
                                        tone="outline"
                                        size="sm"
                                        pending={create.isPending && !asking}
                                        pendingLabel={copy.creating}
                                        onPress={() => (staff ? setAsking(true) : make())}
                                        className="self-start"
                                    >
                                        {copy.create}
                                    </Button>
                                    {failure && !asking ? (
                                        <p role="alert" className="text-error text-xs">
                                            {errorMessage(failure)}
                                        </p>
                                    ) : null}
                                </>
                            ) : null}
                            {revoked.length > 0 ? (
                                <div className="border-border flex flex-col gap-1 border-t pt-3">
                                    <p className="haulr-label text-text-muted">{copy.history}</p>
                                    <ul className="flex flex-col gap-1">
                                        {revoked.map((link) => (
                                            <li key={link.id} className="text-text-muted text-xs">
                                                {fillTemplate(copy.revokedOn, { time: stopMoment(link.revokedAt ?? link.createdAt, zone), name: link.createdByName })}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ) : null}
                        </>
                    );
                }}
            </SectionState>
            <ReasonDialog
                key={asking ? "open" : "closed"}
                isOpen={asking}
                kicker={load.id}
                title={copy.createTitle}
                consequence={copy.exposes}
                confirmLabel={copy.create}
                cancelLabel={UI_COPY.cancel}
                needsReason
                pending={create.isPending}
                failure={asking ? failure : null}
                onClose={() => setAsking(false)}
                onConfirm={make}
            />
        </Panel>
    );
}
