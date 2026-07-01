import os
import json
import uuid
import asyncio
from datetime import datetime, timedelta
from typing import Optional
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pymongo import MongoClient

app = FastAPI(title="FlowSense Event API & Gateway")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

KAFKA_BROKER = os.getenv("KAFKA_BROKER", "localhost:9092")
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
STANDALONE = os.getenv("STANDALONE", "true").lower() == "true"
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
TOPIC_NAME = "transaction-events"

# MongoDB
mongo_client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=3000)
db = mongo_client.flowsense
events_col = db.events
consents_col = db.consents
executed_col = db.executed_actions
audit_col = db.audit_log
journeys_col = db.journeys
life_events_col = db.life_events
actions_col = db.agent_actions

# Kafka (optional)
kafka_producer = None
if not STANDALONE:
    try:
        from confluent_kafka import Producer
        kafka_producer = Producer({"bootstrap.servers": KAFKA_BROKER})
        print(f"Kafka connected at {KAFKA_BROKER}")
    except Exception as e:
        print(f"Kafka unavailable, running standalone: {e}")
        STANDALONE = True

# Gemini LLM (optional)
genai_client = None
if GEMINI_API_KEY:
    try:
        from google import genai
        genai_client = genai.Client(api_key=GEMINI_API_KEY)
        print("Gemini LLM connected")
    except Exception as e:
        print(f"Gemini unavailable, using mock responses: {e}")

# ─── Models ───
class EventPayload(BaseModel):
    customer_id: str
    event_type: str
    amount: float = 0.0
    merchant: str = ""
    city: str = ""

class ConsentPayload(BaseModel):
    customer_id: str
    action_id: str
    journey_id: Optional[str] = None
    proposed_action: str
    decision: str
    parameters: Optional[dict] = None

# SSE clients
clients: list[asyncio.Queue] = []

# ─── Audit ───
def write_audit(action: str, actor: str, details: dict):
    try:
        audit_col.insert_one({
            "audit_id": f"aud_{uuid.uuid4().hex[:8]}",
            "action": action,
            "actor": actor,
            "details": details,
            "timestamp": datetime.utcnow().isoformat(),
        })
    except Exception as e:
        print(f"Audit error: {e}")

# ─── Journey Templates ───
JOURNEY_TEMPLATES = {
    "FIRST_SALARY": {
        "name": "New Salary Customer Onboarding",
        "agent": "Acquisition Agent",
        "steps": [
            {"step_id": "detect", "label": "Life Event Detected", "description": "First salary credit identified", "action": None},
            {"step_id": "open_account", "label": "Open Salary Account", "description": "Zero-balance salary account with free debit card", "action": "OPEN_SALARY_ACCOUNT"},
            {"step_id": "enable_upi", "label": "Enable UPI", "description": "Activate UPI on the new salary account", "action": "ENABLE_UPI"},
            {"step_id": "start_sip", "label": "Start SIP", "description": "Begin systematic investment plan from salary", "action": "START_SIP"},
        ],
    },
    "RELOCATION": {
        "name": "Relocation Assistance",
        "agent": "Lifestyle Agent",
        "steps": [
            {"step_id": "detect", "label": "Life Event Detected", "description": "Relocation to new city identified", "action": None},
            {"step_id": "setup_autopay", "label": "Set Up Rent Auto-pay", "description": "Never miss rent in your new city", "action": "SETUP_AUTOPAY"},
            {"step_id": "local_offers", "label": "Local Offers", "description": "Cashback and offers for your new city", "action": "SHOW_LOCAL_OFFERS"},
        ],
    },
    "PAYMENT_STRESS": {
        "name": "Financial Health Recovery",
        "agent": "Engagement Agent",
        "steps": [
            {"step_id": "detect", "label": "Life Event Detected", "description": "Payment stress pattern identified", "action": None},
            {"step_id": "restructure", "label": "Restructure EMI", "description": "Lower your monthly EMI burden", "action": "RESTRUCTURE_EMI"},
            {"step_id": "health_check", "label": "Financial Health Check", "description": "Personalized financial health review", "action": "VIEW_DETAILS"},
        ],
    },
}

