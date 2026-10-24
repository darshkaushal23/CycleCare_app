import { AlertCircle, Construction, Inbox, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./Button";
import { Card } from "./Card";

export function LoadingState({ label }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-ink-500" role="status">
      <Loader2 className="h-8 w-8 animate-spin text-lavender-500" aria-hidden="true" />
      <p>{label}</p>
    </div>
  );
}

export function ErrorState({ title, body, onRetry, retryLabel }) {
  return (
    <Card className="mx-auto mt-10 max-w-md text-center" role="alert">
      <AlertCircle className="mx-auto h-8 w-8 text-rose-500" />
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

export function EmptyState({ icon: Icon = Inbox, title, body, action, secondary }) {
  return (
    <Card className="text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-lavender-100 text-lavender-700">
        <Icon className="h-7 w-7" aria-hidden="true" />
      </div>
      <h2 className="mt-4 font-display text-2xl text-ink-900">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-500">{body}</p>
      {action}
      {secondary}
    </Card>
  );
}

export function UnderConstruction({ title, next, backLabel }) {
  return (
    <div className="page-enter mx-auto max-w-lg space-y-4">
      <Card>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cream-100 text-lavender-700">
          <Construction className="h-6 w-6" aria-hidden="true" />
        </div>
        <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-500">
          Stage 1 · under construction
        </p>
        <h1 className="mt-2 font-display text-3xl text-ink-900">{title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-500">{next}</p>
        <Link
          to="/"
          className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-2xl bg-white text-sm font-medium text-ink-900 ring-1 ring-lavender-200"
        >
          {backLabel}
        </Link>
      </Card>
    </div>
  );
}
