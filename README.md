# Oxalate Info

Look up how much oxalate is in everyday foods and keep a daily log of your intake.
Live at **[oxalate.info](https://oxalate.info)**.

## Features

- **Food search**: fuzzy search over about 3,600 foods, filtered by category and oxalate level
- **Food details**: total and soluble oxalate (per 100 g and per serving), serving size, level and notes
- **Daily log**: add foods to breakfast, lunch, dinner and snacks, and see daily totals
- **Reports**: download a day's breakdown as a PDF, or share it
- **Saved foods and profile**: Google or email sign-in, saved items, profile photo
- **Light and dark themes**, keyboard and screen-reader friendly

## Tech stack

Angular 21 · AngularFire 21 (compat API) · Firebase (Auth, Firestore, Storage, Analytics, Hosting) ·
Angular Material · Fuse.js · jsPDF · EmailJS · Karma + Jasmine

## Scripts

| Command         | What it does                                                                           |
| --------------- | -------------------------------------------------------------------------------------- |
| `npm start`     | Dev server on port 4200. **Must be 4200**: the Firebase API key only accepts that port |
| `npm test`      | Unit tests (Karma). Add `-- --watch=false --browsers=ChromeHeadless` for a single run  |
| `npm run build` | Production build into `dist/oxalates`                                                  |

## Project structure

```
src/
├── app/
│   ├── landing-page/   Homepage sections, header, footer, food search (/oxalate), legal pages
│   ├── user-auth/      Sign-in, profile, saved items, daily log (/food-entry), calculator
│   └── shared/         Icon component, services (theme, alerts), directives, utils
├── assets/mock-oxalate/  Food database and homepage content (JSON)
├── environments/         Firebase + EmailJS config (example file only in git)
└── styles/tokens/        Design tokens: colors for light and dark themes
```

**Firestore:** `users/{uid}`, `foodEntries/{uid}/entries/{yyyy-mm-dd}`, `savedOxalates/{uid}/oxalates/{id}`.

**Styling:** all colors come from `src/styles/tokens/colors.css` (`--color-*` tokens; dark mode is the
`.dark-theme` class on `<html>`). Icons use the shared `<app-icon name="…">` component.

## Deploying

Deploys are **manual**: merging to `master` does not publish anything. GitHub Actions only runs the unit
tests (on pull requests) and CodeQL security scans. To publish:

```bash
npm run build                      # needs the real food data and environment files
firebase deploy --only hosting     # project: oxalates-
```

Then hard-reload oxalate.info and check sign-in and the daily log. If something is wrong, roll back in the
Firebase console under **Hosting → Release history**.