# ─── Life-Event Detection (inline for standalone mode) ───
def detect_life_event(event_data):
    customer_id = event_data.get("customer_id")
    event_type = event_data.get("type")
    amount = event_data.get("amount", 0)
    merchant = (event_data.get("merchant") or "").upper()
    city = event_data.get("city", "")

    # FIRST_SALARY: large credit with employer-like merchant
    if event_type == "CREDIT" and amount > 50000:
        salary_kw = ["EMPLOYER", "SALARY", "CORP", "PVT", "LTD", "PAYROLL", "NEFT"]
        is_salary = any(kw in merchant for kw in salary_kw) or amount > 70000
        if is_salary:
            prior = events_col.count_documents({
                "customer_id": customer_id, "type": "CREDIT", "amount": {"$gt": 50000}
            })
            if prior <= 1:
                return {"type": "FIRST_SALARY", "confidence": 0.91}

    # RELOCATION: rent payment in a new city
    if event_type == "DEBIT" and "RENT" in merchant and city:
        prior_cities = events_col.distinct("city", {
            "customer_id": customer_id,
            "city": {"$nin": [city, ""]},
        })
        if prior_cities:
            return {"type": "RELOCATION", "confidence": 0.85, "metadata": {"to_city": city}}

    # PAYMENT_STRESS: stress-related debits or high-frequency small spends
    if event_type == "DEBIT":
        stress_kw = ["MINIMUM DUE", "CREDIT CARD", "EMI BOUNCE", "PENALTY", "LATE FEE", "OVERDRAFT", "INSUFFICIENT"]
        is_stress_txn = any(kw in merchant for kw in stress_kw)

        if not is_stress_txn:
            recent_debits = list(events_col.find(
                {"customer_id": customer_id, "type": "DEBIT"},
                {"amount": 1, "timestamp": 1}
            ).sort("timestamp", -1).limit(10))
            if len(recent_debits) >= 5:
                small_count = sum(1 for d in recent_debits if d.get("amount", 0) < 1000)
                if small_count >= 4:
                    is_stress_txn = True

        if is_stress_txn:
            stress_count = events_col.count_documents({
                "customer_id": customer_id,
                "type": "DEBIT",
                "amount": {"$lt": 1000},
            })
            confidence = min(0.65 + stress_count * 0.03, 0.92)
            if stress_count >= 3:
                return {"type": "PAYMENT_STRESS", "confidence": round(confidence, 2)}

    return None

# ─── Agent Response Generation ───
MOCK_RESPONSES = {
    "FIRST_SALARY": {
        "title": "Salary Credited!",
        "message": "Congratulations on your salary! Upgrade to an SBI Salary Account for zero-balance benefits, a free debit card, and priority UPI setup.",
        "suggested_action": "OPEN_SALARY_ACCOUNT",
        "action_label": "Explore Benefits",
    },
    "RELOCATION": {
        "title": "New City, New Start!",
        "message": "We noticed you're settling into a new city. Set up auto-pay for your rent so you never miss a deadline while getting settled.",
        "suggested_action": "SETUP_AUTOPAY",
        "action_label": "Set up Auto-pay",
    },
    "PAYMENT_STRESS": {
        "title": "We're Here to Help",
        "message": "We noticed some payment pressure on your account. Let us help restructure your dues with a lower EMI plan tailored to your cash flow.",
        "suggested_action": "RESTRUCTURE_EMI",
        "action_label": "View Options",
    },
}

AGENT_NAMES = {
    "FIRST_SALARY": "acquisition",
    "RELOCATION": "lifestyle",
    "PAYMENT_STRESS": "engagement",
}

def generate_agent_action(customer_id, life_event_type, confidence):
    agent = AGENT_NAMES.get(life_event_type, "general")

    action_data = None
    if genai_client:
        try:
            prompt = f"""You are the {agent} AI Banking Agent for SBI FlowSense.
A customer ({customer_id}) just experienced: {life_event_type} (confidence: {confidence}).
Generate a JSON response: {{"title": "Short title", "message": "Friendly message", "suggested_action": "ACTION_CODE", "action_label": "Button text"}}"""
            response = genai_client.models.generate_content(
                model="gemini-2.5-pro",
                contents=prompt,
                config={"response_mime_type": "application/json"},
            )
            action_data = json.loads(response.text)
        except Exception as e:
            print(f"LLM error: {e}")

    if not action_data:
        action_data = MOCK_RESPONSES.get(life_event_type, {
            "title": "FlowSense Insight",
            "message": f"We detected a {life_event_type.replace('_', ' ').lower()} event.",
            "suggested_action": "VIEW_DETAILS",
            "action_label": "Learn More",
        })

    action_data["id"] = f"act_{uuid.uuid4().hex[:8]}"
    action_data["customer_id"] = customer_id
    action_data["life_event"] = life_event_type
    action_data["agent"] = agent
    action_data["confidence"] = confidence
    action_data["timestamp"] = datetime.utcnow().isoformat()

    return action_data

