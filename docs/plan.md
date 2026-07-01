# FlowSense – Project Plan

## Goal

Build an MVP of FlowSense: an event-driven, agentic journey orchestrator for banking customers, with:

- Synthetic event generation (salary, rent, card payments, app logins).
- Life-event detection (FIRST_SALARY, RELOCATION, PAYMENT_STRESS).
- Journey orchestration with three micro-agents (Acquisition, Lifestyle, Engagement).
- Frontend dashboard with event timeline, journey tracking, and agent interaction.
- Consent + execution flow for all action types.
- Standalone mode for demo without Kafka.

---

## Epics

1. Foundation & Infra
2. Event Ingestion & Event Store
3. Life-Event Detector
4. Journey Orchestrator & Templates
5. Micro-Agents & Channel Adapter
6. Execution Service & Consent Flow
7. Frontend & UX
8. Tests, Logging, and Documentation

---

## Epic 1 – Foundation & Infra

**Tasks**

- [x] Set up monorepo with `frontend`, `services`, `infra`.
- [x] Initialize Docker Compose with Kafka + MongoDB + API gateway.
- [x] Configure environment variables and standalone mode.
- [x] Create `README.md`, `ARCHITECTURE.md`, and `CLAUDE_CONTEXT.md`.
- [x] Create startup scripts (start-standalone.bat, start-standalone.sh).

---

## Epic 2 – Event Ingestion & Event Store

**Tasks**

- [x] Implement Event Ingestion Service (`services/event-ingestion/main.py`):
  - `POST /events` REST endpoint with Pydantic validation.
  - Write events to MongoDB `events` collection.
  - Publish events to Kafka topic `transaction-events` (distributed mode).
- [x] Implement seed data script (`seed_data.py`):
  - Generate 20 realistic Mumbai transactions for customer cust_123.
  - Seed audit log entries.
- [x] Implement `GET /api/events/recent` and `GET /api/stats` endpoints.

---

## Epic 3 – Life-Event Detector

**Tasks**

- [x] Implement inline detection in standalone mode:
  - `detect_life_event()` function with 3 detectors.
- [x] Implement rule-based detectors:
  - FIRST_SALARY → large credit with employer keywords, first occurrence.
  - RELOCATION → rent payment in a new city vs. historical transactions.
  - PAYMENT_STRESS → stress keywords or high-frequency small debits pattern.
- [x] 24h deduplication to prevent duplicate detections.
- [x] Emit life events to MongoDB `life_events` collection.
- [x] Implement standalone Kafka consumer (`services/life-event-detector/detector.py`).

---

## Epic 4 – Journey Orchestrator & Templates

**Tasks**

- [x] Define journey templates:
  - FIRST_SALARY: 4 steps (detect → open account → enable UPI → start SIP).
  - RELOCATION: 3 steps (detect → auto-pay → local offers).
  - PAYMENT_STRESS: 3 steps (detect → restructure EMI → health check).
- [x] Implement `create_journey()` — map life events to templates, prevent duplicates.
- [x] Implement `advance_journey()` — progress steps on consent approval.
- [x] Journey completion detection (all steps done → status COMPLETED).

---

## Epic 5 – Micro-Agents & Channel Adapter

**Tasks**

- [x] Implement Acquisition Agent for FIRST_SALARY events.
- [x] Implement Lifestyle Agent for RELOCATION events.
- [x] Implement Engagement Agent for PAYMENT_STRESS events.
- [x] Mock response templates for all 3 agent types.
- [x] Optional Gemini LLM integration for personalized messages.
- [x] SSE broadcast to connected frontend clients.
- [x] Implement standalone orchestrator-agents service for distributed mode.

---

## Epic 6 – Execution Service & Consent Flow

**Tasks**

- [x] Implement `POST /api/consents` for user approvals/rejections.
- [x] Implement 7 execution handlers:
  - OPEN_SALARY_ACCOUNT, ENABLE_UPI, START_SIP
  - SETUP_AUTOPAY, SHOW_LOCAL_OFFERS
  - RESTRUCTURE_EMI, VIEW_DETAILS
- [x] Write executed actions to MongoDB `executed_actions` and `audit_log`.
- [x] Journey step advancement on consent approval.
- [x] Toast notifications for execution results.

---

## Epic 7 – Frontend & UX

**Tasks**

- [x] Implement React SPA with sidebar navigation.
- [x] Build Overview tab: balance card, mini-stats, agent alerts, transactions, journeys.
- [x] Build Transactions tab: full event list with simulate buttons.
- [x] Build Journeys tab: journey cards with step indicators and progress bars.
- [x] Build AI Agents tab: intervention cards with approve/reject buttons.
- [x] Build Settings tab: system configuration display.
- [x] SSE connection for real-time agent action delivery.
- [x] FINEbank-style light theme with SBI branding.
- [x] Responsive design with breakpoints.

---

## Epic 8 – Tests, Logging, and Documentation

**Tasks**

- [x] Immutable audit logging for all system actions.
- [x] Request tracing with event_id, journey_id, action_id.
- [ ] Add unit tests for detector functions.
- [ ] Add integration test for first-salary end-to-end flow.
- [x] Update README.md, ARCHITECTURE.md, and CLAUDE_CONTEXT.md.

---

## Next Steps

1. Make the FIRST_SALARY + RELOCATION vertical slice flawless for the final demo.
2. Add integration tests for the first-salary journey, from event ingestion to audit log.
3. Add unit tests for core detection logic.
4. Capture real UI screenshots for the pitch deck.
5. Rehearse the demo script in `docs/WINNING_GUIDE.md`.

## Hackathon Demo Priority

The winning story is not "every possible banking journey." The priority is one polished vertical slice:

1. First salary and rent events are published for one customer.
2. FlowSense detects FIRST_SALARY and RELOCATION.
3. A journey is created and the Acquisition Agent recommends salary account/SIP actions.
4. The user approves with explicit consent.
5. Mock execution writes `executed_actions` and `audit_log` records.
6. The UI shows timeline, journey progress, agent message, consent, execution, and audit trail.

Use [WINNING_GUIDE.md](WINNING_GUIDE.md) as the final pitch and demo checklist.
