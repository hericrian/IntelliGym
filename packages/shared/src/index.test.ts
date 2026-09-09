import { describe, expect, it } from "vitest";

import type { HealthCheckResponse } from "./index";

describe("shared health contract", () => {
  it("accepts the expected API payload shape", () => {
    const payload: HealthCheckResponse = {
      status: "ok",
      service: "intelligym-api",
      version: "0.1.0"
    };

    expect(payload.status).toBe("ok");
  });
});
