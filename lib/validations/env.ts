import { z } from "zod";

type Source = Record<string, string | undefined>;

export const ENV_DEFAULTS = { apiUrl: "http://localhost:5100", mocks: "on" } as const;

const SWITCH = ["on", "off"] as const;

const publicSchema = z.object({
    NEXT_PUBLIC_API_URL: z.url().default(ENV_DEFAULTS.apiUrl),
    NEXT_PUBLIC_API_MOCKS: z.enum(SWITCH, "NEXT_PUBLIC_API_MOCKS must be on or off").default(ENV_DEFAULTS.mocks),
    NEXT_PUBLIC_PROTOMAPS_KEY: z.string().trim().min(1).optional(),
    NEXT_PUBLIC_SENTRY_DSN: z.url().optional(),
    NEXT_PUBLIC_RELEASE: z.string().trim().min(1).optional(),
});

const serverSchema = publicSchema
    .extend({
        NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
        JWT_PUBLIC_KEY: z.string().min(1).optional(),
        CONTRACT_SOURCE: z.string().min(1).optional(),
        SENTRY_DSN: z.url().optional(),
        OTEL_EXPORTER_OTLP_ENDPOINT: z.url().optional(),
    })
    .refine(({ NEXT_PUBLIC_API_MOCKS, JWT_PUBLIC_KEY }) => NEXT_PUBLIC_API_MOCKS === "on" || JWT_PUBLIC_KEY !== undefined, {
        path: ["JWT_PUBLIC_KEY"],
        message: "JWT_PUBLIC_KEY is required when NEXT_PUBLIC_API_MOCKS is off",
    });

const present = (source: Source) => Object.fromEntries(Object.entries(source).filter(([, value]) => value !== undefined && value.trim() !== ""));

const parse = <T extends z.ZodType>(schema: T, source: Source): z.infer<T> => {
    const result = schema.safeParse(present(source));
    if (result.success) return result.data;
    throw new Error(`Invalid environment: ${result.error.issues.map((issue) => `${issue.path.join(".")} ${issue.message}`).join("; ")}`);
};

export const publicEnv = parse(publicSchema, {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_API_MOCKS: process.env.NEXT_PUBLIC_API_MOCKS,
    NEXT_PUBLIC_PROTOMAPS_KEY: process.env.NEXT_PUBLIC_PROTOMAPS_KEY,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_RELEASE: process.env.NEXT_PUBLIC_RELEASE,
});

let server: z.infer<typeof serverSchema> | null = null;

export const serverEnv = () => (server ??= parse(serverSchema, { ...process.env }));