# ─── Journey Management ───
def create_journey(customer_id, life_event):
    template = JOURNEY_TEMPLATES.get(life_event)
    if not template:
        return None

    existing = journeys_col.find_one({
        "customer_id": customer_id, "life_event": life_event, "status": "ACTIVE",
    })
    if existing:
        return existing.get("journey_id")

    journey_id = f"jrn_{uuid.uuid4().hex[:8]}"
    now = datetime.utcnow().isoformat()
    steps = []
    for step_tpl in template["steps"]:
        done = step_tpl["step_id"] == "detect"
        steps.append({**step_tpl, "status": "COMPLETED" if done else "PENDING", "completed_at": now if done else None})

    journey = {
        "journey_id": journey_id, "customer_id": customer_id,
        "life_event": life_event, "name": template["name"],
        "agent": template["agent"], "status": "ACTIVE",
        "steps": steps, "current_step_index": 1,
        "created_at": now, "updated_at": now,
    }
    try:
        journeys_col.insert_one(journey.copy())
    except Exception as e:
        print(f"Journey creation error: {e}")

    write_audit("JOURNEY_CREATED", "orchestrator", {"journey_id": journey_id, "life_event": life_event})
    return journey_id

def advance_journey(customer_id, proposed_action):
    journey = journeys_col.find_one({
        "customer_id": customer_id, "status": "ACTIVE", "steps.action": proposed_action,
    })
    if not journey:
        return None

    now = datetime.utcnow().isoformat()
    steps = journey["steps"]
    updated = False
    for step in steps:
        if step["action"] == proposed_action and step["status"] == "PENDING":
            step["status"] = "COMPLETED"
            step["completed_at"] = now
            updated = True
            break

    if not updated:
        return None

    next_idx = next((i for i, s in enumerate(steps) if s["status"] == "PENDING"), len(steps))
    all_done = all(s["status"] == "COMPLETED" for s in steps)
    journeys_col.update_one(
        {"journey_id": journey["journey_id"]},
        {"$set": {"steps": steps, "current_step_index": next_idx,
                  "status": "COMPLETED" if all_done else "ACTIVE", "updated_at": now}},
    )
    write_audit("JOURNEY_STEP_COMPLETED", customer_id, {
        "journey_id": journey["journey_id"], "step_action": proposed_action
    })
    return {"journey_id": journey["journey_id"], "journey_status": "COMPLETED" if all_done else "ACTIVE"}

# ─── Execution Handlers ───
EXECUTION_HANDLERS = {
    "OPEN_SALARY_ACCOUNT": lambda cid, p: {
        "result": "SALARY_ACCOUNT_CREATED",
        "account_number": f"SBI{uuid.uuid4().hex[:10].upper()}",
        "type": "Salary Account",
        "message": "Salary account opened with zero-balance benefits and free debit card.",
    },
    "SETUP_AUTOPAY": lambda cid, p: {
        "result": "AUTOPAY_CONFIGURED",
        "autopay_id": f"AP{uuid.uuid4().hex[:6].upper()}",
        "type": "Rent Auto-pay",
        "message": "Auto-pay set up for your monthly rent.",
    },
    "START_SIP": lambda cid, p: {
        "result": "SIP_STARTED",
        "sip_id": f"SIP{uuid.uuid4().hex[:6].upper()}",
        "amount": (p or {}).get("amount", 2000),
        "message": "SIP started successfully.",
    },
    "ENABLE_UPI": lambda cid, p: {
        "result": "UPI_ENABLED",
        "vpa": f"{cid}@sbi",
        "message": "UPI activated on your salary account.",
    },
    "RESTRUCTURE_EMI": lambda cid, p: {
        "result": "EMI_RESTRUCTURED",
        "plan_id": f"EMI{uuid.uuid4().hex[:6].upper()}",
        "message": "EMI restructured to a lower monthly amount.",
    },
    "SHOW_LOCAL_OFFERS": lambda cid, p: {
        "result": "OFFERS_SHOWN",
        "message": "Local cashback offers activated for your new city.",
    },
    "VIEW_DETAILS": lambda cid, p: {
        "result": "DETAILS_VIEWED",
        "message": "Details sent to your registered email.",
    },
}

# ─── Routes ───

