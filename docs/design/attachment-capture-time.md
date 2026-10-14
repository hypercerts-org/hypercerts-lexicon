# Attachment capture time

A photo captured in 2019 and uploaded in 2026 needs both dates. `createdAt`
continues to mean record creation; optional `capturedAt` on
`org.hypercerts.context.attachment` describes when the attached material was
captured. It is client-declared metadata, not proof of the device clock's
accuracy.

## Format

`capturedAt` is a plain atproto `datetime` string, the same format used by
`createdAt` and the other timestamps in these lexicons:

```json
{ "capturedAt": "2019-07-14T01:22:05.123Z" }
```

```json
{ "capturedAt": "2019-07-14T13:22:05.123+12:00" }
```

The [atproto Lexicon spec](https://atproto.com/specs/lexicon#datetime)
defines `datetime` as full-precision date and time with timezone
information. In particular, it states that:

- timezone specification is required, and a capital `Z` (UTC) suffix is
  strongly preferred, though `+HH:MM` / `-HH:MM` offsets are supported;
- the "negative zero" offset `-00:00` is specifically disallowed;
- whole-second precision is required and fractional seconds are allowed;
- date-only strings (`1985-04-12`) and offsetless strings
  (`1985-04-12T23:20:50.123`, under "timezone is required") appear among the
  spec's invalid examples.

## When only a local time or a date is known

Camera EXIF frequently records a local date and time without an offset, and
historical material may only have a known date. Neither identifies an
instant, and the `datetime` format has no way to express "offset unknown"
(`-00:00` is disallowed). Publishers in that situation should omit
`capturedAt` rather than invent an offset, assume UTC, or use the viewer's
timezone. A publisher that does know the offset (for example from EXIF
`OffsetTimeOriginal` or a trusted device timezone) should apply it and
publish a full datetime.

Do not derive capture time from upload time, and do not turn a date-only
value into midnight UTC.

## Files, captures, and temporal coverage

For field photos, one attachment per capture is a useful application
convention; the original and a preview rendition can share one capture time.
This is not a restriction on the general attachment model: reports, survey
bundles, and raster composites may contain multiple captures.

If the attached material has no single truthful capture time, omit
`capturedAt`. For example, a satellite composite assembled from June through
August should keep its acquisition interval in dataset metadata (such as a
STAC Item) rather than put its processing date in `capturedAt`. The field does
not describe video duration, capture intervals, processing time, or dataset
coverage.

## Validation notes

Clients should validate `capturedAt` like any other atproto `datetime`. The
`@atproto/lexicon` validator used by this package's generated code rejects
date-only strings and the `-00:00` offset, but at the time of writing it
accepts some offsetless strings (for example `2019-07-14T13:22:05`) that the
spec lists as invalid. This applies equally to every `datetime` field in these
lexicons; publishers should not rely on the validator to catch a missing
offset.

## Alternatives considered

An earlier draft of this proposal used a union of three shared objects
(`instant`, `localDateTime`, `calendarDate`) so that local-only and date-only
capture times could also be recorded. Maintainer review preferred staying
with the atproto `datetime` format for consistency with the rest of the
lexicons, since the benefit of the categorisation did not justify departing
from it. Local-only and date-only capture times are therefore not
representable in this field; if that need becomes concrete it can be proposed
as a separate addition without changing the meaning of `capturedAt`.
