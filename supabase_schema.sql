-- ==========================================================
-- Co-Solve Platform PostgreSQL / Supabase Schema
-- Run this script directly in the Supabase SQL Editor
-- ==========================================================

CREATE TABLE IF NOT EXISTS profiles (
	id VARCHAR(36) NOT NULL, 
	email VARCHAR(255) NOT NULL, 
	hashed_password VARCHAR(255) NOT NULL, 
	full_name VARCHAR(255) NOT NULL, 
	role VARCHAR(50) NOT NULL, 
	provider_type VARCHAR(50), 
	panchayat_name VARCHAR(255), 
	panchayat_state VARCHAR(100), 
	panchayat_district VARCHAR(100), 
	designation VARCHAR(100), 
	verification_status VARCHAR(50), 
	verification_notes TEXT, 
	is_student BOOLEAN, 
	college_name VARCHAR(255), 
	graduation_year INTEGER, 
	phone VARCHAR(50), 
	bio TEXT, 
	location VARCHAR(255), 
	avatar_url VARCHAR(500), 
	availability_hours_per_week INTEGER, 
	preferred_duration_weeks INTEGER, 
	fieldwork_willing BOOLEAN, 
	remote_preference VARCHAR(50), 
	portfolio_privacy VARCHAR(50), 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	updated_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS audit_logs (
	id VARCHAR(36) NOT NULL, 
	actor_id VARCHAR(36), 
	action VARCHAR(100) NOT NULL, 
	resource_type VARCHAR(50) NOT NULL, 
	resource_id VARCHAR(100) NOT NULL, 
	details TEXT, 
	ip_address VARCHAR(45), 
	timestamp TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(actor_id) REFERENCES profiles (id)
);

CREATE TABLE IF NOT EXISTS notifications (
	id VARCHAR(36) NOT NULL, 
	user_id VARCHAR(36) NOT NULL, 
	title VARCHAR(255) NOT NULL, 
	message TEXT NOT NULL, 
	category VARCHAR(50), 
	link VARCHAR(255), 
	is_read BOOLEAN, 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES profiles (id)
);

CREATE TABLE IF NOT EXISTS organizations (
	id VARCHAR(36) NOT NULL, 
	name VARCHAR(255) NOT NULL, 
	type VARCHAR(50) NOT NULL, 
	registration_number VARCHAR(100), 
	lead_id VARCHAR(36) NOT NULL, 
	description TEXT, 
	website VARCHAR(255), 
	verification_status VARCHAR(50), 
	verification_notes TEXT, 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	updated_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	UNIQUE (name), 
	FOREIGN KEY(lead_id) REFERENCES profiles (id)
);

CREATE TABLE IF NOT EXISTS problems (
	id VARCHAR(36) NOT NULL, 
	creator_id VARCHAR(36) NOT NULL, 
	title VARCHAR(255) NOT NULL, 
	description TEXT NOT NULL, 
	current_situation TEXT, 
	root_cause TEXT, 
	affected_community VARCHAR(255) NOT NULL, 
	beneficiaries_estimate INTEGER, 
	domain VARCHAR(100) NOT NULL, 
	category VARCHAR(100), 
	geographic_state VARCHAR(100) NOT NULL, 
	geographic_district VARCHAR(100) NOT NULL, 
	locality VARCHAR(255), 
	expected_outcome TEXT NOT NULL, 
	constraints TEXT, 
	available_resources TEXT, 
	required_skills_declared TEXT, 
	preferred_solver_type VARCHAR(50), 
	urgency VARCHAR(50), 
	deadline TIMESTAMP WITHOUT TIME ZONE, 
	deliverables_text TEXT, 
	acceptance_criteria_text TEXT, 
	testing_approach TEXT, 
	adoption_plan TEXT, 
	funding_model VARCHAR(50), 
	funding_amount FLOAT, 
	funding_currency VARCHAR(10), 
	funding_status VARCHAR(50), 
	sponsor_details VARCHAR(255), 
	award_conditions TEXT, 
	payment_milestones TEXT, 
	moderation_status VARCHAR(50), 
	moderation_notes TEXT, 
	moderated_by VARCHAR(36), 
	moderated_at TIMESTAMP WITHOUT TIME ZONE, 
	view_count INTEGER, 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	updated_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(creator_id) REFERENCES profiles (id), 
	FOREIGN KEY(moderated_by) REFERENCES profiles (id)
);

CREATE TABLE IF NOT EXISTS solver_interests (
	id VARCHAR(36) NOT NULL, 
	user_id VARCHAR(36) NOT NULL, 
	domain VARCHAR(100) NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES profiles (id)
);

CREATE TABLE IF NOT EXISTS solver_skills (
	id VARCHAR(36) NOT NULL, 
	user_id VARCHAR(36) NOT NULL, 
	skill_name VARCHAR(100) NOT NULL, 
	proficiency_level VARCHAR(50), 
	years_experience FLOAT, 
	verified BOOLEAN, 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES profiles (id)
);

CREATE TABLE IF NOT EXISTS ai_problem_analyses (
	id VARCHAR(36) NOT NULL, 
	problem_id VARCHAR(36) NOT NULL, 
	version INTEGER, 
	provider VARCHAR(50), 
	model_name VARCHAR(100), 
	executive_summary TEXT NOT NULL, 
	problem_statement TEXT NOT NULL, 
	affected_stakeholders TEXT NOT NULL, 
	domain_detected VARCHAR(100) NOT NULL, 
	subdomains TEXT, 
	potential_root_causes TEXT, 
	required_skills TEXT NOT NULL, 
	suggested_team_composition TEXT, 
	complexity_score INTEGER, 
	complexity_explanation TEXT, 
	expected_deliverables TEXT, 
	suggested_milestones TEXT, 
	acceptance_criteria TEXT, 
	testing_strategy TEXT, 
	risks_and_constraints TEXT, 
	missing_information_questions TEXT, 
	impact_indicators TEXT, 
	suggested_adoption_strategy TEXT, 
	confidence_score FLOAT, 
	is_confirmed_by_provider BOOLEAN, 
	provider_edits TEXT, 
	generated_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(problem_id) REFERENCES problems (id)
);

CREATE TABLE IF NOT EXISTS applications (
	id VARCHAR(36) NOT NULL, 
	problem_id VARCHAR(36) NOT NULL, 
	solver_type VARCHAR(50), 
	applicant_id VARCHAR(36) NOT NULL, 
	organization_id VARCHAR(36), 
	team_name VARCHAR(255), 
	college_name VARCHAR(255), 
	team_members_data TEXT, 
	proposal TEXT NOT NULL, 
	approach TEXT NOT NULL, 
	relevant_experience TEXT, 
	estimated_timeline_weeks FLOAT, 
	weekly_availability_hours FLOAT, 
	team_composition_notes TEXT, 
	match_score_at_application FLOAT, 
	match_explanation_snapshot TEXT, 
	status VARCHAR(50), 
	provider_notes TEXT, 
	submitted_at TIMESTAMP WITHOUT TIME ZONE, 
	updated_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(problem_id) REFERENCES problems (id), 
	FOREIGN KEY(applicant_id) REFERENCES profiles (id), 
	FOREIGN KEY(organization_id) REFERENCES organizations (id)
);

CREATE TABLE IF NOT EXISTS organization_members (
	id VARCHAR(36) NOT NULL, 
	org_id VARCHAR(36) NOT NULL, 
	user_id VARCHAR(36) NOT NULL, 
	role VARCHAR(50), 
	joined_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(org_id) REFERENCES organizations (id), 
	FOREIGN KEY(user_id) REFERENCES profiles (id)
);

CREATE TABLE IF NOT EXISTS problem_attachments (
	id VARCHAR(36) NOT NULL, 
	problem_id VARCHAR(36) NOT NULL, 
	file_name VARCHAR(255) NOT NULL, 
	file_path VARCHAR(500) NOT NULL, 
	file_type VARCHAR(50), 
	file_size INTEGER, 
	is_private BOOLEAN, 
	uploaded_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(problem_id) REFERENCES problems (id)
);

CREATE TABLE IF NOT EXISTS verification_requests (
	id VARCHAR(36) NOT NULL, 
	user_id VARCHAR(36), 
	org_id VARCHAR(36), 
	request_type VARCHAR(50) NOT NULL, 
	status VARCHAR(50), 
	document_ref VARCHAR(500), 
	notes TEXT, 
	admin_feedback TEXT, 
	reviewed_by VARCHAR(36), 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	reviewed_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES profiles (id), 
	FOREIGN KEY(org_id) REFERENCES organizations (id), 
	FOREIGN KEY(reviewed_by) REFERENCES profiles (id)
);

CREATE TABLE IF NOT EXISTS projects (
	id VARCHAR(36) NOT NULL, 
	problem_id VARCHAR(36) NOT NULL, 
	application_id VARCHAR(36) NOT NULL, 
	solver_type VARCHAR(50), 
	team_name VARCHAR(255), 
	lead_solver_id VARCHAR(36) NOT NULL, 
	organization_id VARCHAR(36), 
	status VARCHAR(50), 
	progress_percentage FLOAT, 
	last_activity_at TIMESTAMP WITHOUT TIME ZONE, 
	last_progress_updated_at TIMESTAMP WITHOUT TIME ZONE, 
	charter_scope TEXT NOT NULL, 
	charter_deliverables TEXT NOT NULL, 
	charter_acceptance_criteria TEXT NOT NULL, 
	charter_milestones_summary TEXT, 
	charter_funding_terms TEXT, 
	charter_ip_terms TEXT, 
	charter_confidentiality_terms TEXT, 
	charter_withdrawal_rules TEXT, 
	charter_agreed_solver BOOLEAN, 
	charter_agreed_provider BOOLEAN, 
	prototype_demo_url VARCHAR(500), 
	prototype_repo_url VARCHAR(500), 
	prototype_video_url VARCHAR(500), 
	prototype_documentation TEXT, 
	prototype_test_instructions TEXT, 
	prototype_known_limitations TEXT, 
	prototype_submitted_at TIMESTAMP WITHOUT TIME ZONE, 
	is_scope_completed BOOLEAN, 
	assigned_at TIMESTAMP WITHOUT TIME ZONE, 
	completed_at TIMESTAMP WITHOUT TIME ZONE, 
	updated_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(problem_id) REFERENCES problems (id), 
	UNIQUE (application_id), 
	FOREIGN KEY(application_id) REFERENCES applications (id), 
	FOREIGN KEY(lead_solver_id) REFERENCES profiles (id), 
	FOREIGN KEY(organization_id) REFERENCES organizations (id)
);

CREATE TABLE IF NOT EXISTS adoption_records (
	id VARCHAR(36) NOT NULL, 
	project_id VARCHAR(36) NOT NULL, 
	adoption_status VARCHAR(50), 
	implementation_date TIMESTAMP WITHOUT TIME ZONE, 
	real_world_evidence TEXT, 
	evidence_files TEXT, 
	beneficiaries_served INTEGER, 
	outcomes_achieved TEXT, 
	known_limitations TEXT, 
	maintenance_plan TEXT, 
	is_independent_review BOOLEAN, 
	reviewer_id VARCHAR(36), 
	review_rationale TEXT, 
	reviewed_at TIMESTAMP WITHOUT TIME ZONE, 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(project_id) REFERENCES projects (id), 
	FOREIGN KEY(reviewer_id) REFERENCES profiles (id)
);

CREATE TABLE IF NOT EXISTS disputes (
	id VARCHAR(36) NOT NULL, 
	project_id VARCHAR(36) NOT NULL, 
	raised_by_id VARCHAR(36) NOT NULL, 
	dispute_type VARCHAR(50) NOT NULL, 
	title VARCHAR(255) NOT NULL, 
	description TEXT NOT NULL, 
	evidence_text TEXT, 
	status VARCHAR(50), 
	assigned_reviewer_id VARCHAR(36), 
	resolution_decision TEXT, 
	reconsidered BOOLEAN, 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	resolved_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(project_id) REFERENCES projects (id), 
	FOREIGN KEY(raised_by_id) REFERENCES profiles (id), 
	FOREIGN KEY(assigned_reviewer_id) REFERENCES profiles (id)
);

CREATE TABLE IF NOT EXISTS impact_metrics (
	id VARCHAR(36) NOT NULL, 
	project_id VARCHAR(36) NOT NULL, 
	metric_name VARCHAR(100) NOT NULL, 
	metric_value VARCHAR(50) NOT NULL, 
	unit VARCHAR(50), 
	is_verified BOOLEAN, 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(project_id) REFERENCES projects (id)
);

CREATE TABLE IF NOT EXISTS milestones (
	id VARCHAR(36) NOT NULL, 
	project_id VARCHAR(36) NOT NULL, 
	title VARCHAR(255) NOT NULL, 
	description TEXT, 
	"order" INTEGER, 
	target_date TIMESTAMP WITHOUT TIME ZONE, 
	status VARCHAR(50), 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(project_id) REFERENCES projects (id)
);

CREATE TABLE IF NOT EXISTS project_members (
	id VARCHAR(36) NOT NULL, 
	project_id VARCHAR(36) NOT NULL, 
	user_id VARCHAR(36) NOT NULL, 
	role VARCHAR(50), 
	assigned_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(project_id) REFERENCES projects (id), 
	FOREIGN KEY(user_id) REFERENCES profiles (id)
);

CREATE TABLE IF NOT EXISTS reviews (
	id VARCHAR(36) NOT NULL, 
	project_id VARCHAR(36) NOT NULL, 
	target_type VARCHAR(50) NOT NULL, 
	target_id VARCHAR(36) NOT NULL, 
	reviewer_id VARCHAR(36) NOT NULL, 
	rating INTEGER, 
	decision VARCHAR(50) NOT NULL, 
	comments TEXT NOT NULL, 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(project_id) REFERENCES projects (id), 
	FOREIGN KEY(reviewer_id) REFERENCES profiles (id)
);

CREATE TABLE IF NOT EXISTS rewards (
	id VARCHAR(36) NOT NULL, 
	user_id VARCHAR(36), 
	org_id VARCHAR(36), 
	project_id VARCHAR(36), 
	reward_type VARCHAR(50) NOT NULL, 
	title VARCHAR(255) NOT NULL, 
	description TEXT, 
	sponsor VARCHAR(255), 
	amount FLOAT, 
	status VARCHAR(50), 
	issued_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES profiles (id), 
	FOREIGN KEY(org_id) REFERENCES organizations (id), 
	FOREIGN KEY(project_id) REFERENCES projects (id)
);

CREATE TABLE IF NOT EXISTS testing_records (
	id VARCHAR(36) NOT NULL, 
	project_id VARCHAR(36) NOT NULL, 
	round_number INTEGER, 
	test_plan TEXT NOT NULL, 
	test_results TEXT NOT NULL, 
	status VARCHAR(50), 
	criteria_checked TEXT, 
	evidence_files TEXT, 
	reviewer_comments TEXT, 
	reviewer_id VARCHAR(36) NOT NULL, 
	conducted_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(project_id) REFERENCES projects (id), 
	FOREIGN KEY(reviewer_id) REFERENCES profiles (id)
);

CREATE TABLE IF NOT EXISTS deliverables (
	id VARCHAR(36) NOT NULL, 
	project_id VARCHAR(36) NOT NULL, 
	milestone_id VARCHAR(36), 
	submitted_by_id VARCHAR(36) NOT NULL, 
	title VARCHAR(255) NOT NULL, 
	description TEXT, 
	file_path VARCHAR(500), 
	external_link VARCHAR(500), 
	submission_type VARCHAR(50), 
	version INTEGER, 
	status VARCHAR(50), 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(project_id) REFERENCES projects (id), 
	FOREIGN KEY(milestone_id) REFERENCES milestones (id), 
	FOREIGN KEY(submitted_by_id) REFERENCES profiles (id)
);

CREATE TABLE IF NOT EXISTS tasks (
	id VARCHAR(36) NOT NULL, 
	project_id VARCHAR(36) NOT NULL, 
	milestone_id VARCHAR(36), 
	assigned_to_id VARCHAR(36), 
	title VARCHAR(255) NOT NULL, 
	description TEXT, 
	status VARCHAR(50), 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(project_id) REFERENCES projects (id), 
	FOREIGN KEY(milestone_id) REFERENCES milestones (id), 
	FOREIGN KEY(assigned_to_id) REFERENCES profiles (id)
);

-- Indexes
CREATE UNIQUE INDEX IF NOT EXISTS ix_profiles_email ON profiles (email);