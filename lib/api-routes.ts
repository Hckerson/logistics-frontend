export const apiRoutes = {
    session: () => "/api/session",
    register: () => "/api/register",
} as const;

export const unpublishedRoutes = {
    passwordReset: () => "/api/auth/password-reset",
    passwordResetCheck: () => "/api/auth/password-reset/check",
    passwordResetConfirm: () => "/api/auth/password-reset/confirm",
    verifyEmail: () => "/api/auth/verify-email",
    verifyEmailResend: () => "/api/auth/verify-email/resend",
    mfaChallenge: () => "/api/auth/mfa/challenge",
    mfaVerify: () => "/api/auth/mfa/verify",
} as const;
