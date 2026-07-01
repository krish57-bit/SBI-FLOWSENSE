"""
Seed realistic customer data into MongoDB for demo purposes.
Run: python seed_data.py
"""
import os
import uuid
from datetime import datetime, timedelta
from pymongo import MongoClient

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
client = MongoClient(MONGO_URI)
db = client.flowsense

def seed():
    print("Seeding SBI FlowSense demo data...")

    # Clear existing data
    for col_name in ["events", "life_events", "journeys", "agent_actions", "consents", "executed_actions", "audit_log"]:
        db[col_name].delete_many({})
    print("  Cleared existing collections.")

    now = datetime.utcnow()
    customer_id = "cust_123"
    events = []

    # Generate 30 days of realistic transaction history
    transactions = [
        # Regular spending pattern in Mumbai
        {"days_ago": 28, "type": "DEBIT", "amount": 450, "merchant": "Swiggy", "city": "Mumbai"},
        {"days_ago": 27, "type": "DEBIT", "amount": 120, "merchant": "Uber", "city": "Mumbai"},
        {"days_ago": 25, "type": "DEBIT", "amount": 2500, "merchant": "BigBasket", "city": "Mumbai"},
        {"days_ago": 24, "type": "DEBIT", "amount": 999, "merchant": "Netflix", "city": "Mumbai"},
        {"days_ago": 22, "type": "DEBIT", "amount": 350, "merchant": "Zomato", "city": "Mumbai"},
        {"days_ago": 20, "type": "DEBIT", "amount": 1500, "merchant": "Amazon", "city": "Mumbai"},
        {"days_ago": 18, "type": "DEBIT", "amount": 800, "merchant": "Myntra", "city": "Mumbai"},
        {"days_ago": 15, "type": "DEBIT", "amount": 3200, "merchant": "DMart", "city": "Mumbai"},
        {"days_ago": 14, "type": "DEBIT", "amount": 200, "merchant": "Starbucks", "city": "Mumbai"},
        {"days_ago": 12, "type": "DEBIT", "amount": 650, "merchant": "Swiggy", "city": "Mumbai"},
        {"days_ago": 10, "type": "DEBIT", "amount": 4500, "merchant": "Croma Electronics", "city": "Mumbai"},
        {"days_ago": 8, "type": "DEBIT", "amount": 280, "merchant": "Uber", "city": "Mumbai"},
        {"days_ago": 7, "type": "DEBIT", "amount": 1200, "merchant": "BookMyShow", "city": "Mumbai"},
        {"days_ago": 5, "type": "DEBIT", "amount": 550, "merchant": "Zomato", "city": "Mumbai"},
        {"days_ago": 4, "type": "DEBIT", "amount": 8500, "merchant": "Electricity Bill - MSEB", "city": "Mumbai"},
        {"days_ago": 3, "type": "DEBIT", "amount": 1800, "merchant": "Airtel Mobile", "city": "Mumbai"},
        {"days_ago": 2, "type": "DEBIT", "amount": 320, "merchant": "Swiggy", "city": "Mumbai"},
        {"days_ago": 1, "type": "DEBIT", "amount": 900, "merchant": "BigBasket", "city": "Mumbai"},
        # Small credits (cashbacks, refunds)
        {"days_ago": 20, "type": "CREDIT", "amount": 150, "merchant": "Cashback - SBI Card", "city": "Mumbai"},
        {"days_ago": 10, "type": "CREDIT", "amount": 500, "merchant": "Refund - Amazon", "city": "Mumbai"},
    ]

    for txn in transactions:
        event_id = f"evt_{uuid.uuid4().hex[:8]}"
        ts = (now - timedelta(days=txn["days_ago"], hours=int(uuid.uuid4().hex[:2], 16) % 12, minutes=int(uuid.uuid4().hex[:2], 16) % 60)).isoformat()
        events.append({
            "event_id": event_id,
            "customer_id": customer_id,
            "type": txn["type"],
            "amount": txn["amount"],
            "merchant": txn["merchant"],
            "city": txn["city"],
            "timestamp": ts,
        })

    db.events.insert_many(events)
    print(f"  Inserted {len(events)} transaction events.")

    # Seed audit log entries
    db.audit_log.insert_many([
        {"audit_id": f"aud_{uuid.uuid4().hex[:8]}", "action": "SYSTEM_INITIALIZED",
         "actor": "system", "details": {"customer_id": customer_id, "mode": "standalone"},
         "timestamp": (now - timedelta(days=30)).isoformat()},
        {"audit_id": f"aud_{uuid.uuid4().hex[:8]}", "action": "EVENT_INGESTED",
         "actor": customer_id, "details": {"count": len(events)},
         "timestamp": now.isoformat()},
    ])
    print("  Inserted audit log entries.")

    print("")
    print("Done! The demo is ready with:")
    print(f"  - {len(events)} historical transactions")
    print(f"  - Customer: {customer_id} (Rahul Kumar)")
    print(f"  - City: Mumbai")
    print("")
    print("Now simulate a salary credit or rent payment in the UI to trigger life events.")

if __name__ == "__main__":
    seed()
