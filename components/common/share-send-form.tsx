"use client";
import { useId, useState, type FormEvent } from "react";
import Button from "@/components/ui/button";
import Field from "@/components/ui/field";
import Input from "@/components/ui/input";
import { useAnnounce } from "@/components/providers/announcer-provider";
import { LOAD_RECORD_COPY } from "@/lib/data/loads/record-copy";
import { useSendTrackingLink } from "@/lib/hooks/use-tracking";
import { errorMessage, failureFrom } from "@/lib/utils/action-result";
import { pluralize } from "@/lib/utils/plural";
import { trackingSendSchema } from "@/lib/validations/tracking";

interface Props {
    loadId: string;
}

const { share: copy } = LOAD_RECORD_COPY;
const SEPARATOR = ",";

export default function ShareSendForm({ loadId }: Props) {
    const send = useSendTrackingLink(loadId);
    const announce = useAnnounce();
    const fieldId = useId();
    const [text, setText] = useState("");
    const [invalid, setInvalid] = useState(false);
    const failure = send.isError ? failureFrom(send.error) : null;

    const submit = (event: FormEvent) => {
        event.preventDefault();
        if (send.isPending) return;
        const recipients = text
            .split(SEPARATOR)
            .map((value) => value.trim())
            .filter(Boolean);
        if (!trackingSendSchema.safeParse({ recipients }).success) {
            setInvalid(true);
            return;
        }
        send.mutate(
            { recipients },
            {
                onSuccess: ({ sent }) => {
                    setText("");
                    announce({ message: pluralize(sent, copy.sent) });
                },
            },
        );
    };

    return (
        <form onSubmit={submit} noValidate className="border-border flex flex-col gap-2 border-t pt-3">
            <Field id={fieldId} label={copy.recipients} hint={copy.recipientsHint} error={invalid ? copy.recipientsInvalid : failure ? errorMessage(failure) : undefined}>
                {(control) => (
                    <Input
                        {...control}
                        value={text}
                        autoComplete="off"
                        onChange={(event) => {
                            setText(event.target.value);
                            setInvalid(false);
                            send.reset();
                        }}
                    />
                )}
            </Field>
            <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" tone="outline" size="sm" pending={send.isPending} pendingLabel={copy.sending}>
                    {copy.send}
                </Button>
                {send.isSuccess ? <p className="text-accent text-xs">{pluralize(send.data.sent, copy.sent)}</p> : null}
            </div>
        </form>
    );
}
