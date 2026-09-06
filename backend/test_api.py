import sys
import os
import uuid

# Ensure backend directory is in python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "backend"))

from fastapi.testclient import TestClient
from app import app
from database import init_db

# Initialize database schema
init_db()

client = TestClient(app)

def run_tests():
    print("=" * 60)
    print("STARTING SOLISIQ FASTAPI MIGRATION ENDPOINT TEST SUITE")
    print("=" * 60)

    # 1. Health and Meta
    print("\n[1] Testing / and /health...")
    res = client.get("/")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    assert res.json() == {"message": "SolisIQ backend is running"}, f"Unexpected: {res.json()}"
    print("  [PASS] GET / => 200 OK")

    res = client.get("/health")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    assert res.json() == {"status": "ok"}, f"Unexpected: {res.json()}"
    print("  [PASS] GET /health => 200 OK")

    # 2. OpenAPI / Swagger Docs
    print("\n[2] Testing Swagger /docs and OpenAPI...")
    res = client.get("/docs")
    assert res.status_code == 200
    print("  [PASS] GET /docs => 200 OK")

    res = client.get("/openapi.json")
    assert res.status_code == 200
    assert "paths" in res.json()
    print("  [PASS] GET /openapi.json => 200 OK")

    # 3. Weather
    print("\n[3] Testing /weather...")
    res = client.get("/weather?city=New Delhi")
    assert res.status_code == 200
    weather = res.json()
    for key in ["temperature", "cloudcover", "humidity", "windspeed", "radiation"]:
        assert key in weather, f"Missing weather key: {key}"
    print(f"  [PASS] GET /weather => 200 OK (Telemetry: temp={weather['temperature']}, radiation={weather['radiation']})")

    res = client.get("/weather?city=")
    assert res.status_code == 400
    print("  [PASS] GET /weather (empty city) => 400 Bad Request")

    # 4. Authentication (Signup, Login, Profile)
    print("\n[4] Testing User Authentication & Token Expiry/Errors...")
    random_user = f"testuser_{uuid.uuid4().hex[:6]}"
    random_email = f"{random_user}@example.com"
    password = "TestPassword@123"

    res = client.post("/signup", json={"username": random_user, "email": random_email, "password": password})
    assert res.status_code == 200, f"Signup failed: {res.text}"
    assert res.json()["message"] == "User registered successfully."
    print("  [PASS] POST /signup => 200 OK")

    # Duplicate signup should fail with 409
    res = client.post("/signup", json={"username": random_user, "email": random_email, "password": password})
    assert res.status_code == 409
    print("  [PASS] POST /signup (duplicate) => 409 Conflict")

    # Invalid password login
    res = client.post("/login", json={"email": random_email, "password": "WrongPassword"})
    assert res.status_code == 401
    print("  [PASS] POST /login (wrong password) => 401 Unauthorized")

    # Successful login
    res = client.post("/login", json={"email": random_email, "password": password})
    assert res.status_code == 200
    data = res.json()
    assert "token" in data
    assert data["user"]["email"] == random_email
    user_token = data["token"]
    user_id = data["user"]["id"]
    print(f"  [PASS] POST /login => 200 OK (User ID: {user_id})")

    # Profile endpoint with valid token
    res = client.get("/profile", headers={"Authorization": f"Bearer {user_token}"})
    assert res.status_code == 200
    assert res.json()["user"]["username"] == random_user
    print("  [PASS] GET /profile (authorized) => 200 OK")

    # Profile endpoint with invalid token
    res = client.get("/profile", headers={"Authorization": "Bearer invalid_token_123"})
    assert res.status_code == 401
    print("  [PASS] GET /profile (invalid token) => 401 Unauthorized")

    # Profile endpoint missing token
    res = client.get("/profile")
    assert res.status_code == 401
    print("  [PASS] GET /profile (missing token) => 401 Unauthorized")

    # 5. Admin Authentication & Authorization
    print("\n[5] Testing Admin Authentication & RBAC...")
    admin_user = os.getenv("ADMIN_USERNAME", "admin")
    admin_pass = os.getenv("ADMIN_PASSWORD", "Admin@123")

    res = client.post("/admin/login", json={"username": admin_user, "password": admin_pass})
    assert res.status_code == 200, f"Admin login failed: {res.text}"
    admin_data = res.json()
    assert admin_data["isAdmin"] is True
    admin_token = admin_data["token"]
    print("  [PASS] POST /admin/login => 200 OK")

    # Normal user accessing admin endpoint should return 403
    res = client.get("/admin/stats", headers={"Authorization": f"Bearer {user_token}"})
    assert res.status_code == 403
    print("  [PASS] GET /admin/stats (user token) => 403 Forbidden")

    # Admin accessing admin stats
    res = client.get("/admin/stats", headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == 200
    stats = res.json()
    assert "total_users" in stats
    assert "total_calculations" in stats
    print(f"  [PASS] GET /admin/stats (admin token) => 200 OK (Total Users: {stats['total_users']}, Calcs: {stats['total_calculations']})")

    # Admin accessing admin users
    res = client.get("/admin/users", headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == 200
    assert "users" in res.json()
    print("  [PASS] GET /admin/users (admin token) => 200 OK")

    # 6. ML Prediction
    print("\n[6] Testing ML Prediction /predict...")
    res = client.post(
        "/predict",
        json={
            "temperature": 32.5,
            "cloudcover": 15.0,
            "humidity": 45.0,
            "windspeed": 12.0,
            "radiation": 22.0,
        },
    )
    assert res.status_code == 200
    assert "predicted_energy_output_kwh" in res.json()
    predicted_val = res.json()["predicted_energy_output_kwh"]
    assert predicted_val > 0
    print(f"  [PASS] POST /predict => 200 OK (Predicted Energy Output: {predicted_val} kWh)")

    # 7. CRITICAL ROOFTOP TEST
    print("\n[7] CRITICAL ROOFTOP TEST: 600 sq ft roof, INR 34,979 bill, INR 7/kWh tariff...")
    res = client.post(
        "/calculate-roi",
        json={
            "monthlyBill": 34979.0,
            "rooftopArea": 600.0,
            "tariffRate": 7.0,
            "state": "Delhi",
            "city": "New Delhi",
            "predicted_output": predicted_val,
        },
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert res.status_code == 200, f"Calculation failed: {res.text}"
    roi = res.json()

    print(f"  Monthly units: {roi['monthly_units_kwh']} kWh")
    print(f"  Required capacity: {roi['required_capacity_kw']} kW")
    print(f"  Required panels: {roi['required_panels']}")
    print(f"  Usable roof: {roi['usable_roof_area_sqft']} sq ft")
    print(f"  Max physical panels: {roi['max_physical_panels']}")
    print(f"  Max physical capacity: {roi['max_physical_capacity_kw']} kW")
    print(f"  Recommended panels: {roi['panel_count']}")
    print(f"  Recommended capacity: {roi['recommended_capacity_kw']} kW")
    print(f"  is_roof_constrained: {roi['is_roof_constrained']}")
    print(f"  Constraint message: '{roi['constraint_message']}'")

    assert roi["panel_count"] == 19, f"Expected 19 panels, got {roi['panel_count']}"
    assert roi["number_of_panels"] == 19
    assert roi["recommended_capacity_kw"] == 7.6
    assert roi["max_physical_panels"] == 19
    assert roi["max_physical_capacity_kw"] == 7.6
    assert roi["required_panels"] == 105
    assert roi["is_roof_constrained"] is True
    assert roi["usable_roof_area_sqft"] == 420.0
    print("  [PASS] CRITICAL ROOFTOP TEST PASSED: EXACTLY 19 PANELS (Capped at physical rooftop limits)!")

    # 8. Additional Rooftop Tests
    print("\n[8] Testing multiple roof sizes (300, 1000, 1500, 2500 sq ft)...")
    for area in [300, 1000, 1500, 2500]:
        r = client.post(
            "/calculate-roi",
            json={
                "monthlyBill": 5000.0,
                "rooftopArea": float(area),
                "tariffRate": 7.0,
                "state": "Delhi",
            },
        )
        assert r.status_code == 200
        d = r.json()
        usable_area = float(area) * 0.70
        max_panels = int(usable_area // 21.02)
        assert d["panel_count"] <= max_panels, f"Panels {d['panel_count']} exceeded max {max_panels} for {area} sq ft"
        assert d["roof_area_required_sq_ft"] <= usable_area + 0.1
        print(f"  [PASS] Roof {area} sq ft: {d['panel_count']} panels ({d['recommended_capacity_kw']} kW), usable={usable_area:.1f} sq ft, footprint={d['roof_area_required_sq_ft']} sq ft")

    # 9. Carbon Footprint
    print("\n[9] Testing /carbon-footprint...")
    res = client.post("/carbon-footprint", json={"energyOutputKwh": 10944.0})
    assert res.status_code == 200
    carbon = res.json()
    assert "co2_saved_kg" in carbon
    assert "tree_equivalent" in carbon
    print(f"  [PASS] POST /carbon-footprint => 200 OK (CO2 Saved: {carbon['co2_saved_kg']} kg, Trees: {carbon['tree_equivalent']})")

    # 10. Subsidies
    print("\n[10] Testing /subsidy-info...")
    res = client.get("/subsidy-info?state=Delhi&capacity_kw=7.6")
    assert res.status_code == 200
    sub = res.json()
    assert sub["subsidy_percent"] == 40
    assert sub["subsidy_amount"] == 182400.0
    print(f"  [PASS] GET /subsidy-info => 200 OK ({sub['state']}: {sub['subsidy_percent']}%, Amount: INR {sub['subsidy_amount']})")

    # 11. Seasonal Breakdown
    print("\n[11] Testing /seasonal-breakdown...")
    res = client.get("/seasonal-breakdown?city=New Delhi")
    assert res.status_code == 200
    seasonal = res.json()
    assert "monthly_breakdown" in seasonal
    assert len(seasonal["monthly_breakdown"]) == 12
    print(f"  [PASS] GET /seasonal-breakdown => 200 OK (12 months returned)")

    # 12. Model Comparison
    print("\n[12] Testing /model-comparison...")
    res = client.get("/model-comparison")
    assert res.status_code == 200
    comp = res.json()
    assert "random_forest" in comp
    assert "linear_regression" in comp
    print(f"  [PASS] GET /model-comparison => 200 OK (RF RMSE: {comp['random_forest']['rmse']}, LR RMSE: {comp['linear_regression']['rmse']})")

    # 13. Community Stats
    print("\n[13] Testing /community-stats...")
    res = client.get("/community-stats")
    assert res.status_code == 200
    comm = res.json()
    assert "total_calculations" in comm
    assert "top_cities" in comm
    print(f"  [PASS] GET /community-stats => 200 OK (Total calcs: {comm['total_calculations']})")

    # 14. User Calculation History & Deletion
    print("\n[14] Testing Calculation History & Deletion...")
    res = client.get("/my-calculations", headers={"Authorization": f"Bearer {user_token}"})
    assert res.status_code == 200
    history = res.json().get("history", [])
    assert len(history) >= 1, "Calculation saved during calculate-roi should appear in history"
    calc_id = history[0]["id"]
    print(f"  [PASS] GET /my-calculations => 200 OK ({len(history)} calculations found, Latest ID: {calc_id})")

    # Delete calculation
    res = client.delete(f"/calculation/{calc_id}", headers={"Authorization": f"Bearer {user_token}"})
    assert res.status_code == 200
    print("  [PASS] DELETE /calculation/{id} => 200 OK")

    # Verify deleted
    res = client.get("/my-calculations", headers={"Authorization": f"Bearer {user_token}"})
    remaining_ids = [c["id"] for c in res.json().get("history", [])]
    assert calc_id not in remaining_ids
    print("  [PASS] Verification: Calculation successfully removed from history")

    # 15. PDF Generation
    print("\n[15] Testing /generate-report (ReportLab PDF)...")
    res = client.post(
        "/generate-report",
        json={
            "city": "New Delhi",
            "rooftopArea": 600,
            "monthlyBill": 34979,
            "state": "Delhi",
            "predictedOutput": predicted_val,
            "monthlySavings": 6384,
            "annualSavings": 76608,
            "paybackPeriod": 5.95,
            "co2SavedKg": 8974,
            "treeEquivalent": 427,
        },
    )
    assert res.status_code == 200
    assert res.headers["content-type"] == "application/pdf"
    assert res.content.startswith(b"%PDF-"), "Response does not start with PDF magic bytes"
    print(f"  [PASS] POST /generate-report => 200 OK (Generated valid PDF: {len(res.content)} bytes)")

    # 16. Report stub
    print("\n[16] Testing /report/{user_id} stub...")
    res = client.get("/report/123")
    assert res.status_code == 200
    print("  [PASS] GET /report/{user_id} => 200 OK")

    # 17. Admin Delete User
    print("\n[17] Testing Admin User Deletion (/admin/user/{id})...")
    res = client.delete(f"/admin/user/{user_id}", headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == 200
    print(f"  [PASS] DELETE /admin/user/{user_id} => 200 OK (User successfully cleaned up)")

    print("\n" + "=" * 60)
    print("ALL 17 ENDPOINT TEST CATEGORIES PASSED WITH 100% SUCCESS!")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()
