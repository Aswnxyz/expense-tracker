# Expense Tracker

A personal expense tracker built with Next.js, TypeScript, and Tailwind CSS. Add, edit, and delete expenses, filter and search them, and follow your spending on a live dashboard — everything persists locally in the browser with no backend required.

## Features

- **Dashboard** — total expenses, transaction count, highest expense, average expense, spending-by-category breakdown, and recent transactions; all stats update automatically after every change.
- **Full CRUD** — add, edit, and delete expenses (with a confirmation dialog) from an accessible modal form.
- **Filtering & search** — category filter, date-range filter, and free-text search across title and description (case-insensitive).
- **Sorting** — by date, title, or amount, ascending/descending, from the table headers (or a select on mobile).
- **Validation** — title required, amount must be greater than zero, category and date required, with inline error messages and focus management.
- **States** — loading skeletons, empty states (first run and no-filter-matches), inline error states with recovery actions, and pending states on save/delete.
- **Responsive layout** — sidebar navigation on desktop; top bar with a drawer on mobile, where the table becomes a card list.
- **Persistence** — expenses survive page reloads via `localStorage` behind a repository abstraction, so the persistence implementation can evolve behind an explicit interface.

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack) + React 19
- TypeScript (strict)
- Tailwind CSS v4
- ESLint (flat config)

No other runtime dependencies: icons are hand-written SVGs, and formatting uses the built-in `Intl` APIs.

## Getting started

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Production build:

```bash
npm run build
npm run start
```

Other scripts:

```bash
npm run lint   # ESLint
npx tsc --noEmit   # type-check
```

## Project structure

```
src/
├── app/                      # Routes (server components export metadata)
│   ├── page.tsx              # Dashboard
│   └── expenses/page.tsx     # Expense list
├── components/
│   ├── ui/                   # Primitives: Modal, Button, Badge, inputs…
│   ├── layout/               # AppShell, Sidebar (responsive nav/drawer)
│   ├── dashboard/            # DashboardView, StatCard, breakdown, recents
│   └── expenses/             # ExpensesView, table/cards, filters, form modal
├── hooks/
│   └── use-expense-form.ts   # Form lifecycle: values, validation, focus
├── lib/
│   ├── types.ts              # Expense model, categories, filters, stats
│   ├── categories.ts         # Category metadata (labels, colors)
│   ├── validation.ts         # Form validation + value mappers
│   ├── stats.ts              # Filter/sort/stat/breakdown computations
│   ├── format.ts             # Currency/date formatting
│   └── repository/           # Persistence abstraction (see below)
├── providers/
│   └── expense-provider.tsx  # Shared state + CRUD actions for the UI
└── …
```

### Architecture notes

- **Separation of concerns** — server pages stay thin and pass rendering to client `*View` components; all expense state lives in `ExpenseProvider`, so the dashboard and expenses page always agree and stats recompute after every mutation.
- **Repository pattern** — components never call `localStorage` directly. They go through the `ExpenseRepository` interface (`src/lib/repository/types.ts`), currently implemented by `LocalStorageExpenseRepository`. A future REST backend can implement that interface and replace the singleton in `src/lib/repository/index.ts`; authentication, server validation, concurrency and failure handling would still require design and testing.
- **Form handling** — `useExpenseForm` owns values, validation-on-submit, error clearing on edit, and focusing the first invalid field. The dialog mounts only while open so the form re-seeds from the edited expense every time.
- **Simulated latency** — repository operations wait ~150 ms to exercise loading and pending states; this is artificial delay, not measured backend latency.

## Persistence details

- Storage key: `expense-tracker:v1:expenses` (versioned for future migrations).
- Unknown categories are normalized to `Other`; corrupt JSON surfaces a readable error with a **Clear saved data** action instead of crashing.
- Data is scoped per browser profile — clearing site data removes it.

## Categories

Food · Transport · Shopping · Entertainment · Bills · Health · Other

## Verification

Reproducible checks after installing dependencies:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

The earlier README recorded one-off logic/UI checks and Lighthouse scores. The harnesses and reports are not committed, so those counts and scores cannot be reproduced from this repository and are not presented as current quality guarantees. There is no `npm test` script or committed automated test suite/CI workflow in this snapshot.

For manual validation, use a disposable browser profile: create/edit/delete expenses, reject invalid amounts and dates, filter and sort, check dashboard updates, reload to verify persistence, and test the mobile drawer and keyboard focus. Exercise unavailable/corrupt storage without deleting real personal records.

## Data model and privacy

React Context shares expense state and CRUD actions. Pure helpers handle filtering, statistics and validation; a typed repository interface separates persistence from components. Browser `localStorage` is the only store: there is no backend database, login, cloud backup or cross-device sync. Data remains available to scripts on the same origin and is not an encrypted financial vault. Do not rely on this demo as your only copy of important records.

## Limitations

- Persistence is per-browser (`localStorage`); there is no sync across devices or users.
- Light theme only; amounts are formatted in fixed USD.
- The verification suites were run as throwaway harnesses and are not committed as a test framework.
