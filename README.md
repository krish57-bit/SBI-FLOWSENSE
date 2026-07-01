<div align="center">

# SBI FlowSense

### Agentic AI Banking Intelligence Platform

*Event-driven life-event detection, journey orchestration, and AI-powered banking recommendations — with consent-first execution and full auditability.*

**Built for the Antigravity x SBI Hackathon**

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com)

![SBI FlowSense 3D system overview](docs/assets/flowsense-hero-3d.svg)

---

</div>

## The Problem

Traditional banking is **reactive** — customers must discover products, remember deadlines, and manage finances manually. Banks miss critical moments where personalized intervention could transform the customer relationship.

## Our Solution

**FlowSense** detects life events from transaction patterns in real-time and activates AI agents that deliver personalized banking recommendations — all with explicit user consent and an immutable audit trail.

```
Transaction Stream → Life-Event Detection → Journey Orchestration → AI Agent Recommendations → User Consent → Execution
```

---

## System Architecture

![SBI FlowSense layered 3D architecture](docs/assets/flowsense-architecture-3d.svg)

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                    FLOWSENSE PLATFORM                                   │
│                                                                                         │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐    │
│  │                          EXPERIENCE LAYER (React + Vite)                         │    │
│  │                                                                                  │    │
│  │   ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │    │
│  │   │  Login   │  │ Overview │  │ Journeys │  │AI Agents │  │  Notifications   │   │    │
│  │   │  + MPIN  │  │Dashboard │  │ Tracker  │  │  Cards   │  │     Panel        │   │    │
│  │   └─────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────────────┘   │    │
│  │                              ▲ SSE (Real-time)  ▲ REST API                       │    │
│  └──────────────────────────────┼──────────────────┼────────────────────────────────┘    │
│                                 │                  │                                     │
│  ┌──────────────────────────────┼──────────────────┼────────────────────────────────┐    │
│  │                     INTELLIGENCE LAYER (FastAPI)                                  │    │
│  │                                                                                   │    │
│  │   ┌──────────────────┐   ┌───────────────────┐   ┌────────────────────────────┐   │    │
│  │   │  EVENT INGESTION │   │  LIFE-EVENT        │   │   JOURNEY ORCHESTRATOR    │   │    │
│  │   │                  │──▶│  DETECTOR           │──▶│                          │   │    │
│  │   │  POST /events    │   │                    │   │  Template-based multi-    │   │    │
│  │   │  Validation      │   │  • FIRST_SALARY    │   │  step journeys with      │   │    │
│  │   │  Storage         │   │  • RELOCATION      │   │  progress tracking        │   │    │
│  │   └──────────────────┘   │  • PAYMENT_STRESS  │   └───────────┬──────────────┘   │    │
│  │                          └────────────────────┘               │                   │    │
│  │                                                               ▼                   │    │
│  │   ┌───────────────────────────────────────────────────────────────────────────┐   │    │
│  │   │                        MICRO-AGENTS                                       │   │    │
│  │   │                                                                           │   │    │
│  │   │   ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐   │   │    │
│  │   │   │  ACQUISITION    │  │   LIFESTYLE      │  │     ENGAGEMENT          │   │   │    │
│  │   │   │  AGENT          │  │   AGENT           │  │     AGENT               │   │   │    │
│  │   │   │                 │  │                   │  │                         │   │   │    │
│  │   │   │  Salary Account │  │  Auto-pay Setup   │  │  EMI Restructure       │   │   │    │
│  │   │   │  UPI Enable     │  │  Local Offers     │  │  Financial Health      │   │   │    │
│  │   │   │  SIP Start      │  │                   │  │  Check                 │   │   │    │
│  │   │   └─────────────────┘  └─────────────────┘  └─────────────────────────┘   │   │    │
│  │   └───────────────────────────────────────────────────────────────────────────┘   │    │
│  │                                        │                                          │    │
│  │   ┌────────────────────────────────────┼──────────────────────────────────────┐   │    │
│  │   │              CONSENT & EXECUTION ENGINE                                   │   │    │
│  │   │                                    ▼                                      │   │    │
│  │   │   User Approve/Reject  →  Execute Action  →  Advance Journey  →  Audit   │   │    │
│  │   └──────────────────────────────────────────────────────────────────────────┘   │    │
│  └──────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                         │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐    │
│  │                              DATA LAYER                                          │    │
│  │                                                                                  │    │
│  │   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────────┐   │    │
│  │   │  events  │  │  life_   │  │ journeys │  │  agent_  │  │   audit_log    │   │    │
│  │   │          │  │  events  │  │          │  │  actions │  │   (immutable)  │   │    │
│  │   └──────────┘  └──────────┘  └──────────┘  └──────────┘  └────────────────┘   │    │
│  │                                                                                  │    │
│  │   ┌──────────┐  ┌──────────────────┐                                             │    │
│  │   │ consents │  │ executed_actions │     MongoDB 7.0                              │    │
│  │   └──────────┘  └──────────────────┘                                             │    │
│  └──────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                         │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐    │
│  │                     MESSAGING LAYER (Optional)                                   │    │
│  │                                                                                  │    │
│  │   Apache Kafka  ─  transaction-events topic  ─  For distributed microservices    │    │
│  └──────────────────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow

