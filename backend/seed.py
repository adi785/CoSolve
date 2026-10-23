import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import json
from datetime import datetime, timedelta
from backend.app.database import engine, SessionLocal, Base
from backend.app.models import (
    Profile,
    Organization,
    OrganizationMember,
    VerificationRequest,
    SolverSkill,
    SolverInterest,
    Problem,
    AIProblemAnalysis,
    Application,
    Project,
    ProjectMember,
    Milestone,
    Task,
    Deliverable,
    Review,
    TestingRecord,
    AdoptionRecord,
    ImpactMetric,
    Notification,
    Reward,
    Dispute,
    AuditLog
)
from backend.app.services.auth import get_password_hash
from backend.app.services.ai_analyst import AIProblemAnalystService

def seed_database():
    db = SessionLocal()
    try:
        # Check if already seeded
        existing_admin = db.query(Profile).filter(Profile.email == "admin@Co-Solve.gov.in").first()
        if existing_admin:
            print("Database already contains seed data. Skipping re-seed.")
            return

        print("Seeding database with realistic societal challenges and personas...")

        # 1. CREATE USERS
        # Admin
        admin_user = Profile(
            email="admin@Co-Solve.gov.in",
            hashed_password=get_password_hash("AdminSecretPass123!"),
            full_name="Dr. Sunita Rao",
            role="admin",
            verification_status="verified",
            bio="Platform Moderator and Principal Evaluator for Civic Innovation.",
            location="New Delhi, India"
        )

        # Independent Reviewer
        reviewer_user = Profile(
            email="dr.kulkarni@iiserpune.ac.in",
            hashed_password=get_password_hash("ReviewerPass123!"),
            full_name="Prof. Sudhir Kulkarni",
            role="admin",
            verification_status="verified",
            bio="Senior Scientist, Environmental Sensors & Independent Civic Audit Committee.",
            location="Pune, Maharashtra"
        )

        # Provider 1: Gram Panchayat Sarpanch
        provider_panchayat = Profile(
            email="sarpanch.ramesh@shirur-panchayat.org",
            hashed_password=get_password_hash("DemoPassword123!"),
            full_name="Ramesh Patil",
            role="provider",
            provider_type="panchayat_rep",
            panchayat_name="Shirur Gram Panchayat",
            panchayat_state="Maharashtra",
            panchayat_district="Pune",
            designation="Sarpanch (Elected Village Council Head)",
            verification_status="verified",
            bio="Elected village council representative committed to clean drinking water and sustainable rural infrastructure.",
            location="Shirur, Pune, Maharashtra",
            phone="+91-98220-11223"
        )

        # Provider 2: Rural Education NGO Lead
        provider_individual = Profile(
            email="anita.sharma@gramvikas.in",
            hashed_password=get_password_hash("DemoPassword123!"),
            full_name="Anita Sharma",
            role="provider",
            provider_type="individual",
            verification_status="verified",
            bio="Grassroots agricultural cooperative coordinator working with smallholder farmers across western India.",
            location="Nashik, Maharashtra",
            phone="+91-94231-44556"
        )

        # Individual Solver 1: Engineering Student
        solver_student_1 = Profile(
            email="arjun.sharma@coep.ac.in",
            hashed_password=get_password_hash("DemoPassword123!"),
            full_name="Arjun Sharma",
            role="solver",
            is_student=True,
            college_name="College of Engineering Pune (COEP Technological University)",
            graduation_year=2026,
            verification_status="verified",
            bio="Pre-final year Electronics & Telecommunications student passionate about low-power IoT telemetry and water quality monitoring.",
            location="Pune, Maharashtra",
            availability_hours_per_week=18,
            preferred_duration_weeks=10,
            fieldwork_willing=True,
            remote_preference="hybrid",
            portfolio_privacy="public"
        )

        # Individual Solver 2: Computer Vision Student
        solver_student_2 = Profile(
            email="priya.nair@iitb.ac.in",
            hashed_password=get_password_hash("DemoPassword123!"),
            full_name="Priya Nair",
            role="solver",
            is_student=True,
            college_name="Indian Institute of Technology Bombay (IIT Bombay)",
            graduation_year=2025,
            verification_status="verified",
            bio="Final year Computer Science student focusing on lightweight on-device edge ML for vernacular mobile applications.",
            location="Mumbai, Maharashtra",
            availability_hours_per_week=16,
            preferred_duration_weeks=8,
            fieldwork_willing=True,
            remote_preference="remote",
            portfolio_privacy="public"
        )

        # Organization Lead
        org_lead = Profile(
            email="vikram.mehta@ruraltech.org",
            hashed_password=get_password_hash("DemoPassword123!"),
            full_name="Dr. Vikram Mehta",
            role="solver",
            verification_status="verified",
            bio="Director of Rural Technology & Innovation Collective (RTIC).",
            location="Pune, Maharashtra",
            availability_hours_per_week=20,
            fieldwork_willing=True
        )

        # Organization Member
        org_member = Profile(
            email="kavita.deshmukh@ruraltech.org",
            hashed_password=get_password_hash("DemoPassword123!"),
            full_name="Kavita Deshmukh",
            role="solver",
            verification_status="verified",
            bio="Field hydrologist and community water survey specialist.",
            location="Pune, Maharashtra",
            availability_hours_per_week=15,
            fieldwork_willing=True
        )

        db.add_all([
            admin_user,
            reviewer_user,
            provider_panchayat,
            provider_individual,
            solver_student_1,
            solver_student_2,
            org_lead,
            org_member
        ])
        db.flush()

        # 2. CREATE ORGANIZATION
        org = Organization(
            name="Rural Technology & Innovation Collective (RTIC)",
            type="ngo",
            registration_number="MH/2021/PUNE/009182",
            lead_id=org_lead.id,
            description="University-incubated non-profit engineering laboratory building open-source civic hardware and telemetry for rural Indian communities.",
            website="https://ruraltech.example.org",
            verification_status="verified"
        )
        db.add(org)
        db.flush()

        db.add(OrganizationMember(org_id=org.id, user_id=org_lead.id, role="lead"))
        db.add(OrganizationMember(org_id=org.id, user_id=org_member.id, role="coordinator"))

        # 3. SOLVER SKILLS & INTERESTS
        # Arjun skills
        db.add_all([
            SolverSkill(user_id=solver_student_1.id, skill_name="IoT & Sensor Interfacing", proficiency_level="advanced", years_experience=2.5, verified=True),
            SolverSkill(user_id=solver_student_1.id, skill_name="Embedded Systems / Microcontrollers", proficiency_level="advanced", years_experience=2.0, verified=True),
            SolverSkill(user_id=solver_student_1.id, skill_name="Telemetry & Low-Power LoRa/GSM", proficiency_level="intermediate", years_experience=1.5, verified=True),
            SolverSkill(user_id=solver_student_1.id, skill_name="Water Quality Chemistry Basics", proficiency_level="intermediate", years_experience=1.0, verified=False),
            SolverSkill(user_id=solver_student_1.id, skill_name="Python & Fast-API", proficiency_level="advanced", years_experience=3.0, verified=True),
            SolverInterest(user_id=solver_student_1.id, domain="Water & Sanitation"),
            SolverInterest(user_id=solver_student_1.id, domain="Renewable Energy")
        ])

        # Priya skills
        db.add_all([
            SolverSkill(user_id=solver_student_2.id, skill_name="Computer Vision / Edge ML", proficiency_level="advanced", years_experience=2.5, verified=True),
            SolverSkill(user_id=solver_student_2.id, skill_name="Mobile App Development (Flutter/Android)", proficiency_level="advanced", years_experience=2.0, verified=True),
            SolverSkill(user_id=solver_student_2.id, skill_name="Offline-First Synchronization", proficiency_level="intermediate", years_experience=1.5, verified=True),
            SolverSkill(user_id=solver_student_2.id, skill_name="Vernacular UX / Audio Guidance", proficiency_level="intermediate", years_experience=1.0, verified=False),
            SolverInterest(user_id=solver_student_2.id, domain="Agriculture & Rural Tech")
        ])

        # Org Member skills
        db.add_all([
            SolverSkill(user_id=org_member.id, skill_name="Water Quality Chemistry Basics", proficiency_level="expert", years_experience=4.0, verified=True),
            SolverSkill(user_id=org_member.id, skill_name="Community Field Survey", proficiency_level="advanced", years_experience=3.5, verified=True),
            SolverSkill(user_id=org_lead.id, skill_name="Power Electronics / Charge Controllers", proficiency_level="expert", years_experience=6.0, verified=True)
        ])

        # 4. SOCIETAL CHALLENGES
        # Challenge 1: Water Quality Telemetry (Full lifecycle project)
        prob1 = Problem(
            creator_id=provider_panchayat.id,
            title="Real-Time Arsenic & Potable Contamination Telemetry for Shirur Borewells",
            description="Our village water committee relies on 4 public borewells supplying drinking water to 1,450 residents. In summer and post-monsoon, turbidity and mineral contamination spikes cause recurring gastrointestinal infections among schoolchildren. Current laboratory testing takes 3 weeks per cycle. We require a solar-powered, low-cost sensor node with SMS/dashboard telemetry that triggers immediate warnings to the panchayat when safe thresholds are breached.",
            current_situation="Periodic water testing happens manually once every six months, meaning contamination is discovered only after villagers fall ill.",
            root_cause="Unmonitored runoff into shallow groundwater aquifers during unseasonal rains.",
            affected_community="Shirur Village (1,450 residents, 3 schools, 1 primary health sub-centre)",
            beneficiaries_estimate=1450,
            domain="Water & Sanitation",
            category="Potable Water Infrastructure",
            geographic_state="Maharashtra",
            geographic_district="Pune",
            locality="Shirur Taluka",
            expected_outcome="Automated daily telemetry of pH, TDS, and turbidity with village-level alert beacon and panchayat noticeboard integration.",
            constraints="Must operate reliably under direct sunlight and withstand voltage fluctuations; maximum component budget Rs 25,000 per unit.",
            available_resources="Gram Panchayat office electricity, 4 target borewell sites, 2 appointed local youth caretakers for daily inspection.",
            required_skills_declared="IoT & Sensor Interfacing, Embedded Systems / Microcontrollers, Water Quality Chemistry Basics, Telemetry & Low-Power LoRa/GSM",
            preferred_solver_type="any",
            urgency="high",
            deadline=datetime.utcnow() + timedelta(days=60),
            deliverables_text="1. Calibrated sensor node prototype; 2. SMS alert firmware; 3. Bilingual local caretaker handbook; 4. Open-source CAD schematics.",
            acceptance_criteria_text="Accurate detection against laboratory standard test, >95% cellular telemetry uptime over 14 consecutive trial days.",
            testing_approach="Split-sample comparison: sensor node readings tested alongside government district water testing laboratory samples.",
            adoption_plan="Adopted directly by Shirur Village Water & Sanitation Committee with monthly panchayat maintenance fund allocation.",
            funding_model="grant_funded",
            funding_amount=35000.0,
            funding_currency="INR",
            funding_status="secured",
            sponsor_details="District Rural Development Agency (DRDA) Innovation Fund",
            award_conditions="Successful completion of 14-day continuous field trial verified by Gram Panchayat resolution.",
            moderation_status="published",
            moderated_by=admin_user.id,
            moderated_at=datetime.utcnow() - timedelta(days=30),
            view_count=184
        )

        # Challenge 2: Crop Pest Diagnostics (Ready for matching/application)
        prob2 = Problem(
            creator_id=provider_individual.id,
            title="Offline Vernacular Early Blight Diagnostics for Smallholder Tomato & Onion Growers",
            description="Over 300 smallholder farmer families in Dindori block lose up to 40% of their onion and tomato crops to early fungal blight because symptoms are recognized too late. Commercial diagnostic apps require 4G internet (which is absent in fields) and use complex English terminology. We need an offline-first mobile tool that operates on entry-level Android devices and provides voice-guided remedies in Marathi.",
            current_situation="Farmers rely on guesswork or pesticide store recommendations, leading to expensive and often incorrect chemical spraying.",
            root_cause="Late recognition of early micro-lesions on foliage and lack of accessible vernacular guidance.",
            affected_community="Dindori Smallholder Vegetable Producers (320 farming households)",
            beneficiaries_estimate=1200,
            domain="Agriculture & Rural Tech",
            category="Smart Agriculture",
            geographic_state="Maharashtra",
            geographic_district="Nashik",
            locality="Dindori",
            expected_outcome="Smartphone app diagnosing top 4 local foliar diseases within 2 seconds offline with regional audio readout.",
            constraints="Must run on Android 9+ smartphones with 2GB RAM; zero cellular data dependency in the field.",
            available_resources="Access to 10 local farms for image collection and validation; support from local Krishi Vigyan Kendra.",
            required_skills_declared="Computer Vision / Edge ML, Mobile App Development (Flutter/Android), Agronomy & Plant Pathology, Offline-First Synchronization",
            preferred_solver_type="individual",
            urgency="medium",
            deadline=datetime.utcnow() + timedelta(days=90),
            deliverables_text="TFLite edge model, Android application APK, documentation on dataset curation, and organic treatment advisory.",
            acceptance_criteria_text="Model inference under 1.5 seconds, >85% accuracy on field images under direct sunlight.",
            testing_approach="Field testing on 25 active farm plots comparing app diagnosis with agronomist inspection.",
            adoption_plan="Distribution through Nashik District Farmer Producer Company with weekly village haat demonstrations.",
            funding_model="prize_based",
            funding_amount=50000.0,
            funding_currency="INR",
            funding_status="pledged",
            sponsor_details="Western India Agritech Fellowship",
            moderation_status="published",
            moderated_by=admin_user.id,
            moderated_at=datetime.utcnow() - timedelta(days=15),
            view_count=142
        )

        # Challenge 3: Tribal Hamlet Solar Micro-Grid (Renewable Energy)
        prob3 = Problem(
            creator_id=provider_panchayat.id,
            title="Smart Solar Micro-Grid Demand Balancing for Remote Tribal Hamlets",
            description="A remote hamlet of 45 households in Gadchiroli depends on a decentralized 5kW solar micro-grid. In the evening, simultaneous connection of high-power inductive loads trips the central inverter, leaving the entire village in total darkness. We seek a low-cost automated load-balancing controller that protects basic household lighting while rationing heavy power appliances.",
            affected_community="Mendha Lekha Hamlet (45 indigenous households)",
            beneficiaries_estimate=230,
            domain="Renewable Energy",
            category="Decentralized Energy",
            geographic_state="Maharashtra",
            geographic_district="Gadchiroli",
            locality="Dhanora Block",
            expected_outcome="Automated priority load-shedding controller that guarantees 5 hours of continuous evening lighting.",
            constraints="IP65 weatherproofing, withstand ambient temperatures up to 47 degrees C.",
            funding_model="voluntary",
            funding_amount=0.0,
            funding_currency="INR",
            funding_status="voluntary",
            moderation_status="published",
            moderated_by=admin_user.id,
            moderated_at=datetime.utcnow() - timedelta(days=5),
            view_count=88
        )

        # Challenge 4: Moderation Queue demo challenge (Under Review)
        prob4 = Problem(
            creator_id=provider_individual.id,
            title="Solar-Powered Evaporative Cold Storage Telemetry for Tomato Harvests",
            description="Kolar district tomato farmers face heavy spoilage during harvest peaks. A zero-electricity evaporative cooling chamber was constructed, but internal temperature and relative humidity need remote monitoring to alert farmers when water re-soaking is required.",
            affected_community="Kolar Vegetable Growers Cooperative (180 farmers)",
            beneficiaries_estimate=650,
            domain="Agriculture & Rural Tech",
            category="Post-Harvest Tech",
            geographic_state="Karnataka",
            geographic_district="Kolar",
            locality="Mulbagal",
            expected_outcome="Low-power solar sensor beacon sending threshold SMS alerts to cooperative managers.",
            funding_model="grant_funded",
            funding_amount=20000.0,
            funding_currency="INR",
            funding_status="planned",
            moderation_status="submitted",  # In moderation queue!
            view_count=12
        )

        db.add_all([prob1, prob2, prob3, prob4])
        db.flush()

        # 5. AI ANALYSES
        for prob in [prob1, prob2, prob3, prob4]:
            analysis = AIProblemAnalystService.generate_analysis({
                "title": prob.title,
                "description": prob.description,
                "domain": prob.domain,
                "affected_community": prob.affected_community,
                "geographic_state": prob.geographic_state,
                "geographic_district": prob.geographic_district,
                "required_skills_declared": prob.required_skills_declared
            })
            ai_obj = AIProblemAnalysis(
                problem_id=prob.id,
                version=1,
                provider="Co-Solve-ai-engine",
                model_name="Co-Solve-analyst-v1.0",
                executive_summary=analysis["executive_summary"],
                problem_statement=analysis["problem_statement"],
                affected_stakeholders=json.dumps(analysis["affected_stakeholders"]),
                domain_detected=analysis["domain_detected"],
                subdomains=json.dumps(analysis["subdomains"]),
                potential_root_causes=json.dumps(analysis["potential_root_causes"]),
                required_skills=json.dumps(analysis["required_skills"]),
                suggested_team_composition=analysis["suggested_team_composition"],
                complexity_score=analysis["complexity_score"],
                complexity_explanation=analysis["complexity_explanation"],
                expected_deliverables=json.dumps(analysis["expected_deliverables"]),
                suggested_milestones=json.dumps(analysis["suggested_milestones"]),
                acceptance_criteria=json.dumps(analysis["acceptance_criteria"]),
                testing_strategy=analysis["testing_strategy"],
                risks_and_constraints=json.dumps(analysis["risks_and_constraints"]),
                missing_information_questions=json.dumps(analysis["missing_information_questions"]),
                impact_indicators=json.dumps(analysis["impact_indicators"]),
                suggested_adoption_strategy=analysis["suggested_adoption_strategy"],
                confidence_score=analysis["confidence_score"],
                is_confirmed_by_provider=True
            )
            db.add(ai_obj)
        db.flush()

        # 6. APPLICATION & COMPLETE PROJECT FOR CHALLENGE 1
        app1 = Application(
            problem_id=prob1.id,
            solver_type="individual",
            applicant_id=solver_student_1.id,
            proposal="We will build 'Jal-Drishti' — an ultra-low-power, solar-charged telemetry node using an ESP32 microcontroller with industrial-grade pH and turbidity sensors, communicating via local GSM/SMS directly to the Gram Panchayat registry.",
            approach="Phase 1: Sensor calibration in COEP environmental engineering lab against buffer solutions. Phase 2: Design IP66 weatherproof enclosure with 5W solar trickle charger. Phase 3: Deploy pilot on Shirur well #2 with 14-day parallel lab sampling.",
            relevant_experience="Developed IoT weather telemetry for agricultural lab; winner of 2024 Smart India Hackathon rural water theme.",
            estimated_timeline_weeks=8.0,
            weekly_availability_hours=18.0,
            team_composition_notes="Arjun Sharma (Hardware & Telemetry Lead) with laboratory testing guidance from COEP Department of Chemistry.",
            match_score_at_application=94.5,
            match_explanation_snapshot="Direct skill overlap on 4/4 required areas, high weekly availability (18h), local geographic proximity in Pune district.",
            status="accepted"
        )
        db.add(app1)
        db.flush()

        # Project Workspace
        proj1 = Project(
            problem_id=prob1.id,
            application_id=app1.id,
            solver_type="individual",
            lead_solver_id=solver_student_1.id,
            status="completed",
            charter_scope="Development, calibration, and 14-day village field trial of Jal-Drishti water telemetry node for Shirur public borewells.",
            charter_deliverables="Calibrated sensor node, open-source PCB schematics, SMS alert daemon, bilingual Marathi/English caretaker guide.",
            charter_acceptance_criteria="Detection accuracy within 5% of laboratory spectrophotometer, continuous battery operation across 14 consecutive trial days.",
            charter_funding_terms="Grant of Rs 35,000 from DRDA Innovation Fund disbursed upon verified village council adoption.",
            charter_ip_terms="Open-source MIT / CERN Open Hardware Licence for public community benefit.",
            charter_confidentiality_terms="Public data; water quality statistics published for village transparency.",
            charter_withdrawal_rules="2 weeks notice required with complete handover of source code and physical sensor nodes.",
            charter_agreed_solver=True,
            charter_agreed_provider=True,
            prototype_demo_url="https://jal-drishti-telemetry.example.org",
            prototype_repo_url="https://github.com/Co-Solve-civic/jal-drishti-node",
            prototype_video_url="https://youtube.com/watch?v=sample-jal-drishti-demo",
            prototype_documentation="Comprehensive hardware documentation including wiring diagrams, component BOM (Total cost Rs 6,800), and firmware flashing instructions.",
            prototype_test_instructions="1. Power on unit via solar switch; 2. Observe LED status indicator green heartbeat; 3. Dip probe into test solution; 4. Verify SMS received on registered panchayat mobile number.",
            prototype_known_limitations="Requires manual wiper wipe every 30 days in high-calcium borewells to maintain optical turbidity sensor clarity.",
            prototype_submitted_at=datetime.utcnow() - timedelta(days=20),
            is_scope_completed=True,
            assigned_at=datetime.utcnow() - timedelta(days=45),
            completed_at=datetime.utcnow() - timedelta(days=3)
        )
        db.add(proj1)
        db.flush()

        # Project Members
        db.add(ProjectMember(project_id=proj1.id, user_id=solver_student_1.id, role="lead"))

        # Milestones
        m1 = Milestone(project_id=proj1.id, title="1. Lab Calibration & Sensor Benchmarking", description="Bench-testing sensors against known chemical buffers.", order=1, status="approved")
        m2 = Milestone(project_id=proj1.id, title="2. Prototype Enclosure & Telemetry Build", description="Assembling solar-backed node with SIM800L module.", order=2, status="approved")
        m3 = Milestone(project_id=proj1.id, title="3. Shirur Well #2 Field Trial", description="14-day continuous monitoring alongside government laboratory testing.", order=3, status="approved")
        m4 = Milestone(project_id=proj1.id, title="4. Panchayat Handover & Caretaker Training", description="Formal handover to village council with maintenance checklist.", order=4, status="approved")
        db.add_all([m1, m2, m3, m4])
        db.flush()

        # Deliverables
        d1 = Deliverable(project_id=proj1.id, milestone_id=m1.id, submitted_by_id=solver_student_1.id, title="Sensor Calibration Certificate & Data Logs", submission_type="report", status="approved")
        d2 = Deliverable(project_id=proj1.id, milestone_id=m2.id, submitted_by_id=solver_student_1.id, title="Jal-Drishti Firmware & PCB Gerber Files", submission_type="code", external_link="https://github.com/Co-Solve-civic/jal-drishti-node", status="approved")
        d3 = Deliverable(project_id=proj1.id, milestone_id=m4.id, submitted_by_id=solver_student_1.id, title="Bilingual Marathi-English Caretaker Manual", submission_type="report", status="approved")
        db.add_all([d1, d2, d3])

        # Testing Records (Section 10: support multiple testing iterations)
        # Round 1: revisions requested on enclosure waterproofing
        t1 = TestingRecord(
            project_id=proj1.id,
            round_number=1,
            test_plan="Initial 48-hour bench test and splash resistance examination under simulated rainfall conditions.",
            test_results="Sensor readings calibrated accurately, but cable gland on top of enclosure allowed minor moisture seepage under heavy water splash.",
            status="revision_required",
            reviewer_comments="Please seal wire entry points with marine-grade silicone RTV and re-submit for approval.",
            reviewer_id=provider_panchayat.id,
            conducted_at=datetime.utcnow() - timedelta(days=22)
        )
        # Round 2: passed!
        t2 = TestingRecord(
            project_id=proj1.id,
            round_number=2,
            test_plan="14-day field deployment at Shirur Well #2 with daily parallel split-sample testing by Pune District Public Health Laboratory.",
            test_results="Passed with excellence. Turbidity readings matched spectrophotometer within 3.8% variance. Automated SMS alerts successfully triggered during simulated spiked sample.",
            status="passed",
            reviewer_comments="Exceeded all acceptance criteria. Panchayat water committee unanimously endorses testing results.",
            reviewer_id=provider_panchayat.id,
            conducted_at=datetime.utcnow() - timedelta(days=8)
        )
        db.add_all([t1, t2])

        # Adoption Record (Section 10: strictly separate from prototype submission!)
        adopt1 = AdoptionRecord(
            project_id=proj1.id,
            adoption_status="verified_adopted",
            implementation_date=datetime.utcnow() - timedelta(days=5),
            real_world_evidence="Gram Panchayat Resolution #2026/09 officially accepting the Jal-Drishti telemetry system into Shirur's municipal water grid. Unit installed permanently on Well #2 with continuous real-time noticeboard readout.",
            beneficiaries_served=1450,
            outcomes_achieved="100% elimination of testing delay (from 3 weeks down to instantaneous alert). Over 1,450 villagers now have verified safe drinking water security.",
            known_limitations="Requires quarterly replacement of 9V backup battery and monthly probe wipe.",
            maintenance_plan="Adopted under Gram Panchayat annual maintenance budget; two village youth (Deepak & Santosh) trained as primary caretakers.",
            is_independent_review=True,
            reviewer_id=reviewer_user.id,
            review_rationale="Independent review conducted by Prof. Sudhir Kulkarni (IISER Pune). Verified sensor readings on-site, inspected panchayat installation, and confirmed community water committee training.",
            reviewed_at=datetime.utcnow() - timedelta(days=3)
        )
        db.add(adopt1)

        # Verified Reward
        reward1 = Reward(
            user_id=solver_student_1.id,
            project_id=proj1.id,
            reward_type="digital_credential",
            title="Verified Civic Impact Credential: Rural Potable Water Telemetry",
            description="Awarded for verified real-world deployment of IoT water telemetry serving 1,450 beneficiaries in Shirur Gram Panchayat.",
            sponsor="Shirur Gram Panchayat & DRDA Maharashtra",
            amount=35000.0,
            status="approved"
        )
        db.add(reward1)

        # 7. AUDIT LOGS
        db.add_all([
            AuditLog(actor_id=provider_panchayat.id, action="PROBLEM_CREATED", resource_type="problem", resource_id=prob1.id, details="Created Shirur water telemetry challenge"),
            AuditLog(actor_id=admin_user.id, action="PROBLEM_APPROVED", resource_type="problem", resource_id=prob1.id, details="Approved for publication after verification of Sarpanch authority"),
            AuditLog(actor_id=solver_student_1.id, action="APPLICATION_SUBMITTED", resource_type="application", resource_id=app1.id, details="Proposal submitted with 94.5% match score"),
            AuditLog(actor_id=provider_panchayat.id, action="SOLVER_SELECTED", resource_type="project", resource_id=proj1.id, details="Arjun Sharma selected as Lead Solver"),
            AuditLog(actor_id=solver_student_1.id, action="PROTOTYPE_SUBMITTED", resource_type="project", resource_id=proj1.id, details="Jal-Drishti working prototype submitted with full schematics"),
            AuditLog(actor_id=provider_panchayat.id, action="TESTING_ROUND_PASSED", resource_type="project", resource_id=proj1.id, details="Field testing round 2 passed against lab standard"),
            AuditLog(actor_id=reviewer_user.id, action="ADOPTION_INDEPENDENTLY_VERIFIED", resource_type="project", resource_id=proj1.id, details="Independent verification by Prof. Sudhir Kulkarni for 1,450 beneficiaries")
        ])

        # 8. VERIFICATION REQUESTS (Admin queue demo)
        v1 = VerificationRequest(
            user_id=provider_individual.id,
            request_type="individual_identity",
            status="approved",
            document_ref="sanitized_org_credential_ref_8921.pdf",
            notes="Gram Vikas Sanstha executive committee credentials and identity confirmation.",
            admin_feedback="Verified against state NGO Darpan portal registration.",
            reviewed_by=admin_user.id,
            reviewed_at=datetime.utcnow() - timedelta(days=20)
        )
        v2 = VerificationRequest(
            org_id=org.id,
            request_type="organization_existence",
            status="approved",
            document_ref="sanitized_trust_deed_pune_2021.pdf",
            notes="Section 8 Non-Profit registration certificate and university incubation letter.",
            admin_feedback="Approved. Organization authorized for collective challenge applications.",
            reviewed_by=admin_user.id,
            reviewed_at=datetime.utcnow() - timedelta(days=25)
        )
        # Pending verification for demo
        v3 = VerificationRequest(
            user_id=solver_student_2.id,
            request_type="student_affiliation",
            status="pending",
            document_ref="sanitized_iitb_student_id_card.pdf",
            notes="IIT Bombay Computer Science Department Bonafide Student Certificate."
        )
        db.add_all([v1, v2, v3])

        # 9. DISPUTE (Demonstrating Section 12 dispute process)
        disp1 = Dispute(
            project_id=proj1.id,
            raised_by_id=solver_student_1.id,
            dispute_type="unpaid_reward",
            title="Delay in DRDA Grant Disbursement Process",
            description="Project adoption was verified on-site 10 days ago, but district grant disbursement token was pending bank clearing.",
            evidence_text="Bank communication reference #DRDA/2026/PUN/88219 and Panchayat resolution copy.",
            status="resolved",
            assigned_reviewer_id=reviewer_user.id,
            resolution_decision="Independent reviewer contacted DRDA accounts officer. Payment batch released and credited to project escrow account.",
            reconsidered=False,
            created_at=datetime.utcnow() - timedelta(days=4),
            resolved_at=datetime.utcnow() - timedelta(days=1)
        )
        db.add(disp1)

        db.commit()
        print("Database seed completed successfully with complete realistic dataset!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
