import type { Metadata } from "next";
import LoadActions from "@/components/common/load-actions";
import LoadCoverage from "@/components/common/load-coverage";
import LoadDocuments from "@/components/common/load-documents";
import LoadHeader from "@/components/common/load-header";
import LoadMoney from "@/components/common/load-money";
import LoadSections from "@/components/common/load-sections";
import LoadShare from "@/components/common/load-share";
import LoadStops from "@/components/common/load-stops";
import LoadTimeline from "@/components/common/load-timeline";
import LoadTracking from "@/components/common/load-tracking";
import WorkspacePage from "@/components/common/workspace-page";
import { LOAD_COPY } from "@/lib/data/loads/copy";
import { readLoad } from "@/lib/loads/server-read";
import { fillTemplate } from "@/lib/utils/fill-template";

interface Props {
    params: Promise<{ loadId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { loadId } = await params;
    return { title: fillTemplate(LOAD_COPY.meta.title, { reference: loadId }), robots: { index: false, follow: false } };
}

export default async function LoadPage({ params }: Props) {
    const { loadId } = await params;
    const load = await readLoad(loadId);

    return (
        <WorkspacePage>
            <LoadHeader initial={load} />
            <LoadSections
                actions={<LoadActions initial={load} />}
                coverage={<LoadCoverage initial={load} />}
                tracking={<LoadTracking initial={load} />}
                share={<LoadShare initial={load} />}
                stops={<LoadStops initial={load} />}
                money={<LoadMoney initial={load} />}
                documents={<LoadDocuments initial={load} />}
                timeline={<LoadTimeline initial={load} />}
            />
        </WorkspacePage>
    );
}
