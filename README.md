# Samarthya — AI-Powered Societal Challenge Coordination Platform

An end-to-end web application that connects verified village panchayats and grassroots community providers with student and organizational solvers (universities, NGOs, SHGs). The platform leverages structured AI problem decomposition, explainable multi-factor skill matching, binding project charters, and multi-round testing reviews leading to verified community adoption.

---

## 🌟 Key Capabilities & Features

### 1. Verification & Multi-Role Governance
- **Role-Based Access Control (RBAC)**: Enforced both on server dependencies and database models across 4 roles:
  - **Problem Provider**: Gram Panchayat Sarpanches and verified community coordinators.
  - **Individual Solver**: Engineering and university students with skill profiles and availability.
  - **Organization Solver**: University labs, student tech clubs, NGOs, and Self-Help Groups (SHGs) with aggregated team capabilities.
  - **Platform Administrator & Independent Reviewers**: Dispute adjudication, credential audit, problem moderation, and independent review.
- **Privacy by Design**: No raw Aadhaar/PAN cards stored. Identity verification uses sanitized references and protected access-controlled evidence.

### 2. Comprehensive Problem Submission & AI Problem Analyst
- **17 Structured AI Output Dimensions**:
  1. Executive Summary
  2. Problem Statement
  3. Affected Stakeholders
  4. Domain & Subdomains
  5. Potential Root Causes (strictly labeled as hypotheses)
  6. Required Technical & Domain Skills (with 1-5 weighting)
  7. Recommended Team Structure
  8. Complexity Score & Detailed Explanation
  9. Expected Deliverables
  10. Suggested Milestones
  11. Acceptance Criteria
  12. Testing Strategy
  13. Risks & Field Constraints
  14. Missing Information & Clarification Questions
  15. Potential Impact Indicators
  16. Suggested Adoption Strategy
  17. AI Confidence Score & Metadata
- **Prompt Injection Defense**: Sanitization of untrusted user inputs.
- **Provider Authority**: Provider can inspect, edit, and confirm AI-extracted parameters before submitting for publication. AI never auto-publishes without human approval.

### 3. Explainable Multi-Factor Matching Engine
- Multi-factor algorithm ranking candidates on a transparent 0–100 scale:
  - **Required Skills Overlap**: 40%
  - **Domain & Stated Interest**: 20%
  - **Availability & Timeline**: 15%
  - **Prior Experience**: 15%
  - **Fieldwork & Location Fit**: 10%
- **Team Aggregation**: Organizations evaluated on collective team capability and hours pool.
- **Explainability**: Every recommendation details matched skills, missing skills, and narrative reasoning.

### 4. Candidate Review & Project Charter Agreement
- Provider compares applicants using side-by-side match breakdowns.
- Binding **Project Charter** locked prior to execution: Scope, deliverables, testing acceptance criteria, IP terms (Open Public Good / CERN Open Hardware Licence), funding terms, and withdrawal rules.
- Prevents duplicate active project assignments for the same challenge.

### 5. Interactive Project Workspace & Lifecycle
- Lifecycle progression: `Assigned` → `In Progress` → `Prototype Submitted` → `Prototype Review` → `Testing` → `Adoption Review` → `Completed`.
- **Milestones & Tasks Board**: Interactive status toggling, task assignments.
- **Working Prototype Hub**: Demo links, GitHub repository, video links, technical documentation, and known limitations.
- **Multi-Round Testing**: Systematic evaluations against laboratory/field standards with pass/revision/fail decisions. Supports multiple iterative rounds.
- **Adoption Verification**: Real-world evidence, implementation dates, verified beneficiary counts (e.g. 1,450 villagers served), and municipal maintenance plans. Completely independent of prototype code delivery.

### 6. Tamper-Proof Portfolio, Disputes & Audit Ledger
- **Verified Public Portfolios**: Evidence-based credentials tied to verified community impact.
- **Conflict-Free Dispute Adjudication**: Direct parties are prevented from evaluating their own disputes; high-impact cases route to independent reviewers.
- **Cryptographic Audit Log**: Immutable ledger capturing all approvals, assignments, and test outcomes.

---

## 🛠 Tech Stack

