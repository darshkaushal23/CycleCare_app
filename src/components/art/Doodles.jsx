const C = {
  blush: "#F6C1CF",
  rose: "#D987A3",
  lavender: "#E9DDF7",
  purple: "#A78BCA",
  cream: "#FFF8F2",
  white: "#FFFCFA",
  plum: "#563F68",
  peach: "#F9DFCC",
};

function Frame({ children, fill = C.lavender, className = "", title }) {
  return (
    <svg className={className} viewBox="0 0 64 64" role={title ? "img" : "presentation"} aria-hidden={title ? undefined : true} aria-label={title}>
      {title ? <title>{title}</title> : null}
      <rect x="1" y="1" width="62" height="62" rx="18" fill={fill} />
      {children}
    </svg>
  );
}

function Flower() {
  return (
    <>
      <circle cx="32" cy="26" r="7" fill={C.blush} />
      <circle cx="22" cy="32" r="7" fill={C.rose} opacity="0.85" />
      <circle cx="42" cy="32" r="7" fill={C.rose} opacity="0.85" />
      <circle cx="26" cy="40" r="7" fill={C.peach} />
      <circle cx="38" cy="40" r="7" fill={C.peach} />
      <circle cx="32" cy="33" r="4.5" fill={C.plum} />
    </>
  );
}

function Calendar() {
  return (
    <>
      <rect x="16" y="18" width="32" height="28" rx="6" fill={C.white} stroke={C.plum} strokeWidth="1.8" />
      <path d="M16 26h32" stroke={C.purple} strokeWidth="6" />
      <circle cx="26" cy="36" r="2.2" fill={C.rose} />
      <circle cx="32" cy="36" r="2.2" fill={C.purple} />
      <circle cx="38" cy="36" r="2.2" fill={C.rose} />
      <path d="M24 16v6M40 16v6" stroke={C.plum} strokeWidth="2" strokeLinecap="round" />
    </>
  );
}

function Heart() {
  return (
    <path
      d="M32 46c-10-7.5-16-13.5-16-20a9 9 0 0 1 16-5 9 9 0 0 1 16 5c0 6.5-6 12.5-16 20z"
      fill={C.rose}
      stroke={C.plum}
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  );
}

function Moon() {
  return (
    <>
      <circle cx="34" cy="32" r="12" fill={C.peach} />
      <circle cx="40" cy="28" r="10" fill={C.lavender} />
      <circle cx="24" cy="22" r="1.6" fill={C.purple} />
      <circle cx="46" cy="42" r="1.2" fill={C.rose} />
    </>
  );
}

function Bottle() {
  return (
    <>
      <path d="M26 18h12v6c6 4 8 10 8 16 0 8-6 14-14 14s-14-6-14-14c0-6 2-12 8-16z" fill={C.blush} stroke={C.plum} strokeWidth="1.6" />
      <rect x="27" y="14" width="10" height="6" rx="2" fill={C.purple} />
      <path d="M24 34h16" stroke={C.white} strokeWidth="2" strokeLinecap="round" opacity="0.8" />
    </>
  );
}

function Mood({ face = "ok" }) {
  const mouth =
    face === "low"
      ? "M26 40c3-3 9-3 12 0"
      : face === "calm"
        ? "M26 38h12"
        : "M26 38c3 4 9 4 12 0";
  return (
    <>
      <circle cx="32" cy="32" r="14" fill={C.peach} stroke={C.plum} strokeWidth="1.5" />
      <circle cx="26" cy="28" r="1.8" fill={C.plum} />
      <circle cx="38" cy="28" r="1.8" fill={C.plum} />
      <path d={mouth} fill="none" stroke={C.plum} strokeWidth="1.8" strokeLinecap="round" />
    </>
  );
}

function Journal() {
  return (
    <>
      <rect x="18" y="14" width="28" height="36" rx="5" fill={C.white} stroke={C.plum} strokeWidth="1.7" />
      <path d="M18 14h6v36h-6a4 4 0 0 1-4-4V18a4 4 0 0 1 4-4z" fill={C.rose} />
      <path d="M28 24h12M28 32h12M28 40h8" stroke={C.purple} strokeWidth="1.7" strokeLinecap="round" />
    </>
  );
}

function Chart() {
  return (
    <>
      <rect x="16" y="16" width="32" height="32" rx="8" fill={C.white} />
      <path d="M22 40c4-8 6-4 10-12 3 6 6 4 10 8" fill="none" stroke={C.rose} strokeWidth="2.2" strokeLinecap="round" />
      <path d="M22 44h20" stroke={C.purple} strokeWidth="1.6" strokeLinecap="round" />
    </>
  );
}

