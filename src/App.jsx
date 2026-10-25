import { lazy, Suspense, useState } from "react";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { UnsavedGuardProvider } from "./context/UnsavedGuard";
import { PinLock } from "./components/PinLock";
import { ErrorState, LoadingState } from "./components/ui/States";
import { useAppState } from "./context/AppState";
import { isSessionUnlocked } from "./lib/pin";
import { Onboarding } from "./pages/Onboarding";
import { CalendarPage } from "./pages/Calendar";
import { CarePage } from "./pages/Care";
import { LearnPage } from "./pages/Learn";
import { LogPage } from "./pages/Log";
import { PregnancyPage } from "./pages/Pregnancy";
import { RemindersPage } from "./pages/Reminders";
import { SettingsPage } from "./pages/Settings";
import { SaheliPage } from "./pages/Saheli";
import { Today } from "./pages/Today";
import { VisitSummaryPage } from "./pages/VisitSummary";

const InsightsPage = lazy(() => import("./pages/Insights").then((mod) => ({ default: mod.InsightsPage })));

function GuardedShell() {
  return (
    <UnsavedGuardProvider>
      <AppShell />
    </UnsavedGuardProvider>
  );
}

function InsightsRoute() {
  const { t } = useAppState();
  return (
    <Suspense fallback={<LoadingState label={t("common.loading")} />}>
      <InsightsPage />
    </Suspense>
  );
}

function PregnancyRoute() {
  const { showFertility } = useAppState();
  if (!showFertility) return <Navigate to="/" replace />;
  return <PregnancyPage />;
}

const router = createBrowserRouter([
  {
    element: <GuardedShell />,
    children: [
      { path: "/", element: <Today /> },
      { path: "/calendar", element: <CalendarPage /> },
      { path: "/log", element: <LogPage /> },
      { path: "/insights", element: <InsightsRoute /> },
      { path: "/learn", element: <LearnPage /> },
      { path: "/saheli", element: <SaheliPage /> },
      { path: "/care", element: <CarePage /> },
      { path: "/visit", element: <VisitSummaryPage /> },
      { path: "/reminders", element: <RemindersPage /> },
      { path: "/pregnancy", element: <PregnancyRoute /> },
      { path: "/settings", element: <SettingsPage /> },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);

export default function App() {
  const { ready, error, settings, t, reload, completeOnboarding } = useAppState();
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

  return <RouterProvider router={router} />;
}
