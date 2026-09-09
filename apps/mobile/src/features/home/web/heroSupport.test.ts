import { describe, expect, it } from "vitest";

import { demoWeeklyProgress, todayWorkout } from "../../../data/demo/demoData";
import { getHeroMetrics, supportsWebGL } from "./heroSupport";

describe("heroSupport", () => {
  it("returns false for WebGL when window is unavailable", () => {
    expect(supportsWebGL()).toBe(false);
  });

  it("builds stable hero metrics from workout and progress data", () => {
    const metrics = getHeroMetrics(demoWeeklyProgress, todayWorkout);

    expect(metrics).toHaveLength(3);
    expect(metrics[0]?.value).toBe(83);
    expect(metrics[1]?.value).toBe(70);
  });
});
