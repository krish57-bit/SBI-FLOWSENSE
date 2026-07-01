# FlowSense Winning Guide

This guide keeps the final build, pitch, and demo focused on what judges can understand and believe in quickly.

## Judging Strategy

FlowSense should optimize for four judging signals:

- Clear problem and business impact: acquisition, adoption, engagement, and retention KPIs.
- Technical credibility: event-driven architecture, bounded agents, logging, auditability, and consent-gated execution.
- Demo readiness: one polished end-to-end story that works reliably.
- Pitch clarity: simple story first, architecture second, live proof throughout.

## MVP Story

Primary demo story:

> First salary in a new city -> FlowSense detects life events -> creates a journey -> Acquisition Agent recommends next best actions -> user consents -> salary account and SIP are created as mock actions with full audit trail.

This is the vertical slice to polish before adding breadth. Extra detectors and agents are useful only after this story is reliable.

## Build Focus

### Phase A: Core Plumbing

- Docker Compose brings up MongoDB, Kafka, and services.
- `POST /events` stores events and publishes them when Kafka is enabled.
- Synthetic salary and rent events exist for one customer.
- FIRST_SALARY and RELOCATION detections are written to `life_events`.

Validation target:

- CLI/Postman can show `events -> life_events` without using the UI.

### Phase B: Journey And Agent

- Life events create journey documents from templates.
- Acquisition Agent generates one or two personalized recommendations.
- Frontend shows agent messages and clear approve/reject actions.

Validation target:

- Demo can show `events -> life_events -> journey -> agent card`.

### Phase C: Consent, Execution, Polish

- Approval creates a consent record.
- Mock execution writes `executed_actions`.
- Audit log records the full chain with `customer_id`, `event_id`, `life_event_id`, `journey_id`, and `action_id`.
- UI shows timeline, journey progress, recommendations, and audit trail.

Validation target:

- One full demo run can show every step without manual database edits.

## Demo Script

Use this as the spoken flow for an 8-10 minute demo.

1. "This is Krish, a young professional who just moved to Mumbai and received his first salary."
2. "We publish salary and rent transaction events into FlowSense."
3. "The system detects FIRST_SALARY and RELOCATION from transaction patterns."
4. "A journey is created automatically, and the Acquisition Agent recommends relevant SBI actions."
5. "The user stays in control. Nothing executes until they approve."
6. "When the user approves, FlowSense records consent, performs mock execution, advances the journey, and writes the audit trail."
7. "This is one vertical slice today. The same architecture extends to merchants, payment stress, lifestyle events, and more agents."

## Deck Checklist

Build a 10-12 slide deck:

- Title: FlowSense, agentic banking journeys.
- Problem: banks miss life moments and customers receive generic offers.
- Research landscape: agentic AI, hyper-personalized journeys, consent-first banking.
- Product overview: events -> life events -> journeys -> agents -> consent -> execution.
- Architecture: React, FastAPI services, MongoDB, Kafka, bounded agents, audit trail.
- Demo storyboard: the exact first-salary-in-new-city flow.
- Safety and governance: consent required, audit log, execution guard, agent boundaries.
- Impact and KPIs: journeys started, consent rate, action completion, adoption uplift.
- Roadmap: stronger ML, real SBI integrations, additional agents, enterprise monitoring.
- Team: why this team can build and ship it.

## Final Week Checklist

- [ ] One first-salary story runs end to end without manual fixes.
- [ ] Audit log can answer what happened, when, for whom, and why.
- [ ] Deck screenshots come from the real UI.
- [ ] Architecture slide matches the actual repo structure.
- [ ] Pitch explains safety in 2-3 sentences: bounded agents, explicit consent, execution guard, audit trail.
- [ ] Full pitch plus demo has been rehearsed at least three times.
- [ ] Backup screenshots and CLI commands are ready in case live demo networking fails.

## Codex Development Workflow

Use Codex in three modes:

- Planner: refine `docs/plan.md` into concrete tasks with files, endpoints, and acceptance checks.
- Dev: implement one task at a time, then run the nearest useful check.
- QA: review changed files for edge cases, missing logs, and missing tests.

Do not ask for the whole system in one prompt. Keep work task-based and verify each task before moving on.
