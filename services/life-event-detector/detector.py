import os
import json
import uuid
from datetime import datetime, timedelta
from confluent_kafka import Consumer, Producer
from pymongo import MongoClient

KAFKA_BROKER = os.getenv("KAFKA_BROKER", "localhost:9092")
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")

IN_TOPICS = ["transaction-events", "behavior-events"]
OUT_TOPIC = "life-events"

client = MongoClient(MONGO_URI)
db = client.flowsense
events_collection = db.events
life_events_collection = db.life_events


def detect_first_salary(event, history):
    if event.get("type") != "CREDIT":
        return None
    if event.get("amount", 0) <= 50000:
        return None
    merchant = event.get("merchant", "").upper()
    salary_keywords = ["EMPLOYER", "SALARY", "CORP", "PVT", "LTD", "PAYROLL", "NEFT"]
    if not any(kw in merchant for kw in salary_keywords):
        if event.get("amount", 0) <= 70000:
            return None

    prior_salaries = [
        e for e in history
        if e.get("type") == "CREDIT" and e.get("amount", 0) > 50000
    ]
    if len(prior_salaries) > 1:
        return None

    return {
        "type": "FIRST_SALARY",
        "confidence": 0.91 if any(kw in merchant for kw in salary_keywords) else 0.72,
    }


def detect_relocation(event, history):
    if event.get("type") != "DEBIT":
        return None
    merchant = event.get("merchant", "").upper()
    if "RENT" not in merchant:
        return None

    current_city = event.get("city", "")
    if not current_city:
        return None

    prior_cities = set(
        e.get("city", "") for e in history
        if e.get("city") and e.get("city") != current_city
    )

    if not prior_cities:
        return None

    return {
        "type": "RELOCATION",
        "confidence": 0.85,
        "metadata": {"from_cities": list(prior_cities), "to_city": current_city},
    }


def detect_payment_stress(event, history):
    if event.get("type") != "DEBIT":
        return None
    merchant = event.get("merchant", "").upper()
    stress_keywords = ["MINIMUM DUE", "CREDIT CARD", "EMI BOUNCE", "PENALTY", "LATE FEE"]
    if not any(kw in merchant for kw in stress_keywords):
        return None

    stress_events = [
        e for e in history
        if any(kw in e.get("merchant", "").upper() for kw in stress_keywords)
    ]
    if len(stress_events) < 2:
        return None

    return {
        "type": "PAYMENT_STRESS",
        "confidence": 0.78,
        "metadata": {"stress_event_count": len(stress_events) + 1},
    }


DETECTORS = [detect_first_salary, detect_relocation, detect_payment_stress]


def get_customer_history(customer_id, days=90):
    cutoff = (datetime.utcnow() - timedelta(days=days)).isoformat()
    try:
        return list(
            events_collection.find(
                {"customer_id": customer_id, "timestamp": {"$gte": cutoff}},
                {"_id": 0},
            ).sort("timestamp", -1).limit(200)
        )
    except Exception as e:
        print(f"History fetch error: {e}")
        return []


def check_duplicate(customer_id, life_event_type):
    recent_cutoff = (datetime.utcnow() - timedelta(hours=24)).isoformat()
    existing = life_events_collection.find_one({
        "customer_id": customer_id,
        "type": life_event_type,
        "detected_at": {"$gte": recent_cutoff},
    })
    return existing is not None


def process_event(event_data, producer):
    customer_id = event_data.get("customer_id")
    if not customer_id:
        return

    history = get_customer_history(customer_id)

    for detector in DETECTORS:
        result = detector(event_data, history)
        if result is None:
            continue

        if check_duplicate(customer_id, result["type"]):
            print(f"Skipping duplicate {result['type']} for {customer_id}")
            continue

        life_event = {
            "life_event_id": f"le_{uuid.uuid4().hex[:8]}",
            "customer_id": customer_id,
            "type": result["type"],
            "confidence": result["confidence"],
            "detected_at": datetime.utcnow().isoformat(),
            "evidence_events": [event_data.get("event_id", "unknown")],
            "metadata": result.get("metadata", {}),
        }

        try:
            life_events_collection.insert_one(life_event.copy())
        except Exception as e:
            print(f"MongoDB life_event error: {e}")

        if "_id" in life_event:
            del life_event["_id"]

        try:
            producer.produce(
                OUT_TOPIC,
                key=customer_id.encode("utf-8"),
                value=json.dumps(life_event).encode("utf-8"),
            )
            producer.flush()
            print(f"Detected {result['type']} for {customer_id} (confidence: {result['confidence']})")
        except Exception as e:
            print(f"Kafka produce error: {e}")


def main():
    print(f"Starting Life-Event Detector... connecting to Kafka at {KAFKA_BROKER}")

    consumer = Consumer({
        "bootstrap.servers": KAFKA_BROKER,
        "group.id": f"life-event-detector-{uuid.uuid4().hex[:8]}",
        "auto.offset.reset": "earliest",
    })

    producer = Producer({"bootstrap.servers": KAFKA_BROKER})

    consumer.subscribe(IN_TOPICS)
    print(f"Subscribed to topics: {IN_TOPICS}")
    print(f"Publishing life events to: {OUT_TOPIC}")

    try:
        while True:
            msg = consumer.poll(1.0)
            if msg is None:
                continue
            if msg.error():
                print(f"Consumer error: {msg.error()}")
                continue

            try:
                event_data = json.loads(msg.value().decode("utf-8"))
                process_event(event_data, producer)
            except Exception as e:
                print(f"Error processing message: {e}")

    except KeyboardInterrupt:
        pass
    finally:
        consumer.close()


if __name__ == "__main__":
    main()
