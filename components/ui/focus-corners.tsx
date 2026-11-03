import clsx from "clsx";
import HudCorners from "@/components/ui/hud-corners";
import { FOCUS_CORNERS } from "@/lib/ui/constants";

interface Props {
    invalid?: boolean;
}

export default function FocusCorners({ invalid = false }: Props) {
    return (
        <HudCorners
            tone={invalid ? "error" : "accent"}
            className={clsx(FOCUS_CORNERS.motion, invalid ? FOCUS_CORNERS.shown : FOCUS_CORNERS.hidden)}
        />
    );
}
