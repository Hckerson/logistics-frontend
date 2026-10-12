import type { ERROR_CLASSES } from "@/lib/errors/constants";

export type ErrorClass = (typeof ERROR_CLASSES)[number];
