import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  clearAllData,
  deleteLog as dbDeleteLog,
  getAllLogs,
  getSettings,
  putLog,
  replaceAllLogs,
  replaceAllPeriods,
  saveSettings,
} from "../lib/db";
import { derivePeriodsFromLogs } from "../lib/cycle";
import { analyzeCycles } from "../lib/cycleAnalysis";
import { todayISO } from "../lib/dates";
import { t } from "../lib/i18n";
import { buildDemoLogs } from "../lib/demoData";
import { DEFAULT_TRACKED_SYMPTOMS, normalizeLog } from "../lib/logFields";
import { defaultReminders } from "../lib/reminders";

const AppStateContext = createContext(null);

const defaultSettings = {
  language: "en",
  ageGroup: "under18",
  onboardingComplete: false,
  isDemo: false,
  discreetMode: false,
  textScale: 100,
  highContrast: false,
  readAloud: false,
  trackedSymptoms: DEFAULT_TRACKED_SYMPTOMS,
  pinHash: null,
  fertilityUnlocked: false,
  pregnancyMode: false,
  pregnancyLmp: null,
  reminders: defaultReminders,
  createdAt: null,
};

function mergeSettings(saved) {
  return { ...defaultSettings, ...(saved ?? {}) };
}

export function AppStateProvider({ children }) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);
  const [settings, setSettings] = useState(defaultSettings);
  const [periods, setPeriods] = useState([]);
  const [logs, setLogs] = useState([]);

  const loadAll = useCallback(async () => {
    setError(null);
    const [savedSettings, savedLogs] = await Promise.all([getSettings(), getAllLogs()]);
    setSettings(mergeSettings(savedSettings));
    setLogs(savedLogs);
    setPeriods(derivePeriodsFromLogs(savedLogs));
    setReady(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await loadAll();
      } catch (err) {
        if (!cancelled) {
          setError(err);
          setReady(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadAll]);

  const persistSettings = useCallback(async (next) => {
    setSettings(next);
    await saveSettings(next);
  }, []);

  const completeOnboarding = useCallback(
    async ({ language, ageGroup, mode }) => {
      const nextSettings = {
        ...defaultSettings,
        language,
        ageGroup,
        onboardingComplete: true,
        isDemo: mode === "demo",
        createdAt: todayISO(),
      };

      if (mode === "demo") {
        const demoLogs = buildDemoLogs();
        const demoPeriods = derivePeriodsFromLogs(demoLogs);
        await Promise.all([
          saveSettings(nextSettings),
          replaceAllPeriods(demoPeriods),
          replaceAllLogs(demoLogs),
        ]);
        setPeriods(demoPeriods);
        setLogs(demoLogs);
      } else {
        await Promise.all([saveSettings(nextSettings), replaceAllPeriods([]), replaceAllLogs([])]);
        setPeriods([]);
        setLogs([]);
      }

      setSettings(nextSettings);
    },
    [],
  );

  const loadDemo = useCallback(async () => {
    const nextSettings = {
      ...settings,
      onboardingComplete: true,
      isDemo: true,
      createdAt: settings.createdAt ?? todayISO(),
    };
    const demoLogs = buildDemoLogs();
    const demoPeriods = derivePeriodsFromLogs(demoLogs);
    await Promise.all([
      saveSettings(nextSettings),
      replaceAllPeriods(demoPeriods),
      replaceAllLogs(demoLogs),
    ]);
    setSettings(nextSettings);
    setPeriods(demoPeriods);
    setLogs(demoLogs);
  }, [settings]);

  const startFresh = useCallback(async () => {
    const nextSettings = {
      ...settings,
      onboardingComplete: true,
      isDemo: false,
      createdAt: settings.createdAt ?? todayISO(),
    };
    await Promise.all([saveSettings(nextSettings), replaceAllPeriods([]), replaceAllLogs([])]);
    setSettings(nextSettings);
    setPeriods([]);
    setLogs([]);
  }, [settings]);

  const updateLanguage = useCallback(
    async (language) => {
      await persistSettings({ ...settings, language });
    },
    [persistSettings, settings],
  );

  const updateSettings = useCallback(
    async (patch) => {
      await persistSettings({ ...settings, ...patch });
    },
    [persistSettings, settings],
  );

  const importBackup = useCallback(
    async (result) => {
      const nextSettings = {
        ...settings,
        ...result.settings,
        onboardingComplete: true,
        isDemo: false,
      };
      const derived = derivePeriodsFromLogs(result.logs);
      await Promise.all([
        saveSettings(nextSettings),
        replaceAllLogs(result.logs),
        replaceAllPeriods(derived),
      ]);
      setSettings(nextSettings);
      setLogs(result.logs);
      setPeriods(derived);
    },
    [settings],
  );

  const deleteAllData = useCallback(async () => {
    await clearAllData();
    setSettings(defaultSettings);
    setPeriods([]);
    setLogs([]);
  }, []);

  const resetOnboarding = useCallback(async () => {
    await clearAllData();
    setSettings(defaultSettings);
    setPeriods([]);
    setLogs([]);
  }, []);

  const persistDerived = useCallback(async (nextLogs) => {
    const sorted = [...nextLogs].sort((a, b) => a.date.localeCompare(b.date));
    const derived = derivePeriodsFromLogs(sorted);
    await replaceAllPeriods(derived);
    setLogs(sorted);
    setPeriods(derived);
  }, []);

  const saveLog = useCallback(
    async (input) => {
      const log = normalizeLog(input, input.date);
      log.isDemo = Boolean(settings.isDemo || input.isDemo);
      log.updatedAt = new Date().toISOString();
      await putLog(log);
      const next = logs.filter((item) => item.date !== log.date);
      next.push(log);
      await persistDerived(next);
    },
    [logs, persistDerived, settings.isDemo],
  );

  const removeLog = useCallback(
    async (date) => {
      await dbDeleteLog(date);
      await persistDerived(logs.filter((item) => item.date !== date));
    },
    [logs, persistDerived],
  );

  const analysis = useMemo(
    () => analyzeCycles(periods, logs, todayISO(), { pregnancyMode: Boolean(settings.pregnancyMode) }),
    [periods, logs, settings.pregnancyMode],
  );
  const lang = settings.language === "hi" ? "hi" : "en";
  const showFertility = settings.ageGroup !== "under18" || Boolean(settings.fertilityUnlocked);

  useEffect(() => {
    document.documentElement.lang = lang === "hi" ? "hi" : "en";
    const scale = Number(settings.textScale) || 100;
    document.documentElement.style.fontSize = `${(16 * scale) / 100}px`;
    document.documentElement.classList.toggle("high-contrast", Boolean(settings.highContrast));
    if (settings.discreetMode) {
      document.title = lang === "hi" ? "दैनिक पंजी" : "Daybook";
    } else {
      document.title =
        lang === "hi" ? "CycleCare — निजी मासिक धर्म साथी" : "CycleCare — Private menstrual health companion";
    }
  }, [lang, settings.discreetMode, settings.textScale, settings.highContrast]);

  const value = useMemo(
    () => ({
      ready,
      error,
      settings,
      periods,
      logs,
      analysis,
      lang,
      showFertility,
      t: (path) => t(lang, path),
      completeOnboarding,
      loadDemo,
      startFresh,
      updateLanguage,
      updateSettings,
      resetOnboarding,
      importBackup,
      deleteAllData,
      saveLog,
      removeLog,
      reload: loadAll,
    }),
    [
      ready,
      error,
      settings,
      periods,
      logs,
      analysis,
      lang,
      showFertility,
      completeOnboarding,
      loadDemo,
      startFresh,
      updateLanguage,
      updateSettings,
      resetOnboarding,
      importBackup,
      deleteAllData,
      saveLog,
      removeLog,
      loadAll,
    ],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}
