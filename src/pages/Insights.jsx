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
import { Link } from "react-router-dom";
import { Doodle } from "../components/art/Doodles";
import { Card, CardKicker, CardTitle } from "../components/ui/Card";
import { EmptyState } from "../components/ui/States";
import { useAppState } from "../context/AppState";
import { buildInsights } from "../lib/cycle";
import {
  ENERGY_CHART,
  energyChartPoint,
  energyTicks,
  mean,
  MOOD_CHART,
  moodChartPoint,
  moodTicks,
} from "../lib/insightCharts";

const GRID = "#E9DDF7";
const CYCLE = "#7A5EA8";
const PERIOD = "#C56B8A";
const SYMPTOM = "#A78BCA";
const MOOD = "#8E4A62";
const ENERGY = "#563F68";

function fill(template, vars) {
  return Object.entries(vars).reduce((text, [key, value]) => text.replaceAll(`{${key}}`, value), template);
}

function moodTick(value, t) {
  const id = Object.keys(MOOD_CHART).find((key) => MOOD_CHART[key] === value);
  return id ? t(`log.moodOpts.${id}`) : "";
}

function energyTick(value, t) {
  const id = Object.keys(ENERGY_CHART).find((key) => ENERGY_CHART[key] === value);
  return id ? t(`log.energyOpts.${id}`) : "";
}

function DaysTip({ active, payload, label, unit }) {
  if (!active || !payload?.length || payload[0].value == null) return null;
  return (
    <div className="rounded-xl bg-cream-50 px-3 py-2 text-xs text-ink-900 shadow-soft ring-1 ring-lavender-100">
      <p className="font-medium">{label}</p>
      <p className="mt-0.5 text-ink-700">
        {payload[0].name}: {payload[0].value} {unit}
      </p>
    </div>
  );
}

function LabelTip({ active, payload, label }) {
  if (!active || !payload?.length || payload[0].payload?.label == null) return null;
  return (
    <div className="rounded-xl bg-cream-50 px-3 py-2 text-xs text-ink-900 shadow-soft ring-1 ring-lavender-100">
      <p>{label}</p>
      <p className="mt-0.5 font-medium">{payload[0].payload.label}</p>
    </div>
  );
}

