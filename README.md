# CycleCare

Privacy-first menstrual health companion (React + Vite). Logs stay in this browser’s **IndexedDB**. There is **no backend, no account, no analytics, and no encryption at rest**.

## Install and run

```bash
npm install
npm run dev
```

Tests: `npm test`  
Production build: `npm run build`

## Implemented

- Daily logs, calendar, cycle estimates (range + uncertainty, not a fake %)
- Insights charts from saved logs
- Care Guidance (rules + public NHS/ACOG/WHO/CDC/FOGSI/NHM links; not a diagnosis)
- Printable doctor-visit summary
- Learn lessons and Ask Saheli (offline FAQ)
- English / Hindi, text size, discreet mode
- JSON export/import (validated), CSV export, delete-all, demo reload, start fresh

## Known limitations

- Data is only as private as this device and browser profile.
- Exported files are plaintext.
- Not a clinician, pregnancy test, contraception method, or emergency service.
- Settings cannot encrypt IndexedDB.

## 3-minute demo

1. Choose **Try Demo** (fictional 17-year-old, irregular cycles).
2. **Today**: Cycle Confidence range and walkthrough list.
3. **Calendar** → a logged day → **Log**.
4. **Insights** charts, then **Care Guidance** cards, then **clinic note** (`/visit`) and Print.
5. **Ask Saheli**: search `heavy bleeding`.
6. Header language **हिन्दी**. **Settings**: discreet mode, export JSON.

All demo screens use the same engines as a real user.
