import { Loader2 } from "lucide-react";
import { Doodle } from "../art/Doodles";
import { LogoMark } from "../art/Logo";
import { Button } from "./Button";
import { Card } from "./Card";

export function LoadingState({ label }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-ink-500" role="status">
      <LogoMark className="h-16 w-16 motion-safe:animate-pulse" title={label} />
      <Loader2 className="h-5 w-5 motion-safe:animate-spin text-lavender-500" aria-hidden="true" />
      <p>{label}</p>
    </div>
  );
}

export function ErrorState({ title, body, onRetry, retryLabel }) {
  return (
    <Card className="mx-auto mt-10 max-w-md text-center" role="alert">
      <Doodle kind="alert" className="mx-auto h-16 w-16" title={title} />
      <h1 className="mt-3 font-display text-2xl">{title}</h1>
      <p className="mt-2 text-sm text-ink-500">{body}</p>
      {onRetry ? (
        <Button className="mt-5 w-full" onClick={onRetry}>
          {retryLabel}
        </Button>
      ) : null}
    </Card>
  );
}

export function EmptyState({ icon: Icon, title, body, action, secondary }) {
  return (
    <Card className="text-center">
      {Icon ? (
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-lavender-100 text-lavender-700">
          <Icon className="h-7 w-7" aria-hidden="true" />
        </div>
      ) : (
        <Doodle kind="empty" className="mx-auto h-16 w-16" title={title} />
      )}
      <h2 className="mt-4 font-display text-2xl text-ink-900">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-500">{body}</p>
      {action}
      {secondary}
    </Card>
  );
}

