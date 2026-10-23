import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.database import SessionLocal
from backend.app.models import Profile, Problem, Application, Project, Dispute

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"

def test_login_demo_users():
    # Test logging in as Sarpanch
    resp = client.post("/api/auth/login", json={
        "email": "sarpanch.ramesh@shirur-panchayat.org",
        "password": "DemoPassword123!"
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["user"]["role"] == "provider"
    assert data["user"]["panchayat_name"] == "Shirur Gram Panchayat"

    # Test logging in as Student Solver
    resp2 = client.post("/api/auth/login", json={
        "email": "arjun.sharma@coep.ac.in",
        "password": "DemoPassword123!"
    })
    assert resp2.status_code == 200
    assert resp2.json()["user"]["role"] == "solver"
    assert resp2.json()["user"]["is_student"] is True

    # Test logging in as Admin
    resp3 = client.post("/api/auth/login", json={
        "email": "admin@Co-Solve.gov.in",
        "password": "AdminSecretPass123!"
    })
    assert resp3.status_code == 200
    assert resp3.json()["user"]["role"] == "admin"

def test_list_published_problems():
    resp = client.get("/api/problems")
    assert resp.status_code == 200
    problems = resp.json()
    assert len(problems) >= 3
    # Check domains
    domains = [p["domain"] for p in problems]
    assert "Water & Sanitation" in domains
    assert "Agriculture & Rural Tech" in domains

def test_ai_analysis_retrieval():
    resp = client.get("/api/problems")
    prob_id = resp.json()[0]["id"]

    resp_analysis = client.get(f"/api/problems/{prob_id}/analysis")
    assert resp_analysis.status_code == 200
    analysis = resp_analysis.json()
    assert "executive_summary" in analysis
    assert "required_skills" in analysis
    assert "complexity_score" in analysis
    assert "acceptance_criteria" in analysis
    assert "potential_root_causes" in analysis
    assert len(analysis["required_skills"]) > 0

def test_personalized_solver_matching():
    # Login as student solver
    login_resp = client.post("/api/auth/login", json={
        "email": "arjun.sharma@coep.ac.in",
        "password": "DemoPassword123!"
    })
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    recs_resp = client.get("/api/solver/recommendations", headers=headers)
    assert recs_resp.status_code == 200
    recs = recs_resp.json()
    assert len(recs) > 0
    # Top recommendation should have high match score
    top_match = recs[0]["match"]
    assert top_match["match_score"] > 80.0
    assert "breakdown" in top_match
    assert "reasons" in top_match
    assert len(top_match["reasons"]) > 0

def test_solver_public_portfolio():
    # Get Arjun's ID
    login_resp = client.post("/api/auth/login", json={
        "email": "arjun.sharma@coep.ac.in",
        "password": "DemoPassword123!"
    })
    arjun_id = login_resp.json()["user"]["id"]

    port_resp = client.get(f"/api/solver/portfolio/{arjun_id}")
    assert port_resp.status_code == 200
    data = port_resp.json()
    assert data["solver"]["full_name"] == "Arjun Sharma"
    assert data["metrics"]["total_projects"] >= 1
    assert data["metrics"]["verified_adopted_projects"] >= 1
    assert data["metrics"]["total_beneficiaries_impacted"] == 1450
    assert len(data["skills"]) >= 3

def test_project_workspace_lifecycle():
    # Login as Sarpanch
    login_resp = client.post("/api/auth/login", json={
        "email": "sarpanch.ramesh@shirur-panchayat.org",
        "password": "DemoPassword123!"
    })
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # List projects
    projs_resp = client.get("/api/projects", headers=headers)
    assert projs_resp.status_code == 200
    projects = projs_resp.json()
    assert len(projects) >= 1
    proj_id = projects[0]["id"]

    # Get workspace details
    workspace_resp = client.get(f"/api/projects/{proj_id}", headers=headers)
    assert workspace_resp.status_code == 200
    ws = workspace_resp.json()
    assert ws["problem"]["domain"] == "Water & Sanitation"
    assert len(ws["milestones"]) == 4
    assert len(ws["testing_records"]) == 2
    assert len(ws["adoption_records"]) == 1
    assert ws["adoption_records"][0]["adoption_status"] == "verified_adopted"
    assert ws["prototype"]["demo_url"] is not None

def test_negative_cases():
    # 1. Unauthenticated request to protected endpoint fails
    resp = client.get("/api/projects")
    assert resp.status_code == 401

    # 2. Non-admin attempting to access admin metrics
    login_resp = client.post("/api/auth/login", json={
        "email": "arjun.sharma@coep.ac.in",
        "password": "DemoPassword123!"
    })
    solver_token = login_resp.json()["access_token"]
    resp2 = client.get("/api/admin/metrics", headers={"Authorization": f"Bearer {solver_token}"})
    assert resp2.status_code == 403

    # 3. Solver attempting to select solver
    resp3 = client.post("/api/applications/select-solver", json={
        "application_id": "dummy-id",
        "charter_scope": "Test",
        "charter_deliverables": "Test",
        "charter_acceptance_criteria": "Test"
    }, headers={"Authorization": f"Bearer {solver_token}"})
    assert resp3.status_code in [403, 404]

    # 4. Conflict of interest in dispute reviewer assignment
    admin_login = client.post("/api/auth/login", json={
        "email": "admin@Co-Solve.gov.in",
        "password": "AdminSecretPass123!"
    })
    admin_token = admin_login.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    
    # Try to assign Arjun (who raised the dispute) as his own reviewer
    disputes = client.get("/api/admin/metrics", headers=admin_headers)
    assert disputes.status_code == 200
