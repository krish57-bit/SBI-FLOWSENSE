import os
import json
import uuid
from datetime import datetime
from confluent_kafka import Consumer, Producer
from pymongo import MongoClient

KAFKA_BROKER = os.getenv("KAFKA_BROKER", "localhost:9092")
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
IN_TOPIC = "life-events"
OUT_TOPIC = "agent-actions"

client = MongoClient(MONGO_URI)
db = client.flowsense
actions_collection = db.agent_actions

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY:
    from google import genai
    genai_client = genai.Client(api_key=GEMINI_API_KEY)
else:
    genai_client = None


AGENT_ROUTING = {
    "FIRST_SALARY": "acquisition",
    "RELOCATION": "lifestyle",
    "PAYMENT_STRESS": "engagement",
}

MOCK_RESPONSES = {
    "FIRST_SALARY": {
        "title": "Salary Credited! \U0001f389",
        "message": "We noticed a large credit. Upgrade to an SBI Salary Account for zero-balance benefits and free debit card.",
        "suggested_action": "OPEN_SALARY_ACCOUNT",
        "action_label": "Explore Benefits",
    },
    "RELOCATION": {
        "title": "New Place? \U0001f3e0",
        "message": "Set up auto-pay for your rent so you never miss a deadline while settling in.",
        "suggested_action": "SETUP_AUTOPAY",
        "action_label": "Set up Auto-pay",
    },
    "PAYMENT_STRESS": {
        "title": "We're Here to Help \U0001f91d",
        "message": "We noticed some payment pressure. Let us help restructure your dues with a lower EMI plan.",
        "suggested_action": "RESTRUCTURE_EMI",
        "action_label": "View Options",
    },
}


def generate_agent_action(life_event):
    event_type = life_event.get("type")
    customer_id = life_event.get("customer_id")
    confidence = life_event.get("confidence", 0)
    agent = AGENT_ROUTING.get(event_type, "general")

    prompt = f"""
    You are the {agent} AI Banking Agent for SBI FlowSense.
    A customer ({customer_id}) just experienced a life event: {event_type} (confidence: {confidence}).
    Generate a JSON response with a personalized, helpful nudge.
    Format:
    {{
      "title": "Short title",
      "message": "Friendly, professional message",
      "suggested_action": "e.g., OPEN_SALARY_ACCOUNT or START_SIP",
      "action_label": "Button text"
    }}
    """

    action_data = None

    if genai_client:
        try:
            response = genai_client.models.generate_content(
                model="gemini-2.5-pro",
                contents=prompt,
                config={"response_mime_type": "application/json"},
            )
            action_data = json.loads(response.text)
        except Exception as e:
            print(f"LLM Error: {e}")

    if not action_data:
        action_data = MOCK_RESPONSES.get(event_type)
        if not action_data:
            action_data = {
                "title": "FlowSense Insight",
                "message": f"We detected a {event_type.replace('_', ' ').lower()} event. Tap to learn more.",
                "suggested_action": "VIEW_DETAILS",
                "action_label": "Learn More",
            }

    action_data["id"] = f"act_{uuid.uuid4().hex[:8]}"
    action_data["customer_id"] = customer_id
    action_data["life_event"] = event_type
    action_data["life_event_id"] = life_event.get("life_event_id")
    action_data["agent"] = agent
    action_data["confidence"] = confidence
    action_data["timestamp"] = datetime.utcnow().isoformat()

    return action_data


def main():
    print(f"Starting Journey Orchestrator... consuming from '{IN_TOPIC}'")

    consumer = Consumer({
        "bootstrap.servers": KAFKA_BROKER,
        "group.id": f"orchestrator-group-{uuid.uuid4().hex[:8]}",
        "auto.offset.reset": "earliest",
    })

    producer = Producer({"bootstrap.servers": KAFKA_BROKER})

    consumer.subscribe([IN_TOPIC])

    try:
        while True:
            msg = consumer.poll(1.0)
            if msg is None:
                continue
            if msg.error():
                print(f"Consumer error: {msg.error()}")
                continue

            try:
                life_event = json.loads(msg.value().decode("utf-8"))
                print(f"Received life event: {life_event.get('type')} for {life_event.get('customer_id')}")

                action = generate_agent_action(life_event)

                print(f"Generated {action['agent']} agent action for {action['customer_id']}")
                actions_collection.insert_one(action.copy())

                if "_id" in action:
                    del action["_id"]

                producer.produce(
                    OUT_TOPIC,
                    key=action["customer_id"].encode("utf-8"),
                    value=json.dumps(action).encode("utf-8"),
                )
                producer.flush()

                import requests
                try:
                    requests.post(
                        "http://localhost:8001/internal/push-action",
                        json=action,
                        timeout=2,
                    )
                except Exception as req_err:
                    print(f"Could not push to frontend: {req_err}")

            except Exception as e:
                print(f"Error processing life event: {e}")

    except KeyboardInterrupt:
        pass
    finally:
        consumer.close()


if __name__ == "__main__":
    main()
