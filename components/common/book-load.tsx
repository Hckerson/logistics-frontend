"use client";
import { nanoid } from "nanoid";
import { useRef, useState } from "react";
import AccountStandingNotice from "@/components/common/account-standing-notice";
import BookChecks from "@/components/common/book-checks";
import BookHero from "@/components/common/book-hero";
import BookOutcome from "@/components/common/book-outcome";
import BookSigning from "@/components/common/book-signing";
import BookSimilar from "@/components/common/book-similar";
import BookTerms from "@/components/common/book-terms";
import ButtonLink from "@/components/ui/button-link";
import { useAnnounce } from "@/components/providers/announcer-provider";
import { appRoutes } from "@/lib/app-routes";
import type { LoadBookedDto, LoadBookingDto } from "@/lib/contract/schemas";
import { BOOKING_COPY } from "@/lib/data/load-board/booking";
import { useBookLoad, useLoadBooking } from "@/lib/hooks/use-load-board";
import { LOAD_BOARD } from "@/lib/load-board/constants";
import type { Crumb } from "@/lib/types";
import { errorMessage, failureFrom } from "@/lib/utils/action-result";
import { fillTemplate } from "@/lib/utils/fill-template";

interface Props {
    initial: LoadBookingDto;
    trail: readonly Crumb[];
}

const { outcome: copy, confirmation } = BOOKING_COPY;

export default function BookLoad({ initial, trail }: Props) {
    const { data: booking, refetch } = useLoadBooking(initial.loadId, initial);
    const book = useBookLoad(booking.loadId);
    const announce = useAnnounce();
    const outcome = useRef<HTMLDivElement>(null);
    const [key, setKey] = useState(nanoid);
    const [booked, setBooked] = useState<LoadBookedDto | null>(null);
    const [taken, setTaken] = useState(false);
    const failure = book.isError ? failureFrom(book.error) : null;
    const problem =
        failure === null || failure.errorClass === "validation" || failure.errorClass === "conflict"
            ? null
            : failure.errorClass === "precondition"
              ? copy.changed
              : failure.errorClass === "forbidden"
                ? confirmation.blocked
                : errorMessage(failure);
    const pickup = booking.stops[0].facility;

    const onBook = (signerName: string) =>
        book.mutate(
            { idempotencyKey: key, version: booking.version, rateConfirmationVersion: booking.rateConfirmation.version, signerName, attested: true },
            {
                onSuccess: (result) => {
                    setBooked(result);
                    announce({ message: fillTemplate(copy.announced, { reference: result.loadId }) });
                    requestAnimationFrame(() => outcome.current?.focus());
                },
                onError: (error) => {
                    const kind = failureFrom(error)?.errorClass;
                    if (kind === "conflict") {
                        setTaken(true);
                        announce({ message: copy.taken, tone: "assertive" });
                    }
                    if (kind === "precondition" || kind === "forbidden") {
                        setKey(nanoid());
                        void refetch();
                    }
                },
            },
        );

    return (
        <div className="flex flex-col gap-6">
            <BookHero booking={booking} trail={trail} />
            <AccountStandingNotice capabilities={["book"]} />
            {booked ? <BookOutcome ref={outcome} booked={booked} /> : null}
            {taken && !booked ? (
                <div role="alert" className="border-error flex flex-col gap-4 border-l-2 py-1 pl-4">
                    <p className="text-text text-lg">{copy.taken}</p>
                    <BookSimilar loadId={booking.loadId} query={{ origin: `${pickup.city}, ${pickup.region}`, originRadius: LOAD_BOARD.similarRadius, equipment: booking.equipment }} />
                    <ButtonLink href={appRoutes.loadBoard()} tone="outline" className="self-start">
                        {copy.board}
                    </ButtonLink>
                </div>
            ) : null}
            {!booked && !taken ? (
                <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_26rem] lg:items-start lg:gap-8">
                    <div className="order-2 lg:order-1">
                        <BookTerms booking={booking} />
                    </div>
                    <div className="contents lg:sticky lg:top-6 lg:order-2 lg:flex lg:flex-col lg:gap-6">
                        <div className="order-1">
                            <BookChecks checks={booking.checks} />
                        </div>
                        <div className="order-3">
                            <BookSigning
                                key={`${booking.version}:${booking.rateConfirmation.version}`}
                                booking={booking}
                                pending={book.isPending}
                                problem={problem}
                                nameRejected={failure?.errorClass === "validation"}
                                onBook={onBook}
                            />
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
