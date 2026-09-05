.PHONY: test eval api web verify

test:
	python -m pytest -q

eval:
	python scripts/evaluate.py

api:
	uvicorn api:app --reload

web:
	cd frontend && npm run dev

verify:
	python -m compileall -q src api.py scripts tests
	python -m pytest -q
	python scripts/evaluate.py >/tmp/aigate-eval.json
	cd frontend && npm test
