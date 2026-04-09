# TODO

## Session handling
The session handling in `src/lib/session.ts` still uses the old iron-session v6 wrapper pattern (`withApiSession`/`withSsrSession`), emulated on top of the v8 API. iron-session v8 dropped these wrappers in favor of calling `getIronSession(req, res, options)` directly where the session is needed. The current approach works but is a compatibility shim — it should be refactored to use the v8 pattern natively.
