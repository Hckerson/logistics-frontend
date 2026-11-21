"use client";
import { forwardRef, useState } from "react";
import { CheckmarkFilled } from "@carbon/icons-react";
import AssignmentDeadline from "@/components/common/assignment-deadline";
import AssignmentDialog from "@/components/common/assignment-dialog";
import Button from "@/components/ui/button";
import ButtonLink from "@/components/ui/button-link";
import { appRoutes } from "@/lib/app-routes";
import type { LoadBookedDto } from "@/lib/contract/schemas";
import { BOOKING_COPY } from "@/lib/data/load-board/booking";
import { stopMoment } from "@/lib/loads/view";
import { fillTemplate } from "@/lib/utils/fill-template";

interface Props {
    booked: LoadBookedDto;
}

const { outcome: copy } = BOOKING_COPY;

const BookOutcome = forwardRef<HTMLDivElement, Props>(function BookOutcome({ booked }, ref) {
    const [assigning, setAssigning] = useState(false);

    return (
        <div ref={ref} tabIndex={-1} role="status" className="border-success flex flex-col gap-4 border-l-2 py-1 pl-4 outline-none">
            <p className="text-text flex items-center gap-2 text-lg">
                <CheckmarkFilled aria-hidden className="text-success size-5" />
                {copy.booked}
            </p>
            <p className="text-text-secondary text-sm">
                {fillTemplate(copy.bookedBody, { reference: booked.loadId, deadline: stopMoment(booked.assignmentDeadline, booked.timeZone) })}
            </p>
            <AssignmentDeadline deadline={booked.assignmentDeadline} timeZone={booked.timeZone} />
            <p className="text-text-muted text-xs">{copy.deadlineNote}</p>
            <div className="flex flex-col gap-2 sm:flex-row">
                <Button size="lg" onPress={() => setAssigning(true)}>
                    {copy.assign}
                </Button>
                <ButtonLink href={appRoutes.load(booked.loadId)} size="lg" tone="outline">
                    {copy.later}
                </ButtonLink>
            </div>
            <ButtonLink href={appRoutes.dispatchBoard()} tone="link" size="inline" className="self-start">
                {copy.plan}
            </ButtonLink>
            {assigning ? <AssignmentDialog target={{ loadId: booked.loadId }} onClose={() => setAssigning(false)} /> : null}
        </div>
    );
});

export default BookOutcome;
