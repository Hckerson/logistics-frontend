import clsx from "clsx";
import LaneArt from "@/components/auth/lane-art";
import { AUTH_COLUMNS } from "@/lib/auth/constants";
import { LANE_ART } from "@/lib/auth/lane-art";
import { AUTH_COPY } from "@/lib/data/auth/shared";

export default function LaneScene() {
    return (
        <div
            aria-hidden
            className="haulr-auth-mask pointer-events-none absolute inset-0 -z-10 flex flex-col"
        >
            <div className="hidden h-(--haulr-header) shrink-0 lg:block" />
            <div className={clsx("haulr-shell grid min-h-0 flex-1 lg:pb-8", AUTH_COLUMNS)}>
                <div className="grid h-(--haulr-auth-band) place-items-center py-4 opacity-80 [container-type:size] lg:h-auto lg:justify-items-end lg:py-10 lg:opacity-100">
                    <LaneArt art={LANE_ART} tag={AUTH_COPY.tag} />
                </div>
            </div>
        </div>
    );
}
