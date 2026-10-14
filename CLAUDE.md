# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Start production server
```

No linter or test runner is configured.

## Architecture

This is a Next.js (Pages Router) surf/weather dashboard for **Viana do Castelo**. It shows live wind, a recent wind/gust chart, and a tide chart, all sourced from the APDL port authority weather station (`liveweather.apdl.pt`, station `PTVDC`).

### Data flow

The browser never calls APDL directly. API routes in `pages/api/` proxy the upstream requests (sending a browser `User-Agent` and an APDL `Referer`), normalize timestamps, and set short `Cache-Control` headers:

| Route | Upstream | Consumer |
|---|---|---|
| `wind-latest.ts` | `/api/weather/latest/apdl/PTVDC` | `WindLive` |
| `wind-data.ts` | `/api/weather/history/{RVT,VVT,DVT}/PTVDC/` (last 6h) | `WindChart` |
| `tide-data.ts` | `/api/tides/PTVDC/chart` | `TideChart` |

APDL sensor codes: `VVT` = wind speed, `RVT` = gust, `DVT` = wind direction.

### Timezone gotcha

APDL timestamps are **Europe/Lisbon local time**, even when the history endpoint suffixes them with `Z`. Each route computes the current Lisbon UTC offset and rewrites timestamps as ISO 8601 with that offset. Client components format times with `timeZone: "Europe/Lisbon"`.

### Components

- **WindLive**: current wind, gust, and direction, with time since the last reading.
- **WindChart** / **TideChart**: hand-drawn on `<canvas>` (no chart library), with hover tooltips.
- **Webcam**: link to the Surfline cam embed, opened with no referrer.
- **Layout**: global layout wrapper applied in `_app.tsx`.

### Legacy

The original dashboard cropped regions out of `weather.vianalocals.com/ecowitt.png`. `components/ImageClip.tsx`, `pages/api/weather-image.ts`, and `pages/api/weather-meta.ts` are left over from that version and are not used by the current homepage.

### Stack

- Next.js 16 with TypeScript (strict mode), React 19
- Tailwind CSS v4 for styling
