import { MOCK_USERS } from "@/lib/data/mocks/users";
import type { MockUser } from "@/lib/types";

interface MockStore {
    users: Map<string, MockUser>;
}

const holder = globalThis as typeof globalThis & { haulrMockStore?: MockStore };

const seed = (): MockStore => ({
    users: new Map(MOCK_USERS.map((user) => [user.email.toLowerCase(), { ...user }])),
});

export const mockStore = (): MockStore => (holder.haulrMockStore ??= seed());
