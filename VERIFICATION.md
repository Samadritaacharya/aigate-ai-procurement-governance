# Verification report — AIGate

Verified locally on 5 September 2026.

## Passed

- Python compile (`compileall`)
- 41 Python unit/API/registry/governance tests
- 32/32 synthetic risk-band regression cases
- 32/32 synthetic decision regression cases
- Python ↔ TypeScript canonical output hashes across all 32 cases
- 7 TypeScript engine/validation/parity tests
- TypeScript/TSX syntax transpilation across the web source
- Core TypeScript static typecheck for policy + validation modules
- Live FastAPI health and screening smoke tests
- malformed JSON, primitive JSON, unknown fields, wrong boolean types, out-of-range numbers and oversized bodies are rejected
- local SQLite registry round-trip and audit-event tests
- GitHub Actions workflow YAML parsing

## Prepared for repository CI

The checked-in workflows additionally run:

- a clean dependency install
- full Next.js TypeScript typecheck
- production Next.js build
- production server boot
- homepage / health / evaluation HTTP checks
- four end-to-end screening scenarios
- malformed/primitive/type-confusion/unknown-field/oversized-body HTTP checks
- Docker image build for the Python API

These clean-environment steps must run in GitHub Actions after the new repository exists. The current ChatGPT execution container cannot reach the npm registry and does not have Docker installed, so I do not label those two checks as locally verified.
