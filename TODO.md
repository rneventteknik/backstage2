# TODO

## Typeahead typing

react-bootstrap-typeahead v6 removed generic type parameters from `Typeahead` and `AsyncTypeahead`. All callbacks now receive `Option` (`string | Record<string, any>`) instead of the specific model type. The codebase uses `as` casts throughout to recover type safety — this is ugly and fragile.
