# CLAUDE_CONTEXT – FlowSense

## Project Summary

FlowSense is an event-driven, agentic journey orchestrator for SBI banking customers. It:

- Ingests synthetic transaction/behavior events via REST API.
- Detects life events (FIRST_SALARY, RELOCATION, PAYMENT_STRESS) using rule-based detectors.
- Starts multi-step journeys and activates micro-agents (Acquisition, Lifestyle, Engagement).
- Pushes personalized agent recommendations to the frontend via SSE.
- Executes mock banking actions only after explicit user consent.
- Maintains an immutable audit trail of every decision and action.

## Current State

### Implemented

- [x] Event Ingestion Service (standalone + Kafka modes)
- [x] Life-Event Detector (3 detectors: salary, relocation, payment stress)
- [x] Journey Orchestrator (3 templates with step tracking)
- [x] Acquisition Agent (FIRST_SALARY → salary account)
- [x] Lifestyle Agent (RELOCATION → auto-pay)
- [x] Engagement Agent (PAYMENT_STRESS → EMI restructure)
- [x] Execution Service (7 action handlers)
- [x] Consent Flow (approve/reject with audit)
- [x] Frontend dashboard (FINEbank-style, 5 tabs, SSE, consent UI)
- [x] Seed data script (20 Mumbai transactions)
- [x] Docker Compose (MongoDB, Kafka, Zookeeper, services)
- [x] Standalone mode (single process, no Kafka needed)

### Tech Stack

- Frontend: React + Vite (JSX), custom CSS with CSS variables.
- Backend: Python FastAPI (services/event-ingestion/main.py).
- Messaging: Kafka topics (optional, for distributed mode).
- Storage: MongoDB for events, life_events, journeys, agent_actions, consents, executed_actions, audit_log.
- AI: Gemini LLM via google-genai SDK (optional, with mock fallback).

### Key Files

- `services/event-ingestion/main.py` — Core API gateway with all routes, inline detection, orchestration, execution.
- `services/life-event-detector/detector.py` — Standalone Kafka consumer for distributed detection.
- `services/orchestrator-agents/orchestrator.py` — Standalone Kafka consumer for distributed orchestration.
- `frontend/src/App.jsx` — Complete React frontend.
- `frontend/src/index.css` — All styles (light theme, sidebar, cards).
- `seed_data.py` — Database seeder for demo data.
- `docker-compose.yml` — Full stack with Kafka/Zookeeper/MongoDB.
- `start-standalone.bat` / `start-standalone.sh` — One-command startup.

### Known Constraints

- Prototype runs locally via Docker Compose or standalone mode.
- No real SBI data or integration; everything is synthetic.
- Safety: agents never write directly to account balances; only Execution Service does after consent.
- Standalone mode runs all logic in a single Python process.

### API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| POST | /events | Ingest transaction event |
| GET | /api/events/recent | Last 20 transactions |
| GET | /api/stats | Balance, totals, agent count |
| POST | /api/consents | Approve/reject agent action |
| GET | /api/consents/{id} | Consent history |
| GET | /api/journeys/{id} | Customer journeys |
| GET | /api/life-events/{id} | Detected life events |
| GET | /api/audit-log | Full audit trail |
| GET | /stream | SSE for real-time actions |
| GET | /health | System health |

### Running Locally

**Standalone (recommended for demo):**
```bash
# Start MongoDB
docker compose up -d mongodb

# Seed data
python seed_data.py

# Start backend
set STANDALONE=true
cd services/event-ingestion
uvicorn main:app --host 0.0.0.0 --port 8001

# Start frontend (separate terminal)
cd frontend
npm run dev
```

**Full stack:**
```bash
docker compose up -d
```

---

## Prompt Guidelines

When using Claude Code:

- Always load `plan.md`, `ARCHITECTURE.md`, and this file for context.
- Work on one task at a time.
- The main backend logic is all in `services/event-ingestion/main.py`.
- Frontend is a single-file SPA in `frontend/src/App.jsx`.
- Test changes by simulating events via the frontend buttons or POST /events.
- Check audit trail at GET /api/audit-log to verify system behavior.
