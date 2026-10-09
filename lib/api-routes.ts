export const apiRoutes = {
    session: () => "/api/session",
    register: () => "/api/register",
} as const;

export const unpublishedRoutes = {
    passwordReset: () => "/api/auth/password-reset",
} as const;
