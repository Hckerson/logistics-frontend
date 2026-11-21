import "server-only";
import { AsyncLocalStorage } from "node:async_hooks";
import { nanoid } from "nanoid";

interface RequestScope {
    correlationId: string;
    reason: string | undefined;
}

const current = new AsyncLocalStorage<RequestScope>();

export const withCorrelation = <T>(run: (correlationId: string) => Promise<T>, reason?: string) => {
    const correlationId = nanoid();
    return current.run({ correlationId, reason }, () => run(correlationId));
};

export const correlationId = () => current.getStore()?.correlationId;

export const auditReason = () => current.getStore()?.reason;