@app.post("/events")
async def ingest_event(payload: EventPayload):
    event_id = f"evt_{uuid.uuid4().hex[:8]}"
    event_data = {
        "event_id": event_id,
        "customer_id": payload.customer_id,
        "type": payload.event_type,
        "amount": payload.amount,
        "merchant": payload.merchant,
        "city": payload.city,
        "timestamp": datetime.utcnow().isoformat(),
    }

    try:
        events_col.insert_one(event_data.copy())
    except Exception as e:
        print(f"MongoDB error: {e}")

    if "_id" in event_data:
        del event_data["_id"]

    write_audit("EVENT_INGESTED", payload.customer_id, {"event_id": event_id, "type": payload.event_type})

    # Kafka path (distributed mode)
    if kafka_producer:
        try:
            kafka_producer.produce(TOPIC_NAME, key=payload.customer_id.encode(), value=json.dumps(event_data).encode())
            kafka_producer.flush()
        except Exception as e:
            print(f"Kafka error: {e}")

    # Standalone path: detect + orchestrate + push inline
    if STANDALONE:
        life_event = detect_life_event(event_data)
        if life_event:
            le_type = life_event["type"]
            confidence = life_event["confidence"]

            # Check for duplicate detection in last 24h
            recent = life_events_col.find_one({
                "customer_id": payload.customer_id,
                "type": le_type,
                "detected_at": {"$gte": (datetime.utcnow() - timedelta(hours=24)).isoformat()},
            })
            if not recent:
                le_record = {
                    "life_event_id": f"le_{uuid.uuid4().hex[:8]}",
                    "customer_id": payload.customer_id,
                    "type": le_type,
                    "confidence": confidence,
                    "detected_at": datetime.utcnow().isoformat(),
                    "evidence_events": [event_id],
                    "metadata": life_event.get("metadata", {}),
                }
                try:
                    life_events_col.insert_one(le_record.copy())
                except Exception:
                    pass

                write_audit("LIFE_EVENT_DETECTED", "life_event_detector", {
                    "type": le_type, "confidence": confidence, "customer_id": payload.customer_id
                })

                # Create journey
                journey_id = create_journey(payload.customer_id, le_type)

                # Generate agent action
                action = generate_agent_action(payload.customer_id, le_type, confidence)
                action["journey_id"] = journey_id

                try:
                    actions_col.insert_one(action.copy())
                except Exception:
                    pass
                if "_id" in action:
                    del action["_id"]

                write_audit("AGENT_ACTION_GENERATED", f"{action['agent']}_agent", {
                    "action_id": action["id"], "life_event": le_type
                })

                # Push to SSE clients
                for q in clients:
                    await q.put(action)

                print(f"[STANDALONE] {le_type} detected -> {action['agent']} agent -> action {action['id']}")

    return {"status": "success", "event_id": event_id, "data": event_data}

@app.post("/internal/push-action")
async def push_action(request: Request):
    data = await request.json()
    life_event = data.get("life_event")
    customer_id = data.get("customer_id", "cust_123")
    if life_event and life_event in JOURNEY_TEMPLATES:
        create_journey(customer_id, life_event)
    for q in clients:
        await q.put(data)
    return {"status": "broadcasted"}

@app.get("/stream")
async def sse_stream(request: Request):
    q = asyncio.Queue()
    clients.append(q)
    async def gen():
        try:
            while True:
                action = await q.get()
                yield f"data: {json.dumps(action)}\n\n"
        except asyncio.CancelledError:
            clients.remove(q)
    return StreamingResponse(gen(), media_type="text/event-stream")

@app.get("/api/events/recent")
async def get_recent_events():
    try:
        return {"events": list(events_col.find({}, {"_id": 0}).sort("timestamp", -1).limit(20))}
    except Exception as e:
        return {"events": [], "error": str(e)}

@app.get("/api/stats")
async def get_stats():
    try:
        total_events = events_col.count_documents({})
        credits = list(events_col.find({"type": "CREDIT"}, {"amount": 1, "_id": 0}))
        debits = list(events_col.find({"type": "DEBIT"}, {"amount": 1, "_id": 0}))
        total_credits = sum(e.get("amount", 0) for e in credits)
        total_debits = sum(e.get("amount", 0) for e in debits)
        active_journeys = journeys_col.count_documents({"status": "ACTIVE"})
        return {
            "total_events": total_events,
            "total_credits": total_credits,
            "total_debits": total_debits,
            "balance": 42500.50 + total_credits - total_debits,
            "active_agents": 3,
            "active_journeys": active_journeys,
        }
    except Exception as e:
        return {"total_events": 0, "balance": 42500.50, "error": str(e)}

