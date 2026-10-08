import clsx from "clsx";
import LaneArt from "@/components/auth/lane-art";
import { AUTH_COLUMNS } from "@/lib/auth/constants";
import { LANE_ART } from "@/lib/auth/lane-art";
import { SIGN_IN_COPY } from "@/lib/data/auth/sign-in";

export default function LaneScene() {
    return (
        <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 flex flex-col [mask-image:radial-gradient(ellipse_75%_26%_at_55%_14%,#000_45%,transparent)] lg:[mask-image:radial-gradient(ellipse_62%_78%_at_32%_52%,#000_40%,transparent)]"
        >
            <div className="hidden h-(--haulr-header) shrink-0 lg:block" />
            <div className={clsx("haulr-shell grid min-h-0 flex-1 lg:pb-8", AUTH_COLUMNS)}>
                <div className="grid h-[30svh] place-items-center py-4 opacity-80 [container-type:size] lg:h-auto lg:py-10 lg:opacity-100">
                    <LaneArt art={LANE_ART} tag={SIGN_IN_COPY.tag} />
                </div>
            </div>
        </div>
    );
}
