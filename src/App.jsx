import { useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { PinLock } from "./components/PinLock";
import { ErrorState, LoadingState } from "./components/ui/States";
import { useAppState } from "./context/AppState";
import { isSessionUnlocked } from "./lib/pin";
import { Onboarding } from "./pages/Onboarding";
import { CalendarPage } from "./pages/Calendar";
import { CarePage } from "./pages/Care";
import { InsightsPage } from "./pages/Insights";
import { LearnPage } from "./pages/Learn";
import { LogPage } from "./pages/Log";
import { PregnancyPage } from "./pages/Pregnancy";
import { RemindersPage } from "./pages/Reminders";
import { SettingsPage } from "./pages/Settings";
import { SaheliPage } from "./pages/Saheli";
import { Today } from "./pages/Today";
import { VisitSummaryPage } from "./pages/VisitSummary";

export default function App() {
  const { ready, error, settings, t, reload, completeOnboarding, showFertility } = useAppState();
  const [unlocked, setUnlocked] = useState(() => isSessionUnlocked());

  if (!ready) {
    return <LoadingState label={t("common.loading")} />;
  }

  if (error) {
    return (
      <ErrorState
        title={t("common.errorTitle")}
        body={t("common.errorBody")}
        retryLabel={t("common.retry")}
        onRetry={reload}
      />
    );
  }

  if (!settings.onboardingComplete) {
    return <Onboarding onComplete={completeOnboarding} />;
  }

  if (settings.pinHash && !unlocked) {
    return <PinLock pinHash={settings.pinHash} t={t} onUnlock={() => setUnlocked(true)} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<Today />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/log" element={<LogPage />} />
          <Route path="/insights" element={<InsightsPage />} />
          <Route path="/learn" element={<LearnPage />} />
          <Route path="/saheli" element={<SaheliPage />} />
          <Route path="/care" element={<CarePage />} />
          <Route path="/visit" element={<VisitSummaryPage />} />
          <Route path="/reminders" element={<RemindersPage />} />
          {showFertility ? <Route path="/pregnancy" element={<PregnancyPage />} /> : null}
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
