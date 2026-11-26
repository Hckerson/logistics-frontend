"use client";
import { Renew } from "@carbon/icons-react";
import AssignmentInvite from "@/components/common/assignment-invite";
import Button from "@/components/ui/button";
import DataTable from "@/components/ui/data-table";
import StatusLabel from "@/components/ui/status-label";
import { useAnnounce } from "@/components/providers/announcer-provider";
import type { DriverInvitationDto } from "@/lib/contract/schemas";
import { ROSTER_COPY } from "@/lib/data/fleet/roster-copy";
import { FLEET } from "@/lib/fleet/constants";
import { useFleetRoster, useInvitationActions } from "@/lib/hooks/use-fleet";
import { dayName } from "@/lib/tracking/view";
import type { TableColumn } from "@/lib/types";
import { errorMessage, failureFrom } from "@/lib/utils/action-result";
import { fillTemplate } from "@/lib/utils/fill-template";

interface Props {
    onRevoke: (invitation: DriverInvitationDto) => void;
}

const { invitations: copy } = ROSTER_COPY;

export default function FleetInvitations({ onRevoke }: Props) {
    const roster = useFleetRoster();
    const { resend } = useInvitationActions();
    const announce = useAnnounce();
    const rows = roster.data?.invitations ?? [];
    const timeZone = roster.data?.timeZone ?? FLEET.defaultZone;
    const failure = resend.isError ? failureFrom(resend.error) : null;
    const problem = failure ? (failure.errorClass === "rate-limit" ? copy.limit : errorMessage(failure)) : null;

    const send = (invitation: DriverInvitationDto) =>
        resend.mutate(invitation.id, {
            onSuccess: (sent) => announce({ message: fillTemplate(copy.resent, { email: sent.email, date: dayName(sent.expiresAt, timeZone) }) }),
        });

    const columns: TableColumn<DriverInvitationDto>[] = [
        { key: "email", label: copy.columns.email, rowHeader: true, cell: (invitation) => <span className="text-text block truncate">{invitation.email}</span> },
        {
            key: "state",
            label: copy.columns.state,
            width: "11rem",
            cell: ({ status, expiresAt }) => (
                <StatusLabel label={fillTemplate(status === "open" ? copy.expires : copy.expired, { date: dayName(expiresAt, timeZone) })} tone={copy.tones[status]} />
            ),
        },
        { key: "sent", label: copy.columns.sent, width: "11rem", phone: "hidden", cell: ({ inviter, sentAt }) => fillTemplate(copy.sent, { name: inviter, date: dayName(sentAt, timeZone) }) },
        {
            key: "actions",
            label: copy.columns.actions,
            align: "end",
            width: "13rem",
            cell: (invitation) => (
                <span className="flex items-center justify-end gap-3">
                    <Button
                        tone="link"
                        size="sm"
                        icon={Renew}
                        pending={resend.isPending && resend.variables === invitation.id}
                        disabledReason={invitation.resendsLeft === 0 ? copy.limit : undefined}
                        onPress={() => send(invitation)}
                    >
                        {copy.resend}
                    </Button>
                    <span className="text-text-muted text-xs tabular-nums">{fillTemplate(copy.resendsLeft, { count: String(invitation.resendsLeft) })}</span>
                    <Button tone="link" size="sm" onPress={() => onRevoke(invitation)}>
                        {copy.revoke}
                    </Button>
                </span>
            ),
        },
    ];

    return (
        <div className="flex flex-col gap-2">
            <DataTable
                caption={copy.caption}
                count={roster.data ? rows.length : undefined}
                columns={columns}
                rows={rows}
                rowKey={(invitation) => invitation.id}
                rowLabel={(invitation) => invitation.email}
                rowSignature={(invitation) => `${invitation.status}-${invitation.sentAt}`}
                loading={roster.isPending}
                failed={roster.isError}
                onRetry={() => void roster.refetch()}
                empty={<span className="text-text-muted text-xs">{copy.empty}</span>}
                footer={roster.data ? <AssignmentInvite timeZone={timeZone} /> : undefined}
            />
            {problem ? (
                <p role="alert" className="text-error text-xs">
                    {problem}
                </p>
            ) : null}
        </div>
    );
}
