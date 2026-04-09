# Upgrade Session Status

## What we're doing
Upgrading the Backstage2 repo from yarn/Node 18 to npm/Node 24, and upgrading all packages.

## Commits on `upgrade-versions` branch

1. **732acab** — Migrate to native ESM and npm, upgrade better-sqlite3 for Node 24
2. **9c9d0b9** — Replace pre-commit hooks with CI lint workflow
3. **2568c44** — Upgrade TypeScript 6, @types/node 24, fix type errors
4. **4ac1812** — Fix ESLint errors from @typescript-eslint v8 to make build pass
5. **db85098** — Wave 1: types, dev tools, utilities
6. **d9cc035** — Wave 2: backend/API packages (iron-session, Google APIs, Slack)
7. **8f14bc8** — Wave 3: UI libraries (Bootstrap 5, FontAwesome 7, Typeahead 6)
8. **953e4d8** — Bootstrap 4→5 CSS class renames (336 occurrences across 85 files)

## Key insights

- **better-sqlite3** was the first hard blocker — v9 can't compile on Node 24. Needed v12+.
- **`esm` package** is dead on Node 24. Fixed by adding `"type": "module"` to package.json and dropping `--esm` from knex scripts. `next.config.js` needed rename to `.cjs`.
- **TypeScript 6** deprecated `moduleResolution: "node"`. Changed to `"bundler"` which is correct for Next.js (bundler handles resolution, not Node).
- **type-fest `PartialDeep`** with `recurseIntoArrays: true` now adds `| undefined` to array elements by default. Fixed with `allowUndefinedInNonTupleArrays: false` across ~16 files.
- **iron-session v6→v8** dropped `withIronSessionApiRoute`/`withIronSessionSsr`. Built a compatibility shim using `getIronSession()` to avoid rewriting all callers. Proper refactor tracked in TODO.md.
- **Google APIs** changed response type from `GaxiosResponse` to `GaxiosResponseWithHTTP2`.
- **Bootstrap 4→5** was the biggest change by file count: `Form.Row`→`Row`, `Badge variant`→`bg`, `InputGroup.Append` removed, `Form inline` removed, directional classes renamed (`ml-`→`ms-`, etc.).
- **react-bootstrap-typeahead v6** removed generics from Typeahead/AsyncTypeahead. All callbacks now receive untyped `Option`. Requires `as` casts everywhere — ugly but functional. Tracked in TODO.md.
- **react-dnd** is abandoned — used `as unknown as` double-cast for ref types. Should eventually be replaced.

## What's left

### Wave 4 — Next.js 14→15
- Skip React 19 (react-bootstrap 2 still targets React 18)
- Skip Next 16 (too new)
- Skip ESLint 9/10 (flat config migration is a separate effort)

### Not upgraded (intentionally skipped)
- **React 18→19** — react-bootstrap 2 and several UI libs don't support it yet
- **Next.js 16** — too new, 15 is the stable target
- **ESLint 8→9/10** — requires flat config migration, separate task

### Technical debt tracked in TODO.md
- Session handling refactor (iron-session v8 native pattern)
- Typeahead typing (ugly `as` casts)
- react-bus/mitt Emitter typing (lost event type safety)
