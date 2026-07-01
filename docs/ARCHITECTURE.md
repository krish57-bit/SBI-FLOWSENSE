# FlowSense – Architecture Overview

## 1. High-Level Design

FlowSense is built as an event-driven system with three layers:

- **Experience layer**: React frontend + API gateway.
- **Intelligence layer**: Life-Event Detector, Journey Orchestrator, Micro-Agents.
- **Data & core layer**: Event Ingestion, MongoDB event store, Execution Service, Kafka (optional).

### Deployment Modes

- **Standalone**: Single Python process (event-ingestion/main.py) handles detection, orchestration, and execution inline. Only requires MongoDB. Ideal for demos.
- **Distributed**: Separate microservices connected via Kafka topics. Full production architecture.

## 2. Components

### 2.1 Frontend

- React SPA (Vite + JSX).
- Key views: Overview dashboard, Transactions, Journeys, AI Agents, Settings.
- Sidebar navigation with FINEbank-style design.
- Communicates with API gateway via REST + SSE for real-time updates.

### 2.2 API Gateway & Event Ingestion (services/event-ingestion)

- FastAPI server on port 8001.
- Endpoints:
  - `POST /events` — Ingest transaction/behavior events.
  - `GET /api/events/recent` — Recent transactions.
  - `GET /api/stats` — Balance, totals, active agents.
  - `POST /api/consents` — Approve/reject agent actions.
  - `GET /api/consents/{customer_id}` — Consent history.
  - `GET /api/journeys/{customer_id}` — Active journeys.
  - `GET /api/life-events/{customer_id}` — Detected life events.
  - `GET /api/audit-log` — Immutable audit trail.
  - `GET /stream` — SSE endpoint for real-time agent actions.
  - `GET /health` — System health check.

### 2.3 Life-Event Detector

- **Standalone mode**: Inline function in main.py.
- **Distributed mode**: Kafka consumer (services/life-event-detector).
- Detectors:
  - `FIRST_SALARY` — Large credit (>50K) with employer keywords, first occurrence.
  - `RELOCATION` — Rent payment in a city different from historical transactions.
  - `PAYMENT_STRESS` — Stress keywords (minimum due, EMI bounce) or high-frequency small debits.
- 24h deduplication to prevent duplicate detections.

### 2.4 Journey Orchestrator

- Creates journey instances from templates when life events are detected.
- Templates define multi-step flows:
  - FIRST_SALARY: 4 steps (detect → open account → enable UPI → start SIP).
  - RELOCATION: 3 steps (detect → auto-pay → local offers).
  - PAYMENT_STRESS: 3 steps (detect → restructure EMI → health check).
- Steps advance automatically when related consents are approved.

### 2.5 Micro-Agents

- **Acquisition Agent** — Handles FIRST_SALARY events, recommends salary account.
- **Lifestyle Agent** — Handles RELOCATION events, recommends auto-pay setup.
- **Engagement Agent** — Handles PAYMENT_STRESS events, recommends EMI restructure.
- Each agent generates personalized action cards with approve/reject options.
- Optional Gemini LLM integration for dynamic message generation.

### 2.6 Execution Service

- Handles 7 action types:
  - `OPEN_SALARY_ACCOUNT`, `ENABLE_UPI`, `START_SIP`
  - `SETUP_AUTOPAY`, `SHOW_LOCAL_OFFERS`
  - `RESTRUCTURE_EMI`, `VIEW_DETAILS`
- Mock implementations that simulate banking operations.
- All executions create audit log entries.

### 2.7 Data Stores

MongoDB collections:
- `events` — Raw transaction/behavior events.
- `life_events` — Detected life events with confidence scores.
- `journeys` — Journey instances with step tracking.
- `agent_actions` — Agent-generated recommendations.
- `consents` — User approval/rejection records.
- `executed_actions` — Results of executed actions.
- `audit_log` — Immutable audit trail.

## 3. Messaging (Distributed Mode)

Kafka topics:
- `transaction-events` — Raw transaction events.
- `behavior-events` — User behavior events.
- `life-events` — Detected life events.

## 4. Data Flow

```
Transaction Event
  → POST /events
    → MongoDB (events collection)
    → Life-Event Detector
      → Life event detected (e.g., FIRST_SALARY)
        → MongoDB (life_events collection)
        → Journey Orchestrator
          → Journey created (e.g., Salary Onboarding)
            → MongoDB (journeys collection)
        → Agent generates action card
          → MongoDB (agent_actions collection)
          → SSE push to frontend
            → User sees card with approve/reject
              → POST /api/consents
                → Execution handler runs
                  → MongoDB (executed_actions, audit_log)
                  → Journey step advanced
```

## 5. Security and Governance (Prototype)

- No real PII; synthetic IDs only.
- Agents cannot call write APIs directly.
- All money-like actions go through Execution Service after explicit consent.
- Every step logged with audit_id, actor, and timestamp.
- Consent is mandatory — no automatic execution.

## 6. Future Extensions

- Replace rule-based detectors with sequence ML models.
- Add more agent types (Adoption, Retention).
- Integrate real bank data feeds.
- Add multi-channel delivery (SMS, WhatsApp, push).
- Production Kafka deployment with consumer groups.
- Bank-grade GenAI stack with guardrails.
