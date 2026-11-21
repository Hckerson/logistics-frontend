import type { Metadata } from "next";
import DriverTrip from "@/components/common/driver-trip";
import WorkspacePage from "@/components/common/workspace-page";
import { DRIVER_COPY } from "@/lib/data/driver/copy";
import { fillTemplate } from "@/lib/utils/fill-template";

interface Props {
    params: Promise<{ loadId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { loadId } = await params;
    return { title: fillTemplate(DRIVER_COPY.trip.meta, { reference: loadId }) };
}

export default async function DriverTripPage({ params }: Props) {
    const { loadId } = await params;

    return (
        <WorkspacePage>
            <DriverTrip loadId={loadId} />
        </WorkspacePage>
    );
}
