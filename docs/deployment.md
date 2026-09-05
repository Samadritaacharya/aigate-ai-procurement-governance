# Deployment

## Public web app on Vercel

Import the repository, then set:

- Framework: Next.js
- Root Directory: `frontend`
- Environment variables: none required

The public app uses the TypeScript policy mirror and does not require Python hosting, a database or an AI API key.

## Python API

```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\\Scripts\\activate
pip install -r requirements.txt
uvicorn api:app --reload
```

Health: `GET /health`  
Screening: `POST /v1/screen`

## Docker

```bash
docker build -t aigate .
docker run --rm -p 8000:8000 aigate
```
