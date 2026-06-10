import { describe, expect, it } from "vitest";
import { estimateDashboardLoadTime } from "./performance";

describe("estimateDashboardLoadTime", () => {
  it("returns 0 for invalid inputs", () => {
    expect(estimateDashboardLoadTime(0, 100)).toBe(0);
    expect(estimateDashboardLoadTime(1024, 0)).toBe(0);
  });

  it("estimates load time under a 3G connection", () => {
    const seconds = estimateDashboardLoadTime(500_000, 750);
    expect(seconds).toBeGreaterThan(4);
    expect(seconds).toBeLessThan(10);
  });
});
