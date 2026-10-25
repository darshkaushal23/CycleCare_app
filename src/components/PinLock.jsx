import { useState } from "react";
import { LogoMark, LogoWordmark } from "./art/Logo";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { verifyPin, unlockSession } from "../lib/pin";

export function PinLock({ pinHash, t, onUnlock }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    const ok = await verifyPin(pin, pinHash);
    if (!ok) {
      setError(t("pin.wrong"));
      return;
    }
    unlockSession();
    onUnlock();
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-sm items-center px-4">
      <form className="w-full" onSubmit={submit}>
        <Card>
          <div className="mb-4 flex items-center gap-3">
            <LogoMark className="h-12 w-12 shrink-0" />
            <LogoWordmark className="text-2xl leading-none" />
          </div>
          <h1 className="font-display text-2xl">{t("pin.title")}</h1>
          <p className="mt-2 text-sm text-ink-500">{t("pin.body")}</p>
          <input
            type="password"
            inputMode="numeric"
            autoComplete="off"
            value={pin}
            onChange={(event) => setPin(event.target.value)}
            className="mt-4 h-12 w-full rounded-2xl bg-cream-50 px-3 text-sm ring-1 ring-lavender-200"
          />
          {error ? <p className="mt-2 text-sm text-rose-700">{error}</p> : null}
          <Button type="submit" className="mt-4 w-full">
            {t("pin.unlock")}
          </Button>
        </Card>
      </form>
    </div>
  );
}
