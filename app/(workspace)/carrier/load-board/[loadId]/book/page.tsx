import type { Metadata } from "next";
import BookGone from "@/components/common/book-gone";
import BookLoad from "@/components/common/book-load";
import WorkspacePage from "@/components/common/workspace-page";
import { BOOKING_COPY } from "@/lib/data/load-board/booking";
import { readBooking } from "@/lib/load-board/server-read";
import { fillTemplate } from "@/lib/utils/fill-template";

interface Props {
    params: Promise<{ loadId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { loadId } = await params;
    return { title: fillTemplate(BOOKING_COPY.meta, { reference: loadId }), robots: { index: false, follow: false } };
}

export default async function BookLoadPage({ params }: Props) {
    const { loadId } = await params;
    const booking = await readBooking(loadId);

    return <WorkspacePage>{booking ? <BookLoad initial={booking} /> : <BookGone loadId={loadId} />}</WorkspacePage>;
}
