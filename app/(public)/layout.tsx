import type { ReactNode } from "react";
import HaulrFooter from "@/components/home/haulr-footer";
import HaulrNav from "@/components/home/haulr-nav";
import TrailRule from "@/components/home/trail-rule";
import { MAIN_CONTENT_ID } from "@/lib/constants";
import { getSession } from "@/lib/utils/session";

export default async function PublicLayout({ children }: { children: ReactNode }) {
    const signedIn = (await getSession()) !== null;

    return (
        <>
            <div className="print:hidden">
                <HaulrNav signedIn={signedIn} />
            </div>
            <main id={MAIN_CONTENT_ID} tabIndex={-1} className="outline-none">
                {children}
            </main>
            <div className="print:hidden">
                <TrailRule />
                <HaulrFooter signedIn={signedIn} />
            </div>
        </>
    );
}
