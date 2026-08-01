# Basilisk — Accessibility Auditing Platform

Basilisk scans any public website for **WCAG 2.1 AA** accessibility issues using Playwright + axe-core, then delivers a scored, plain-English report with fix guidance.

Built for hackathon demo — stable, readable, and keyboard-accessible.

## Quick Start

```bash
# Install dependencies
npm install

# Set up database
npm run db:push

# Install Playwright browser (first time only)
npx playwright install chromium

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), enter a URL, and click **Scan**.

## Demo Script (for judges)

1. **Landing page** — Enter `https://example.com` and scan. Show loading progress states.
2. **Report page** — Walk through overall score, severity chart, category breakdown, and a violation card with plain-English explanation.
3. **History page** — Run a second scan on the same URL, then show the line chart tracking score over time.
4. **Accessibility of Basilisk itself** — Tab through the UI to demonstrate visible focus rings, skip link, and semantic HTML.

### Good test URLs

| URL | What to expect |
|-----|----------------|
| `https://example.com` | Clean baseline, few issues |
| `https://dequeuniversity.com/demo/million/` | Many intentional violations for demo |
| Any site you're evaluating | Real-world results |

## Tech Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Audit engine:** Playwright (headless Chromium) + axe-core via `@axe-core/playwright`
- **Database:** SQLite via Prisma (swappable to Postgres/Supabase)
- **Charts:** recharts

## Scoring

Starting score: **100**

| Severity | Deduction |
|----------|-----------|
| Critical Error | −10 |
| Warning | −5 |
| Notice | −1 |

- **90+** Good
- **70–89** Needs Improvement
- **Below 70** Poor

## Project Structure

```
src/
  app/
    page.tsx              # Landing + URL form
    scan/[id]/page.tsx    # Report view
    history/page.tsx      # Scan history + trend chart
    api/scan/route.ts     # POST — run audit
    api/scans/route.ts    # GET — list scans
  components/             # UI components
  lib/audit/              # Playwright + axe + categorization
  lib/types/report.ts     # Shared TypeScript types
prisma/schema.prisma      # Scan model
```

## API

### `POST /api/scan`

```json
{ "url": "https://example.com" }
```

Returns `{ id, score, summary }`.

### `GET /api/scans?url=...`

Returns scan history, optionally filtered by URL.

### `GET /api/scans/:id`

Returns full scan report.

## Environment

```env
DATABASE_URL="file:./dev.db"
```

## Production Notes

- Playwright requires a Node.js runtime (`runtime = 'nodejs'`), not Edge.
- For deployment, ensure Chromium is available or use a container with Playwright pre-installed.
- Swap SQLite for Postgres by changing `datasource` in `prisma/schema.prisma` and updating `DATABASE_URL`.
