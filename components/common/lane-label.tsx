import { UI_COPY } from "@/lib/ui/copy";

interface Props {
    origin: string;
    destination: string;
}

export default function LaneLabel({ origin, destination }: Props) {
    return (
        <span className="text-text">
            {origin}{" "}
            <span aria-hidden className="text-accent">
                →
            </span>
            <span className="sr-only">{UI_COPY.routeTo}</span> {destination}
        </span>
    );
}
