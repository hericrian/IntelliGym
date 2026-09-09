import { describe, expect, it } from "vitest";

import { getApiUrl } from "./config";

describe("config", () => {
  it("returns the local API URL by default", () => {
    expect(getApiUrl()).toBe("http://127.0.0.1:8000");
  });
});
