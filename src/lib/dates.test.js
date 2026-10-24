import { describe, expect, it } from "vitest";
import {
  addDays,
  addMonths,
  daysBetween,
  endOfMonth,
  formatLocalDate,
  isISODate,
  monthGrid,
  parseLocalDate,
  startOfMonth,
} from "./dates";

describe("local calendar dates", () => {
  it("formats local dates without UTC shift", () => {
    expect(formatLocalDate(new Date(2026, 0, 1))).toBe("2026-01-01");
    expect(formatLocalDate(new Date(2026, 9, 24))).toBe("2026-10-24");
  });

  it("rejects invalid ISO and accepts real days", () => {
    expect(isISODate("2026-02-29")).toBe(false);
    expect(isISODate("2024-02-29")).toBe(true);
    expect(isISODate("2026-13-01")).toBe(false);
  });

  it("handles month boundaries including leap years", () => {
    expect(startOfMonth("2026-02-14")).toBe("2026-02-01");
    expect(endOfMonth("2026-02-14")).toBe("2026-02-28");
    expect(endOfMonth("2024-02-10")).toBe("2024-02-29");
    expect(addMonths("2026-01-31", 1)).toBe("2026-02-28");
    expect(addMonths("2026-10-31", 1)).toBe("2026-11-30");
    expect(addMonths("2026-12-15", 1)).toBe("2027-01-15");
  });

  it("adds days across months and years", () => {
    expect(addDays("2026-01-31", 1)).toBe("2026-02-01");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(daysBetween("2026-02-28", "2026-03-01")).toBe(1);
    expect(daysBetween("2024-02-28", "2024-03-01")).toBe(2);
  });

  it("builds a Monday-first month grid that includes adjacent months", () => {
    const { start, end, cells } = monthGrid("2026-02-01");
    expect(start).toBe("2026-02-01");
    expect(end).toBe("2026-02-28");
    expect(cells).toHaveLength(42);
    expect(cells[0].date).toBe("2026-01-26");
    expect(cells.filter((cell) => cell.inMonth)).toHaveLength(28);
    const feb2024 = monthGrid("2024-02-01");
    expect(feb2024.cells.filter((cell) => cell.inMonth)).toHaveLength(29);
    expect(parseLocalDate("2024-02-29").getDate()).toBe(29);
  });
});
