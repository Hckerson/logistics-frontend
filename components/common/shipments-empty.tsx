import { Add, Upload } from "@carbon/icons-react";
import Button from "@/components/ui/button";
import ButtonLink from "@/components/ui/button-link";
import { appRoutes } from "@/lib/app-routes";
import { SHIPMENTS_COPY } from "@/lib/data/loads/shipments";
import { pluralize } from "@/lib/utils/plural";

interface Props {
    filters: number;
    canImport: boolean;
    onClear: () => void;
}

const { empty } = SHIPMENTS_COPY;

export default function ShipmentsEmpty({ filters, canImport, onClear }: Props) {
    return (
        <span className="flex flex-wrap items-center justify-between gap-3">
            <span>{filters > 0 ? pluralize(filters, empty.filtered) : empty.none}</span>
            {filters > 0 ? (
                <Button tone="outline" size="sm" onPress={onClear}>
                    {empty.clear}
                </Button>
            ) : (
                <span className="flex flex-wrap gap-2">
                    {canImport ? (
                        <ButtonLink href={appRoutes.bulkImport()} tone="outline" size="sm" icon={Upload}>
                            {empty.importFile}
                        </ButtonLink>
                    ) : null}
                    <ButtonLink href={appRoutes.postLoad()} tone="outline" size="sm" icon={Add}>
                        {empty.start}
                    </ButtonLink>
                </span>
            )}
        </span>
    );
}
