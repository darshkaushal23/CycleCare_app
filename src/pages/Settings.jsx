import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card, CardKicker, CardTitle } from "../components/ui/Card";
import { ChoiceButton, ChoiceGroup } from "../components/ui/Input";
import { useAppState } from "../context/AppState";
import { SYMPTOM_OPTIONS } from "../lib/logFields";
import { hashPin, lockSession } from "../lib/pin";
import { buildExportPayload, downloadText, logsToCsv, validateImport } from "../lib/transfer";

const AGE_KEYS = ["under18", "18-24", "25-34", "35plus"];

export function SettingsPage() {
  const {
    t,
    lang,
    settings,
    logs,
    updateLanguage,
    updateSettings,
    loadDemo,
    startFresh,
    importBackup,
    deleteAllData,
  } = useAppState();
  const fileRef = useRef(null);
  const [message, setMessage] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);
  const [pinDraft, setPinDraft] = useState("");

  function exportJson() {
    const payload = buildExportPayload({ logs, settings });
    downloadText(`cyclecare-backup.json`, JSON.stringify(payload, null, 2));
    setMessage(t("settings.exported"));
  }

  function exportCsv() {
    downloadText("cyclecare-logs.csv", logsToCsv(logs), "text/csv");
    setMessage(t("settings.exported"));
  }

  async function onImport(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setBusy(true);
    try {
      const text = await file.text();
      const result = validateImport(text);
      if (!result.ok) {
        setMessage(t(`settings.importErrors.${result.error}`));
        return;
      }
      await importBackup(result);
      setMessage(t("settings.imported"));
    } catch {
      setMessage(t("settings.importErrors.invalid-json"));
    } finally {
      setBusy(false);
    }
  }

  async function onDelete() {
    if (!confirmDelete) return;
    if (!window.confirm(t("settings.deleteConfirm"))) return;
    setBusy(true);
    await deleteAllData();
  }

  return (
    <div className="page-enter mx-auto max-w-2xl space-y-4">
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-lavender-500">{t("nav.settings")}</p>
        <h1 className="mt-1 font-display text-3xl">{t("settings.title")}</h1>
        <p className="mt-2 text-sm text-ink-500">{t("settings.intro")}</p>
      </header>

      <Card>
        <CardKicker>{t("onboarding.language")}</CardKicker>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <ChoiceButton selected={lang === "en"} onClick={() => updateLanguage("en")}>
            English
          </ChoiceButton>
          <ChoiceButton selected={lang === "hi"} onClick={() => updateLanguage("hi")}>
            हिन्दी
          </ChoiceButton>
        </div>
      </Card>

      <Card>
        <ChoiceGroup legend={t("onboarding.age")} hint={t("onboarding.ageHint")}>
          {AGE_KEYS.map((key) => (
            <ChoiceButton
              key={key}
              selected={settings.ageGroup === key}
              onClick={() => updateSettings({ ageGroup: key })}
            >
              {t(`onboarding.ages.${key}`)}
            </ChoiceButton>
          ))}
        </ChoiceGroup>
      </Card>

      <Card>
        <CardTitle>{t("settings.textSize")}</CardTitle>
        <div className="mt-3 flex flex-wrap gap-2">
          {[100, 112, 125].map((scale) => (
            <ChoiceButton
              key={scale}
              className="min-h-11 px-3 py-2"
              selected={settings.textScale === scale}
              onClick={() => updateSettings({ textScale: scale })}
            >
              {scale}%
            </ChoiceButton>
          ))}
        </div>
      </Card>

      <Card>
        <CardTitle>{t("settings.discreet")}</CardTitle>
        <p className="mt-2 text-sm text-ink-500">{t("settings.discreetHint")}</p>
        <Button
          className="mt-4 w-full"
          variant={settings.discreetMode ? "primary" : "secondary"}
          onClick={() => updateSettings({ discreetMode: !settings.discreetMode })}
        >
          {settings.discreetMode ? t("settings.discreetOn") : t("settings.discreetOff")}
        </Button>
      </Card>

      <Card>
        <CardTitle>{t("settings.contrast")}</CardTitle>
        <Button
          className="mt-4 w-full"
          variant={settings.highContrast ? "primary" : "secondary"}
          onClick={() => updateSettings({ highContrast: !settings.highContrast })}
        >
          {settings.highContrast ? t("settings.contrastOn") : t("settings.contrastOff")}
        </Button>
      </Card>

      <Card>
        <CardTitle>{t("settings.readAloud")}</CardTitle>
        <p className="mt-2 text-sm text-ink-500">{t("settings.readAloudHint")}</p>
        <Button
          className="mt-4 w-full"
          variant={settings.readAloud ? "primary" : "secondary"}
          onClick={() => updateSettings({ readAloud: !settings.readAloud })}
        >
          {settings.readAloud ? t("settings.discreetOn") : t("settings.discreetOff")}
        </Button>
      </Card>

      <Card>
        <CardTitle>{t("settings.symptoms")}</CardTitle>
        <p className="mt-2 text-sm text-ink-500">{t("settings.symptomsHint")}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {SYMPTOM_OPTIONS.map((id) => {
            const selected = (settings.trackedSymptoms ?? []).includes(id);
            return (
              <ChoiceButton
                key={id}
                className="min-h-11 px-3 py-2"
                selected={selected}
                onClick={() => {
                  const current = settings.trackedSymptoms ?? [];
                  const next = selected ? current.filter((item) => item !== id) : [...current, id];
                  updateSettings({ trackedSymptoms: next.length ? next : [id] });
                }}
              >
                {t(`log.symptomOpts.${id}`)}
              </ChoiceButton>
            );
          })}
        </div>
      </Card>

      <Card>
        <CardTitle>{t("settings.pin")}</CardTitle>
        <p className="mt-2 text-sm text-ink-500">{t("pin.body")}</p>
        <input
          type="password"
          inputMode="numeric"
          value={pinDraft}
          onChange={(event) => setPinDraft(event.target.value)}
          placeholder={t("settings.pinSet")}
          className="mt-3 h-12 w-full rounded-2xl bg-cream-50 px-3 text-sm ring-1 ring-lavender-200"
        />
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <Button
            disabled={pinDraft.length < 4}
            onClick={async () => {
              const pinHash = await hashPin(pinDraft);
              await updateSettings({ pinHash });
              setPinDraft("");
              setMessage(t("settings.pinSaved"));
            }}
          >
            {t("common.save")}
          </Button>
          <Button
            variant="secondary"
            onClick={async () => {
              await updateSettings({ pinHash: null });
              lockSession();
              setMessage(t("settings.pinClear"));
            }}
          >
            {t("settings.pinClear")}
          </Button>
        </div>
      </Card>

      {settings.ageGroup === "under18" ? (
        <Card>
          <CardTitle>{t("pregnancy.locked")}</CardTitle>
          <Button
            className="mt-4 w-full"
            variant={settings.fertilityUnlocked ? "primary" : "secondary"}
            onClick={() => updateSettings({ fertilityUnlocked: !settings.fertilityUnlocked })}
          >
            {t("pregnancy.unlock")}
          </Button>
        </Card>
      ) : null}

      <Card>
        <Link to="/reminders" className="block text-sm font-medium text-lavender-700">
          {t("nav.reminders")}
        </Link>
        {settings.ageGroup !== "under18" || settings.fertilityUnlocked ? (
          <Link to="/pregnancy" className="mt-2 block text-sm font-medium text-lavender-700">
            {t("nav.pregnancy")}
          </Link>
        ) : null}
      </Card>

      <Card>
        <CardTitle>{t("settings.privacy")}</CardTitle>
        <ul className="mt-3 space-y-2 text-sm text-ink-700">
          {t("settings.privacyItems").map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>
      </Card>

      <Card>
        <CardTitle>{t("settings.backup")}</CardTitle>
        <p className="mt-2 text-sm text-ink-500">{t("settings.backupHint")}</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <Button onClick={exportJson}>{t("settings.exportJson")}</Button>
          <Button variant="secondary" onClick={exportCsv}>
            {t("settings.exportCsv")}
          </Button>
          <Button variant="secondary" className="sm:col-span-2" onClick={() => fileRef.current?.click()}>
            {t("settings.importJson")}
          </Button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="sr-only"
          onChange={onImport}
        />
      </Card>

      <Card>
        <CardTitle>{t("settings.data")}</CardTitle>
        <div className="mt-4 grid gap-2">
          <Button variant="secondary" disabled={busy} onClick={loadDemo}>
            {t("settings.reloadDemo")}
          </Button>
          <Button variant="secondary" disabled={busy} onClick={startFresh}>
            {t("settings.startFresh")}
          </Button>
        </div>
        <label className="mt-4 flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4"
            checked={confirmDelete}
            onChange={(event) => setConfirmDelete(event.target.checked)}
          />
          {t("settings.deleteCheck")}
        </label>
        <Button className="mt-3 w-full" variant="rose" disabled={!confirmDelete || busy} onClick={onDelete}>
          {t("settings.deleteAll")}
        </Button>
      </Card>

      {message ? (
        <p className="text-sm text-lavender-700" role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}
