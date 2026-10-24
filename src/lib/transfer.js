import { isISODate } from "./dates";
import { FLOW_OPTIONS, PERIOD_STATUS, normalizeLog } from "./logFields";

export const EXPORT_APP = "cyclecare";
export const EXPORT_VERSION = 1;

export function buildExportPayload({ logs, settings }) {
  return {
    app: EXPORT_APP,
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    storage: "indexeddb-local-only",
    encrypted: false,
    settings: {
      language: settings.language === "hi" ? "hi" : "en",
      ageGroup: settings.ageGroup ?? "under18",
      discreetMode: Boolean(settings.discreetMode),
      textScale: Number(settings.textScale) || 100,
    },
    logs: (logs ?? []).map((log) => normalizeLog(log, log.date)),
  };
}

export function validateImport(raw) {
  let data = raw;
  if (typeof raw === "string") {
    try {
      data = JSON.parse(raw);
    } catch {
      return { ok: false, error: "invalid-json" };
    }
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return { ok: false, error: "not-object" };
  }
  if (data.app !== EXPORT_APP) return { ok: false, error: "wrong-app" };
  if (data.version !== EXPORT_VERSION) return { ok: false, error: "wrong-version" };
  if (!Array.isArray(data.logs)) return { ok: false, error: "logs-missing" };

  const logs = [];
  const seen = new Set();
  for (const item of data.logs) {
    if (!item || !isISODate(item.date) || seen.has(item.date)) continue;
    if (item.flow && !FLOW_OPTIONS.includes(item.flow)) continue;
    if (item.periodStatus && !PERIOD_STATUS.includes(item.periodStatus)) continue;
    seen.add(item.date);
    const log = normalizeLog(item, item.date);
    log.isDemo = false;
    logs.push(log);
  }

  if (!logs.length && data.logs.length) return { ok: false, error: "no-valid-logs" };

  const settings = data.settings && typeof data.settings === "object" ? data.settings : {};
  return {
    ok: true,
    logs,
    settings: {
      language: settings.language === "hi" ? "hi" : "en",
      ageGroup: ["under18", "18-24", "25-34", "35plus"].includes(settings.ageGroup)
        ? settings.ageGroup
        : undefined,
      discreetMode: Boolean(settings.discreetMode),
      textScale: [100, 112, 125].includes(Number(settings.textScale)) ? Number(settings.textScale) : 100,
    },
  };
}

function csvEscape(value) {
  const text = value == null ? "" : String(value);
  if (/[",\n]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

export function logsToCsv(logs) {
  const header = [
    "date",
    "periodStatus",
    "flow",
    "pain",
    "mood",
    "energy",
    "sleep",
    "symptoms",
    "medicines",
    "notes",
  ];
  const rows = (logs ?? []).map((log) =>
    [
      log.date,
      log.periodStatus ?? "",
      log.flow ?? "",
      log.pain ?? "",
      log.mood ?? "",
      log.energy ?? "",
      log.sleep ?? "",
      (log.symptoms ?? []).join("|"),
      log.medicines ?? "",
      log.notes ?? "",
    ]
      .map(csvEscape)
      .join(","),
  );
  return [header.join(","), ...rows].join("\n");
}

export function downloadText(filename, content, type = "application/json") {
  const blob = new Blob([content], { type: `${type};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
