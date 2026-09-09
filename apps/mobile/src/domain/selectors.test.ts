import { describe, expect, it } from "vitest";

import { todayWorkout } from "../data/demo/demoData";
import { painBadge, totalRestSeconds, totalSets } from "./selectors";

describe("workout selectors", () => {
  it("calculates total sets for the demo workout", () => {
    expect(totalSets(todayWorkout)).toBe(10);
  });

  it("calculates rest blocks only between sets", () => {
    expect(totalRestSeconds(todayWorkout)).toBe(320);
  });

  it("maps pain average to a user-facing badge", () => {
    expect(painBadge(3)).toBe("controlado");
    expect(painBadge(5)).toBe("moderado");
    expect(painBadge(8)).toBe("alto");
  });
});
