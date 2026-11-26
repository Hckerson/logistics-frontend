import type { Metadata } from "next";
import LoadActions from "@/components/common/load-actions";
import LoadAssignment from "@/components/common/load-assignment";
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
import { requireUser } from "@/lib/auth/guards";
import { LOAD_COPY } from "@/lib/data/loads/copy";
import { readLoad } from "@/lib/loads/server-read";
import { backParam } from "@/lib/navigation/back";
import { loadTrail } from "@/lib/navigation/trails";
import { fillTemplate } from "@/lib/utils/fill-template";

interface Props {
    params: Promise<{ loadId: string }>;
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { loadId } = await params;
    return { title: fillTemplate(LOAD_COPY.meta.title, { reference: loadId }), robots: { index: false, follow: false } };
}

export default async function LoadPage({ params, searchParams }: Props) {
    const { loadId } = await params;
    const [load, user, search] = await Promise.all([readLoad(loadId), requireUser(), searchParams]);
    const trail = loadTrail(user.roles, backParam(search));

    return (
        <WorkspacePage>
            <LoadHeader initial={load} trail={trail} />
            <LoadSections
                actions={<LoadActions initial={load} />}
                coverage={<LoadCoverage initial={load} />}
                assignment={<LoadAssignment initial={load} />}
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