- **Backend**: Python 3.14, FastAPI, SQLAlchemy 2.0, Pydantic v2, PyJWT, Bcrypt, Pytest
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React
- **Database**: SQLite for instant zero-dependency local development; PostgreSQL / Supabase ready via `DATABASE_URL`
- **AI Abstraction**: Secure server-side service with OpenAI & Gemini API support + deterministic, high-fidelity offline fallback engine

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Python 3.10+ (tested on Python 3.14)
- Node.js 18+ & npm

### 2. Backend Setup
```bash
# In project root
python -m venv venv
.\venv\Scripts\pip install -r backend/requirements.txt

# Run database seeder (populates realistic challenges & personas)
.\venv\Scripts\python backend/seed.py

# Run backend server
.\venv\Scripts\python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 👥 Demo Personas (1-Click Switcher Available in Top Navbar)

| Persona Name | Role | Email | Password | Key Context |
|---|---|---|---|---|
| **Ramesh Patil** | Problem Provider | `sarpanch.ramesh@shirur-panchayat.org` | `DemoPassword123!` | Sarpanch, Shirur Gram Panchayat (Pune, MH) |
| **Arjun Sharma** | Student Solver | `arjun.sharma@coep.ac.in` | `DemoPassword123!` | COEP Tech Student (IoT, Water Quality, Sensors) |
| **Priya Nair** | Student Solver | `priya.nair@iitb.ac.in` | `DemoPassword123!` | IIT Bombay Student (Computer Vision, Mobile App) |
| **Dr. Vikram Mehta**| Org Solver Lead | `vikram.mehta@ruraltech.org` | `DemoPassword123!` | Director, Rural Tech & Innovation Collective |
| **Dr. Sunita Rao** | Platform Admin | `admin@samarthya.gov.in` | `AdminSecretPass123!` | Platform Moderator & Compliance Lead |
| **Prof. S. Kulkarni**| Independent Reviewer| `dr.kulkarni@iiserpune.ac.in` | `ReviewerPass123!` | Senior Scientist & Independent Audit Committee |

---

## 🧪 Running Automated Tests

```bash
.\venv\Scripts\python -m pytest
```
Output:
```
======================= 8 passed in 10.72s =======================
```
Covering:
- User authentication & role enforcement
- Published problem catalog & filters
- Structured AI analysis retrieval
- Explainable matching engine calculations
- Public verified contribution portfolio
- Project workspace lifecycle transitions
- Negative authorization cases & conflict-of-interest prevention

---

## 🧭 End-to-End Walkthrough Scenario

1. **Inspect Problem Marketplace**:
   - Go to [http://localhost:5173/problems](http://localhost:5173/problems).
   - Filter by `Water & Sanitation` or `Agriculture & Rural Tech`.
   - Click on *"Real-Time Arsenic & Potable Contamination Telemetry for Shirur Borewells"*.
2. **Review AI Problem Analyst Report**:
   - On the challenge details page, click the **AI Problem Report** tab.
   - Observe the 17 structured fields: root cause hypotheses, required competency levels, suggested team, milestones, and testing gates.
3. **Inspect Candidate Matching**:
   - Use the **Demo Persona Switcher** in the top navbar and click **Ramesh Patil (Gram Panchayat Sarpanch)**.
   - Click **Review Applicants & Compare Candidates**.
   - Observe candidate Arjun Sharma with a 94.5% match score, matched skills checklist, and narrative explanation.
4. **Inspect Project Workspace**:
   - Navigate to the active project workspace.
   - Click **Milestones**: see 4 structured milestones and tasks.
   - Click **Prototype**: see live telemetry simulator link, GitHub repo link, test instructions, and known limitations.
   - Click **Testing Rounds**: observe Round 1 (revisions required) and Round 2 (passed with lab validation).
   - Click **Adoption Verification**: observe the confirmed municipal adoption record with Gram Panchayat Resolution #2026/09, 1,450 beneficiaries served, and independent audit by Prof. Sudhir Kulkarni.
5. **View Solver Public Portfolio**:
   - Switch persona to **Arjun Sharma**.
   - Navigate to **Public Portfolio**.
   - Verify that 1,450 beneficiaries, demonstrated skills, and the verified digital credential appear with tamper-proof integrity.
6. **Admin Moderation & Disputes**:
   - Switch persona to **Dr. Sunita Rao (Platform Admin)**.
   - Click **Admin Moderation** in the navbar.
   - Check the **Moderation Queue** (e.g. approve Challenge #4), **Verification Queue**, **Disputes**, and **Immutable Audit Log**.
