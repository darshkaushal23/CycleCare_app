import { Button } from "../components/ui/Button";
import { Card, CardTitle } from "../components/ui/Card";
import { useAppState } from "../context/AppState";
import { todayISO } from "../lib/dates";
import { PREGNANCY_DANGER_SIGNS, PREGNANCY_SOURCES, dueDateFromLmp, weekCopy, weekFromLmp } from "../content/pregnancyWeeks";

export function PregnancyPage() {
  const { t, lang, settings, updateSettings, periods } = useAppState();
  const lastStart = periods.at(-1)?.startDate ?? "";
  const lmp = settings.pregnancyLmp || lastStart;
  const week = settings.pregnancyMode ? weekFromLmp(lmp, todayISO()) : null;
  const due = settings.pregnancyMode ? dueDateFromLmp(lmp) : null;
  const copy = week ? weekCopy(week, lang) : null;

  async function turnOn() {
    await updateSettings({
      pregnancyMode: true,
      pregnancyLmp: lmp || todayISO(),
    });
  }

  async function turnOff() {
    if (!window.confirm(t("pregnancy.confirmOff"))) return;
    await updateSettings({ pregnancyMode: false });
  }

  return (
    <div className="page-enter mx-auto max-w-2xl space-y-4">
      <header>
        <h1 className="font-display text-3xl">{t("pregnancy.title")}</h1>
        <p className="mt-2 text-sm text-ink-500">{t("pregnancy.intro")}</p>
      </header>

      <Card>
        <label className="block text-sm">
          {t("pregnancy.lmp")}
          <input
            type="date"
            value={lmp}
            onChange={(event) => updateSettings({ pregnancyLmp: event.target.value })}
            className="mt-2 h-12 w-full rounded-2xl bg-cream-50 px-3 ring-1 ring-lavender-200"
          />
        </label>
        {settings.pregnancyMode ? (
          <Button className="mt-4 w-full" variant="secondary" onClick={turnOff}>
            {t("pregnancy.disable")}
          </Button>
        ) : (
          <Button className="mt-4 w-full" onClick={turnOn}>
            {t("pregnancy.enable")}
          </Button>
        )}
      </Card>

      {settings.pregnancyMode && week ? (
        <Card>
          <CardTitle>
            {t("pregnancy.week")}: {week}
          </CardTitle>
          <p className="mt-2 text-sm text-ink-500">
            {t("pregnancy.due")}: {due} ({t("today.estimate")})
          </p>
          <h2 className="mt-4 font-display text-lg">{copy.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-700">{copy.body}</p>
          <p className="mt-3 text-sm text-ink-500">{t("pregnancy.checkup")}</p>
        </Card>
      ) : null}

      <Card>
        <CardTitle>{t("pregnancy.danger")}</CardTitle>
        <p className="mt-2 text-sm text-rose-700">{t("pregnancy.dangerNote")}</p>
        <ul className="mt-3 space-y-1 text-sm text-ink-800">
          {PREGNANCY_DANGER_SIGNS.map((item) => (
            <li key={item.id}>• {lang === "hi" ? item.hi : item.en}</li>
          ))}
        </ul>
        <ul className="mt-4 space-y-1 text-xs text-lavender-700">
          {PREGNANCY_SOURCES.map((source) => (
            <li key={source.url}>
              <a href={source.url} className="underline" target="_blank" rel="noreferrer">
                {source.name}: {source.title}
              </a>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
