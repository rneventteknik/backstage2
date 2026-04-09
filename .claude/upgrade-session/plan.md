# Phase 3: Upgrade all remaining packages

## Context
Phases 1-2 are done (npm migration, Node 24, TS 6, better-sqlite3). Build and dev both work. Now upgrading all remaining outdated dependencies. 40 packages are outdated per `npm outdated`.

## Strategy: 4 waves, build+verify after each

### Wave 1 — Safe drops: types, dev tools, utilities (no code changes expected)
```
npm install @types/archiver@latest @types/uuid@latest @types/react-highlight-words@latest
npm install -D rimraf@latest open@latest type-fest@latest eslint-config-prettier@latest eslint-import-resolver-typescript@latest
npm install dotenv@latest iconv-lite@latest currency.js@latest uuid@latest archiver@latest bcryptjs@latest
```
- Remove `@types/dompurify` (dompurify ships its own types now)
- Verify: `npm run tc && npm run build`

### Wave 2 — Backend/API packages (low UI risk)
```
npm install @googleapis/calendar@latest @googleapis/drive@latest googleapis@latest
npm install @slack/web-api@latest
npm install pg@latest knex@latest objection@latest
npm install mqtt@latest
npm install iron-session@latest
```
- **iron-session 6→8**: API changed. Only `src/lib/session.ts` uses it. v8 dropped `withIronSessionApiRoute`/`withIronSessionSsr` wrappers — need to migrate to the new `getIronSession()` API.
- Verify: `npm run tc && npm run build`, test login flow manually

### Wave 3 — UI libraries (highest risk, most files affected)
```
npm install bootstrap@5 react-bootstrap@2 react-bootstrap-typeahead@6
npm install @fortawesome/fontawesome-svg-core@latest @fortawesome/free-regular-svg-icons@latest @fortawesome/free-solid-svg-icons@latest @fortawesome/react-fontawesome@latest
npm install @react-pdf/renderer@latest
npm install react-dropzone@latest react-highlight-words@latest react-markdown@latest remark-gfm@latest
npm install react-loading-skeleton@latest react-bus@latest
npm install swr@latest sass@latest dompurify@latest posthog-js@latest turndown@latest svd-js@latest
```
- **Bootstrap 4→5**: biggest change. react-bootstrap 2 uses Bootstrap 5. Key breaking changes:
  - `Form.Row` → `Row` (no more Form.Row)
  - `Form.File` removed → use plain `<input type="file">`
  - `bsPrefix` props may change
  - Various CSS class renames (`ml-` → `ms-`, `mr-` → `me-`, `pl-` → `ps-`, `pr-` → `pe-`, `float-left` → `float-start`, etc.)
  - 121 files import from react-bootstrap — this is the biggest piece of work
- **FontAwesome 6→7 + react-fontawesome 0.2→3**: import paths and API may change
- Verify: `npm run tc && npm run build`, visually check key pages

### Wave 4 — Framework (do last, most disruptive)
```
npm install next@15 @next/eslint-plugin-next@15
```
- **Next.js 14→15**: Pages Router apps are mostly unaffected. Key changes:
  - `next.config.cjs` may need update to new format
  - Some API route behavior changes
- **Skip React 19 for now** — react-bootstrap 2 and many UI libs still target React 18
- **Skip Next 16** — too new, 15 is the stable upgrade target
- **Skip ESLint 9/10** — flat config migration is a separate effort
- Verify: `npm run tc && npm run build && npm run dev`, test pages

## Files most affected
- `src/lib/session.ts` — iron-session migration (Wave 2)
- 121 files importing react-bootstrap — Bootstrap 5 migration (Wave 3)
- All files using `ml-`, `mr-`, `pl-`, `pr-` CSS classes — Bootstrap 5 class renames (Wave 3)
- `next.config.cjs` — Next 15 config (Wave 4)

## Verification after each wave
1. `npm run tc` — no new type errors
2. `npm run build` — production build passes
3. `npm run dev` — dev server starts, spot-check key pages
