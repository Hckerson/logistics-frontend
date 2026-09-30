import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const serverOnlyStub = fileURLToPath(
    new URL("./node_modules/server-only/empty.js", import.meta.url),
);

export default defineConfig({
    resolve: {
        tsconfigPaths: true,
        alias: { "server-only": serverOnlyStub },
    },
    test: { testTimeout: 30_000 },
});
