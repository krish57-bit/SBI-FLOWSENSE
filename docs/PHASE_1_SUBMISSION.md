# SBI Hackathon 2026 Phase 1 Submission

## Project Title

**SBI FlowSense: Agentic AI Journey Brain for Customer Acquisition, Digital Adoption, and Engagement**

## One-Line Pitch

SBI FlowSense detects customer life events from banking activity and activates consent-first AI agents that recommend, guide, and execute the next best digital banking journey with full auditability.

## Problem Statement

Banks today are rich in customer signals but often act too late. Important moments such as first salary, relocation, payment stress, increased QR usage, or changing spending patterns are visible in transaction and behavior data, yet they are usually treated as isolated records instead of triggers for coordinated customer journeys.

This creates three gaps aligned with the SBI Hackathon themes:

- **Customer acquisition:** Potential customers are not identified and converted at the right life moment.
- **Digital adoption:** Customers do not receive contextual nudges to adopt payments, investments, insurance, UPI, autopay, or mobile banking when those services are most relevant.
- **Digital engagement:** Engagement remains campaign-led instead of behavior-led, personalized, and proactive.

The result is missed conversion, weak product adoption, low long-term engagement, and generic customer communication.

## Proposed Solution

SBI FlowSense is an event-driven, Agentic AI banking intelligence platform that works like a bank-owned journey brain.

It ingests customer transaction and behavior events, detects life events, creates a structured journey, activates a specialized micro-agent, asks for explicit user consent, performs mock execution, and records every step in an immutable audit trail.

The current prototype focuses on a polished vertical slice:

> First salary in a new city -> FIRST_SALARY and RELOCATION detected -> onboarding journey created -> Acquisition Agent recommends salary account, UPI, and SIP actions -> user approves -> action is executed in mock mode -> audit trail proves what happened.

## How It Works

1. **Event ingestion:** Salary, rent, card, and app activity events are accepted through `POST /events`.
2. **Life-event detection:** Rule-based detectors identify FIRST_SALARY, RELOCATION, and PAYMENT_STRESS.
3. **Journey orchestration:** Each life event maps to a journey template with ordered steps.
4. **Micro-agent activation:** Acquisition, Lifestyle, and Engagement agents create personalized action cards.
5. **Consent-first execution:** No financial action is performed unless the user explicitly approves.
6. **Auditability:** Events, detections, journeys, consents, executions, and decisions are logged with traceable IDs.

## Alignment With Hackathon Focus Areas

| Focus Area | FlowSense Contribution |
|---|---|
| Customer Acquisition | Detects high-intent life moments such as first salary and triggers conversational onboarding for salary accounts, UPI setup, and starter investments. |
| Digital Adoption | Recommends context-aware digital products such as autopay, UPI, SIP, mobile banking, and insurance nudges based on life events. |
| Digital Engagement | Proactively engages users based on financial patterns instead of generic campaigns, while preserving user control through consent. |
| Agentic AI & Emerging Tech | Uses bounded micro-agents, event-driven orchestration, real-time UI updates, and audit logs for safe AI-powered banking journeys. |

## Innovation

FlowSense is not just a chatbot and not just a campaign engine. It combines:

- **Event intelligence:** Converts raw transaction signals into life-event context.
- **Journey orchestration:** Turns one detected moment into a multi-step banking journey.
- **Bounded agents:** Agents recommend and guide, but cannot directly mutate financial state.
- **Consent-first execution:** Every high-impact action requires explicit approval.
- **Audit trail:** Every decision is explainable, traceable, and suitable for regulated banking environments.

## Technical Approach

- **Frontend:** React + Vite dashboard with event timeline, journey tracker, and AI agent cards.
- **Backend:** FastAPI event ingestion, detection, orchestration, consent, execution, and SSE streaming.
- **Database:** MongoDB collections for events, life events, journeys, agent actions, consents, executed actions, and audit log.
- **Messaging:** Kafka-ready architecture for distributed event processing.
- **AI layer:** Micro-agent architecture with template fallback and optional LLM personalization.
- **Governance:** Execution guard, consent records, audit logs, and trace IDs.

## Expected Impact For SBI

FlowSense can help SBI:

- Improve acquisition conversion by identifying life moments earlier.
- Increase digital product adoption through timely, contextual recommendations.
- Reduce generic outreach and improve customer relevance.
- Create explainable customer engagement journeys suitable for regulated environments.
- Build reusable infrastructure for additional journeys such as merchant onboarding, insurance gap detection, savings nudges, EMI restructuring, and wealth activation.

## Measurable KPIs

- Journey initiation rate.
- Agent recommendation click-through rate.
- Consent approval rate.
- Digital product activation rate.
- Time from life-event detection to action completion.
- Audit completeness rate.
- Repeat engagement rate after first journey.

## Prototype Scope

The prototype demonstrates:

- Event ingestion for synthetic customer events.
- FIRST_SALARY, RELOCATION, and PAYMENT_STRESS detection.
- Journey creation and progress tracking.
- Acquisition, Lifestyle, and Engagement agent recommendations.
- Consent approval/rejection.
- Mock execution of salary account, UPI, SIP, autopay, local offers, and EMI actions.
- Audit log for every step.

## Why This Can Scale

FlowSense is designed as an event-driven system that can run in standalone mode for demos and distributed mode with Kafka for scale. New detectors, journey templates, and micro-agents can be added without rewriting the platform. The separation between AI recommendation and execution guard keeps the system practical for real-world banking compliance.

## Closing Statement

SBI FlowSense transforms banking from reactive product promotion into proactive, intelligent, and consent-first customer journeys. It directly addresses the hackathon themes of customer acquisition, digital adoption, and digital engagement while keeping safety, auditability, and scalability at the center.
