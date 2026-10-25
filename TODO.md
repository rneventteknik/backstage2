# TODO

## Typeahead typing

react-bootstrap-typeahead v6 removed generic type parameters from `Typeahead` and `AsyncTypeahead`. All callbacks now receive `Option` (`string | Record<string, any>`) instead of the specific model type. The codebase uses `as` casts throughout to recover type safety — this is ugly and fragile.

## react-bus / mitt Emitter typing

The `Emitter` type from `mitt` (used via `react-bus`) now requires a type argument. In `src/lib/useNotifications.ts` we pass `Emitter<Record<string | symbol, unknown>>` which loses event type safety. The `useListener` callback in `src/components/layout/NotificationsArea.tsx` accepts `unknown` and casts to `NotificationData`.