export function InsightsPage() {
  const { t, periods, logs, settings } = useAppState();
  const insights = buildInsights(periods, logs);
  const noPeriods = periods.length === 0;
  const prediction = insights.prediction;
  const cycleCount = prediction.completeCycleCount;
  const moodData = logs
    .map((log) => moodChartPoint(log, (mood) => t(`log.moodOpts.${mood}`)))
    .filter(Boolean);
  const energyData = logs
    .map((log) => energyChartPoint(log, (energy) => t(`log.energyOpts.${energy}`)))
    .filter(Boolean);
  const cycleMean = mean(prediction.cycleLengths);
  const symptomData = insights.symptomFrequency.map((item) => ({
    name: t(`log.symptomOpts.${item.id}`),
    count: item.count,
  }));
  const cycleData = insights.cycleChart.map((row) => ({
    ...row,
    name: fill(t("insights.cycleN"), { n: row.name }),
  }));
  const durationData = insights.durationChart.map((row) => ({
    ...row,
    name: fill(t("insights.periodN"), { n: row.name }),
  }));
  const frequent = insights.symptomFrequency.slice(0, 3);
  const hasVariation = prediction.minLength != null && prediction.maxLength != null;

  return (
    <div className="page-enter mx-auto max-w-3xl space-y-4">
      <header className="flex items-start gap-3">
        <Doodle kind="chart" className="h-14 w-14 shrink-0" />
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-lavender-500">{t("insights.fromLogs")}</p>
          <h1 className="mt-1 font-display text-3xl">{t("insights.title")}</h1>
        </div>
      </header>

      {settings.isDemo ? (
        <p className="rounded-2xl bg-rose-100 px-4 py-3 text-sm text-rose-700" role="status">
          {t("insights.demoNote")}
        </p>
      ) : null}

      {noPeriods && logs.length === 0 ? (
        <EmptyState title={t("insights.empty")} body={t("insights.needLogs")} />
      ) : null}

      {noPeriods && logs.length === 0 ? null : (
      <>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Summary doodle="calendar" label={t("insights.typicalCycle")} value={prediction.medianLength != null ? Math.round(prediction.medianLength) : "—"} unit={prediction.medianLength != null ? t("insights.unitDays") : null} />
        <Summary doodle="drop" label={t("insights.typicalPeriod")} value={prediction.medianPeriodDuration != null ? Math.round(prediction.medianPeriodDuration) : "—"} unit={prediction.medianPeriodDuration != null ? t("insights.unitDays") : null} />
        <Summary doodle="journal" label={t("insights.cyclesRecorded")} value={cycleCount > 0 ? cycleCount : "—"} />
        <Summary
          doodle="spark"
          label={t("insights.variation")}
          value={hasVariation ? `${prediction.minLength}–${prediction.maxLength}` : "—"}
          unit={hasVariation ? t("insights.unitDays") : null}
        />
        <Card className="sm:col-span-2">
          <div className="flex items-start gap-3">
            <Doodle kind="heart" className="h-11 w-11 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wide text-ink-500">{t("insights.frequent")}</p>
              {frequent.length ? (
                <ul className="mt-2 flex flex-wrap gap-2">
                  {frequent.map((item) => (
                    <li key={item.id} className="rounded-full bg-lavender-100 px-3 py-1 text-sm text-plum">
                      {t(`log.symptomOpts.${item.id}`)} · {item.count}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 font-display text-xl text-ink-900">—</p>
              )}
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <CardKicker>{t("insights.regularity")}</CardKicker>
        <p className="mt-2 text-sm text-ink-700">{t(`insights.${insights.regularity}`)}</p>
        {hasVariation ? (
          <p className="mt-2 text-sm text-ink-500">
            {prediction.minLength}–{prediction.maxLength} {t("insights.unitDays")} · {prediction.usedCycleCount} {t("insights.cycles")}
          </p>
        ) : (
          <p className="mt-2 text-sm text-ink-500">{t("insights.needThree")}</p>
        )}
      </Card>

      {cycleData.length ? (
        <ChartCard
          learnLabel={t("insights.learnMore")}
          doodle="calendar"
          title={t("insights.cycleChart")}
          explain={t("insights.chartExplainCycle")}
          note={
            prediction.medianLength != null
              ? fill(t("insights.obsCycle"), { n: String(Math.round(prediction.medianLength)) })
              : t("insights.needCycles")
          }
        >
          <BarChart data={cycleData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#563F68" }} interval={cycleData.length > 6 ? "preserveStartEnd" : 0} />
            <YAxis allowDecimals={false} width={36} tick={{ fontSize: 10, fill: "#563F68" }} label={{ value: t("insights.unitDays"), angle: -90, position: "insideLeft", fontSize: 10 }} />
            <Tooltip content={<DaysTip unit={t("insights.unitDays")} />} />
            <Legend />
            <Bar dataKey="length" fill={CYCLE} radius={[8, 8, 0, 0]} name={t("insights.cycleChart")} />
          </BarChart>
        </ChartCard>
      ) : (
        <NeedCard doodle="calendar" title={t("insights.cycleChart")} body={t("insights.needCycles")} />
      )}

      {durationData.length ? (
        <ChartCard
          learnLabel={t("insights.learnMore")}
          doodle="drop"
          title={t("insights.durationChart")}
          explain={t("insights.chartExplainPeriod")}
          note={
            prediction.medianPeriodDuration != null
              ? fill(t("insights.obsPeriod"), { n: String(Math.round(prediction.medianPeriodDuration)) })
              : t("insights.needLogs")
          }
        >
          <BarChart data={durationData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#563F68" }} interval={durationData.length > 6 ? "preserveStartEnd" : 0} />
            <YAxis allowDecimals={false} width={36} tick={{ fontSize: 10, fill: "#563F68" }} label={{ value: t("insights.unitDays"), angle: -90, position: "insideLeft", fontSize: 10 }} />
            <Tooltip content={<DaysTip unit={t("insights.unitDays")} />} />
            <Legend />
            <Bar dataKey="days" fill={PERIOD} radius={[8, 8, 0, 0]} name={t("insights.durationChart")} />
          </BarChart>
        </ChartCard>
      ) : (
        <NeedCard doodle="drop" title={t("insights.durationChart")} body={t("insights.needLogs")} />
      )}

      {symptomData.length ? (
        <ChartCard
          learnLabel={t("insights.learnMore")} doodle="heart" title={t("insights.symptomChart")} explain={t("insights.chartExplainSymptoms")} note={t("insights.obsSymptoms")}>
          <BarChart data={symptomData} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10, fill: "#563F68" }} />
            <YAxis type="category" dataKey="name" width={104} tick={{ fontSize: 10, fill: "#563F68" }} interval={0} />
            <Tooltip content={<DaysTip unit={t("insights.unitTimes")} />} />
            <Legend />
            <Bar dataKey="count" fill={SYMPTOM} radius={[0, 8, 8, 0]} name={t("insights.symptomChart")} />
          </BarChart>
        </ChartCard>
      ) : (
        <NeedCard doodle="heart" title={t("insights.symptomChart")} body={t("insights.needLogs")} />
      )}

      {moodData.length ? (
        <ChartCard
          learnLabel={t("insights.learnMore")} doodle="mood" title={t("insights.moodOnly")} explain={t("insights.chartExplainMood")} note={t("insights.obsMood")}>
          <LineChart data={moodData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#563F68" }} tickFormatter={(value) => String(value).slice(5)} interval="preserveStartEnd" />
            <YAxis domain={[1, 5]} ticks={moodTicks()} tickFormatter={(value) => moodTick(value, t)} width={72} tick={{ fontSize: 9, fill: "#563F68" }} />
            <Tooltip content={<LabelTip />} />
            <Legend />
            <Line type="monotone" dataKey="mood" stroke={MOOD} strokeWidth={2} dot={{ r: 3, fill: MOOD }} connectNulls={false} name={t("log.mood")} />
          </LineChart>
        </ChartCard>
      ) : (
        <NeedCard doodle="mood" title={t("insights.moodOnly")} body={t("insights.needLogs")} />
      )}

      {energyData.length ? (
        <ChartCard
          learnLabel={t("insights.learnMore")} doodle="sun" title={t("insights.energyOnly")} explain={t("insights.chartExplainEnergy")} note={t("insights.obsEnergy")}>
          <LineChart data={energyData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#563F68" }} tickFormatter={(value) => String(value).slice(5)} interval="preserveStartEnd" />
            <YAxis domain={[1, 3]} ticks={energyTicks()} tickFormatter={(value) => energyTick(value, t)} width={56} tick={{ fontSize: 9, fill: "#563F68" }} />
            <Tooltip content={<LabelTip />} />
            <Legend />
            <Line type="monotone" dataKey="energy" stroke={ENERGY} strokeWidth={2} dot={{ r: 3, fill: ENERGY }} connectNulls={false} name={t("log.energy")} />
          </LineChart>
        </ChartCard>
      ) : (
        <NeedCard doodle="sun" title={t("insights.energyOnly")} body={t("insights.needLogs")} />
      )}

      {insights.symptomPatterns.length ? (
        <Card>
          <div className="flex items-start gap-3">
            <Doodle kind="spark" className="h-12 w-12 shrink-0" />
            <div>
              <CardTitle>{t("insights.patterns")}</CardTitle>
              <ul className="mt-3 space-y-2 text-sm text-ink-700">
                {insights.symptomPatterns.map((item) => (
                  <li key={`${item.kind}-${item.id}`} className="rounded-2xl bg-lavender-50 px-3 py-2">
                    {item.kind === "energy-pre"
                      ? fill(t("insights.energyPre"), { n: String(item.cycles) })
                      : fill(t("insights.patternDays"), {
                          symptom: t(`log.symptomOpts.${item.id}`),
                          days: item.days.join("-"),
                          n: String(item.cycles),
                        })}
                    <span className="mt-1 block text-xs text-ink-500">{fill(t("insights.basedOn"), { n: String(item.cycles) })}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      ) : null}

      {prediction.medianLength != null ? (
        <Card>
          <CardTitle>{t("insights.averages")}</CardTitle>
          <p className="mt-2 text-sm text-ink-700">
            {t("insights.medianCycle")}: {prediction.medianLength} ({prediction.minLength}–{prediction.maxLength}) {t("insights.unitDays")}
          </p>
          {cycleMean != null ? (
            <p className="mt-1 text-sm text-ink-700">
              {t("insights.averageCycle")}: {Math.round(cycleMean * 10) / 10} {t("insights.unitDays")}
            </p>
          ) : null}
          <p className="mt-1 text-sm text-ink-700">
            {t("insights.medianPeriod")}: {prediction.medianPeriodDuration} ({prediction.minPeriodDuration}–{prediction.maxPeriodDuration}) {t("insights.unitDays")}
          </p>
        </Card>
      ) : null}
      </>
      )}
    </div>
  );
}

function Summary({ label, value, unit, doodle }) {
  return (
    <Card>
      <div className="flex items-start gap-3">
        <Doodle kind={doodle} className="h-11 w-11 shrink-0" />
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-ink-500">{label}</p>
          <p className="mt-1 font-display text-3xl leading-none text-ink-900">{value}</p>
          {unit ? <p className="mt-1 text-xs text-ink-500">{unit}</p> : null}
        </div>
      </div>
    </Card>
  );
}

function ChartCard({ title, explain, note, doodle, learnLabel, children }) {
  return (
    <Card>
      <div className="mb-3 flex items-start gap-3">
        <Doodle kind={doodle} className="h-11 w-11 shrink-0" />
        <div>
          <h2 className="font-display text-lg">{title}</h2>
          <p className="mt-1 text-sm text-ink-500">{explain}</p>
        </div>
      </div>
      <div className="h-64 w-full min-w-0 overflow-hidden sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
      {note ? <p className="mt-3 text-sm text-ink-700">{note}</p> : null}
      <Link to="/learn" className="mt-3 inline-block text-sm font-medium text-plum">
        {learnLabel}
      </Link>
    </Card>
  );
}

function NeedCard({ title, body, doodle }) {
  return (
    <Card className="text-center">
      <Doodle kind={doodle ?? "empty"} className="mx-auto h-14 w-14" title={title} />
      <h2 className="mt-3 font-display text-lg">{title}</h2>
      <p className="mt-2 text-sm text-ink-500">{body}</p>
    </Card>
  );
}
