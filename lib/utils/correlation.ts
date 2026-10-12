import "server-only";
import { AsyncLocalStorage } from "node:async_hooks";
import { nanoid } from "nanoid";

const current = new AsyncLocalStorage<string>();

export const withCorrelation = <T>(run: (correlationId: string) => Promise<T>) => {
    const correlationId = nanoid();
    return current.run(correlationId, () => run(correlationId));
};

export const correlationId = () => current.getStore();
