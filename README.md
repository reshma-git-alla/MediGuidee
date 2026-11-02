# MediGuide AI Medical Assistant

MediGuide is a full-stack, safety-first medical information assistant. It supports educational chat, medical report summaries, medical image observations, emergency phrase detection, conversation history, and explicit privacy and uncertainty notices.

> This project provides educational information only. It is not medical advice, a diagnostic device, or a replacement for a licensed healthcare professional.

## Architecture

```text
.
|-- frontend/                  Next.js 15, TypeScript, Tailwind, ShadCN-style UI
|   |-- app/                   App Router pages
|   |-- components/            Chat, upload, safety, and UI components
|   |-- lib/                   Shared utilities
|   |-- services/              Typed API client
|   `-- types/                 API and domain types
|-- backend/                   FastAPI and SQLAlchemy
|   |-- app/
|   |   |-- core/              Settings and database
|   |   |-- models/            Conversation, Message, AnalysisHistory
|   |   |-- routers/           Chat, history, report, and image endpoints
|   |   |-- schemas/           Request and response contracts
|   |   |-- services/          Gemini and medical safety guard
|   |   `-- utils/             Upload validation and PDF extraction
|   `-- tests/                 Guardrail tests
`-- README.md
```

## Safety Design

- Emergency screening runs locally before the AI call.
- Emergency responses recommend immediate local emergency care.
- Prescription, individualized dosage, and diagnosis requests are refused.
- Gemini receives a strict medical safety system instruction.
- Every response includes the required educational-use disclaimer.
- Uploads are type-checked, size-limited, and validated before processing.
- Model output explicitly communicates uncertainty and recommends professional review.

The phrase detector is a safety aid, not a certified clinical triage system. Production healthcare use requires clinical validation, legal review, security controls, audit policies, and applicable regulatory compliance.

## Local Installation

### Backend

Python 3.11 or newer is recommended.

```bash
cd backend
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate
pip install -r requirements.txt
```

Add your Gemini key to `backend/.env`:

```env
GEMINI_API_KEY=your_key_here
```

Start the API:

```bash
uvicorn app.main:app --reload
```

FastAPI documentation is available at `http://localhost:8000/docs`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`.

## API

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/chat` | Educational medical chat with safety screening |
| `POST` | `/analyze-report` | PDF/JPG/PNG report analysis |
| `POST` | `/analyze-image` | JPG/PNG medical image observations |
| `GET` | `/history` | Recent conversations and messages |
| `GET` | `/health` | Service health check |

Uploads are limited to 10 MB by default. PDF extraction supports text-based PDFs; scanned PDFs should be uploaded as page images.

## Environment Variables

Backend:

- `GEMINI_API_KEY`: Google Gemini API key.
- `GEMINI_MODEL`: Defaults to `gemini-2.5-flash`.
- `GEMINI_FALLBACK_MODEL`: Used after retryable Gemini capacity failures; defaults to `gemini-2.5-flash-lite`.
- `DATABASE_URL`: Defaults to local SQLite.
- `FRONTEND_URL`: Exact allowed CORS origin.
- `MAX_UPLOAD_MB`: Upload limit from 1 to 25 MB.
- `LOG_LEVEL`: Python logging level.

Frontend:

- `BACKEND_URL`: Private server-side backend URL used by the Next.js `/api` proxy.

Never commit real credentials. The included `.env` files contain placeholders and are ignored by Git.

## Tests and Checks

```bash
cd backend
pytest

cd ../frontend
npm run typecheck
npm run lint
npm run build
```

## Deployment

### Backend on Render

1. Push the repository to GitHub and create a new Render Blueprint or Web Service.
2. Use `backend` as the root directory.
3. Build with `pip install -r requirements.txt`.
4. Start with `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
5. Set `GEMINI_API_KEY`, `FRONTEND_URL`, and `ENVIRONMENT=production`.
6. Use `/health` for health checks.

`backend/render.yaml` contains these defaults. Render's filesystem is ephemeral. SQLite is suitable for development; for durable production history, migrate `DATABASE_URL` to managed PostgreSQL and add migrations.

### Frontend on Vercel

1. Import the repository in Vercel.
2. Set the root directory to `frontend`.
3. Set `BACKEND_URL` to the Render service URL.
4. Deploy, then update Render's `FRONTEND_URL` to the final Vercel origin.

## Production Hardening Checklist

- Replace SQLite with managed PostgreSQL and add Alembic migrations.
- Add authentication, consent, retention controls, and per-user authorization.
- Encrypt stored data and use private object storage for uploads if persistence is needed.
- Add rate limiting, malware scanning, observability, and structured audit events.
- Establish regional privacy and healthcare compliance requirements before handling protected health information.
- Complete clinician-led red-team testing and emergency-flow validation.
