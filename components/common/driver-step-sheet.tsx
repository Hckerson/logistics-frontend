"use client";
import { useId, useState } from "react";
import { ArrowRight } from "@carbon/icons-react";
import Button from "@/components/ui/button";
import Drawer from "@/components/ui/drawer";
import Field from "@/components/ui/field";
import Input from "@/components/ui/input";
import type { DriverStopEventDto } from "@/lib/contract/schemas";
import { DRIVER_COPY } from "@/lib/data/driver/copy";
import { STOP_EVENT_LIMITS } from "@/lib/driver/constants";
import { departureSchema } from "@/lib/validations/driver";

type Details = Required<Pick<DriverStopEventDto, "seal" | "pieces">>;

interface Props {
    isOpen: boolean;
    title: string;
    kicker: string;
    onClose: () => void;
    onConfirm: (details: Details) => void;
}

const { action: copy } = DRIVER_COPY;

export default function DriverStepSheet({ isOpen, title, kicker, onClose, onConfirm }: Props) {
    const sealId = useId();
    const piecesId = useId();
    const [seal, setSeal] = useState("");
    const [pieces, setPieces] = useState("");
    const [errors, setErrors] = useState<{ seal?: string; pieces?: string }>({});

    const confirm = () => {
        const details = departureSchema.safeParse({ seal, pieces });
        if (!details.success) {
            const failed = new Set(details.error.issues.map((issue) => issue.path[0]));
            return setErrors({ seal: failed.has("seal") ? copy.sealInvalid : undefined, pieces: failed.has("pieces") ? copy.piecesInvalid : undefined });
        }
        setErrors({});
        setSeal("");
        setPieces("");
        onConfirm(details.data);
    };

    return (
        <Drawer
            isOpen={isOpen}
            onOpenChange={(open) => (open ? undefined : onClose())}
            side="bottom"
            title={title}
            kicker={kicker}
            footer={
                <div className="flex flex-col gap-2">
                    <Button size="wide" trailing={ArrowRight} onPress={confirm} className="min-h-14">
                        {title}
                    </Button>
                    <Button tone="ghost" onPress={onClose}>
                        {copy.cancel}
                    </Button>
                </div>
            }
        >
            <div className="flex flex-col gap-4 p-4">
                <p className="text-text-secondary">{copy.sheetLead}</p>
                <div className="grid grid-cols-2 gap-3">
                    <Field id={sealId} label={copy.seal} error={errors.seal}>
                        {(control) => <Input {...control} size="lg" value={seal} maxLength={STOP_EVENT_LIMITS.sealMax} autoComplete="off" onChange={(event) => setSeal(event.target.value)} />}
                    </Field>
                    <Field id={piecesId} label={copy.pieces} error={errors.pieces}>
                        {(control) => <Input {...control} size="lg" value={pieces} inputMode="numeric" onChange={(event) => setPieces(event.target.value)} />}
                    </Field>
                </div>
            </div>
        </Drawer>
    );
}
