import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PublicPage from "@/components/common/public-page";
import TrackingView from "@/components/tracking/tracking-view";
import { TRACKING_COPY } from "@/lib/data/tracking/copy";
import { readTracking } from "@/lib/tracking/server-read";

interface Props {
    params: Promise<{ token: string }>;
}

const { meta } = TRACKING_COPY;

export const metadata: Metadata = {
    title: meta.title,
    description: meta.description,
    robots: { index: false, follow: false },
    referrer: "no-referrer",
};

export default async function TrackingPage({ params }: Props) {
    const { token } = await params;
    const read = await readTracking(token);
    if (read.kind === "missing") notFound();

    return (
        <PublicPage>
            <TrackingView token={token} read={read} />
        </PublicPage>
    );
}
