import { describe, expect, it } from "vitest";
import { buildDemoLogs } from "./demoData";
import { buildExportPayload, logsToCsv, validateImport } from "./transfer";

describe("backup transfer", () => {
  const logs = buildDemoLogs();
  const payload = buildExportPayload({
    logs,
    settings: { language: "hi", ageGroup: "under18", discreetMode: true, textScale: 112 },
  });

  it("exports local-only JSON without claiming encryption", () => {
    expect(payload.app).toBe("cyclecare");
    expect(payload.version).toBe(1);
    expect(payload.encrypted).toBe(false);
    expect(payload.storage).toBe("indexeddb-local-only");
    expect(payload.logs.length).toBe(logs.length);
  });

  it("rejects invalid files and accepts a round-trip", () => {
    expect(validateImport("{").ok).toBe(false);
    expect(validateImport({ app: "other", version: 1, logs: [] }).error).toBe("wrong-app");
    const ok = validateImport(JSON.stringify(payload));
    expect(ok.ok).toBe(true);
    expect(ok.logs.length).toBe(logs.length);
    expect(ok.settings.language).toBe("hi");
    expect(ok.logs.every((log) => log.isDemo === false)).toBe(true);
  });

  it("writes a CSV with a header and one row per log", () => {
    const csv = logsToCsv(logs);
    const lines = csv.split("\n");
    expect(lines[0]).toContain("date");
    expect(lines.length).toBe(logs.length + 1);
  });
});
