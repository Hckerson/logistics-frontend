import type { ReactNode } from "react";
import HaulrFooter from "@/components/home/haulr-footer";
import HaulrNav from "@/components/home/haulr-nav";
import TrailRule from "@/components/home/trail-rule";
import { getSession } from "@/lib/utils/session";

export default async function PublicLayout({ children }: { children: ReactNode }) {
    const signedIn = (await getSession()) !== null;

    return (
        <>
            <div className="print:hidden">
                <HaulrNav signedIn={signedIn} />
            </div>
            <main>{children}</main>
            <div className="print:hidden">
                <TrailRule />
                <HaulrFooter signedIn={signedIn} />
            </div>
        </>
    );
}
