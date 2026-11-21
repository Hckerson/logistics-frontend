import ButtonLink from "@/components/ui/button-link";
import { appRoutes } from "@/lib/app-routes";
import { BOOKING_COPY } from "@/lib/data/load-board/booking";

interface Props {
    loadId: string;
}

const { outcome: copy } = BOOKING_COPY;

export default function BookGone({ loadId }: Props) {
    return (
        <div role="alert" className="border-error flex flex-col gap-4 border-l-2 py-1 pl-4">
            <h1 className="text-text font-mono text-sm">{loadId}</h1>
            <p className="text-text text-lg">{copy.gone}</p>
            <ButtonLink href={appRoutes.loadBoard()} tone="outline" className="self-start">
                {copy.board}
            </ButtonLink>
        </div>
    );
}
