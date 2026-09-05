# AIGate — AI Procurement, Governance & Value Control Plane

[![Python CI](https://github.com/Samadritaacharya/aigate-ai-procurement-governance/actions/workflows/backend-ci.yml/badge.svg)](https://github.com/Samadritaacharya/aigate-ai-procurement-governance/actions/workflows/backend-ci.yml)
[![Interactive Web CI](https://github.com/Samadritaacharya/aigate-ai-procurement-governance/actions/workflows/frontend-ci.yml/badge.svg)](https://github.com/Samadritaacharya/aigate-ai-procurement-governance/actions/workflows/frontend-ci.yml)

> **From AI request to approved, governed and measurable production use.**

AIGate is a zero-key, portfolio-safe control plane for screening proposed AI systems, identifying evidence gaps, routing approvals, evaluating vendor readiness and quantifying business value. The central design rule is simple: **model reasoning may advise; deterministic policy owns authority.**

## Why this exists

German and European organizations increasingly need to operationalize AI rather than merely experiment with it. The hard part is often the workflow around the model: ownership, vendor evidence, data/privacy review, risk classification, transparency, human oversight, evaluation, approval, monitoring and a credible value case.

AIGate turns that lifecycle into an inspectable product workflow.

## Verification snapshot

| Capability | Verified state |
|---|---|
| Structured AI use-case intake | Working |
| Risk-band screening | Working, deterministic |
| Prohibited/high-risk/transparency indicators | Working, screening only |
| Vendor-evidence score | Working |
| Evidence/control gap analysis | Working |
| Explainable approval route | Working |
| Value / ROI / payback calculation | Working |
| Evidence graph | Working |
| Optional local model explanation | Working, advisory only |
| Python FastAPI backend | Working |
| Local SQLite AI registry + audit event | Working |
| Zero-key Next.js backend | Working |
| Shared synthetic evaluation | **32/32 risk-band + 32/32 decision cases** |
| Python test suite | **41/41 passed in GitHub Actions** |
| TypeScript engine suite | **7/7 passed in GitHub Actions** |
| Python ↔ TypeScript canonical output parity | **32/32 cases verified** |
| Next.js production build + HTTP smoke | **Passed in GitHub Actions** |
| FastAPI production smoke | **Passed in GitHub Actions** |
| Docker image build | **Passed in GitHub Actions** |
| Responsive interactive UI | Working |
| Vercel configuration | Ready; deploy `frontend/` |

The 32-case result is a **regression result on a checked-in, hand-authored synthetic fixture**, not a production-accuracy or legal-classification claim.

## Decision model

```text
AI request
   ↓
structured context
   ↓
deterministic screening
   ├── prohibited-review       → block + legal review
   ├── high-risk-candidate     → human approval required
   ├── transparency            → control review
   └── minimal                 → standard review
   ↓
required controls + missing evidence
   ↓
approval route
   ↓
value case + evidence graph
   ↓
registry / monitoring pattern
```

**Important:** this is decision-support screening, not a legal determination or conformity assessment. High-risk/prohibited categories evolve through law, guidance and organizational interpretation; production use requires qualified legal/compliance review.

## Evaluation

The checked-in fixture contains **32 synthetic scenarios** spanning internal assistants, human-facing chatbots, synthetic media, employment/education/essential-service use cases, biometric/critical-infrastructure indicators and deliberately prohibited-risk indicators.

Run:

```bash
python scripts/evaluate.py
pytest
```

The evaluation measures only deterministic regression behavior on the checked-in synthetic set. It does **not** claim production accuracy or legal-classification accuracy.

## Web app

```bash
cd frontend
npm install
npm run dev
```

The app includes:

- editable enterprise AI intake
- scenario presets
- context/control toggles
- live value sliders
- deterministic API screening
- risk/decision transitions
- readiness/evidence/vendor scores
- missing-control view
- approval-route view
- interactive React Three Fiber evidence visualization
- original GLSL policy core
- downloadable JSON evidence pack
- local browser history
- reduced-motion, WebGL fallback and mobile layouts

## Python API

```bash
pip install -r requirements.txt
uvicorn api:app --reload
```

```http
GET  /health
POST /v1/screen
POST /v1/registry
GET  /v1/registry
GET  /v1/registry/{id}
```

## Optional AI layer

AIGate works without any model. If you run a local OpenAI-compatible endpoint, set:

```bash
AIGATE_LLM_BASE_URL=http://localhost:11434/v1
AIGATE_LLM_MODEL=<your-local-model>
```

The model can only generate an explanation. It cannot change `risk_band`, `decision`, required controls, approval routing or authorization.

## Architecture

See [docs/market-context.md](docs/market-context.md), [docs/architecture.md](docs/architecture.md), [docs/product-spec.md](docs/product-spec.md), [docs/api-contract.md](docs/api-contract.md), [docs/security.md](docs/security.md) and [docs/deployment.md](docs/deployment.md).

## Free-runtime posture

No hosted model, paid API, analytics platform or authentication service is required for the community/portfolio app. The Python community mode uses local SQLite, while the public Next.js mode is stateless on the server and keeps recent runs in the browser. Local execution is self-contained after installing open-source dependencies. Vercel Hobby can be used for a public personal demo subject to Vercel's current plan limits and terms.

## Scope

All included scenarios are synthetic. Do not use the public demo for confidential vendor, employee, applicant, customer, patient or contract data.

## License

MIT
