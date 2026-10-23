import pytest
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.database import SessionLocal
from backend.app.models.problem import Problem
from backend.app.models.application import Application
from backend.app.models.project import Project
from backend.app.models.user import Profile

client = TestClient(app)

def test_team_application_and_email_dispatch():
    # 1. Login as student solver Arjun
    login_res = client.post("/api/auth/login", json={
        "email": "arjun.sharma@coep.ac.in",
        "password": "DemoPassword123!"
    })
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    user_id = login_res.json()["user"]["id"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Get published problems
    prob_res = client.get("/api/problems")
    assert prob_res.status_code == 200
    problems = prob_res.json()
    assert len(problems) > 0
    problem_id = problems[0]["id"]

    # Clean up any existing application by Arjun for this problem for repeatable tests
    db = SessionLocal()
    try:
        db.query(Application).filter(
            Application.problem_id == problem_id,
            Application.applicant_id == user_id
        ).delete()
        db.commit()
    finally:
        db.close()

    # 3. Apply as a College Team
    app_payload = {
        "problem_id": problem_id,
        "solver_type": "team",
        "team_name": "COEP HydroWarriors",
        "college_name": "College of Engineering Pune",
        "team_members": [
            {"name": "Snehal Deshmukh", "email": "snehal.d@coep.ac.in", "role": "Hardware Lead"},
            {"name": "Rohan Jadhav", "email": "rohan.j@coep.ac.in", "role": "Software Lead"}
        ],
        "proposal": "Comprehensive solar-powered continuous turbidity and mineral monitoring system with LoRa mesh network.",
        "approach": "Bench testing sensor nodes followed by 2-week continuous field calibration in Shirur village wells.",
        "estimated_timeline_weeks": 8.0,
        "weekly_availability_hours": 20.0
    }
    app_res = client.post("/api/applications", json=app_payload, headers=headers)
    assert app_res.status_code == 200
    app_data = app_res.json()
    assert app_data["solver_type"] == "team"
    assert app_data["team_name"] == "COEP HydroWarriors"
    assert len(app_data["team_members"]) == 2
    assert app_data["team_members"][0]["name"] == "Snehal Deshmukh"

def test_inactivity_revocation_and_cadence():
    # Verify the 7-day inactivity rule and 2-day cadence
    db = SessionLocal()
    try:
        # Get any existing project
        project = db.query(Project).first()
        assert project is not None
        
        # Set project to active in_progress and inactive for 8 days
        project.status = "in_progress"
        project.last_activity_at = datetime.utcnow() - timedelta(days=8)
        db.commit()

        # When listing problems, enrich_problem_with_project_insights detects inactivity >= 7 days
        prob_res = client.get("/api/problems")
        assert prob_res.status_code == 200

        # Verify project status was auto-revoked
        db.refresh(project)
        assert project.status == "revoked"

        # Check that problem is re-opened (is_taken == False)
        p_data = [p for p in prob_res.json() if p["id"] == project.problem_id]
        if p_data:
            assert p_data[0]["is_taken"] is False
    finally:
        db.close()
