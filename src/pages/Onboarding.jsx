import { useState } from "react";
import { ShieldCheck, Sparkles, Sprout } from "lucide-react";
import { LogoMark, LogoWordmark } from "../components/art/Logo";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { ChoiceButton, ChoiceGroup } from "../components/ui/Input";
import { copy } from "../lib/i18n";

const AGE_KEYS = ["under18", "18-24", "25-34", "35plus"];

function tWith(lang, path) {
  const parts = path.split(".");
  let node = copy[lang] ?? copy.en;
  for (const part of parts) node = node?.[part];
  return node;
}

export function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [language, setLanguage] = useState("en");
  const [ageGroup, setAgeGroup] = useState("under18");
  const [busy, setBusy] = useState(false);
  const text = (path) => tWith(language, path);

  async function finish(mode) {
    setBusy(true);
    try {
      await onComplete({ language, ageGroup, mode });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto min-h-dvh max-w-lg px-4 py-8">
      <div className="flex items-center gap-3">
        <LogoMark className="h-14 w-14 shrink-0" />
        <LogoWordmark className="text-3xl leading-none" />
      </div>
      <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-lavender-500">
        {text("onboarding.kicker")}
      </p>
      <h1 className="mt-3 font-display text-4xl leading-tight text-ink-900">{text("onboarding.title")}</h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-500">{text("onboarding.body")}</p>

      <div className="mt-6 space-y-4 page-enter">
        {step === 0 ? (
          <Card>
            <ChoiceGroup legend={text("onboarding.language")}>
              <div className="grid grid-cols-2 gap-3">
                <ChoiceButton selected={language === "en"} onClick={() => setLanguage("en")}>
                  English
                </ChoiceButton>
                <ChoiceButton selected={language === "hi"} onClick={() => setLanguage("hi")}>
                  हिन्दी
                </ChoiceButton>
              </div>
            </ChoiceGroup>
            <Button className="mt-5 w-full" onClick={() => setStep(1)}>
              {text("onboarding.continue")}
            </Button>
          </Card>
        ) : null}

        {step === 1 ? (
          <Card>
            <ChoiceGroup legend={text("onboarding.age")} hint={text("onboarding.ageHint")}>
              {AGE_KEYS.map((key) => (
                <ChoiceButton key={key} selected={ageGroup === key} onClick={() => setAgeGroup(key)}>
                  {text(`onboarding.ages.${key}`)}
                </ChoiceButton>
              ))}
            </ChoiceGroup>
            {ageGroup === "under18" ? (
              <p className="mt-4 rounded-2xl bg-cream-100 px-4 py-3 text-sm text-ink-700">
                {text("onboarding.under18Note")}
              </p>
            ) : null}
            <div className="mt-5 flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setStep(0)}>
                {text("onboarding.back")}
              </Button>
              <Button className="flex-1" onClick={() => setStep(2)}>
                {text("onboarding.continue")}
              </Button>
            </div>
          </Card>
        ) : null}

        {step === 2 ? (
          <>
            <h2 className="font-display text-2xl">{text("onboarding.startTitle")}</h2>
            <button
              type="button"
              disabled={busy}
              onClick={() => finish("fresh")}
              className="w-full rounded-2.5xl bg-white p-5 text-left shadow-card ring-1 ring-lavender-100 transition hover:ring-lavender-300 disabled:opacity-60"
            >
              <Sprout className="h-6 w-6 text-lavender-700" />
              <p className="mt-3 font-display text-xl">{text("onboarding.freshTitle")}</p>
              <p className="mt-1 text-sm text-ink-500">{text("onboarding.freshBody")}</p>
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => finish("demo")}
              className="w-full rounded-2.5xl bg-lavender-700 p-5 text-left text-white shadow-card disabled:opacity-60"
            >
              <Sparkles className="h-6 w-6" />
              <p className="mt-3 font-display text-xl">{text("onboarding.demoTitle")}</p>
              <p className="mt-1 text-sm text-lavender-100">{text("onboarding.demoBody")}</p>
            </button>
            <Button variant="ghost" className="w-full" onClick={() => setStep(1)}>
              {text("onboarding.back")}
            </Button>
          </>
        ) : null}

        <Card className="bg-lavender-50/80">
          <div className="flex items-center gap-2 text-lavender-700">
            <ShieldCheck className="h-5 w-5" />
            <p className="font-medium">{text("onboarding.privacyTitle")}</p>
          </div>
          <ul className="mt-3 space-y-2 text-sm text-ink-700">
            {text("onboarding.privacyItems").map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
