const PINK = "#E2788E";
const BLUSH = "#F4C5CC";
const LAVENDER = "#C9B4E9";
const PURPLE = "#8B6ABF";
const PLUM = "#4A2E63";
const CREAM = "#FFF7F8";

function MarkArtwork() {
  return (
    <>
      <path
        d="M27.2 25.6A36.5 36.5 0 0 0 27.2 74.4"
        fill="none"
        stroke={PINK}
        strokeWidth="7.2"
        strokeLinecap="round"
      />
      <path
        d="M72.8 25.6A36.5 36.5 0 0 1 72.8 74.4"
        fill="none"
        stroke={PURPLE}
        strokeWidth="7.2"
        strokeLinecap="round"
      />
      <circle cx="50" cy="15.2" r="3.15" fill={PINK} />
      <circle cx="50" cy="84.8" r="3.15" fill={PURPLE} />
      <path d="M50 51C36 49 27 58 30.5 68.5C37 73.5 46 65 50 54Z" fill={LAVENDER} />
      <path d="M50 51C64 49 73 58 69.5 68.5C63 73.5 54 65 50 54Z" fill={PURPLE} />
      <path d="M50 29C42 40 40.5 51 50 60C59.5 51 58 40 50 29Z" fill={BLUSH} />
      <path
        d="M50 31.6c-2.7-2.5-6.7-1-6.7 2.5 0 4.2 5 6.9 6.7 8 1.7-1.1 6.7-3.8 6.7-8 0-3.5-4-5-6.7-2.5Z"
        fill={PINK}
      />
    </>
  );
}

export function LogoMark({ className = "h-10 w-10 shrink-0", title = "CycleCare" }) {
  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label={title}>
      <title>{title}</title>
      <MarkArtwork />
    </svg>
  );
}

export function LogoAppIcon({ className = "h-16 w-16 shrink-0", title = "CycleCare" }) {
  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label={title}>
      <title>{title}</title>
      <rect width="100" height="100" rx="22" fill={CREAM} />
      <g transform="translate(8 8) scale(0.84)">
        <MarkArtwork />
      </g>
    </svg>
  );
}

export function LogoWordmark({ className = "", discreet = false, discreetName = "CycleCare" }) {
  if (discreet) {
    return <span className={`font-display text-plum ${className}`}>{discreetName}</span>;
  }
  return (
    <span className={`font-display ${className}`} aria-label="CycleCare">
      <span style={{ color: PLUM }}>Cycle</span>
      <span style={{ color: PINK }}>Care</span>
    </span>
  );
}

export function LogoLockup({
  t,
  demo = false,
  compact = false,
  discreet = false,
  markClassName = "h-11 w-11",
  wordClassName = "text-lg leading-none",
}) {
  const title = discreet ? t("discreet.appName") : t("appName");
  return (
    <div className="flex min-w-0 items-center gap-2">
      {discreet ? <LogoAppIcon className={`${markClassName} shrink-0`} title={title} /> : <LogoMark className={`${markClassName} shrink-0`} title={title} />}
      <div className="min-w-0">
        <LogoWordmark className={`truncate ${wordClassName}`} discreet={discreet} discreetName={title} />
        {compact ? null : (
          <p className="mt-1 text-[11px] leading-snug text-ink-500">{discreet ? t("discreet.tagline") : t("tagline")}</p>
        )}
      </div>
      {demo ? (
        <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-rose-700">
          {t("common.demo")}
        </span>
      ) : null}
    </div>
  );
}
