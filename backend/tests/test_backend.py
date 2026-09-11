import uuid
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import init_db, Base, engine

# Recreate clean tables for test run
Base.metadata.drop_all(bind=engine)
init_db()

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert data["app"] == "ClarityHub AI"

def test_user_signup_login():
    uid = uuid.uuid4().hex[:8]
    email = f"user_{uid}@example.com"
    password = "SecretPassword123"
    name = "Test User"

    # Signup
    signup_resp = client.post("/auth/signup", json={"email": email, "password": password, "name": name})
    assert signup_resp.status_code == 200
    signup_data = signup_resp.json()
    assert "access_token" in signup_data
    token = signup_data["access_token"]

    # Login
    login_resp = client.post("/auth/login", json={"email": email, "password": password})
    assert login_resp.status_code == 200
    assert "access_token" in login_resp.json()

    # Get /me
    me_resp = client.get("/me", headers={"Authorization": f"Bearer {token}"})
    assert me_resp.status_code == 200
    assert me_resp.json()["email"] == email

def test_subscriptions_flow():
    uid = uuid.uuid4().hex[:8]
    email = f"sub_{uid}@example.com"
    signup_resp = client.post("/auth/signup", json={"email": email, "password": "Password123", "name": "Sub User"})
    assert signup_resp.status_code == 200
    token = signup_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create subscription
    sub_resp = client.post("/subscriptions", json={
        "name": "StreamMax Premium",
        "monthly_cost": 18.99,
        "last_price": 14.99,
        "renewal_date": "2026-10-01",
        "cancel_difficulty_score": 4
    }, headers=headers)

    assert sub_resp.status_code == 200
    sub_data = sub_resp.json()
    assert sub_data["name"] == "StreamMax Premium"

    # List subscriptions
    list_resp = client.get("/subscriptions", headers=headers)
    assert list_resp.status_code == 200
    assert len(list_resp.json()) >= 1

def test_agent_scan_flow():
    uid = uuid.uuid4().hex[:8]
    email = f"agent_{uid}@example.com"
    signup_resp = client.post("/auth/signup", json={"email": email, "password": "Password123", "name": "Agent User"})
    assert signup_resp.status_code == 200
    token = signup_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Trigger agent scan
    scan_resp = client.post("/agent/scan", headers=headers)
    assert scan_resp.status_code == 200
    scan_data = scan_resp.json()
    assert scan_data["status"] == "success"

    # Fetch agent actions queue
    actions_resp = client.get("/agent/actions", headers=headers)
    assert actions_resp.status_code == 200
    actions = actions_resp.json()
    assert len(actions) > 0
    first_action = actions[0]

    # Approve action
    approve_resp = client.post(f"/agent/actions/{first_action['id']}/approve", headers=headers)
    assert approve_resp.status_code == 200
    assert approve_resp.json()["status"] == "approved"
