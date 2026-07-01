# FlowSense – Product Requirements Document (PRD)

## 1. Problem Statement

Banks struggle to:
- Identify key customer life events (first salary, relocation, payment stress) from raw transaction/behavior data.
- Turn these into coordinated acquisition, digital adoption, and engagement journeys.
- Do this safely with AI agents under regulatory and trust constraints.

FlowSense addresses this by building a bank-owned "journey brain" that detects life events and orchestrates agentic journeys with explicit consent and auditability.

## 2. Users & Personas

- Young salaried professional (first job, Tier-2 city).
- Small merchant (QR usage, cash flow).
- Bank teams (product, CX, RM) as internal consumers of metrics and logs.

## 3. Scope (MVP)

In Scope:
- Synthetic data for 1–2 personas.
- Event ingestion from generator scripts.
- Life-event detection for FIRST_SALARY, RELOCATION, and PAYMENT_STRESS.
- Journeys for:
  - Salary account acquisition.
  - Relocation assistance (rent auto-pay, local offers).
  - Financial health recovery (EMI restructure).
- Three micro-agents (Acquisition, Lifestyle, Engagement) with UI-based interaction.
- Explicit consent and mock execution.
- Real-time SSE push for agent actions.

Out of Scope (for now):
- Real SBI systems integration.
- Production-grade security and identity.
- Advanced ML models for event sequences (beyond rules).

## 4. Functional Requirements

- FR1: Ingest transaction and behavior events via REST API.
- FR2: Persist events in MongoDB and optionally publish to Kafka topics.
- FR3: Detect life events from sequences of events using rule-based detectors.
- FR4: Create journeys mapped to life events with step-by-step templates.
- FR5: Activate micro-agents that produce personalized recommendations.
- FR6: Deliver agent actions to frontend via SSE and display as interactive cards.
- FR7: Record consents and execute mock actions safely (account creation, SIP, auto-pay).
- FR8: Provide immutable audit trail of all agent actions and decisions.
- FR9: Advance journey steps automatically upon consent approval.
- FR10: Support standalone mode (no Kafka) for demo/hackathon use.

## 5. Non-Functional Requirements

- NFR1: All services run via Docker Compose on a laptop (or standalone with just MongoDB).
- NFR2: Clear separation between AI reasoning and financial state mutation.
- NFR3: Logging and traceability for every step (events, detectors, agents, execution).
- NFR4: Simple metrics for demo:
  - Number of journeys started.
  - Number of consents given.
  - Actions executed.
  - Balance and transaction summaries.

## 6. Success Criteria (Hackathon)

- End-to-end demo of all three scenarios:
  - FIRST_SALARY → Acquisition Agent → consent → salary account opened.
  - RELOCATION → Lifestyle Agent → consent → auto-pay configured.
  - PAYMENT_STRESS → Engagement Agent → consent → EMI restructured.
- Clear slides explaining architecture, agent governance, and future ML.
- Judges see:
  - Real-time event stream.
  - Agentic AI behaviour with consent flow.
  - Safety and auditability via audit trail.
  - Journey progression with step tracking.
