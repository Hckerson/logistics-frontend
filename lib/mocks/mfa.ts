import { nanoid } from "nanoid";
import { MOCK_MFA } from "@/lib/data/mocks/mfa";
import { fail, issueSession, ok } from "@/lib/mocks/http";
import { mockStore } from "@/lib/mocks/store";
import type { MfaAnswer, MockHandler, MockResponse, MockUser } from "@/lib/types";
import { mfaChallengeRequestSchema, mfaVerifySchema } from "@/lib/validations/auth";

const INVALID_BODY = "Validation failed";
const CHALLENGE_GONE = "Challenge expired";
const WRONG_CODE = "Invalid code";
const LOCKED = "Too many attempts";
const BACKUP_CODES: readonly string[] = MOCK_MFA.backupCodes;

export const openChallenge = (user: MockUser): MockResponse => {
    const challenge = `mfa_${nanoid()}`;
    mockStore().mfaChallenges.set(challenge, { email: user.email.toLowerCase(), attemptsRemaining: MOCK_MFA.attempts });
    return ok(200, { mfaRequired: true, challenge, method: "totp" });
};

export const challengeStatus: MockHandler = ({ body, path }) => {
    const input = mfaChallengeRequestSchema.safeParse(body);
    if (!input.success) return fail(400, INVALID_BODY, path);
    const found = mockStore().mfaChallenges.get(input.data.challenge);
    return found ? ok(200, { email: found.email, method: "totp", attemptsRemaining: found.attemptsRemaining }) : fail(404, CHALLENGE_GONE, path);
};

const accepts = ({ method, code }: MfaAnswer) =>
    method === "totp" ? code === MOCK_MFA.code : BACKUP_CODES.includes(code) && !mockStore().usedBackupCodes.has(code);

export const answerChallenge: MockHandler = async ({ body, path }) => {
    const input = mfaVerifySchema.safeParse(body);
    if (!input.success) return fail(400, INVALID_BODY, path);
    const { mfaChallenges, users, usedBackupCodes } = mockStore();
    const { challenge, ...answer } = input.data;
    const found = mfaChallenges.get(challenge);
    const user = found && users.get(found.email);
    if (!found || !user) return fail(404, CHALLENGE_GONE, path);
    if (accepts(answer)) {
        mfaChallenges.delete(challenge);
        if (answer.method === "backup") usedBackupCodes.add(answer.code);
        return issueSession(200, user);
    }
    found.attemptsRemaining -= 1;
    if (found.attemptsRemaining > 0) return fail(401, WRONG_CODE, path, undefined, { attemptsRemaining: found.attemptsRemaining });
    mfaChallenges.delete(challenge);
    return fail(429, LOCKED, path, { "Retry-After": String(MOCK_MFA.lockoutSeconds) });
};
