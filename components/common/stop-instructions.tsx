"use client";
import { useId, useState } from "react";
import { Edit } from "@carbon/icons-react";
import AreaField from "@/components/common/area-field";
import Button from "@/components/ui/button";
import { useAnnounce } from "@/components/providers/announcer-provider";
import type { StopDto } from "@/lib/contract/schemas";
import { LOAD_COPY } from "@/lib/data/loads/copy";
import { LOAD_RECORD_COPY } from "@/lib/data/loads/record-copy";
import { useStopInstructions } from "@/lib/hooks/use-loads";
import { STOP_INSTRUCTIONS } from "@/lib/loads/constants";
import { errorMessage, failureFrom } from "@/lib/utils/action-result";
import { fillTemplate } from "@/lib/utils/fill-template";

interface Props {
    loadId: string;
    version: number;
    stop: StopDto;
    editable: boolean;
}

const { instructions: copy } = LOAD_RECORD_COPY;

export default function StopInstructions({ loadId, version, stop, editable }: Props) {
    const save = useStopInstructions(loadId, stop.id);
    const announce = useAnnounce();
    const fieldId = useId();
    const [draft, setDraft] = useState<string | null>(null);
    const failure = save.isError ? failureFrom(save.error) : null;
    const closed = failure?.errorClass === "conflict";

    const submit = () => {
        if (draft === null || save.isPending) return;
        save.mutate(
            { instructions: draft, version },
            {
                onSuccess: () => {
                    setDraft(null);
                    announce({ message: copy.saved });
                },
                onError: (error) => {
                    if (failureFrom(error)?.errorClass === "conflict") setDraft(null);
                },
            },
        );
    };

    if (draft === null) {
        return (
            <>
                {stop.instructions ? <p className="text-text-secondary border-border-dark border-l-2 pl-2 text-xs">{stop.instructions}</p> : null}
                {closed ? <p className="text-text-muted text-xs">{copy.closed}</p> : null}
                {editable && !closed ? (
                    <Button
                        tone="link"
                        size="inline"
                        icon={Edit}
                        onPress={() => {
                            save.reset();
                            setDraft(stop.instructions ?? "");
                        }}
                        className="self-start"
                    >
                        {stop.instructions ? copy.edit : copy.add}
                    </Button>
                ) : null}
            </>
        );
    }

    return (
        <div className="flex flex-col gap-2">
            <AreaField
                id={fieldId}
                label={fillTemplate(copy.label, { stop: `${LOAD_COPY.stops.types[stop.type]} ${stop.sequence}` })}
                value={draft}
                maxLength={STOP_INSTRUCTIONS.max}
                onChange={(event) => setDraft(event.target.value)}
                error={failure ? errorMessage(failure) : undefined}
                aside={<span className="haulr-label text-text-muted">{`${draft.length}/${STOP_INSTRUCTIONS.max}`}</span>}
            />
            {failure?.errorClass === "precondition" ? (
                <p className="text-text-muted text-xs">{fillTemplate(copy.latest, { text: stop.instructions ?? copy.empty })}</p>
            ) : null}
            <p className="text-text-muted text-xs">{copy.hint}</p>
            <div className="flex gap-2">
                <Button size="sm" pending={save.isPending} pendingLabel={copy.saving} onPress={submit}>
                    {copy.save}
                </Button>
                <Button tone="ghost" size="sm" isDisabled={save.isPending} onPress={() => setDraft(null)}>
                    {copy.cancel}
                </Button>
            </div>
        </div>
    );
}