```
                    ┌─────────────┐
                    │  Customer   │
                    │ Transaction │
                    └──────┬──────┘
                           │
                           ▼
                 ┌─────────────────┐
                 │ Event Ingestion │──────── Store in MongoDB
                 │   POST /events  │
                 └────────┬────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │  Life-Event Detector  │
              │                       │
              │  ┌─────────────────┐  │
              │  │ FIRST_SALARY    │  │──── Large credit + employer keywords
              │  │                 │  │     + first occurrence check
              │  ├─────────────────┤  │
              │  │ RELOCATION      │  │──── Rent in new city vs historical
              │  │                 │  │     transaction locations
              │  ├─────────────────┤  │
              │  │ PAYMENT_STRESS  │  │──── Stress keywords (EMI, penalty)
              │  │                 │  │     OR high-frequency small debits
              │  └─────────────────┘  │
              └───────────┬───────────┘
                          │ Life event detected
                          ▼
              ┌───────────────────────┐
              │  Journey Orchestrator │
              │                       │
              │  Creates multi-step   │
              │  journey from         │──── 24h deduplication
              │  template             │     prevents duplicates
              └───────────┬───────────┘
                          │ Journey created
                          ▼
              ┌───────────────────────┐
              │    Micro-Agent        │
              │                       │
              │  Generates personalized│
              │  recommendation with  │──── Optional Gemini LLM
              │  confidence score     │     with mock fallback
              └───────────┬───────────┘
                          │ SSE push to frontend
                          ▼
              ┌───────────────────────┐
              │   User Decision       │
              │                       │
              │   ✅ Approve          │
              │   ❌ Reject           │
              └───────────┬───────────┘
                          │
                ┌─────────┴─────────┐
                ▼                   ▼
       ┌──────────────┐    ┌──────────────┐
       │   Execute     │    │   Log        │
       │   Action      │    │   Rejection  │
       │               │    │              │
       │  • Open acct  │    │  Audit trail │
       │  • Setup UPI  │    │  recorded    │
       │  • Start SIP  │    └──────────────┘
       │  • Auto-pay   │
       │  • EMI restr. │
       └──────┬───────┘
              │
              ▼
       ┌──────────────┐
       │ Advance       │
       │ Journey Step  │──── Progress tracking
       │               │     until completion
       └──────┬───────┘
              │
              ▼
       ┌──────────────┐
       │ Immutable     │
       │ Audit Log     │──── Every decision recorded
       └──────────────┘
```

---

## Life Event Detection Logic

| Life Event | Trigger Conditions | Confidence | Agent |
|---|---|---|---|
| **FIRST_SALARY** | Credit > ₹15,000 + employer keywords (salary, employer, payroll) + first occurrence for customer | 0.85 - 0.95 | Acquisition |
| **RELOCATION** | Rent payment in a city different from historical transactions | 0.80 - 0.92 | Lifestyle |
| **PAYMENT_STRESS** | Stress keywords (minimum due, EMI bounce, penalty, late fee) OR 4+ small debits (<₹1000) in last 10 transactions | 0.65 - 0.92 | Engagement |

---

## Quick Start

### Prerequisites

- **Docker** (for MongoDB)
- **Python 3.11+**
- **Node.js 18+**

### 1. Clone & Setup

```bash
git clone https://github.com/krish57-bit/SBI-FLOWSENSE.git
cd SBI-FLOWSENSE
```

### 2. Start MongoDB

```bash
docker compose up -d mongodb
```

### 3. Install & Seed Backend

```bash
pip install -r services/event-ingestion/requirements-standalone.txt
python seed_data.py
```

### 4. Start Backend (Standalone Mode)

```bash
# Windows
start-standalone.bat

# Linux/Mac
./start-standalone.sh
```

### 5. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

### 6. Open the App

Navigate to **http://localhost:5173**

- Enter any account number (e.g., `cust_123`) and any 6-digit MPIN
- Use the **Demo Controls** panel to simulate banking events
- Watch AI agents detect life events and recommend actions in real-time

---

## Demo Flow

![SBI FlowSense first salary demo storyboard](docs/assets/flowsense-demo-journey.svg)

```
1. Sign In          →  Enter account number + 6-digit MPIN verification
2. Dashboard        →  View balance, stats, recent transactions
3. Simulate Event   →  Click "Salary Credit" in Demo Controls
4. Agent Appears    →  AI Agent card with confidence score + recommendation
5. Approve/Reject   →  Consent-first execution
6. Journey Advances →  Multi-step journey progresses
7. Audit Trail      →  Every action logged immutably
```

### Three Simulate Buttons

| Button | Event | Detection | Agent Response |
|---|---|---|---|
| 💰 **Salary Credit** | +₹75,000 from Employer | FIRST_SALARY | "Open Salary Account" with zero-balance benefits |
| 🏠 **Rent Payment** | ₹18,000 to new city | RELOCATION | "Set up Auto-pay" for rent |
| 💳 **Card Payment** | ₹1,500 minimum due | PAYMENT_STRESS | "Restructure EMI" with lower plan |