function Notebook() {
  return (
    <>
      <rect x="17" y="15" width="30" height="34" rx="5" fill={C.white} stroke={C.plum} strokeWidth="1.7" />
      <path d="M24 15v34M17 24h30M17 32h30" stroke={C.lavender} strokeWidth="1.5" />
      <circle cx="40" cy="40" r="5" fill={C.blush} />
      <path d="M40 37.5v5M37.5 40h5" stroke={C.plum} strokeWidth="1.5" strokeLinecap="round" />
    </>
  );
}

function Drop() {
  return (
    <path
      d="M32 14c8 10 12 16 12 22a12 12 0 1 1-24 0c0-6 4-12 12-22z"
      fill={C.rose}
      stroke={C.plum}
      strokeWidth="1.5"
    />
  );
}

function Spark() {
  return (
    <>
      <circle cx="32" cy="32" r="6" fill={C.purple} />
      <path d="M32 16v8M32 40v8M16 32h8M40 32h8M22 22l5 5M37 37l5 5M42 22l-5 5M27 37l-5 5" stroke={C.rose} strokeWidth="1.8" strokeLinecap="round" />
    </>
  );
}

function Wave() {
  return (
    <path
      d="M12 36c6-10 10 8 16 0s10 8 16 0 8 8 12 0"
      fill="none"
      stroke={C.rose}
      strokeWidth="2.4"
      strokeLinecap="round"
    />
  );
}

function Alert() {
  return (
    <>
      <path d="M32 16l16 28H16z" fill={C.peach} stroke={C.plum} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M32 28v8" stroke={C.plum} strokeWidth="2" strokeLinecap="round" />
      <circle cx="32" cy="40" r="1.5" fill={C.plum} />
    </>
  );
}

function Zap() {
  return (
    <path
      d="M36 12L22 34h10l-3 18 18-26H35l5-14z"
      fill={C.peach}
      stroke={C.plum}
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  );
}

function Sun() {
  return (
    <>
      <circle cx="32" cy="32" r="8" fill={C.peach} stroke={C.plum} strokeWidth="1.6" />
      <path
        d="M32 16v5M32 43v5M16 32h5M43 32h5M21 21l3.5 3.5M39.5 39.5 43 43M43 21l-3.5 3.5M21 43l3.5-3.5"
        stroke={C.rose}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </>
  );
}

function Empty() {
  return (
    <>
      <rect x="16" y="20" width="32" height="26" rx="7" fill={C.white} stroke={C.purple} strokeWidth="1.7" />
      <path d="M16 28h32" stroke={C.blush} strokeWidth="5" />
      <circle cx="44" cy="18" r="6" fill={C.rose} />
      <circle cx="44" cy="18" r="2.4" fill={C.plum} />
    </>
  );
}

function Heat() {
  return (
    <>
      <ellipse cx="32" cy="40" rx="15" ry="11" fill={C.white} stroke={C.plum} strokeWidth="1.6" />
      <path d="M20 38c4-3 8 3 12 0s8 3 12 0" fill="none" stroke={C.rose} strokeWidth="1.7" strokeLinecap="round" />
      <path d="M30 18c0-5 8-5 8 2 0 4-4 5-4 9" fill="none" stroke={C.rose} strokeWidth="1.8" strokeLinecap="round" />
    </>
  );
}

function Pad() {
  return (
    <>
      <ellipse cx="32" cy="32" rx="12" ry="18" fill={C.white} stroke={C.plum} strokeWidth="1.6" />
      <ellipse cx="32" cy="32" rx="6" ry="12" fill={C.blush} />
    </>
  );
}

function Cup() {
  return (
    <>
      <path d="M22 20h20v10c0 10-4.5 18-10 18S22 40 22 30z" fill={C.blush} stroke={C.plum} strokeWidth="1.6" />
      <path d="M32 48v5" stroke={C.plum} strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="32" cy="55" r="2.2" fill={C.plum} />
    </>
  );
}

function Pcos() {
  return (
    <>
      <circle cx="24" cy="34" r="10" fill={C.peach} stroke={C.plum} strokeWidth="1.5" />
      <circle cx="42" cy="34" r="10" fill={C.peach} stroke={C.plum} strokeWidth="1.5" />
      <circle cx="24" cy="34" r="3" fill={C.rose} />
      <circle cx="42" cy="34" r="3" fill={C.rose} />
      <circle cx="20" cy="29" r="1.6" fill={C.purple} />
      <circle cx="28" cy="38" r="1.6" fill={C.purple} />
      <circle cx="38" cy="29" r="1.6" fill={C.purple} />
      <circle cx="46" cy="38" r="1.6" fill={C.purple} />
    </>
  );
}

