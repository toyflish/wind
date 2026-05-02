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

This is a Next.js (Pages Router) surf/weather dashboard for **Viana do Castelo**. It displays wind conditions, hourly chart data, and tide forecasts by clipping regions from a remote weather station image.

### Key concepts

- **ImageClip component**: Crops and displays rectangular sections of a large remote PNG (`weather.vianalocals.com/ecowitt.png`) using absolute positioning and overflow hidden. The homepage uses multiple instances to show wind data and a time-scrolling chart.
- **Time-based offset**: The chart view calculates an x-offset based on current hour to show the relevant slice of the 24h chart.
- **Msw component**: Lazy-loads a Magic Seaweed tide forecast iframe on user interaction.
- **Layout**: Global layout wrapper applied in `_app.tsx`.

### Stack

- Next.js with TypeScript (strict mode)
- Tailwind CSS for styling
- No backend beyond the default Next.js API routes scaffold
