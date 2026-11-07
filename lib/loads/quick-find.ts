import type { QuickFindDto } from "@/lib/contract/schemas";
import { LOAD_STATUSES } from "@/lib/enums/load-status";
import { QUICK_FIND_ROUTES } from "@/lib/loads/constants";
import { LOAD_STATUS_LABELS } from "@/lib/loads/status";

const detailOf = (detail: string | null | undefined) => {
    const status = LOAD_STATUSES.find((candidate) => candidate === detail);
    return status ? LOAD_STATUS_LABELS[status] : (detail ?? undefined);
};

export const quickFindTargets = ({ exact, groups }: QuickFindDto) =>
    groups.flatMap((group) => {
        const routeOf = QUICK_FIND_ROUTES[group.type];
        if (!routeOf) return [];
        const ordered = [...group.items.filter((item) => item.id === exact?.id), ...group.items.filter((item) => item.id !== exact?.id)];
        const items = ordered.map((item) => ({
            key: `${group.type}:${item.id}`,
            href: routeOf(item.id),
            label: item.label,
            detail: detailOf(item.detail),
        }));
        return [{ type: group.type, total: group.total, items }];
    });
