import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  Bell,
  BookOpen,
  CalendarDays,
  ClipboardList,
  HeartPulse,
  Home,
  Languages,
  LayoutGrid,
  MessageCircle,
  MessageCircleHeart,
  Settings,
  Sparkles,
  Sprout,
  X,
} from "lucide-react";
import { Doodle } from "../art/Doodles";
import { LogoLockup, LogoWordmark } from "../art/Logo";
import { FirstTour } from "../FirstTour";
import { useAppState } from "../../context/AppState";
import { useUnsavedGuard } from "../../context/UnsavedGuard";
import { stopSpeaking } from "../../lib/speech";

const primaryNav = [
  { to: "/", key: "today", icon: Home, end: true },
  { to: "/calendar", key: "calendar", icon: CalendarDays },
  { to: "/log", key: "log", icon: ClipboardList },
  { to: "/assistant", key: "assistant", icon: MessageCircle },
];

const moreNav = [
  { to: "/learn", key: "learn", icon: BookOpen, doodle: "journal" },
  { to: "/insights", key: "insights", icon: Sparkles, doodle: "chart" },
  { to: "/care", key: "care", icon: HeartPulse, doodle: "alert" },
  { to: "/saheli", key: "saheli", icon: MessageCircleHeart, doodle: "mood" },
  { to: "/reminders", key: "reminders", icon: Bell, doodle: "spark" },
  { to: "/pregnancy", key: "pregnancy", icon: Sprout, doodle: "moon", fertility: true },
  { to: "/settings", key: "settings", icon: Settings, doodle: "notebook" },
];

function crumbFor(pathname, extraNav) {
  if (pathname === "/") return "today";
  const hit = [...primaryNav, ...extraNav, { to: "/visit", key: "care" }].find(
    (item) => item.to !== "/" && pathname.startsWith(item.to),
  );
  return hit?.key ?? "today";
}

