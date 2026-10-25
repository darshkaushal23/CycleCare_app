import { describe, expect, it } from "vitest";
import { ENERGY_CHART, energyChartPoint, mean, moodChartPoint, MOOD_CHART, moodTicks } from "./insightCharts";

describe("insight charts", () => {
  it("does not treat missing numbers as zero when averaging", () => {
    expect(mean([])).toBeNull();
    expect(mean([null, undefined])).toBeNull();
    expect(mean([28, 30])).toBe(29);
  });

  it("keeps stored mood and energy labels on distinct ranks", () => {
    expect(moodChartPoint({ date: "2026-10-01", mood: "anxious" }).mood).not.toBe(MOOD_CHART.low);
    expect(moodChartPoint({ date: "2026-10-01", mood: "irritable" }).mood).not.toBe(MOOD_CHART.okay);
    expect(moodChartPoint({ date: "2026-10-01" })).toBeNull();
    expect(energyChartPoint({ date: "2026-10-01", energy: "good" }).energy).toBe(ENERGY_CHART.good);
    expect(energyChartPoint({ date: "2026-10-01" })).toBeNull();
  });

  it("orders mood axis ticks without collapsing anxious onto low", () => {
    expect(moodTicks()).toEqual([1, 2, 3, 4, 5]);
    expect(MOOD_CHART.anxious).toBe(2);
    expect(MOOD_CHART.low).toBe(1);
  });
});
