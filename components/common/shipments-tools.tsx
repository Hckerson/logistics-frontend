"use client";
import { Filter } from "@carbon/icons-react";
import Button from "@/components/ui/button";
import CountBadge from "@/components/ui/count-badge";
import SearchField from "@/components/ui/search-field";
import Switch from "@/components/ui/switch";
import { SHIPMENTS_COPY } from "@/lib/data/loads/shipments";
import { pluralize } from "@/lib/utils/plural";

interface Props {
    search: string;
    onSearch: (value: string) => void;
    late: boolean;
    onLate: (late: boolean) => void;
    more: number;
    onMore: () => void;
}

const { search: copy } = SHIPMENTS_COPY;

export default function ShipmentsTools({ search, onSearch, late, onLate, more, onMore }: Props) {
    return (
        <div role="group" aria-label={SHIPMENTS_COPY.filters} className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="w-full sm:w-72">
                <SearchField label={copy.label} placeholder={copy.placeholder} value={search} onChange={onSearch} />
            </div>
            <Switch label={SHIPMENTS_COPY.lateOnly} isSelected={late} onChange={onLate} size="sm" />
            <Button tone="outline" icon={Filter} onPress={onMore}>
                {SHIPMENTS_COPY.more}
                {more > 0 ? <CountBadge value={more} label={pluralize(more, SHIPMENTS_COPY.moreCount)} className="ml-1" /> : null}
            </Button>
        </div>
    );
}
