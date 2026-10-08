import clsx from "clsx";
import LaneTruck from "@/components/auth/lane-truck";
import { percentOf } from "@/lib/auth/point-along";
import type { LaneArtData, LaneTag } from "@/lib/types";

interface Props {
    art: LaneArtData;
    tag: LaneTag;
}

const LAYER = "absolute inset-0 size-full overflow-visible";

export default function LaneArt({ art, tag }: Props) {
    const { width, height } = art;
    const viewBox = `0 0 ${width} ${height}`;

    return (
        <div
            className="relative"
            style={{ aspectRatio: `${width} / ${height}`, width: `min(100cqw, ${width / height} * 100cqh)` }}
        >
            <svg viewBox={viewBox} className={LAYER}>
                <path d={art.roads} fill="none" className="stroke-border" strokeWidth={1} vectorEffect="non-scaling-stroke" />
                <path
                    d={art.route}
                    pathLength={1}
                    fill="none"
                    className="haulr-draw stroke-accent/25 blur-[6px]"
                    strokeWidth={8}
                    strokeLinecap="round"
                />
                <path
                    d={art.route}
                    pathLength={1}
                    fill="none"
                    className="haulr-draw stroke-accent"
                    strokeWidth={1.75}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
            <svg viewBox={viewBox} className={clsx(LAYER, "will-change-transform motion-reduce:hidden")}>
                {art.traffic.map((run) => (
                    <path
                        key={run.d}
                        d={run.d}
                        pathLength={1}
                        fill="none"
                        strokeDasharray={`${run.dash} 2`}
                        className="haulr-traffic stroke-(--haulr-headlight) opacity-70"
                        strokeWidth={1.25}
                        strokeLinecap="round"
                        style={{ animationDuration: `${run.duration}s`, animationDelay: `${run.delay}s` }}
                    />
                ))}
            </svg>
            {art.hubs.map((hub) => (
                <span
                    key={hub.code}
                    className={clsx("absolute -translate-x-1.5 -translate-y-1/2 items-center gap-2", hub.stop ? "flex" : "hidden lg:flex")}
                    style={{ left: percentOf(hub.at[0], width), top: percentOf(hub.at[1], height) }}
                >
                    <span
                        className={clsx(
                            "block rounded-full",
                            hub.stop ? "border-accent bg-background size-3 border-2" : "bg-text-muted/60 ml-0.5 size-2",
                        )}
                    />
                    {hub.stop || hub.major ? (
                        <span className={clsx("haulr-label", hub.stop ? "text-text-secondary" : "text-text-muted")}>
                            {hub.code}
                        </span>
                    ) : null}
                </span>
            ))}
            <LaneTruck width={width} height={height} route={art.route} points={art.points} times={art.times} tag={tag} />
        </div>
    );
}
