import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  Bell,
  BookOpen,
  CalendarDays,
  ClipboardList,
  HeartPulse,
  Home,
  Languages,
  Menu,
  MessageCircleHeart,
  Settings,
  Sparkles,
  Sprout,
  X,
} from "lucide-react";
import { useAppState } from "../../context/AppState";

const primaryNav = [
  { to: "/", key: "today", icon: Home, end: true },
  { to: "/calendar", key: "calendar", icon: CalendarDays },
  { to: "/log", key: "log", icon: ClipboardList, emphasis: true },
  { to: "/insights", key: "insights", icon: Sparkles },
];

const moreNav = [
  { to: "/community", key: "community", icon: MessageCircleHeart },
  { to: "/care", key: "care", icon: HeartPulse },
  { to: "/learn", key: "learn", icon: BookOpen },
  { to: "/saheli", key: "saheli", icon: MessageCircleHeart },
  { to: "/reminders", key: "reminders", icon: Bell },
  { to: "/pregnancy", key: "pregnancy", icon: Sprout, fertility: true },
  { to: "/settings", key: "settings", icon: Settings },
];

function linkClass(isActive, emphasis) {
  if (emphasis) {
    return `flex h-12 w-12 items-center justify-center rounded-2xl ${
      isActive ? "bg-rose-500 text-white shadow-soft" : "bg-lavender-700 text-white"
    }`;
  }
  return `flex min-h-12 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl text-[11px] ${
    isActive ? "text-lavender-700" : "text-ink-500"
  }`;
}

export function AppShell() {
  const { t, lang, updateLanguage, settings, showFertility } = useAppState();
  const extraNav = moreNav.filter((item) => !item.fertility || showFertility);
  const [moreOpen, setMoreOpen] = useState(false);
  const location = useLocation();
  const discreet = Boolean(settings.discreetMode);
  const labelFor = (key) => key === "community" ? (lang === "hi" ? "सहेली सर्कल" : "Community") : (discreet ? t(`discreet.nav.${key}`) : t(`nav.${key}`));

  const moreActive = extraNav.some((item) => location.pathname.startsWith(item.to));

  return (
    <div className="min-h-dvh">
      <a className="skip-link" href="#main">
        {t("skip")}
      </a>

      <div className="mx-auto flex min-h-dvh max-w-6xl">
        <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-lavender-100 bg-white/70 p-5 backdrop-blur md:flex">
          <Brand t={t} demo={settings.isDemo} discreet={discreet} />
          <nav className="mt-8 min-w-0 space-y-1" aria-label={discreet ? t("discreet.appName") : t("appName")}>
            {[...primaryNav, ...extraNav].map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-3 py-3 text-sm ${
                    isActive ? "bg-lavender-100 text-lavender-700" : "text-ink-700 hover:bg-cream-100"
                  }`
                }
              >
                <item.icon className="h-4 w-4" aria-hidden="true" />
                {labelFor(item.key)}
              </NavLink>
            ))}
          </nav>
          <LanguageToggle lang={lang} onChange={updateLanguage} t={t} />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-lavender-100 bg-cream-50/90 px-4 py-3 backdrop-blur md:px-8">
            <div className="min-w-0 md:hidden">
              <Brand t={t} demo={settings.isDemo} discreet={discreet} compact />
            </div>
            <p className="hidden min-w-0 truncate text-sm text-ink-500 md:block">
              {discreet ? t("discreet.tagline") : t("tagline")}
            </p>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-lavender-100 px-3 py-1 text-[11px] font-medium text-lavender-700">
                {t("today.privacyChip")}
              </span>
              <button
                type="button"
                className="md:hidden inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white ring-1 ring-lavender-200"
                aria-expanded={moreOpen}
                aria-controls="more-menu"
                onClick={() => setMoreOpen(true)}
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">{labelFor("more")}</span>
              </button>
            </div>
          </header>

          <main id="main" className="flex-1 px-4 pb-28 pt-5 md:px-8 md:pb-10">
            <Outlet />
          </main>
        </div>
      </div>

      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-lavender-100 bg-white/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur md:hidden"
        aria-label={discreet ? t("discreet.appName") : t("appName")}
      >
        <div className="mx-auto flex max-w-lg items-end">
          {primaryNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => linkClass(isActive, item.emphasis)}
            >
              <item.icon className="h-5 w-5" aria-hidden="true" />
              {item.emphasis ? <span className="sr-only">{labelFor(item.key)}</span> : labelFor(item.key)}
            </NavLink>
          ))}
          <button
            type="button"
            className={`flex min-h-12 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl text-[11px] ${
              moreActive ? "text-lavender-700" : "text-ink-500"
            }`}
            onClick={() => setMoreOpen(true)}
          >
            <HeartPulse className="h-5 w-5" aria-hidden="true" />
            {labelFor("more")}
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
          <div className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-cream-50 p-5 pb-8 shadow-card">
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
                  onClick={() => setMoreOpen(false)}
                  className={({ isActive }) =>
                    `flex min-h-20 flex-col justify-between rounded-2xl p-4 ring-1 ${
                      isActive ? "bg-lavender-700 text-white ring-lavender-700" : "bg-white ring-lavender-100"
                    }`
                  }
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{labelFor(item.key)}</span>
                </NavLink>
              ))}
            </div>
            <LanguageToggle lang={lang} onChange={updateLanguage} t={t} />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Brand({ t, demo, compact, discreet }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-700">
        <HeartPulse className="h-4 w-4" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="font-display text-lg leading-none">{discreet ? t("discreet.appName") : t("appName")}</p>
        {compact ? null : (
          <p className="mt-1 text-[11px] text-ink-500">{discreet ? t("discreet.tagline") : t("tagline")}</p>
        )}
      </div>
      {demo ? (
        <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-rose-700">
          {t("common.demo")}
        </span>
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
        className={`h-10 flex-1 rounded-xl text-sm ${lang === "en" ? "bg-lavender-100 text-lavender-700" : "text-ink-500"}`}
        onClick={() => onChange("en")}
      >
        {t("onboarding.english")}
      </button>
      <button
        type="button"
        aria-pressed={lang === "hi"}
        className={`h-10 flex-1 rounded-xl text-sm ${lang === "hi" ? "bg-lavender-100 text-lavender-700" : "text-ink-500"}`}
        onClick={() => onChange("hi")}
      >
        {t("onboarding.hindi")}
      </button>
    </div>
  );
}
