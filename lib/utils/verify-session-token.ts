import { importSPKI, jwtVerify } from "jose";
import { z } from "zod";
import { API_MOCKS } from "@/lib/constants";
import { createUserDtoSchema } from "@/lib/contract/schemas";
import { ROLE_KEYS } from "@/lib/enums/role-key";
import { MOCK_TOKEN_ALGORITHM, MOCK_TOKEN_SECRET } from "@/lib/mocks/session-token";

const ALGORITHM = "RS256";
const PEM_MARKER = "-----BEGIN";

const sessionPayloadSchema = z.object({
    sub: z.string().min(1),
    email: z.string().email(),
    role: createUserDtoSchema.shape.role.unwrap(),
    roles: z.array(z.enum(ROLE_KEYS)).optional(),
    iat: z.number(),
    exp: z.number(),
});

export type SessionPayload = z.infer<typeof sessionPayloadSchema>;

const decodePem = (value: string) =>
    value.includes(PEM_MARKER) ? value : atob(value);

let importedKey: Promise<CryptoKey> | null = null;

const publicKey = () => {
    if (!importedKey) {
        const raw = process.env.JWT_PUBLIC_KEY;
        if (!raw) {
            throw new Error(
                "JWT_PUBLIC_KEY is not set — the proxy cannot verify a session",
            );
        }
        importedKey = importSPKI(decodePem(raw), ALGORITHM);
    }
    return importedKey;
};

const verifier = async () =>
    API_MOCKS
        ? { key: MOCK_TOKEN_SECRET, algorithm: MOCK_TOKEN_ALGORITHM }
        : { key: await publicKey(), algorithm: ALGORITHM };

export const verifySessionToken = async (
    token: string,
): Promise<SessionPayload | null> => {
    try {
        const { key, algorithm } = await verifier();
        const { payload } = await jwtVerify(token, key, {
            algorithms: [algorithm],
        });
        const parsed = sessionPayloadSchema.safeParse(payload);
        return parsed.success ? parsed.data : null;
    } catch {
        return null;
    }
};
