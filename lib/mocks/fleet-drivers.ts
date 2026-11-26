import { can } from "@/lib/auth/capabilities";
import { HTTP_STATUS, TIME_MS } from "@/lib/constants";
import type { DriverInvitationDto, FleetDriverDto } from "@/lib/contract/schemas";
import { MOCK_CARRIER_ZONES, MOCK_ROSTER } from "@/lib/data/mocks/trucks";
import { FLEET, ROSTER } from "@/lib/fleet/constants";
import { activeLoadOf, carrierDrivers } from "@/lib/mocks/fleet-entries";
import { fleetCarrier } from "@/lib/mocks/fleet-plan";
import { fleetStore } from "@/lib/mocks/fleet-store";
import { withCaller, type MockCaller } from "@/lib/mocks/freight-access";
import { fail, ok } from "@/lib/mocks/http";
import { mockStore } from "@/lib/mocks/store";
import { DRIVER_ROLE, INVITATION_DAYS } from "@/lib/team/constants";
import type { MockInvitation, MockUser } from "@/lib/types";
import { fillTemplate } from "@/lib/utils/fill-template";

const ROSTER_MESSAGES = {
    forbidden: "Only your carrier's dispatchers and admins manage drivers",
    driverMissing: "Driver not found",
    inviteMissing: "Invitation not found",
    busy: "{name} is on {load}; deactivate them after that load delivers",
    limit: "This invitation was resent as often as allowed; revoke it and invite again",
} as const;

type ListedInvitation = MockInvitation & { status: DriverInvitationDto["status"] };

const LISTED = ["open", "expired"] as const;

const listed = (entry: [string, MockInvitation]): entry is [string, ListedInvitation] => LISTED.some((status) => status === entry[1].status);

const carrierFor = (caller: MockCaller) => {
    const carrier = fleetCarrier(caller);
    return carrier && can(caller.user.roles, "manageDrivers") ? carrier : null;
};

const toDriver = (user: MockUser): FleetDriverDto => ({
    id: user.id,
    name: user.name,
    email: user.email,
    currentLoadId: activeLoadOf((load) => load.driver === user.id)?.id ?? null,
    truckUnit: [...fleetStore().trucks.values()].find((truck) => truck.driver === user.id)?.unit ?? null,
    locationSharing: mockStore().locationConsents.get(user.email.toLowerCase()) ?? "notAsked",
});

const settle = (id: string, invitation: ListedInvitation, now: number): ListedInvitation => {
    const sentDaysAgo = invitation.status === "expired" ? MOCK_ROSTER.expiredSentDaysAgo : MOCK_ROSTER.openSentDaysAgo;
    const sentAt = invitation.sentAt ?? new Date(now - sentDaysAgo * TIME_MS.day).toISOString();
    const lapsed = invitation.status === "open" && Date.parse(sentAt) + INVITATION_DAYS * TIME_MS.day <= now;
    const settled: ListedInvitation = { ...invitation, sentAt, status: lapsed ? "expired" : invitation.status };
    mockStore().invitations.set(id, settled);
    return settled;
};

const toInvitation = (id: string, invitation: ListedInvitation, now: number): DriverInvitationDto => {
    const { email, inviter, status, sentAt = new Date(now).toISOString(), resends = 0 } = settle(id, invitation, now);
    return {
        id,
        email,
        inviter,
        status,
        sentAt,
        expiresAt: new Date(Date.parse(sentAt) + INVITATION_DAYS * TIME_MS.day).toISOString(),
        resendsLeft: Math.max(0, ROSTER.resendLimit - resends),
    };
};

const invitationsOf = (carrier: string) =>
    [...mockStore().invitations.entries()].filter(listed).filter(([, invitation]) => invitation.organisation === carrier && invitation.role === DRIVER_ROLE);

const ownInvitation = (carrier: string, invitationId: string) => invitationsOf(carrier).find(([id]) => id === invitationId)?.[1] ?? null;

export const roster = withCaller(({ path }, _params, caller) => {
    const carrier = carrierFor(caller);
    if (!carrier) return fail(HTTP_STATUS.forbidden, ROSTER_MESSAGES.forbidden, path);
    const now = new Date().getTime();
    const invitations = invitationsOf(carrier)
        .map(([id, invitation]) => toInvitation(id, invitation, now))
        .sort((first, second) => Date.parse(second.sentAt) - Date.parse(first.sentAt));
    const drivers = carrierDrivers(carrier)
        .map(toDriver)
        .sort((first, second) => first.name.localeCompare(second.name));
    return ok(HTTP_STATUS.ok, { drivers, invitations, timeZone: MOCK_CARRIER_ZONES[carrier] ?? FLEET.defaultZone });
});

export const deactivateDriver = withCaller(({ path }, { driverId }, caller) => {
    const carrier = carrierFor(caller);
    if (!carrier) return fail(HTTP_STATUS.forbidden, ROSTER_MESSAGES.forbidden, path);
    const driver = carrierDrivers(carrier).find((user) => user.id === driverId);
    if (!driver) return fail(HTTP_STATUS.notFound, ROSTER_MESSAGES.driverMissing, path);
    const busy = activeLoadOf((load) => load.driver === driver.id);
    if (busy) return fail(HTTP_STATUS.conflict, fillTemplate(ROSTER_MESSAGES.busy, { name: driver.name, load: busy.id }), path);

    const removed = toDriver(driver);
    const { deactivated, trucks } = fleetStore();
    deactivated.add(driver.id);
    trucks.forEach((truck) => {
        if (truck.driver === driver.id) truck.driver = null;
    });
    return ok(HTTP_STATUS.ok, removed);
});

export const resendInvitation = withCaller(({ path }, { invitationId }, caller) => {
    const carrier = carrierFor(caller);
    if (!carrier) return fail(HTTP_STATUS.forbidden, ROSTER_MESSAGES.forbidden, path);
    const invitation = ownInvitation(carrier, invitationId);
    if (!invitation) return fail(HTTP_STATUS.notFound, ROSTER_MESSAGES.inviteMissing, path);
    const resends = invitation.resends ?? 0;
    if (resends >= ROSTER.resendLimit) return fail(HTTP_STATUS.tooManyRequests, ROSTER_MESSAGES.limit, path);

    const now = new Date().getTime();
    return ok(HTTP_STATUS.ok, toInvitation(invitationId, { ...invitation, status: "open", sentAt: new Date(now).toISOString(), resends: resends + 1 }, now));
});

export const revokeInvitation = withCaller(({ path }, { invitationId }, caller) => {
    const carrier = carrierFor(caller);
    if (!carrier) return fail(HTTP_STATUS.forbidden, ROSTER_MESSAGES.forbidden, path);
    const invitation = ownInvitation(carrier, invitationId);
    if (!invitation) return fail(HTTP_STATUS.notFound, ROSTER_MESSAGES.inviteMissing, path);
    return ok(HTTP_STATUS.ok, toInvitation(invitationId, { ...invitation, status: "revoked" }, new Date().getTime()));
});
