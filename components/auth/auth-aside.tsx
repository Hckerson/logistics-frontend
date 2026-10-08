import LaneArt from "@/components/auth/lane-art";
import HaulrWordmark from "@/components/home/haulr-wordmark";
import { HAULR_BRAND } from "@/lib/data/home/brand";
import { SIGN_IN_COPY } from "@/lib/data/auth/sign-in";
import { LANE_ART } from "@/lib/auth/lane-art";

const { aside } = SIGN_IN_COPY;

export default function AuthAside() {
    return (
        <aside className="border-border bg-background sticky top-0 hidden h-svh flex-col gap-12 overflow-hidden border-r p-12 lg:flex xl:p-16">
            <HaulrWordmark />
            <div className="mx-auto grid min-h-0 w-full max-w-sm flex-1 place-items-center [container-type:size] xl:max-w-md">
                <LaneArt {...LANE_ART} />
            </div>
            <div className="flex flex-col gap-5">
                <p className="text-text text-4xl leading-none font-light tracking-tight font-stretch-(--haulr-wide) xl:text-5xl">
                    {aside.title.map((line) => (
                        <span key={line} className="block">
                            {line}
                        </span>
                    ))}
                </p>
                <p className="text-text-secondary max-w-md text-(length:--haulr-lead)">{aside.body}</p>
                <p className="haulr-label text-text-muted">{HAULR_BRAND.tag}</p>
            </div>
        </aside>
    );
}
