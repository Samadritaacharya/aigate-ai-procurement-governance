#!/usr/bin/env bash
set -euo pipefail
python -m compileall -q src api.py scripts tests
python -m pytest -q
python scripts/evaluate.py >/tmp/aigate-evaluation.json
python - <<'PY'
import json
x=json.load(open('/tmp/aigate-evaluation.json'))
assert x['cases']==32
assert x['risk_band_accuracy']==1.0
assert x['decision_accuracy']==1.0
print('evaluation: 32/32 risk band and 32/32 decision')
PY
(cd frontend && npm test)
echo 'AIGate core verification passed.'
