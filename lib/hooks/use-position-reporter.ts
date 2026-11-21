import { nanoid } from "nanoid";
import { useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { reportPositions } from "@/lib/actions/report-positions";
import type { DriverPositionDto } from "@/lib/contract/schemas";
import { POSITION_REPORTING } from "@/lib/driver/constants";
import type { LonLat } from "@/lib/types";
import { failureFrom, unwrap } from "@/lib/utils/action-result";

const STOPPED = ["forbidden", "conflict", "not-found"];

export function usePositionReporter(loadId: string, coords: LonLat | null, active: boolean) {
    const buffer = useRef<DriverPositionDto[]>([]);
    const sampled = useRef(0);
    const sending = useRef(false);
    const stopped = useRef(false);
    const { mutate } = useMutation({
        mutationFn: async (positions: DriverPositionDto[]) => unwrap(await reportPositions(loadId, { positions })),
    });

    useEffect(() => {
        const now = new Date().getTime();
        if (!active || !coords || stopped.current || now - sampled.current < POSITION_REPORTING.sampleMs) return;
        sampled.current = now;
        const sample = { id: nanoid(), recordedAt: new Date(now).toISOString(), latitude: coords[1], longitude: coords[0] };
        buffer.current = [...buffer.current, sample].slice(-POSITION_REPORTING.bufferMax);
    }, [active, coords]);

    useEffect(() => {
        if (!active) return;
        const timer = setInterval(() => {
            if (sending.current || stopped.current || buffer.current.length === 0) return;
            const batch = buffer.current.slice(0, POSITION_REPORTING.batchMax);
            sending.current = true;
            mutate(batch, {
                onSuccess: () => {
                    buffer.current = buffer.current.filter((position) => !batch.includes(position));
                },
                onError: (error) => {
                    stopped.current = STOPPED.includes(failureFrom(error)?.errorClass ?? "");
                },
                onSettled: () => {
                    sending.current = false;
                },
            });
        }, POSITION_REPORTING.reportEveryMs);
        return () => clearInterval(timer);
    }, [active, mutate]);
}
