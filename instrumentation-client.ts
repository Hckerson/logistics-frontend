import * as Sentry from "@sentry/nextjs";
import { OBSERVABILITY } from "@/lib/constants";
import { scrubEvent } from "@/lib/utils/scrub";
import { publicEnv } from "@/lib/validations/env";

if (publicEnv.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.init({
        dsn: publicEnv.NEXT_PUBLIC_SENTRY_DSN,
        release: publicEnv.NEXT_PUBLIC_RELEASE,
        sendDefaultPii: false,
        tracesSampleRate: OBSERVABILITY.tracesSampleRate,
        beforeSend: scrubEvent,
    });
}
