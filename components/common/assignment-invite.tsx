"use client";
import { useId, useState } from "react";
import Button from "@/components/ui/button";
import Field from "@/components/ui/field";
import Input from "@/components/ui/input";
import { ASSIGNMENT_COPY } from "@/lib/data/fleet/assignment";
import { FLEET } from "@/lib/fleet/constants";
import { useInviteDriver } from "@/lib/hooks/use-assign-load";
import { longDate } from "@/lib/tracking/view";
import { errorMessage, failureFrom } from "@/lib/utils/action-result";
import { fillTemplate } from "@/lib/utils/fill-template";
import { inviteDriverSchema } from "@/lib/validations/fleet";

interface Props {
    timeZone: string;
}

const { invite: copy } = ASSIGNMENT_COPY;

export default function AssignmentInvite({ timeZone }: Props) {
    const fieldId = useId();
    const [open, setOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [note, setNote] = useState("");
    const [invalid, setInvalid] = useState(false);
    const invite = useInviteDriver();
    const failure = invite.isError ? failureFrom(invite.error) : null;
    const problem = failure ? (failure.errorClass === "conflict" ? fillTemplate(copy.taken, { email }) : errorMessage(failure)) : undefined;

    const send = () => {
        const input = { email: email.trim(), note: note.trim() || undefined };
        if (!inviteDriverSchema.safeParse(input).success) return setInvalid(true);
        invite.mutate(input, { onSuccess: () => setOpen(false) });
    };

    return (
        <div className="flex flex-col gap-2">
            <p role="status" className="text-text-secondary text-xs empty:hidden">
                {invite.isSuccess ? fillTemplate(copy.sent, { email: invite.data.email, date: longDate(invite.data.expiresAt, timeZone) }) : ""}
            </p>
            {open ? (
                <div className="border-border flex flex-col gap-3 border-l-2 pl-3">
                    <Field id={`${fieldId}-email`} label={copy.email} error={invalid ? copy.invalid : problem}>
                        {(control) => (
                            <Input
                                {...control}
                                type="email"
                                autoComplete="off"
                                value={email}
                                maxLength={FLEET.emailMax}
                                onChange={(event) => {
                                    setEmail(event.target.value);
                                    setInvalid(false);
                                }}
                            />
                        )}
                    </Field>
                    <Field id={`${fieldId}-note`} label={copy.note} hint={copy.noteHint}>
                        {(control) => <Input {...control} value={note} maxLength={FLEET.noteMax} onChange={(event) => setNote(event.target.value)} />}
                    </Field>
                    <div className="flex flex-wrap gap-2">
                        <Button tone="outline" size="sm" pending={invite.isPending} pendingLabel={copy.sending} onPress={send}>
                            {copy.send}
                        </Button>
                        <Button tone="ghost" size="sm" isDisabled={invite.isPending} onPress={() => setOpen(false)}>
                            {copy.cancel}
                        </Button>
                    </div>
                </div>
            ) : (
                <Button tone="link" size="inline" className="self-start" onPress={() => setOpen(true)}>
                    {copy.open}
                </Button>
            )}
        </div>
    );
}
