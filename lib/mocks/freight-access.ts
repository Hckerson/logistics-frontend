import { jwtVerify } from "jose";
import { nanoid } from "nanoid";
import type { LoadEventDto } from "@/lib/contract/schemas";
import { can, type Capability } from "@/lib/auth/capabilities";
import { hasAnyRole, ROLE_GROUPS } from "@/lib/auth/roles";
import { HTTP_STATUS } from "@/lib/constants";
import { MOCK_ORGANISATIONS } from "@/lib/data/mocks/team";
import { freightStore } from "@/lib/mocks/freight-store";
import { fail } from "@/lib/mocks/http";
import { MOCK_TOKEN_ALGORITHM, MOCK_TOKEN_SECRET } from "@/lib/mocks/session-token";
import { mockStore } from "@/lib/mocks/store";
import type { AccountSide, MockHandler, MockLoad, MockParams, MockRequest, MockResponse, MockUser } from "@/lib/types";

export interface MockCaller {
    user: MockUser;
    organisation: string | null;
    side: AccountSide | null;
    staff: boolean;
}

type CallerHandler = (request: MockRequest, params: MockParams, caller: MockCaller) => MockResponse | Promise<MockResponse>;

export const FREIGHT_MESSAGES = {
    signedOut: "Unauthorized",
    loadMissing: "Load not found",
    invalid: "Validation failed",
    reasonRequired: "A reason is required for this action",
} as const;

const callerOf = async ({ token }: MockRequest): Promise<MockCaller | null> => {
    if (!token) return null;
    const verified = await jwtVerify(token, MOCK_TOKEN_SECRET, { algorithms: [MOCK_TOKEN_ALGORITHM] }).catch(() => null);
    const store = mockStore();
    const user = [...store.users.values()].find((candidate) => candidate.id === verified?.payload.sub);
    if (!user) return null;

    const organisation = store.memberships.get(user.email) ?? null;
    return {
        user,
        organisation,
        side: organisation ? MOCK_ORGANISATIONS[organisation].side : null,
        staff: hasAnyRole(user.roles, ROLE_GROUPS.internal),
    };
};

export const sees =
    ({ staff, side, organisation, user }: MockCaller) =>
    (load: MockLoad) =>
        staff ||
        (side === "shipper" && hasAnyRole(user.roles, ROLE_GROUPS.shipper) && load.shipper === organisation) ||
        (side === "carrier" && hasAnyRole(user.roles, ROLE_GROUPS.carrier) && load.carrier === organisation);

export const visibleLoad = (caller: MockCaller, loadId: string, capability?: Capability) => {
    const load = freightStore().loads.get(loadId);
    return load && sees(caller)(load) && (!capability || can(caller.user.roles, capability)) ? load : null;
};

export const loadMissing = (path: string) => fail(HTTP_STATUS.notFound, FREIGHT_MESSAGES.loadMissing, path);

export const reasonMissing = (caller: MockCaller, reason: string | undefined, path: string) =>
    caller.staff && !reason ? fail(HTTP_STATUS.unprocessable, FREIGHT_MESSAGES.reasonRequired, path) : null;

export const withCaller =
    (handler: CallerHandler): MockHandler =>
    async (request, params) => {
        const caller = await callerOf(request);
        return caller ? handler(request, params, caller) : fail(HTTP_STATUS.unauthorized, FREIGHT_MESSAGES.signedOut, request.path);
    };

const actorOf = ({ staff, user }: MockCaller): Pick<LoadEventDto, "actorType" | "actorName" | "source"> => ({
    actorType: staff ? "staff" : "member",
    actorName: user.name,
    source: staff ? "operations" : "web",
});

export const recordEvent = (loadId: string, caller: MockCaller, fields: Pick<LoadEventDto, "type" | "category"> & Partial<LoadEventDto>) => {
    const event = {
        id: nanoid(),
        loadId,
        fromStatus: null,
        toStatus: null,
        reason: null,
        note: null,
        city: null,
        occurredAt: new Date().toISOString(),
        ...actorOf(caller),
        ...fields,
    };
    freightStore().events.push(event);
    return event;
};
