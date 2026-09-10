import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // O adaptador D1 dos testes usa node:sqlite, então precisa do runtime Node.
    environment: "node",
    include: ["test/**/*.test.ts"]
  }
});
