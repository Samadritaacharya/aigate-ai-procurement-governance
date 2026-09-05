# API contract

## `GET /health`

Returns service status and confirms that no paid API is required.

## `POST /v1/screen`

Accepts one AI use-case JSON object and returns deterministic screening, evidence gaps, approval route, value metrics and an advisory explanation.

Required fields:

- `name`: non-empty, max 200 chars
- `purpose`: 20–5000 chars

The endpoint rejects unknown fields, wrong boolean/numeric types, non-finite/out-of-range values, primitive JSON and bodies over 32 KB.

## `POST /v1/registry`

Runs the same screening and persists the use case + result to the local SQLite registry. Returns `201` with an immutable screening ID.

## `GET /v1/registry?limit=50`

Lists compact registry entries, newest first. Limit is constrained to 1–100.

## `GET /v1/registry/{id}`

Returns the original input, full screening result and append-only audit events for one screening.

## Public web API

The Next.js public demo exposes:

- `GET /api/health`
- `GET /api/evaluation`
- `GET /api/screen`
- `POST /api/screen`

The public Vercel mode is intentionally stateless on the server; recent screenings are stored only in the visitor's browser, and users can download an evidence pack as JSON.
