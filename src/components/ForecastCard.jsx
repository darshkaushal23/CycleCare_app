import { Card, CardKicker } from "./ui/Card";
import { periodForecast } from "../lib/cycle";
import { formatDisplayDate, todayISO } from "../lib/dates";

function shortDate(value, locale) {
  return formatDisplayDate(value, locale, { day: "numeric", month: "short" });
}

export function ForecastCard({ prediction, t, locale, showFertility, today = todayISO() }) {
  const forecast = periodForecast(prediction, today);
  return (
    <Card>
      <CardKicker>{t("today.fromLogs")}</CardKicker>
      <p className="mt-3 text-base font-medium text-ink-700">{t("today.nextWindow")}</p>
      {forecast.nextPeriod ? (
        <p className="mt-1 font-display text-xl text-ink-900">
          {shortDate(forecast.nextPeriod.start, locale)}
          {" – "}
          {shortDate(forecast.nextPeriod.end, locale)}
        </p>
      ) : (
        <p className="mt-1 text-base text-ink-700">{t("today.needMore")}</p>
      )}
      {showFertility ? (
        <>
          <p className="mt-3 text-base font-medium text-ink-700">{t("today.nextOvulation")}</p>
          <p className="mt-1 font-display text-xl text-ink-900">
            {forecast.ovulation ? shortDate(forecast.ovulation, locale) : t("today.noOvulation")}
          </p>
        </>
      ) : null}
      <p className="mt-3 text-base font-medium text-ink-700">
        {t(forecast.inPeriod ? "today.periodEnds" : "today.nextPeriodEnds")}
      </p>
      <p className="mt-1 font-display text-xl text-ink-900">
        {forecast.periodEnd ? shortDate(forecast.periodEnd, locale) : t("today.needMore")}
      </p>
      <p className="mt-2 text-sm text-ink-500">{t("today.estimate")}</p>
    </Card>
  );
}
