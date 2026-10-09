import { MOCK_RESET_TOKENS, MOCK_USERS } from "@/lib/data/mocks/users";
import type { MockChallenge, MockUser } from "@/lib/types";

interface MockStore {
    users: Map<string, MockUser>;
    resetTokens: Map<string, string>;
    verifiedEmails: Set<string>;
    mfaChallenges: Map<string, MockChallenge>;
    usedBackupCodes: Set<string>;
}

const holder = globalThis as typeof globalThis & { haulrMockStore?: Partial<MockStore> };

const keyOf = (user: MockUser) => user.email.toLowerCase();

const seed = (): MockStore => ({
    users: new Map(MOCK_USERS.map((user) => [keyOf(user), { ...user }])),
    resetTokens: new Map(Object.entries(MOCK_RESET_TOKENS)),
    verifiedEmails: new Set(MOCK_USERS.filter((user) => user.verified).map(keyOf)),
    mfaChallenges: new Map(),
    usedBackupCodes: new Set(),
});

export const mockStore = (): MockStore => {
    const store = (holder.haulrMockStore = { ...seed(), ...holder.haulrMockStore });
    MOCK_USERS.filter((user) => !store.users.has(keyOf(user))).forEach((user) => store.users.set(keyOf(user), { ...user }));
    return store;
};
