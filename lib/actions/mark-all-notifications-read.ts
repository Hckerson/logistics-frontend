"use server";
import { routes } from "@/lib/contract/routes";
import { backendMutation } from "@/lib/utils/backend-mutation";
import { withSessionAction } from "@/lib/utils/with-action";
import { unreadCountEnvelopeSchema } from "@/lib/validations/freight";

export const markAllNotificationsRead = withSessionAction(async () => backendMutation(routes.notificationsMarkAllRead(), {}, unreadCountEnvelopeSchema));