@app.post("/api/consents")
async def submit_consent(payload: ConsentPayload):
    consent_id = f"con_{uuid.uuid4().hex[:8]}"
    now = datetime.utcnow().isoformat()

    try:
        consents_col.insert_one({
            "consent_id": consent_id, "customer_id": payload.customer_id,
            "action_id": payload.action_id, "journey_id": payload.journey_id,
            "proposed_action": payload.proposed_action, "decision": payload.decision,
            "parameters": payload.parameters or {}, "created_at": now,
        })
    except Exception as e:
        print(f"Consent DB error: {e}")

    write_audit(f"CONSENT_{payload.decision}", payload.customer_id, {
        "consent_id": consent_id, "proposed_action": payload.proposed_action
    })

    execution_result = None
    if payload.decision == "APPROVED":
        handler = EXECUTION_HANDLERS.get(payload.proposed_action)
        if handler:
            execution_result = handler(payload.customer_id, payload.parameters)
            try:
                executed_col.insert_one({
                    "execution_id": f"exec_{uuid.uuid4().hex[:8]}",
                    "consent_id": consent_id, "customer_id": payload.customer_id,
                    "action": payload.proposed_action, "result": execution_result,
                    "executed_at": now,
                })
            except Exception as e:
                print(f"Execution DB error: {e}")
            write_audit("ACTION_EXECUTED", "execution_service", {
                "consent_id": consent_id, "result": execution_result.get("result")
            })

    journey_update = None
    if payload.decision == "APPROVED" and payload.proposed_action:
        journey_update = advance_journey(payload.customer_id, payload.proposed_action)

    sse_payload = {
        "type": "CONSENT_RESULT", "consent_id": consent_id,
        "action_id": payload.action_id, "decision": payload.decision,
        "execution_result": execution_result, "journey_update": journey_update,
    }
    for q in clients:
        await q.put(sse_payload)

    return {"status": "success", "consent_id": consent_id,
            "decision": payload.decision, "execution_result": execution_result}

@app.get("/api/consents/{customer_id}")
async def get_consents(customer_id: str):
    try:
        return {"consents": list(consents_col.find({"customer_id": customer_id}, {"_id": 0}).sort("created_at", -1).limit(50))}
    except Exception as e:
        return {"consents": [], "error": str(e)}

@app.get("/api/audit-log")
async def get_audit_log():
    try:
        return {"audit_log": list(audit_col.find({}, {"_id": 0}).sort("timestamp", -1).limit(100))}
    except Exception as e:
        return {"audit_log": [], "error": str(e)}

@app.get("/api/journeys/{customer_id}")
async def get_journeys(customer_id: str):
    try:
        return {"journeys": list(journeys_col.find({"customer_id": customer_id}, {"_id": 0}).sort("created_at", -1).limit(20))}
    except Exception as e:
        return {"journeys": [], "error": str(e)}

@app.get("/api/life-events/{customer_id}")
async def get_life_events(customer_id: str):
    try:
        return {"life_events": list(life_events_col.find({"customer_id": customer_id}, {"_id": 0}).sort("detected_at", -1).limit(20))}
    except Exception as e:
        return {"life_events": [], "error": str(e)}

@app.get("/api/agent-actions/{customer_id}")
async def get_agent_actions(customer_id: str):
    try:
        raw = list(actions_col.find({"customer_id": customer_id}, {"_id": 0}).sort("created_at", -1).limit(20))
        consented_ids = set()
        for c in consents_col.find({"customer_id": customer_id}, {"action_id": 1, "decision": 1}):
            consented_ids.add(c.get("action_id"))
        for a in raw:
            a["consented"] = a.get("id") in consented_ids
        return {"actions": raw}
    except Exception as e:
        return {"actions": [], "error": str(e)}

@app.get("/health")
async def health_check():
    mongo_ok = False
    try:
        mongo_client.admin.command("ping")
        mongo_ok = True
    except Exception:
        pass
    return {
        "status": "ok" if mongo_ok else "degraded",
        "mongo": "connected" if mongo_ok else "disconnected",
        "kafka": "connected" if kafka_producer else "standalone",
        "llm": "gemini" if genai_client else "mock",
        "mode": "standalone" if STANDALONE else "distributed",
    }

@app.get("/")
async def root():
    return {"status": "online", "mode": "standalone" if STANDALONE else "distributed",
            "message": "SBI FlowSense API running. Frontend at http://localhost:5173"}
