import { MOCK_INVITATIONS, MOCK_MEMBERSHIPS } from "@/lib/data/mocks/team";
import { MOCK_TICKETS } from "@/lib/data/mocks/tickets";
import { MOCK_RESET_TOKENS, MOCK_USERS } from "@/lib/data/mocks/users";
import type { LocationDecision, MockChallenge, MockInvitation, MockSavedEstimate, MockTicket, MockUser } from "@/lib/types";

interface MockStore {
    users: Map<string, MockUser>;
    resetTokens: Map<string, string>;
    verifiedEmails: Set<string>;
    mfaChallenges: Map<string, MockChallenge>;
    usedBackupCodes: Set<string>;
    tickets: Map<string, MockTicket>;
    savedEstimates: Map<string, MockSavedEstimate>;
    invitations: Map<string, MockInvitation>;
    memberships: Map<string, string>;
    locationConsents: Map<string, LocationDecision>;
}

const holder = globalThis as typeof globalThis & { haulrMockStore?: Partial<MockStore> };

const keyOf = (user: MockUser) => user.email.toLowerCase();

const seed = (): MockStore => ({
    users: new Map(MOCK_USERS.map((user) => [keyOf(user), { ...user }])),
    resetTokens: new Map(Object.entries(MOCK_RESET_TOKENS)),
    verifiedEmails: new Set(MOCK_USERS.filter((user) => user.verified).map(keyOf)),
    mfaChallenges: new Map(),
    usedBackupCodes: new Set(),
    tickets: new Map(MOCK_TICKETS.map((ticket) => [ticket.reference, { ...ticket }])),
    savedEstimates: new Map(),
    invitations: new Map(Object.entries(MOCK_INVITATIONS).map(([token, invitation]) => [token, { ...invitation }])),
    memberships: new Map(Object.entries(MOCK_MEMBERSHIPS)),
    locationConsents: new Map(),
});

export const mockStore = (): MockStore => {
    const store = (holder.haulrMockStore = { ...seed(), ...holder.haulrMockStore });
    MOCK_USERS.filter((user) => !store.users.has(keyOf(user))).forEach((user) => store.users.set(keyOf(user), { ...user }));
    return store;
};
