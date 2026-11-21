import { HTTP_STATUS, TIME_MS } from "@/lib/constants";
import type { StandingBlockerDto } from "@/lib/contract/schemas";
import { MOCK_STANDING } from "@/lib/data/mocks/standing";
import { MOCK_ORGANISATIONS } from "@/lib/data/mocks/team";
import { FREIGHT_MESSAGES, withCaller } from "@/lib/mocks/freight-access";
import { fail, ok } from "@/lib/mocks/http";

const startOfHour = (moment: number) => moment - (moment % TIME_MS.hour);

export const standingOf = (organisation: string): StandingBlockerDto[] => {
    const now = startOfHour(new Date().getTime());
    return (MOCK_STANDING[organisation] ?? []).map(({ inDays, ...seed }) => ({
        ...seed,
        id: `${organisation}:${seed.type}`,
        effectiveAt: inDays === undefined ? null : new Date(now + inDays * TIME_MS.day).toISOString(),
    }));
};

export const organisationStanding = withCaller(({ path }, _params, caller) => {
    const organisation = caller.organisation;
    if (!organisation || !Object.hasOwn(MOCK_ORGANISATIONS, organisation)) return fail(HTTP_STATUS.notFound, FREIGHT_MESSAGES.invalid, path);
    return ok(HTTP_STATUS.ok, {
        organisation: { id: organisation, name: MOCK_ORGANISATIONS[organisation].name },
        blockers: standingOf(organisation),
        checkedAt: new Date().toISOString(),
    });
});
