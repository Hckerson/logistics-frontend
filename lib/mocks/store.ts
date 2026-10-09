import { MOCK_RESET_TOKENS, MOCK_USERS } from "@/lib/data/mocks/users";
import type { MockUser } from "@/lib/types";

interface MockStore {
    users: Map<string, MockUser>;
    resetTokens: Map<string, string>;
    verifiedEmails: Set<string>;
}

const holder = globalThis as typeof globalThis & { haulrMockStore?: Partial<MockStore> };

const seed = (): MockStore => ({
    users: new Map(MOCK_USERS.map((user) => [user.email.toLowerCase(), { ...user }])),
    resetTokens: new Map(Object.entries(MOCK_RESET_TOKENS)),
    verifiedEmails: new Set(MOCK_USERS.filter((user) => user.verified).map((user) => user.email.toLowerCase())),
});

export const mockStore = (): MockStore => (holder.haulrMockStore = { ...seed(), ...holder.haulrMockStore });
