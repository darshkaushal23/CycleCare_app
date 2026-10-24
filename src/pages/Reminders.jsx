import { useState } from "react";
import { Button } from "../components/ui/Button";
import { Card, CardTitle } from "../components/ui/Card";
import { useAppState } from "../context/AppState";
import { defaultReminders, notifyIfAllowed, requestNotifyPermission } from "../lib/reminders";

export function RemindersPage() {
  const { t, settings, updateSettings } = useAppState();
  const reminders = { ...defaultReminders, ...(settings.reminders ?? {}) };
  const [note, setNote] = useState("");

  async function patch(partial) {
    const next = { ...reminders, ...partial };
    await updateSettings({ reminders: next });
    const anyOn = next.nextPeriod || next.dailyCheckIn || next.medicines || next.customEnabled;
    if (anyOn) {
      const status = await requestNotifyPermission();
      if (status === "granted") {
        notifyIfAllowed({
          title: "CycleCare",
          body: t("reminders.granted"),
          discreet: settings.discreetMode,
        });
        setNote(t("reminders.granted"));
      } else if (status === "denied") setNote(t("reminders.denied"));
      else if (status === "unsupported") setNote(t("reminders.unsupported"));
    }
  }

  return (
    <div className="page-enter mx-auto max-w-2xl space-y-4">
      <header>
        <h1 className="font-display text-3xl">{t("reminders.title")}</h1>
        <p className="mt-2 text-sm text-ink-500">{t("reminders.intro")}</p>
      </header>

      <ToggleCard title={t("reminders.nextPeriod")} on={reminders.nextPeriod} onToggle={() => patch({ nextPeriod: !reminders.nextPeriod })} />
      <ToggleCard title={t("reminders.daily")} on={reminders.dailyCheckIn} onToggle={() => patch({ dailyCheckIn: !reminders.dailyCheckIn })} />
      <Card>
        <CardTitle>{t("reminders.medicines")}</CardTitle>
        <Button className="mt-4 w-full" variant={reminders.medicines ? "primary" : "secondary"} onClick={() => patch({ medicines: !reminders.medicines })}>
          {reminders.medicines ? t("reminders.on") : t("reminders.off")}
        </Button>
        <label className="mt-3 block text-sm">
          {t("reminders.medicineTime")}
          <input
            type="time"
            value={reminders.medicineTimes?.[0] ?? "08:00"}
            onChange={(event) => patch({ medicineTimes: [event.target.value] })}
            className="mt-2 h-12 w-full rounded-2xl bg-cream-50 px-3 ring-1 ring-lavender-200"
          />
        </label>
      </Card>
      <Card>
        <CardTitle>{t("reminders.custom")}</CardTitle>
        <input
          value={reminders.customLabel}
          onChange={(event) => patch({ customLabel: event.target.value, customEnabled: Boolean(event.target.value) })}
          placeholder={t("reminders.customLabel")}
          className="mt-3 h-12 w-full rounded-2xl bg-cream-50 px-3 text-sm ring-1 ring-lavender-200"
        />
      </Card>
      {note ? <p className="text-sm text-lavender-700">{note}</p> : null}
    </div>
  );
}

function ToggleCard({ title, on, onToggle }) {
  const { t } = useAppState();
  return (
    <Card>
      <CardTitle>{title}</CardTitle>
      <Button className="mt-4 w-full" variant={on ? "primary" : "secondary"} onClick={onToggle}>
        {on ? t("reminders.on") : t("reminders.off")}
      </Button>
    </Card>
  );
}
