import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardKicker, CardTitle } from "../components/ui/Card";
import { EmptyState } from "../components/ui/States";
import { useAppState } from "../context/AppState";
import { buildInsights } from "../lib/cycle";

function fill(template, vars) {
  return Object.entries(vars).reduce((text, [key, value]) => text.replaceAll(`{${key}}`, value), template);
}

export function InsightsPage() {
  const { t, periods, logs, analysis, showFertility } = useAppState();
  const insights = buildInsights(periods, logs);
  const empty = periods.length === 0;
  const prediction = insights.prediction;

  return (
    <div className="page-enter mx-auto max-w-3xl space-y-4">
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-lavender-500">{t("insights.fromLogs")}</p>
        <h1 className="mt-1 font-display text-3xl">{t("insights.title")}</h1>
      </header>

      {empty ? <EmptyState title={t("insights.empty")} body={t("insights.needThree")} /> : null}

      <Card>
        <CardKicker>{t("today.estimate")}</CardKicker>
        <CardTitle className="mt-2">
          {prediction.canPredict
            ? `${Math.round(prediction.medianLength)} ${t("insights.medianCycle").toLowerCase()}`
            : t("insights.needThree")}
        </CardTitle>
        <p className="mt-2 text-sm text-ink-500">
          {prediction.usedCycleCount} {t("insights.cycles")}
          {prediction.minLength != null ? ` · ${prediction.minLength}–${prediction.maxLength}` : ""}
        </p>
        <p className="mt-3 text-sm font-medium text-ink-800">{t("insights.regularity")}</p>
        <p className="mt-1 text-sm text-ink-700">{t(`insights.${insights.regularity}`)}</p>
        <p className="mt-3 text-sm text-ink-700">{t("today.contraception")}</p>
        {showFertility && prediction.skipOvulation ? <p className="mt-2 text-sm text-ink-500">{t("today.noOvulation")}</p> : null}
        {showFertility && prediction.ovulationWindow ? (
          <p className="mt-2 text-sm text-ink-700">
            {prediction.ovulationWindow.start} – {prediction.ovulationWindow.end}
          </p>
        ) : null}
      </Card>

      {insights.cycleChart.length ? (
        <ChartCard title={t("insights.cycleChart")}>
          <BarChart data={insights.cycleChart}>
            <CartesianGrid strokeDasharray="3 3" stroke="#EDE7F6" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="length" name={t("insights.cycleChart")} fill="#6F57A5" radius={[8, 8, 0, 0]} />
            <Bar dataKey="period" name={t("insights.durationChart")} fill="#C45B6C" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ChartCard>
      ) : null}

      {insights.moodEnergy.length ? (
        <ChartCard title={t("insights.moodChart")}>
          <LineChart data={insights.moodEnergy}>
            <CartesianGrid strokeDasharray="3 3" stroke="#EDE7F6" />
            <XAxis dataKey="date" hide />
            <YAxis domain={[0, 4]} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="mood" stroke="#C45B6C" dot={false} />
            <Line type="monotone" dataKey="energy" stroke="#6F57A5" dot={false} />
          </LineChart>
        </ChartCard>
      ) : null}

      <Card>
        <CardTitle>{t("insights.patterns")}</CardTitle>
        {insights.symptomPatterns.length ? (
          <ul className="mt-3 space-y-2 text-sm text-ink-700">
            {insights.symptomPatterns.map((item) => (
              <li key={`${item.kind}-${item.id}`} className="rounded-2xl bg-rose-50 px-3 py-2 text-rose-700">
                {item.kind === "energy-pre"
                  ? fill(t("insights.energyPre"), { n: String(item.cycles) })
                  : fill(t("insights.patternDays"), {
                      symptom: t(`log.symptomOpts.${item.id}`),
                      days: item.days.join("-"),
                      n: String(item.cycles),
                    })}
                <span className="mt-1 block text-xs">{fill(t("insights.basedOn"), { n: String(item.cycles) })}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-ink-500">{t("insights.noneRecurring")}</p>
        )}
      </Card>

      {analysis.avgLength ? (
        <Card>
          <CardTitle>{t("insights.averages")}</CardTitle>
          <p className="mt-2 text-sm text-ink-700">
            {t("insights.medianCycle")}: {prediction.medianLength} ({prediction.minLength}–{prediction.maxLength})
          </p>
          <p className="mt-1 text-sm text-ink-700">
            {t("insights.medianPeriod")}: {prediction.medianPeriodDuration} (
            {prediction.minPeriodDuration}–{prediction.maxPeriodDuration})
          </p>
        </Card>
      ) : null}
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <Card>
      <h2 className="mb-3 font-display text-lg">{title}</h2>
      <div className="h-56 w-full min-w-0 overflow-hidden">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
