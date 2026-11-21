import * as Sentry from "@sentry/nextjs";
import { registerOTel } from "@vercel/otel";
import { OBSERVABILITY } from "@/lib/constants";
import { readFlags } from "@/lib/flags";
import { scrubEvent } from "@/lib/utils/scrub";
import { serverEnv } from "@/lib/validations/env";

export function register() {
    const env = serverEnv();
    readFlags();
    registerOTel({ serviceName: OBSERVABILITY.serviceName });
    if (!env.SENTRY_DSN) return;
    Sentry.init({
        dsn: env.SENTRY_DSN,
        release: env.NEXT_PUBLIC_RELEASE,
        environment: env.NODE_ENV,
        sendDefaultPii: false,
        tracesSampleRate: OBSERVABILITY.tracesSampleRate,
        beforeSend: scrubEvent,
    });
}

export const onRequestError = Sentry.captureRequestError;
