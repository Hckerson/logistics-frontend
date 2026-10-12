import type { Metadata } from "next";
import PageIntro from "@/components/common/page-intro";
import RateEstimator from "@/components/estimator/rate-estimator";
import PublicPage from "@/components/common/public-page";
import { ESTIMATOR_COPY } from "@/lib/data/quotes/estimator";
import { laneParams } from "@/lib/quotes/params";
import { getSession } from "@/lib/utils/session";

interface Props {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const { intro, meta } = ESTIMATOR_COPY;

export const metadata: Metadata = { title: meta.title, description: meta.description };

export default async function RateEstimatorPage({ searchParams }: Props) {
    const [search, session] = await Promise.all([searchParams, getSession()]);

    return (
        <PublicPage>
            <PageIntro eyebrow={intro.eyebrow} title={intro.title} lead={intro.lead} />
            <RateEstimator params={laneParams(search)} signedIn={session !== null} />
        </PublicPage>
    );
}