export function AppShell() {
  const { t, lang, updateLanguage, settings, showFertility, updateSettings } = useAppState();
  const { confirmLeave } = useUnsavedGuard();
  const extraNav = moreNav.filter((item) => !item.fertility || showFertility);
  const [moreOpen, setMoreOpen] = useState(false);
  const location = useLocation();
  const discreet = Boolean(settings.discreetMode);
  const labelFor = (key) => (discreet ? t(`discreet.nav.${key}`) : t(`nav.${key}`));
  const moreActive = extraNav.some((item) => location.pathname.startsWith(item.to));
  const crumbKey = crumbFor(location.pathname, extraNav);

  useEffect(() => {
    stopSpeaking();
    setMoreOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!moreOpen) return undefined;
    function onKey(event) {
      if (event.key === "Escape") setMoreOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [moreOpen]);

  function guardNav(event) {
    if (!confirmLeave()) event.preventDefault();
  }

  return (
    <div className="min-h-dvh">
      <a className="skip-link" href="#main">
        {t("skip")}
      </a>

      <div className="mx-auto flex min-h-dvh max-w-6xl">
        <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-lavender-100 bg-white/80 p-5 backdrop-blur md:flex">
          <LogoLockup t={t} demo={settings.isDemo} discreet={discreet} />
          <nav className="mt-8 min-w-0 flex-1 space-y-1 overflow-y-auto" aria-label={discreet ? t("discreet.appName") : t("appName")}>
            {[...primaryNav, ...extraNav].map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={guardNav}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-3 py-3 text-base motion-safe:transition duration-200 ${
                    isActive
                      ? "bg-lavender-100 font-medium text-plum shadow-soft ring-1 ring-lavender-200"
                      : "text-ink-700 hover:bg-cream-100"
                  }`
                }
              >
                <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="truncate">{labelFor(item.key)}</span>
              </NavLink>
            ))}
          </nav>
          <LanguageToggle lang={lang} onChange={updateLanguage} t={t} />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-lavender-100 bg-cream-50/85 px-4 py-3 backdrop-blur md:px-8">
            <div className="min-w-0 md:hidden">
              <LogoLockup t={t} demo={settings.isDemo} discreet={discreet} compact markClassName="h-8 w-8" wordClassName="text-base leading-none" />
            </div>
            <nav className="hidden min-w-0 items-center gap-2 text-sm text-ink-500 md:flex" aria-label="Breadcrumb">
              {discreet ? (
                <span className="truncate">{t("discreet.appName")}</span>
              ) : (
                <LogoWordmark className="truncate text-sm" />
              )}
              <span aria-hidden="true">/</span>
              <span className="truncate font-medium text-ink-900">{labelFor(crumbKey)}</span>
            </nav>
            <span className="rounded-full bg-lavender-100 px-3 py-1 text-[11px] font-medium text-lavender-700">
              {t("today.privacyChip")}
            </span>
          </header>

          <main id="main" className="flex-1 px-4 pb-[calc(var(--app-nav-h)+2.5rem)] pt-5 md:px-8 md:pb-10">
            <Outlet />
          </main>
        </div>
      </div>

      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-lavender-100 bg-white/95 px-1 pt-1 pb-[max(0.4rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden"
        aria-label={discreet ? t("discreet.appName") : t("appName")}
      >
        <div className="mx-auto flex max-w-lg items-stretch">
          {primaryNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={guardNav}
              className={({ isActive }) =>
                  `flex min-h-14 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl px-0.5 text-xs leading-tight motion-safe:transition duration-200 ${
                  isActive ? "bg-lavender-100 font-medium text-plum" : "text-ink-500"
                }`
              }
            >
              <item.icon className="h-5 w-5" aria-hidden="true" />
              <span className="max-w-full truncate">{labelFor(item.key)}</span>
            </NavLink>
          ))}
          <button
            type="button"
            className={`flex min-h-14 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl text-xs leading-tight ${
              moreActive ? "bg-lavender-100 font-medium text-plum" : "text-ink-500"
            }`}
            aria-expanded={moreOpen}
            aria-controls="more-menu"
            onClick={() => setMoreOpen((open) => !open)}
          >
            <LayoutGrid className="h-5 w-5" aria-hidden="true" />
            <span className="max-w-full truncate">{labelFor("more")}</span>
          </button>
        </div>
      </nav>

      {moreOpen ? (
        <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal="true" id="more-menu">
          <button
            type="button"
            className="absolute inset-0 bg-ink-900/30"
            aria-label={t("common.close")}
            onClick={() => setMoreOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-cream-50 p-5 pb-[max(2rem,env(safe-area-inset-bottom))] shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl">{labelFor("more")}</h2>
              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white"
                onClick={() => setMoreOpen(false)}
              >
                <X className="h-5 w-5" />
                <span className="sr-only">{t("common.close")}</span>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {extraNav.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={guardNav}
                  className={({ isActive }) =>
                    `flex min-h-20 flex-col justify-between rounded-2xl p-4 ring-1 motion-safe:transition duration-200 ${
                      isActive ? "bg-plum text-cream-50 ring-plum" : "bg-cream-50 ring-lavender-100"
                    }`
                  }
                >
                  <Doodle kind={item.doodle} className="h-10 w-10" />
                  <span className="text-sm font-medium">{labelFor(item.key)}</span>
                </NavLink>
              ))}
            </div>
            <LanguageToggle lang={lang} onChange={updateLanguage} t={t} />
          </div>
        </div>
      ) : null}

      {!settings.tourComplete ? (
        <FirstTour t={t} onDone={() => updateSettings({ tourComplete: true })} />
      ) : null}
    </div>
  );
}

function LanguageToggle({ lang, onChange, t }) {
  return (
    <div className="mt-5 flex items-center gap-2 rounded-2xl bg-white p-2 ring-1 ring-lavender-100" role="group" aria-label={t("onboarding.language")}>
      <Languages className="ml-2 h-4 w-4 text-lavender-500" aria-hidden="true" />
      <button
        type="button"
        aria-pressed={lang === "en"}
        className={`h-10 flex-1 rounded-xl text-sm motion-safe:transition duration-200 ${lang === "en" ? "bg-lavender-100 text-plum" : "text-ink-500"}`}
        onClick={() => onChange("en")}
      >
        {t("onboarding.english")}
      </button>
      <button
        type="button"
        aria-pressed={lang === "hi"}
        className={`h-10 flex-1 rounded-xl text-sm motion-safe:transition duration-200 ${lang === "hi" ? "bg-lavender-100 text-plum" : "text-ink-500"}`}
        onClick={() => onChange("hi")}
      >
        {t("onboarding.hindi")}
      </button>
    </div>
  );
}
