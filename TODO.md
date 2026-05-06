# TODO

## Session handling
The session handling in `src/lib/session.ts` still uses the old iron-session v6 wrapper pattern (`withApiSession`/`withSsrSession`), emulated on top of the v8 API. iron-session v8 dropped these wrappers in favor of calling `getIronSession(req, res, options)` directly where the session is needed. The current approach works but is a compatibility shim — it should be refactored to use the v8 pattern natively.

## Typeahead typing
react-bootstrap-typeahead v6 removed generic type parameters from `Typeahead` and `AsyncTypeahead`. All callbacks now receive `Option` (`string | Record<string, any>`) instead of the specific model type. The codebase uses `as` casts throughout to recover type safety — this is ugly and fragile.

## react-bus / mitt Emitter typing
The `Emitter` type from `mitt` (used via `react-bus`) now requires a type argument. In `src/lib/useNotifications.ts` we pass `Emitter<Record<string | symbol, unknown>>` which loses event type safety. The `useListener` callback in `src/components/layout/NotificationsArea.tsx` accepts `unknown` and casts to `NotificationData`.