const BODIES = {
  flower: Flower,
  bloom: Flower,
  calendar: Calendar,
  heart: Heart,
  moon: Moon,
  bottle: Bottle,
  mood: () => <Mood face="ok" />,
  "mood-ok": () => <Mood face="ok" />,
  "mood-calm": () => <Mood face="calm" />,
  "mood-low": () => <Mood face="low" />,
  journal: Journal,
  chart: Chart,
  notebook: Notebook,
  drop: Drop,
  spark: Spark,
  wave: Wave,
  alert: Alert,
  empty: Empty,
  pain: Bottle,
  care: Notebook,
  first: Flower,
  wait: Moon,
  info: Journal,
  zap: Zap,
  sun: Sun,
  energy: Sun,
  heat: Heat,
  cramps: Heat,
  pad: Pad,
  cup: Cup,
  hygiene: Pad,
  pcos: Pcos,
};

const FILLS = {
  flower: C.lavender,
  bloom: C.lavender,
  calendar: C.peach,
  heart: C.blush,
  moon: C.lavender,
  bottle: C.peach,
  mood: C.peach,
  "mood-ok": C.peach,
  "mood-calm": C.lavender,
  "mood-low": C.blush,
  journal: C.lavender,
  chart: C.peach,
  notebook: C.lavender,
  drop: C.blush,
  spark: C.lavender,
  wave: C.blush,
  alert: C.peach,
  empty: C.lavender,
  pain: C.peach,
  care: C.lavender,
  first: C.blush,
  wait: C.lavender,
  info: C.lavender,
  zap: C.peach,
  sun: C.peach,
  energy: C.peach,
  heat: C.peach,
  cramps: C.peach,
  pad: C.lavender,
  cup: C.blush,
  hygiene: C.lavender,
  pcos: C.lavender,
};

export function Doodle({ kind = "flower", className = "h-16 w-16 shrink-0", title }) {
  const Body = BODIES[kind] ?? Flower;
  return (
    <Frame fill={FILLS[kind] ?? C.lavender} className={className} title={title}>
      <Body />
    </Frame>
  );
}

const MARKS = {
  period: (
    <path d="M8 1.8C8 1.8 3.6 7 3.6 10.4a4.4 4.4 0 1 0 8.8 0C12.4 7 8 1.8 8 1.8z" fill="#D987A3" />
  ),
  estimate: (
    <>
      <path
        d="M8 1.8C8 1.8 3.6 7 3.6 10.4a4.4 4.4 0 1 0 8.8 0C12.4 7 8 1.8 8 1.8z"
        fill="#F6C1CF"
        fillOpacity="0.35"
        stroke="#D987A3"
        strokeWidth="1.15"
        strokeDasharray="1.4 1.1"
      />
    </>
  ),
  bud: (
    <>
      <path d="M8 14.2c-2.6-1.2-4-4.2-4-6.6 1.8.1 3.2-3.8 4-5.8.8 2 2.2 5.9 4 5.8 0 2.4-1.4 5.4-4 6.6z" fill="#A78BCA" />
      <path d="M8 8.2v6" stroke="#563F68" strokeWidth="0.8" strokeLinecap="round" opacity="0.45" />
    </>
  ),
  bloom: (
    <>
      <circle cx="8" cy="5.2" r="2.1" fill="#F9DFCC" />
      <circle cx="5.1" cy="7.4" r="2.1" fill="#F6C1CF" />
      <circle cx="10.9" cy="7.4" r="2.1" fill="#F6C1CF" />
      <circle cx="6.2" cy="10.4" r="2.1" fill="#F9DFCC" />
      <circle cx="9.8" cy="10.4" r="2.1" fill="#F9DFCC" />
      <circle cx="8" cy="7.8" r="1.4" fill="#D987A3" />
    </>
  ),
  moon: (
    <path d="M10.2 2.6a5.6 5.6 0 1 0 2.6 10.2 5.5 5.5 0 0 1-2.6-10.2z" fill="#A78BCA" />
  ),
  log: (
    <>
      <circle cx="8" cy="8" r="3.1" fill="#563F68" />
      <circle cx="8" cy="8" r="1.15" fill="#FFFCFA" />
    </>
  ),
};

export function CalendarMark({ kind, className = "h-3.5 w-3.5", title }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {title ? <title>{title}</title> : null}
      {MARKS[kind] ?? MARKS.log}
    </svg>
  );
}
