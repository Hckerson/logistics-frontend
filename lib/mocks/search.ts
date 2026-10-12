import { HTTP_STATUS } from "@/lib/constants";
import type { QuickFindItemDto } from "@/lib/contract/schemas";
import { MOCK_FACILITIES } from "@/lib/data/mocks/facilities";
import { MOCK_ORGANISATIONS } from "@/lib/data/mocks/team";
import { QUICK_FIND } from "@/lib/loads/constants";
import { FREIGHT_MESSAGES, sees, withCaller } from "@/lib/mocks/freight-access";
import { freightStore } from "@/lib/mocks/freight-store";
import { fail, ok } from "@/lib/mocks/http";
import { mockStore } from "@/lib/mocks/store";
import { queryOf, quickFindQuerySchema } from "@/lib/validations/freight";

type Found = Omit<QuickFindItemDto, "type">;

const group = (type: QuickFindItemDto["type"], found: readonly Found[]) => ({
    type,
    total: found.length,
    items: found.slice(0, QUICK_FIND.groupLimit).map((item) => ({ type, ...item })),
});

export const quickFind = withCaller(({ path }, _params, caller) => {
    const input = quickFindQuerySchema.safeParse(queryOf(path));
    if (!input.success) return fail(HTTP_STATUS.badRequest, FREIGHT_MESSAGES.invalid, path);
    const term = input.data.q;

    const needle = term.toLowerCase();
    const reference = term.toUpperCase();
    const own = (organisation: string) => caller.staff || organisation === caller.organisation;
    const { users, memberships } = mockStore();

    const loads = [...freightStore().loads.values()]
        .filter(sees(caller))
        .filter((load) => load.id.startsWith(reference) || load.poNumber === term || load.bolNumber === term)
        .map((load) => ({ id: load.id, label: load.id, detail: load.status }));
    const facilities = Object.entries(MOCK_FACILITIES)
        .filter(([, facility]) => own(facility.organisation) && `${facility.name} ${facility.city}`.toLowerCase().includes(needle))
        .map(([id, facility]) => ({ id, label: facility.name, detail: `${facility.city}, ${facility.region}` }));
    const members = [...users.values()]
        .filter((user) => own(memberships.get(user.email) ?? "") && `${user.name} ${user.email}`.toLowerCase().includes(needle))
        .map((user) => ({ id: user.id, label: user.name, detail: user.email }));
    const organisations = caller.staff
        ? Object.entries(MOCK_ORGANISATIONS)
              .filter(([, organisation]) => organisation.name.toLowerCase().includes(needle))
              .map(([id, organisation]) => ({ id, label: organisation.name, detail: organisation.side }))
        : [];

    const groups = [group("load", loads), group("facility", facilities), group("member", members), group("organization", organisations)];
    return ok(HTTP_STATUS.ok, {
        exact: groups[0].items.find((item) => item.id === reference) ?? null,
        groups: groups.filter((found) => found.total > 0),
    });
});
