import { Add } from "@carbon/icons-react";
import Button from "@/components/ui/button";
import ButtonLink from "@/components/ui/button-link";
import { appRoutes } from "@/lib/app-routes";
import { SHIPMENTS_COPY } from "@/lib/data/loads/shipments";
import { pluralize } from "@/lib/utils/plural";

interface Props {
    filters: number;
    onClear: () => void;
}

const { empty } = SHIPMENTS_COPY;

export default function ShipmentsEmpty({ filters, onClear }: Props) {
    return (
        <span className="flex flex-wrap items-center justify-between gap-3">
            <span>{filters > 0 ? pluralize(filters, empty.filtered) : empty.none}</span>
            {filters > 0 ? (
                <Button tone="outline" size="sm" onPress={onClear}>
                    {empty.clear}
                </Button>
            ) : (
                <ButtonLink href={appRoutes.postLoad()} tone="outline" size="sm" icon={Add}>
                    {empty.start}
                </ButtonLink>
            )}
        </span>
    );
}
