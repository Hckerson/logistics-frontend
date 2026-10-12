"use server";
import { routes } from "@/lib/contract/routes";
import { backendMutation, pathSegment } from "@/lib/utils/backend-mutation";
import { withSessionAction } from "@/lib/utils/with-action";
import { unreadCountEnvelopeSchema } from "@/lib/validations/freight";

export const markNotificationRead = withSessionAction(async (_context, notificationId: string) =>
    backendMutation(routes.notificationsMarkRead(pathSegment(notificationId)), {}, unreadCountEnvelopeSchema),
);
