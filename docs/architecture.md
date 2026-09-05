# Architecture

```text
AI use-case intake
       │
       ├── business value inputs
       ├── data / user context
       ├── vendor / model evidence
       └── automation / decision context
                 │
                 ▼
      Deterministic policy engine
                 │
        ┌────────┼─────────┐
        ▼        ▼         ▼
    risk band  controls  approval route
        │        │         │
        └────────┼─────────┘
                 ▼
         readiness + evidence
                 │
         ┌───────┴────────┐
         ▼                ▼
    value engine      evidence graph
         │                │
         └───────┬────────┘
                 ▼
       optional AI explanation
       (advisory, no authority)
```

## Two implementations

- `src/aigate/`: canonical Python policy/evaluation engine and FastAPI service.
- `frontend/lib/engine.ts`: zero-key TypeScript mirror used by the Vercel public demo.

Both consume the same 32-case synthetic evaluation fixture. CI asserts fixture parity and independently verifies the expected risk-band and decision outputs.

## Why deterministic authority

The system is intentionally not a free-form agent making compliance or procurement decisions. Risk-band indicators, release decisions, control gaps and approval routes are deterministic and testable. An optional local/OpenAI-compatible model can improve explanation quality, but its output cannot overwrite the policy result.
