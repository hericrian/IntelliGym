import { describe, expect, it } from "vitest";

import { detectMobilePlatform } from "./lib/device";
import { supportsWebGL } from "./lib/heroSupport";

describe("web hero support", () => {
  it("returns false when window is unavailable", () => {
    expect(supportsWebGL()).toBe(false);
  });
});

describe("device detection", () => {
  it("detects ios devices", () => {
    expect(
      detectMobilePlatform(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)"
      )
    ).toBe("ios");
  });

  it("detects android devices", () => {
    expect(
      detectMobilePlatform("Mozilla/5.0 (Linux; Android 14; Pixel 8)")
    ).toBe("android");
  });

  it("returns desktop when user agent is empty", () => {
    expect(detectMobilePlatform("")).toBe("desktop");
  });
});
