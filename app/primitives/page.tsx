import { notFound } from "next/navigation";
import PrimitivesActions from "@/components/common/primitives-actions";
import PrimitivesChoices from "@/components/common/primitives-choices";
import PrimitivesCollections from "@/components/common/primitives-collections";
import PrimitivesFields from "@/components/common/primitives-fields";
import PrimitivesHeader from "@/components/common/primitives-header";
import PrimitivesOverlays from "@/components/common/primitives-overlays";
import PrimitivesStatus from "@/components/common/primitives-status";
import { MAIN_CONTENT_ID } from "@/lib/constants";

export default function PrimitivesPage() {
    if (process.env.NODE_ENV === "production") notFound();

    return (
        <main id={MAIN_CONTENT_ID} className="haulr-shell flex flex-col gap-4 py-6">
            <PrimitivesHeader />
            <PrimitivesActions />
            <PrimitivesFields />
            <PrimitivesChoices />
            <PrimitivesOverlays />
            <PrimitivesStatus />
            <PrimitivesCollections />
        </main>
    );
}