---

## Project Structure

```
sbi-flowsense/
│
├── frontend/                          # React SPA (Vite)
│   ├── public/
│   │   ├── favicon.svg               # App favicon
│   │   ├── logo.svg                  # Full brand logo
│   │   ├── logo-icon.svg             # Compact icon logo
│   │   └── icons.svg                 # UI icon sprites
│   ├── src/
│   │   ├── App.jsx                   # Complete SPA — login, dashboard, agents, journeys
│   │   ├── index.css                 # Full design system — variables, components, responsive
│   │   └── main.jsx                  # React entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── services/
│   ├── event-ingestion/               # Core API Gateway (FastAPI)
│   │   ├── main.py                   # All routes, detection, orchestration, execution
│   │   ├── Dockerfile
│   │   ├── requirements.txt          # Full stack dependencies
│   │   └── requirements-standalone.txt # Minimal (no Kafka)
│   │
│   ├── life-event-detector/           # Distributed Kafka consumer
│   │   ├── detector.py
│   │   ├── Dockerfile
│   │   └── requirements.txt
│   │
│   └── orchestrator-agents/           # Distributed Kafka consumer
│       ├── orchestrator.py
│       ├── Dockerfile
│       └── requirements.txt
│
├── docs/                              # Documentation
│   ├── PRD.md                        # Product Requirements Document
│   ├── ARCHITECTURE.md               # Detailed system architecture
│   ├── CLAUDE_CONTEXT.md             # AI coding context
│   └── plan.md                       # Project plan with epics
│
├── docker-compose.yml                 # Full stack: MongoDB + Kafka + services
├── seed_data.py                       # Database seeder (20 Mumbai transactions)
├── start-standalone.bat               # Windows one-click startup
├── start-standalone.sh                # Linux/Mac one-click startup
├── .gitignore
└── README.md                          # This file
```

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/events` | Ingest a transaction event |
| `GET` | `/api/events/recent` | Last 20 transactions |
| `GET` | `/api/stats` | Balance, totals, agent count |
| `POST` | `/api/consents` | Approve or reject an agent action |
| `GET` | `/api/agent-actions/{id}` | Agent recommendations for customer |
| `GET` | `/api/journeys/{id}` | Customer journey progress |
| `GET` | `/api/life-events/{id}` | Detected life events |
| `GET` | `/api/audit-log` | Immutable audit trail |
| `GET` | `/stream` | SSE for real-time agent actions |
| `GET` | `/health` | System health check |

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 19, Vite | Single-page dashboard with SSE |
| **Backend** | Python, FastAPI, Uvicorn | REST API + event processing |
| **Database** | MongoDB 7.0 | 7 collections for full data model |
| **Messaging** | Apache Kafka (optional) | Distributed event streaming |
| **AI** | Google Gemini (optional) | Personalized agent messages |
| **Infra** | Docker, Docker Compose | One-command deployment |

---

## Deployment Modes

### Standalone (Demo)

Single Python process handles everything inline. No Kafka needed.

```bash
# Just MongoDB + Backend + Frontend
docker compose up -d mongodb
start-standalone.bat   # or ./start-standalone.sh
cd frontend && npm run dev
```

### Full Stack (Production-like)

Distributed microservices with Kafka message bus.

```bash
# Everything via Docker Compose
docker compose up -d
cd frontend && npm run dev
```

---

## Security & Governance

- **Consent-First**: Agents recommend, users decide — no autonomous execution
- **Immutable Audit Trail**: Every detection, recommendation, decision, and execution logged
- **MPIN Verification**: 6-digit PIN entry for account access
- **Agent Isolation**: Agents cannot directly modify account data
- **Execution Guard**: Only the Execution Service writes to accounts, after consent

---

## MongoDB Collections

| Collection | Purpose | Key Fields |
|---|---|---|
| `events` | Raw transaction events | customer_id, type, amount, merchant, city |
| `life_events` | Detected life events | type, confidence, detected_at |
| `journeys` | Multi-step journey state | template, steps, current_step, status |
| `agent_actions` | AI recommendations | agent, action, confidence, message |
| `consents` | User decisions | action_id, decision, timestamp |
| `executed_actions` | Completed actions | action_type, result, executed_at |
| `audit_log` | Immutable audit trail | event_type, details, timestamp |

---

## Documentation

| Document | Description |
|----------|-------------|
| [PRD.md](docs/PRD.md) | Product requirements, personas, success criteria |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | Detailed system architecture and design decisions |
| [plan.md](docs/plan.md) | Project plan with 8 epics and task tracking |
| [WINNING_GUIDE.md](docs/WINNING_GUIDE.md) | Judge-focused demo, deck, and final-week checklist |
| [Visual assets](docs/assets/) | 3D README diagrams and demo storyboard SVGs |
| [CLAUDE_CONTEXT.md](docs/CLAUDE_CONTEXT.md) | AI coding context and development guide |

---

<div align="center">

**Built with purpose for the Antigravity x SBI Hackathon**

*Transforming reactive banking into proactive, AI-powered financial intelligence*

</div>
