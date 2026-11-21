"use client";
import { useId, useState } from "react";
import { Camera, Image as ImageIcon } from "@carbon/icons-react";
import { FileTrigger } from "react-aria-components";
import AreaField from "@/components/common/area-field";
import DriverPodPage from "@/components/common/driver-pod-page";
import Button from "@/components/ui/button";
import Field from "@/components/ui/field";
import Input from "@/components/ui/input";
import Panel from "@/components/ui/panel";
import type { DriverTripDto } from "@/lib/contract/schemas";
import { DRIVER_COPY } from "@/lib/data/driver/copy";
import { POD_IMAGE, POD_LIMITS } from "@/lib/driver/constants";
import { useOfflineQueue } from "@/lib/hooks/use-offline-queue";
import { usePodUpload } from "@/lib/hooks/use-pod-upload";
import { pluralize } from "@/lib/utils/plural";

interface Props {
    owner: string;
    trip: DriverTripDto;
}

const { pod: copy } = DRIVER_COPY;
const STATUS = { checking: copy.checking, verified: copy.verified, review: copy.review } as const;

export default function DriverPod({ owner, trip }: Props) {
    const upload = usePodUpload(owner, trip.loadId);
    const queue = useOfflineQueue();
    const receiverId = useId();
    const notesId = useId();
    const [receiver, setReceiver] = useState("");
    const [notes, setNotes] = useState("");
    const [problem, setProblem] = useState<string | null>(null);
    const queued = queue.entries.some((entry) => entry.loadId === trip.loadId && entry.kind === "pod");

    if (trip.pod || queued) {
        return (
            <Panel label={copy.label}>
                <p role="status" className={trip.pod?.status === "verified" ? "text-signal-success text-xs" : "text-text-secondary text-xs"}>
                    {trip.pod ? STATUS[trip.pod.status] : copy.queued}
                </p>
            </Panel>
        );
    }

    const pick = (files: FileList | null, replacing?: string) => {
        const file = files?.[0];
        if (file) void upload.add(file, replacing);
    };

    const send = async () => {
        if (upload.pages.length < POD_LIMITS.minPages) return setProblem(copy.needPage);
        if (!receiver.trim()) return setProblem(copy.receiverMissing);
        setProblem(null);
        await upload.submit({ receiverName: receiver, osdNotes: notes });
    };

    return (
        <Panel label={copy.label} aside={<span className="haulr-label text-text-muted">{pluralize(upload.pages.length, copy.pagesReady)}</span>}>
            <p className="text-text-secondary text-xs">{copy.intro}</p>
            {upload.pages.length > 0 ? (
                <ol className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {upload.pages.map((page, index) => (
                        <DriverPodPage key={page.id} page={page} number={index + 1} onRetake={(files) => pick(files, page.id)} onRemove={() => upload.remove(page.id)} />
                    ))}
                </ol>
            ) : null}
            <div className="grid gap-2 sm:grid-cols-2">
                <FileTrigger acceptedFileTypes={POD_IMAGE.types} defaultCamera="environment" onSelect={(files) => pick(files)}>
                    <Button size="wide" tone="outline" trailing={Camera} pending={upload.checking}>
                        {copy.capture}
                    </Button>
                </FileTrigger>
                <FileTrigger acceptedFileTypes={POD_IMAGE.types} onSelect={(files) => pick(files)}>
                    <Button size="wide" tone="outline" trailing={ImageIcon}>
                        {copy.pick}
                    </Button>
                </FileTrigger>
            </div>
            {upload.rejection ? (
                <p role="alert" className="text-error text-xs">
                    {upload.rejection}
                </p>
            ) : null}
            <Field id={receiverId} label={copy.receiver} error={problem === copy.receiverMissing ? problem : undefined}>
                {(control) => <Input {...control} size="lg" value={receiver} maxLength={POD_LIMITS.receiverMax} autoComplete="off" onChange={(event) => setReceiver(event.target.value)} />}
            </Field>
            <AreaField id={notesId} label={copy.notes} value={notes} maxLength={POD_LIMITS.notesMax} onChange={(event) => setNotes(event.target.value)} aside={<span className="text-text-muted text-xs">{copy.notesHint}</span>} />
            {problem && problem !== copy.receiverMissing ? (
                <p role="alert" className="text-error text-xs">
                    {problem}
                </p>
            ) : null}
            <Button size="wide" onPress={() => void send()} className="min-h-14">
                {copy.submit}
            </Button>
        </Panel>
    );
}
