import './style.css';
import { ApiClient, type User, type Problem, type DemoUser } from './api';

type View = 'home' | 'register' | 'organisation' | 'provider' | 'solver';
type Role = 'solver' | 'provider' | 'organisation';

let currentView: View = 'home';
let selectedRole: Role = 'solver';
let modalOpen = false;
let applyModalOpen = false;
let selectedProblemForApply: Problem | null = null;
let applyTab: 'individual' | 'team' = 'individual';
let teamMembers: { name: string; email: string }[] = [{ name: '', email: '' }];

let activeTab = 'Overview';
let authMode: 'login' | 'register' = 'register';
let authError = '';
let challengeFilter = 'All';

// State loaded from Backend
let currentUser: User | null = ApiClient.getUser();
let liveProblems: Problem[] = [];
let demoUsers: DemoUser[] = [];
let userProjects: any[] = [];

const photos = {
  hero: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1400&q=85',
  field: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1000&q=85',
  community: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=1000&q=85',
  student: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=85',
  site: 'https://images.unsplash.com/photo-1516937941344-00b4e0337589?auto=format&fit=crop&w=1000&q=85',
  school: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1000&q=85',
  flood: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=1000&q=85',
  bus: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=1000&q=85',
  hospital: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1000&q=85',
  footpath: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1000&q=85',
  learning: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1000&q=85',
  lights: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1000&q=85',
  water: 'https://images.unsplash.com/photo-1530053969600-caed2596d242?auto=format&fit=crop&w=1000&q=85',
  lake: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1000&q=85',
  access: 'https://images.unsplash.com/photo-1573496358770-bb7c9b8b6e0a?auto=format&fit=crop&w=1000&q=85',
  food: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1000&q=85'
};

function getImageForCategory(cat: string): string {
  const c = (cat || '').toLowerCase();
  if (c.includes('water')) return photos.water;
  if (c.includes('environ') || c.includes('waste')) return photos.field;
  if (c.includes('infra') || c.includes('road')) return photos.flood;
  if (c.includes('edu') || c.includes('school')) return photos.school;
  if (c.includes('trans')) return photos.bus;
  if (c.includes('health')) return photos.hospital;
  if (c.includes('access')) return photos.access;
  if (c.includes('light')) return photos.lights;
  return photos.community;
}

// Data synchronization with Backend
async function initAppData() {
  try {
    if (ApiClient.getToken()) {
      currentUser = await ApiClient.getMe().catch(() => null);
    }
    
    // Fetch live problems from backend
    liveProblems = await ApiClient.getProblems().catch(() => []);
    
    // Fetch demo users for 1-click test login
    demoUsers = await ApiClient.getDemoUsers().catch(() => [
      { name: "Ramesh Patil", email: "sarpanch.ramesh@shirur-panchayat.org", role: "provider", entity: "Shirur Gram Panchayat" },
      { name: "Arjun Sharma", email: "arjun.sharma@coep.ac.in", role: "solver", entity: "COEP Tech University" },
      { name: "Priya Nair", email: "priya.nair@iitb.ac.in", role: "solver", entity: "IIT Bombay" },
      { name: "Dr. Vikram Mehta", email: "vikram.mehta@ruraltech.org", role: "organization", entity: "Rural Tech Foundation" },
      { name: "Dr. Sunita Rao", email: "admin@samarthya.gov.in", role: "admin", entity: "State Innovation Council" }
    ]);

    // Fetch user projects if logged in
    if (currentUser) {
      userProjects = await ApiClient.getProjects().catch(() => []);
    }

    render();
  } catch (err) {
    console.warn("Initial sync note:", err);
  }
}

function go(view: View) {
  currentView = view;
  modalOpen = false;
  applyModalOpen = false;
  authError = '';
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function header() {
  return `
    <header class="topbar">
      <div class="topbar-main">
        <div class="brand-lockup">
          <a href="#home" class="brand-name" data-view="home" aria-label="CO-SOLVE home">Co-Solve</a>
          <p class="brand-tagline">Ideas today. Impact tomorrow.</p>
        </div>
        <div class="header-actions">
          ${currentUser ? `
            <span class="user-badge">
              <span class="dot green-dot"></span>
              ${escapeHTML(currentUser.full_name)} (${currentUser.role})
            </span>
            <button class="button button-outline" data-action="signout">Sign Out</button>
          ` : `
            <button class="button button-dark nav-start" data-view="register">Get Started ↗</button>
            <button class="button button-outline nav-login" data-action="signin">Login</button>
          `}
        </div>
      </div>
      <nav class="desktop-actions site-links" aria-label="Main navigation">
        <button class="nav-link" data-scroll="who-we-are">Who are we?</button>
        <button class="nav-link" data-scroll="challenges">Explore</button>
        <button class="nav-link" data-scroll="solved-problems">Solved problems</button>
        <button class="nav-link" data-scroll="impact">Impact</button>
      </nav>
    </header>`;
}

function nav() {
  const items: { label: string; view: View; symbol: string }[] = [
    { label: 'PUBLIC', view: 'home', symbol: '◉' },
    { label: 'SOLVER', view: 'solver', symbol: '◎' },
    { label: 'PROVIDER', view: 'provider', symbol: '♧' },
    { label: 'INSTITUTION', view: 'organisation', symbol: '⌂' }
  ];

  return `<nav class="bottom-nav">${items.map(item => `
    <button class="${currentView === item.view ? 'active' : ''}" data-view="${item.view}">
      <span>${item.symbol}</span><small>${item.label}</small>
    </button>`).join('')}</nav>`;
}

function challengeCard(p: Problem, i: number) {
  const isTaken = Boolean(p.is_taken || p.status === 'in_progress' || p.status === 'solver_selected' || p.status === 'testing' || p.status === 'adopted');
  const progress = p.progress_percentage ?? 0;
  const image = getImageForCategory(p.category);

  return `
    <article class="challenge-card reveal" data-problem-id="${p.id}">
      <div class="challenge-media">
        <img class="challenge-image" src="${image}" alt="${escapeHTML(p.title)}" loading="lazy">
        <span class="image-index">${String(i + 1).padStart(2, '0')}</span>
      </div>
      <div class="challenge-body">
        <div class="chips">
          <span class="tag">${escapeHTML(p.category || 'Civic')}</span>
          <span class="priority">${escapeHTML(p.urgency_level || 'Normal')}</span>
        </div>

        <h3>${escapeHTML(p.title)}</h3>
        <p>${escapeHTML(p.description)}</p>

        <!-- Availability Indicator Block with Dot -->
        <div class="status-indicator ${isTaken ? 'taken' : 'available'}">
          <span class="dot ${isTaken ? 'red-dot' : 'green-dot'}"></span>
          <span>${isTaken ? 'Not Available — Taken' : 'Available — Not Taken'}</span>
        </div>

        ${isTaken ? `
          <div class="progress-block">
            <div class="progress-header">
              <span>Project Progress</span>
              <span>${progress.toFixed(0)}%</span>
            </div>
            <div class="progress-bar-wrap">
              <div class="progress-bar-fill" style="width: ${progress}%"></div>
            </div>
            <span class="progress-note">Cadence: Updates every 2 days (inactivity auto-revokes after 7 days)</span>
            ${p.assigned_team_name ? `<div class="assigned-meta">Team: <strong>${escapeHTML(p.assigned_team_name)}</strong></div>` : (p.assigned_solver_name ? `<div class="assigned-meta">Solver: <strong>${escapeHTML(p.assigned_solver_name)}</strong></div>` : '')}
          </div>
        ` : ''}

        ${p.target_community ? `<div class="muted-line">⌖ Community: ${escapeHTML(p.target_community)}</div>` : ''}

        <div style="margin-top: 14px;">
          ${isTaken ? `
            <button class="button button-soft full" disabled style="opacity: 0.7; cursor: not-allowed;">
              Already Assigned ✓
            </button>
          ` : `
            <button class="button button-dark full" data-open-apply="${p.id}">
              Apply as Solver ↗
            </button>
          `}
        </div>
      </div>
    </article>`;
}

function challengeSection() {
  const categories = ['All', ...Array.from(new Set(liveProblems.map(c => c.category).filter(Boolean)))];
  const visible = liveProblems.filter(c => challengeFilter === 'All' || c.category === challengeFilter);

  return `
    <section class="section section-pad tinted" id="challenges">
      <div class="eyebrow">LIVE BACKEND SYNC · ${liveProblems.length} ACTIVE CHALLENGES</div>
      <h2>Active civic challenges</h2>
      <p>Real community problems from verified providers. Track live assignment and sprint progress.</p>
      
      <div class="filter-row" aria-label="Filter challenges">
        ${categories.map(category => `<button class="filter-chip ${challengeFilter === category ? 'selected' : ''}" data-filter="${category}">${category}</button>`).join('')}
      </div>

      <div class="challenge-list">
        ${visible.length ? visible.map((p, i) => challengeCard(p, i)).join('') : `<div class="empty-state"><span>◎</span><b>No challenges in this category yet.</b><p>Select another category or post a problem.</p></div>`}
      </div>
    </section>`;
}

function homePage() {
  return `
    <section class="section section-pad mission-section" id="our-mission">
      <div class="mission-copy reveal">
        <h1 class="mission-title">OUR MISSION</h1>
        <p>To transform concerns into collaboration, and student potential into enduring societal value.</p>
      </div>
      <div class="mission-photo-wrap reveal"><img class="mission-photo" src="${photos.student}" alt="Students looking toward a city at sunset"></div>
    </section>

    <section class="section section-pad who-section" id="who-we-are">
      <div class="who-heading reveal"><h2>WHO ARE WE?</h2></div>
      <div class="who-copy reveal"><p>We are a community of students, mentors, and changemakers working together to understand real-world challenges and build meaningful solutions.</p><p>We turn ideas into action and student potential into solutions that matter.</p></div>
    </section>
    <section class="section section-pad process-section">
      <div class="eyebrow">FROM CONCERN TO CHANGE</div><h2>How CO-SOLVE works.</h2>
      <div class="stage-list">
        <article class="stage reveal"><b>01</b><div><h3>Explore</h3><p>Discover real-world challenges shared by communities.</p></div></article>
        <article class="stage reveal"><b>02</b><div><h3>Connect</h3><p>Bring students, mentors and institutions together.</p></div></article>
        <article class="stage reveal"><b>03</b><div><h3>Build</h3><p>Turn ideas into practical software, services or prototypes.</p></div></article>
        <article class="stage reveal"><b>04</b><div><h3>Show impact</h3><p>Track progress and document outcomes transparently.</p></div></article>
      </div>
    </section>

    ${challengeSection()}

    <section class="section section-pad solved-section" id="solved-problems">
      <div class="solved-heading reveal"><div><div class="eyebrow">SOLVED PROBLEMS</div><h2>From problem to solution.</h2><p>Explore practical ways students turn real needs into action—through software, community work and tested prototypes.</p></div><span class="section-stamp">PROBLEM → ACTION → IMPACT</span></div>
      <div class="solved-grid">
        <article class="solved-card reveal"><span class="solved-number">01</span><div class="solved-type">SOFTWARE / DIGITAL</div><h3>Digital solutions</h3><p>Web platforms, reporting tools and accessible services that help people solve everyday problems.</p></article>
        <article class="solved-card reveal"><span class="solved-number">02</span><div class="solved-type">COMMUNITY / FIELD</div><h3>Community-led action</h3><p>Local audits, coordinated volunteers and practical pilots designed around community needs.</p></article>
        <article class="solved-card reveal"><span class="solved-number">03</span><div class="solved-type">RESEARCH / PROTOTYPE</div><h3>Tested ideas</h3><p>Research and prototypes developed with mentors, partners and the people affected by the challenge.</p></article>
      </div>
      <p class="section-footnote">These are solution pathways, verified and tracked through the platform lifecycle.</p>
    </section>

    <section class="section section-pad impact-band impact-layout" id="impact">
      <div class="impact-stat">
        <h2>Impact</h2>
        <div class="impact-number">1403</div>
      </div>
      <p class="impact-quote">We turn ideas into action and student potential into solutions that matter.</p>
      <div class="impact-action">
        <button class="button button-dark" data-view="register">Be Part of Change <span aria-hidden="true">→</span></button>
      </div>
    </section>

    <section class="section section-pad pillars-section">
      <div class="eyebrow">THREE PILLARS. ONE PURPOSE.</div><h2>Better, together.</h2>
      <div class="pillar-grid">
        <article class="pillar reveal"><span class="pillar-icon">♧</span><b>Citizens & providers</b><p>Share local problems and help define what needs to change.</p><button class="text-action" data-view="provider">Report a problem ↗</button></article>
        <article class="pillar reveal"><span class="pillar-icon">✳</span><b>Student solvers</b><p>Use your skills, curiosity and creativity to build solutions.</p><button class="text-action" data-view="solver">Explore solver space ↗</button></article>
        <article class="pillar reveal"><span class="pillar-icon">⌂</span><b>Institutions</b><p>Support teams, offer mentorship and help validate outcomes.</p><button class="text-action" data-view="organisation">Partner with us ↗</button></article>
      </div>
      <button class="button button-dark full" data-view="register">Join CO-SOLVE ↗</button>
    </section>`;
}

function roleFields() {
  if (selectedRole === 'solver') return `
    <label class="field">College / Institution<input name="institution" placeholder="Your college or university" required></label>
    <div class="field-grid">
      <label class="field">Course / discipline<input name="course" placeholder="e.g. B.Tech CSE" required></label>
      <label class="field">Year of study<select name="year"><option value="1">Year 1</option><option value="2">Year 2</option><option value="3">Year 3</option><option value="4" selected>Year 4</option><option value="5">Graduate / Other</option></select></label>
    </div>
    <label class="field">Skills and interests<input name="skills" placeholder="e.g. web development, GIS, design"></label>
    <label class="field">Portfolio / LinkedIn (optional)<input name="portfolio" type="url" placeholder="https://"></label>
    <label class="field">Weekly availability<select name="availability"><option>1–3 hours</option><option>4–6 hours</option><option>7–10 hours</option><option>10+ hours</option></select></label>`;

  if (selectedRole === 'provider') return `
    <label class="field">Community / locality<input name="institution" placeholder="Neighbourhood, ward or community group" required></label>
    <label class="field">Problem area<select name="focus"><option>Environment & sanitation</option><option>Education</option><option>Infrastructure</option><option>Transport</option><option>Healthcare</option><option>Accessibility</option><option>Water</option><option>Food security</option><option>Other</option></select></label>
    <label class="field">City / location<input name="location" placeholder="City, area or landmark" required></label>
    <label class="field">Contact preference<select name="contact"><option>Email</option><option>Phone</option><option>Through community organisation</option></select></label>`;

  return `
    <label class="field">Organisation name<input name="institution" placeholder="Official organisation name" required></label>
    <div class="field-grid">
      <label class="field">Organisation type<select name="orgType"><option>NGO / Non-profit</option><option>University / College</option><option>Community group</option><option>Government / Civic body</option><option>CSR / Corporate</option><option>Research institution</option><option>Other</option></select></label>
      <label class="field">Team size<select name="teamSize"><option>1–5</option><option>6–20</option><option>21–50</option><option>50+</option></select></label>
    </div>
    <label class="field">Website (optional)<input name="website" type="url" placeholder="https://"></label>
    <label class="field">Focus areas<input name="focus" placeholder="e.g. education, environment, accessibility"></label>
    <label class="field">City / operating region<input name="location" placeholder="City or region" required></label>`;
}

// Original CosolveV1 Page Design for Registration and Login
function registerPage() {
  const roles: [Role, string, string, string][] = [
    ['provider', 'Problem Provider', 'Citizens and communities reporting issues', '♧'],
    ['solver', 'Individual Solver', 'Students and experts building solutions', '✳'],
    ['organisation', 'Organisation', 'Universities, NGOs and civic partners', '⌂']
  ];

  return `
    <section class="section section-pad register-layout">
      <div class="register-intro">
        <div class="eyebrow">CIVIC REGISTRY</div>
        <h1 class="small-title">Join the<br>Coordination Network</h1>
        <p>Select your role to enter your CO-SOLVE workspace.</p>
        <div class="register-visual">
          <img src="${photos.student}" alt="Students collaborating">
          <div><strong>Many perspectives.</strong><br>One shared purpose.</div>
        </div>

        <div class="demo-persona-container" style="margin-top: 20px;">
          <div class="demo-persona-title">Quick Demo Persona Logins</div>
          <div class="demo-persona-list">
            <button type="button" class="demo-persona-btn" data-demo-email="sarpanch.ramesh@shirur-panchayat.org" data-demo-role="provider">
              <span>Ramesh Patil</span>
              <small>Provider</small>
            </button>
            <button type="button" class="demo-persona-btn" data-demo-email="arjun.sharma@coep.ac.in" data-demo-role="solver">
              <span>Arjun Sharma</span>
              <small>Student Solver</small>
            </button>
            <button type="button" class="demo-persona-btn" data-demo-email="priya.nair@iitb.ac.in" data-demo-role="solver">
              <span>Priya Nair</span>
              <small>Student Solver</small>
            </button>
            <button type="button" class="demo-persona-btn" data-demo-email="vikram.mehta@ruraltech.org" data-demo-role="organization">
              <span>Dr. Vikram Mehta</span>
              <small>Institution</small>
            </button>
            <button type="button" class="demo-persona-btn" data-demo-email="admin@samarthya.gov.in" data-demo-role="admin">
              <span>Dr. Sunita Rao</span>
              <small>Authority</small>
            </button>
          </div>
        </div>
      </div>

      <div class="register-panel">
        <div class="segmented">
          <button type="button" class="${authMode === 'login' ? 'selected' : ''}" data-auth-mode="login">Login</button>
          <button type="button" class="${authMode === 'register' ? 'selected' : ''}" data-auth-mode="register">Create account</button>
        </div>

        <form id="register-form">
          ${authError ? `<div style="padding: 10px 14px; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); border-radius: 8px; color: #b91c1c; font-size: 13px; font-weight: 600; margin-bottom: 14px;">${escapeHTML(authError)}</div>` : ''}

          <div class="form-heading">STEP 01 — SELECT YOUR ROLE</div>
          <div class="role-list">
            ${roles.map(([id, name, desc, symbol]) => `
              <label class="role-card ${selectedRole === id ? 'chosen' : ''}">
                <input type="radio" name="role" value="${id}" ${selectedRole === id ? 'checked' : ''}>
                <span class="role-symbol">${symbol}</span>
                <span class="role-copy"><b>${name}</b><small>${desc}</small></span>
              </label>`).join('')}
          </div>

          <div class="form-heading">STEP 02 — ${authMode === 'login' ? 'SIGN IN DETAILS' : 'YOUR DETAILS'}</div>

          ${authMode === 'register' ? `<label class="field">Full name<input name="name" autocomplete="name" placeholder="Enter your full name" required></label>` : ''}
          <label class="field">Email address<input name="email" id="auth-email-input" type="email" autocomplete="email" placeholder="you@example.com" required></label>
          <label class="field">Password<input name="password" id="auth-password-input" type="password" autocomplete="${authMode === 'login' ? 'current-password' : 'new-password'}" placeholder="${authMode === 'login' ? 'Enter your password (Demo: DemoPassword123!)' : 'At least 8 characters'}" minlength="6" required></label>

          ${authMode === 'register' ? roleFields() + `<label class="consent"><input type="checkbox" required checked> I agree to follow CO-SOLVE’s community, privacy and verification guidelines.</label>` : ''}

          <button class="button button-dark full" type="submit" id="auth-submit-btn">
            ${authMode === 'login' ? 'Continue to Workspace →' : 'Create account & continue →'}
          </button>
        </form>
      </div>
    </section>`;
}

function organisationPage() {
  const instName = currentUser?.role === 'organization' ? currentUser.full_name : 'Delhi Technological University';
  return `
    <section class="section section-pad dashboard">
      <div class="dashboard-cover org-cover">
        <img src="${photos.student}" alt="Students collaborating on a project">
        <div class="cover-overlay">
          <span class="tag">DEMO ORGANISATION</span>
          <h1 class="small-title">${escapeHTML(instName)}</h1>
          <p>Academic innovation partner · North NCR</p>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat"><strong>${liveProblems.filter(p => p.is_taken).length || 14}</strong><small>ADOPTED CHALLENGES</small></div>
        <div class="stat"><strong>48</strong><small>ACTIVE STUDENTS</small></div>
        <div class="stat"><strong>94.2%</strong><small>RESOLUTION RATE</small></div>
        <div class="stat"><strong>06</strong><small>GRANT POOLS</small></div>
      </div>

      <div class="tabs">${['Overview', 'Adopt Challenges', 'Student Pods'].map(t => `<button class="${activeTab === t ? 'tab-active' : ''}" data-tab="${t}">${t}</button>`).join('')}</div>

      ${activeTab === 'Overview' ? `
        <div class="dashboard-welcome">
          <div>
            <div class="eyebrow">PARTNERSHIP WORKSPACE</div>
            <h2>Make collaboration count.</h2>
            <p>Coordinate student teams, review field progress and document verified impact.</p>
          </div>
          <img src="${photos.community}" alt="Community partnership">
        </div>
        <div class="dashboard-actions">
          <button class="button button-dark" data-view="home">Browse Challenges ↗</button>
          <button class="button button-outline" data-tab="Student Pods">View Student Pods</button>
        </div>
        <div class="mini-grid">
          <article class="mini-card"><span>↗</span><b>Challenge matching</b><p>Find a community problem that fits your teams.</p></article>
          <article class="mini-card"><span>◎</span><b>Impact verification</b><p>Keep project evidence and progress visible.</p></article>
        </div>
      ` : ''}

      ${activeTab === 'Adopt Challenges' ? `
        <h2>Available challenges</h2>
        <div class="challenge-list">
          ${liveProblems.map(challengeCard).join('')}
        </div>
      ` : ''}

      ${activeTab === 'Student Pods' ? `
        <h2>Active student pods</h2>
        ${[
          ['Enactus Eco-Cell', 'Neighbourhood waste mapping', photos.field],
          ['Civic Sensing Lab', 'Water supply reporting pilot', photos.site],
          ['Urban Inclusion Collective', 'Footpath accessibility audit', photos.community]
        ].map(([team, project, image]) => `
          <article class="pod-card reveal">
            <img src="${image}" alt="${team}" loading="lazy">
            <div>
              <b>${team}</b>
              <p>${project}</p>
              <span class="tag">Field deployment</span>
            </div>
          </article>`).join('')}
      ` : ''}
    </section>`;
}

function providerPage() {
  return `
    <section class="section section-pad dashboard">
      <div class="eyebrow">COMMUNITY ISSUE DESK · DEMO</div>
      <h1 class="small-title">Your community, heard.</h1>
      <p>Report problems, add context and follow the progress of local solutions.</p>

      <div class="dashboard-welcome">
        <div>
          <h2>Every improvement starts with evidence.</h2>
          <p>Share the location and impact so the right people can help.</p>
        </div>
        <img src="${photos.community}" alt="Community members working together">
      </div>

      <div class="stats-grid">
        <div class="stat"><strong>${6 + liveProblems.length}</strong><small>LOGGED</small></div>
        <div class="stat"><strong>${liveProblems.filter(p => p.is_taken).length}</strong><small>MATCHED</small></div>
        <div class="stat"><strong>3</strong><small>IN FIELD</small></div>
        <div class="stat"><strong>1</strong><small>VERIFIED</small></div>
      </div>

      <div class="notice">
        <div class="eyebrow">CIVIC LEDGER</div>
        <p>Document local problems with clear evidence so the right teams can help. Avoid sharing personal or sensitive information publicly.</p>
      </div>

      <form id="issue-form" class="form-panel">
        <div class="form-heading">SUBMIT A CIVIC PROBLEM</div>

        <label class="field">Problem title<input name="title" required placeholder="What needs to be solved?"></label>

        <div class="field-grid">
          <label class="field">Category
            <select name="category">
              <option>Environment & sanitation</option>
              <option>Education</option>
              <option>Infrastructure</option>
              <option>Transport</option>
              <option>Healthcare</option>
              <option>Accessibility</option>
              <option>Digital learning</option>
              <option>Public lighting</option>
              <option>Water</option>
              <option>Food security</option>
              <option>Other</option>
            </select>
          </label>
          <label class="field">Urgency
            <select name="urgency">
              <option value="Normal">Normal</option>
              <option value="Time-sensitive">Time-sensitive</option>
              <option value="Urgent">Urgent</option>
            </select>
          </label>
        </div>

        <label class="field">Location<input name="location" required placeholder="Ward, street or landmark"></label>
        <label class="field">Short description<textarea name="description" required rows="3" placeholder="Describe the issue and its impact"></textarea></label>
        <label class="field">Expected outcomes (optional)<input name="expected_outcomes" placeholder="Link to a photo or public report"></label>

        <button class="button button-dark full" type="submit" id="issue-submit-btn">Submit Problem →</button>
      </form>

      <h2>Your Published Problems</h2>
      <div class="challenge-list">
        ${liveProblems.slice(0, 3).map(challengeCard).join('')}
      </div>
    </section>`;
}

function solverPage() {
  const solverName = currentUser?.full_name || 'Priya Sharma';
  const solverDept = 'B.Tech Environmental Engineering · Year 4';
  const solverCollege = 'Delhi Technological University';

  return `
    <section class="section section-pad dashboard">
      <div class="eyebrow">STUDENT SOLVER · DEMO PROFILE</div>
      <div class="profile-heading">
        <img class="avatar" src="${photos.student}" alt="Student profile">
        <div>
          <h1 class="small-title">${escapeHTML(solverName)}</h1>
          <p>${escapeHTML(solverDept)}</p>
          <p>${escapeHTML(solverCollege)}</p>
        </div>
      </div>

      <div class="skills-row">
        <span class="tag">Environmental Engineering</span>
        <span class="tag">GIS Mapping</span>
        <span class="tag">IoT</span>
        <span class="tag">Field Research</span>
      </div>

      <div class="stats-grid">
        <div class="stat"><strong>4</strong><small>ISSUES RESOLVED</small></div>
        <div class="stat"><strong>120 hrs</strong><small>FIELD IMPACT</small></div>
        <div class="stat"><strong>₹65k</strong><small>GRANTS MANAGED</small></div>
        <div class="stat"><strong>12</strong><small>CIVIC CONTRIBUTIONS</small></div>
      </div>
    </section>

    <section class="section section-pad tinted">
      <div class="eyebrow">ACTIVE ENGINEERING SPRINT</div>
      <h2>Current deployment</h2>
      <article class="project-card reveal">
        <img class="wide-image" src="${photos.field}" alt="Community field project">
        <div class="project-content">
          <div class="status-indicator taken">
            <span class="dot red-dot"></span>
            <span>Sprint In Progress</span>
          </div>
          <h3>Neighbourhood waste mapping pilot</h3>
          <p>Community-led · Civic environment</p>
          <div class="progress-block">
            <div class="progress-header">
              <span>Sprint Progress</span>
              <span>92%</span>
            </div>
            <div class="progress-bar-wrap">
              <div class="progress-bar-fill" style="width: 92%"></div>
            </div>
            <span class="progress-note">Milestone 3 of 3 · Awaiting final review.</span>
          </div>
        </div>
      </article>
    </section>

    <section class="section section-pad">
      <div class="eyebrow">DISCOVER CIVIC CHALLENGES</div>
      <h2>Find your next project</h2>
      <p>Choose a challenge that matches your skills and curiosity.</p>
      <div class="challenge-list">
        ${liveProblems.filter(p => !p.is_taken).slice(0, 3).map(challengeCard).join('')}
      </div>
    </section>`;
}

function applyModal() {
  if (!applyModalOpen || !selectedProblemForApply) return '';
  const p = selectedProblemForApply;

  return `
    <div class="modal-backdrop" data-action="close-apply-modal">
      <div class="apply-modal-box" role="dialog" aria-modal="true">
        <button class="modal-close" data-action="close-apply-modal" aria-label="Close modal">×</button>
        <div class="eyebrow">APPLY TO SOLVE</div>
        <h2>${escapeHTML(p.title)}</h2>
        <p style="font-size: 14px; color: var(--muted);">${escapeHTML(p.category)} · ${escapeHTML(p.target_community || 'Community')}</p>

        <!-- Two Tabs: Individual vs Team -->
        <div class="apply-tabs">
          <button class="apply-tab-btn ${applyTab === 'individual' ? 'active' : ''}" data-apply-tab="individual">
            Individual Solver
          </button>
          <button class="apply-tab-btn ${applyTab === 'team' ? 'active' : ''}" data-apply-tab="team">
            Team (Same College) 👥
          </button>
        </div>

        <form id="apply-form">
          <input type="hidden" name="problem_id" value="${p.id}">
          <input type="hidden" name="apply_type" value="${applyTab}">

          ${applyTab === 'team' ? `
            <div style="background: rgba(184, 159, 243, 0.1); padding: 12px; border-radius: 8px; margin-bottom: 14px;">
              <div class="field-grid">
                <label class="field">Team Name<input name="team_name" required placeholder="e.g. AgroTech Innovators"></label>
                <label class="field">College / Institution<input name="college_name" required placeholder="e.g. COEP Technological University"></label>
              </div>

              <div style="font-size: 13px; font-weight: 700; color: var(--ink); margin: 12px 0 6px;">Teammates (Email Confirmations Will Be Sent):</div>
              <div id="teammates-container">
                ${teamMembers.map((m, idx) => `
                  <div class="teammate-row" data-idx="${idx}">
                    <input name="member_name_${idx}" value="${escapeHTML(m.name)}" placeholder="Member Name" required>
                    <input name="member_email_${idx}" type="email" value="${escapeHTML(m.email)}" placeholder="member@college.ac.in" required>
                    ${teamMembers.length > 1 ? `<button type="button" class="remove-btn" data-action="remove-member" data-idx="${idx}">×</button>` : ''}
                  </div>
                `).join('')}
              </div>
              <button type="button" class="add-member-btn" data-action="add-member">+ Add Another Teammate</button>
            </div>
          ` : ''}

          <label class="field">Your Solution Proposal<textarea name="proposal" required rows="3" placeholder="Outline your technical approach and how you will solve this challenge..."></textarea></label>
          <div class="field-grid">
            <label class="field">Estimated Completion (Weeks)<input name="weeks" type="number" min="1" max="52" value="4" required></label>
            <label class="field">Relevant Experience<input name="experience" placeholder="e.g. Built sensor prototype / React app"></label>
          </div>

          <button class="button button-dark full" type="submit" id="submit-application-btn" style="margin-top: 14px;">
            ${applyTab === 'team' ? 'Register Team & Send Member Confirmation Emails →' : 'Submit Application →'}
          </button>
        </form>
      </div>
    </div>`;
}

function escapeHTML(value: string | undefined | null) {
  if (!value) return '';
  return String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] || c));
}

function render() {
  const pages: Record<View, () => string> = { 
    home: homePage, 
    register: registerPage, 
    organisation: organisationPage, 
    provider: providerPage, 
    solver: solverPage 
  };
  const app = document.querySelector<HTMLDivElement>('#app');
  if (!app) return;

  app.innerHTML = `
    ${header()}<main>${pages[currentView]()}</main>
    <footer class="footer"><p>Real problems. Verified solutions.</p><small>© 2026 · Civic Innovation Platform</small></footer>
    ${nav()}
    ${applyModal()}
    <div class="toast" id="toast" aria-live="polite"></div>`;

  setupRevealAnimations();
}

function setupRevealAnimations() {
  const elements = Array.from(new Set(document.querySelectorAll<HTMLElement>(
    '.reveal, .mission-copy, .mission-photo-wrap, .who-heading, .who-copy, .solved-heading, .solved-card, .impact-band > *:not(.section-stamp)'
  )));

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!('IntersectionObserver' in window) || reduceMotion) {
    elements.forEach(el => el.classList.add('is-visible'));
    return;
  }

  elements.forEach((el, index) => {
    el.classList.add('reveal');
    el.classList.remove('is-visible');
    el.style.setProperty('--reveal-delay', `${Math.min(index % 4, 3) * 100}ms`);
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        (entry.target as HTMLElement).classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -45px 0px' });

  elements.forEach(el => observer.observe(el));
}

function showToast(message: string) {
  const toast = document.querySelector<HTMLDivElement>('#toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('visible');
  window.setTimeout(() => toast.classList.remove('visible'), 3200);
}

// Global Event Listeners
document.addEventListener('click', async event => {
  const target = event.target as HTMLElement;

  const viewButton = target.closest<HTMLElement>('[data-view]');
  const actionButton = target.closest<HTMLElement>('[data-action]');
  const tabButton = target.closest<HTMLElement>('[data-tab]');
  const scrollButton = target.closest<HTMLElement>('[data-scroll]');
  const authButton = target.closest<HTMLElement>('[data-auth-mode]');
  const filterButton = target.closest<HTMLElement>('[data-filter]');
  const openApplyBtn = target.closest<HTMLElement>('[data-open-apply]');
  const applyTabBtn = target.closest<HTMLElement>('[data-apply-tab]');
  const demoBtn = target.closest<HTMLElement>('[data-demo-email]');

  if (viewButton) {
    event.preventDefault();
    go(viewButton.dataset.view as View);
    return;
  }

  if (tabButton) {
    activeTab = tabButton.dataset.tab || 'Overview';
    render();
    return;
  }

  if (scrollButton) {
    const sectionId = scrollButton.dataset.scroll || '';
    const scrollToSection = () => {
      document.getElementById(sectionId)?.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'start'
      });
    };

    if (currentView !== 'home' || !document.getElementById(sectionId)) {
      currentView = 'home';
      modalOpen = false;
      render();
      window.requestAnimationFrame(scrollToSection);
    } else {
      scrollToSection();
    }
    return;
  }

  if (authButton) {
    authMode = authButton.dataset.authMode as 'login' | 'register';
    authError = '';
    render();
    return;
  }

  if (filterButton) {
    challengeFilter = filterButton.dataset.filter || 'All';
    render();
    if (document.getElementById('challenges')) {
      document.getElementById('challenges')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    return;
  }

  // 1-Click Persona Sign-In Click
  if (demoBtn) {
    const email = demoBtn.dataset.demoEmail;
    if (email) {
      try {
        authError = '';
        const res = await ApiClient.login(email, 'DemoPassword123!');
        currentUser = res.user;
        showToast(`Signed in as ${res.user.full_name} (${res.user.role})`);
        if (res.user.role === 'provider') go('provider');
        else if (res.user.role === 'organization' || res.user.role === 'institution' || res.user.role === 'admin') go('organisation');
        else go('solver');
      } catch (err: any) {
        authError = err.message || 'Login failed';
        showToast(`Login failed: ${authError}`);
        render();
      }
    }
    return;
  }

  // Open Apply Modal
  if (openApplyBtn) {
    const pId = openApplyBtn.dataset.openApply;
    const prob = liveProblems.find(p => p.id === pId);
    if (prob) {
      selectedProblemForApply = prob;
      applyTab = 'individual';
      teamMembers = [{ name: '', email: '' }];
      applyModalOpen = true;
      render();
    }
    return;
  }

  // Switch Apply Modal Tab
  if (applyTabBtn) {
    applyTab = (applyTabBtn.dataset.applyTab as 'individual' | 'team') || 'individual';
    render();
    return;
  }

  // Add/Remove Team Member in Modal
  if (actionButton) {
    const action = actionButton.dataset.action;
    if (action === 'add-member') {
      teamMembers.push({ name: '', email: '' });
      render();
      return;
    }
    if (action === 'remove-member') {
      const idx = Number(actionButton.dataset.idx);
      teamMembers.splice(idx, 1);
      render();
      return;
    }
    if (action === 'close-apply-modal') {
      if (target.closest('.apply-modal-box') && !target.closest('.modal-close')) return;
      applyModalOpen = false;
      render();
      return;
    }
    if (action === 'signin') {
      authMode = 'login';
      go('register');
      return;
    }
    if (action === 'register') {
      authMode = 'register';
      selectedRole = 'solver';
      go('register');
      return;
    }
    if (action === 'signout') {
      ApiClient.logout();
      currentUser = null;
      showToast('Signed out successfully.');
      go('home');
      return;
    }
  }
});

document.addEventListener('change', event => {
  const target = event.target as HTMLInputElement;
  if (target.name === 'role') {
    selectedRole = target.value as Role;
    render();
  }
});

// Forms Submit
document.addEventListener('submit', async event => {
  event.preventDefault();
  const form = event.target as HTMLFormElement;
  const data = new FormData(form);

  // Authentication Form Submit (Login & Register)
  if (form.id === 'register-form' || form.id === 'auth-form') {
    const email = String(data.get('email') || '').trim();
    const password = String(data.get('password') || '');
    const submitBtn = document.getElementById('auth-submit-btn') as HTMLButtonElement;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Authenticating...';
    }
    authError = '';

    try {
      if (authMode === 'login') {
        const res = await ApiClient.login(email, password);
        currentUser = res.user;
        showToast(`Welcome back, ${res.user.full_name}!`);
        if (res.user.role === 'provider') go('provider');
        else if (res.user.role === 'organization' || res.user.role === 'institution' || res.user.role === 'admin') go('organisation');
        else go('solver');
      } else {
        const name = String(data.get('name') || '');
        const role = selectedRole === 'organisation' ? 'organization' : selectedRole;
        const res = await ApiClient.register({
          email,
          password,
          full_name: name,
          role,
          skills: data.get('skills') ? String(data.get('skills')).split(',').map(s => s.trim()) : undefined,
          department: String(data.get('course') || ''),
          year_of_study: Number(data.get('year') || 1)
        });
        currentUser = res.user;
        showToast(`Account created for ${res.user.full_name}!`);
        if (role === 'provider') go('provider');
        else if (role === 'organization') go('organisation');
        else go('solver');
      }
    } catch (err: any) {
      authError = err.message || 'Authentication failed. Please verify credentials.';
      render();
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = authMode === 'login' ? 'Continue to Workspace →' : 'Create account & continue →';
      }
    }
    return;
  }

  // Provider Problem Submit
  if (form.id === 'issue-form') {
    const title = String(data.get('title') || '').trim();
    const category = String(data.get('category') || 'Environment & sanitation');
    const urgency = String(data.get('urgency') || 'Normal');
    const location = String(data.get('location') || '').trim();
    const description = String(data.get('description') || '').trim();
    const expected = String(data.get('expected_outcomes') || '');

    const submitBtn = document.getElementById('issue-submit-btn') as HTMLButtonElement;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting & Analyzing with AI...';
    }

    try {
      const newProb = await ApiClient.createProblem({
        title,
        category,
        urgency_level: urgency,
        target_community: location,
        description,
        expected_outcomes: expected
      });

      liveProblems.unshift(newProb);
      showToast('Problem submitted! AI has generated requirements & skills analysis.');
      go('provider');
    } catch (err: any) {
      showToast(`Submission error: ${err.message}`);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Problem →';
      }
    }
    return;
  }

  // Apply to Problem Submit (Individual or Team)
  if (form.id === 'apply-form') {
    const problemId = String(data.get('problem_id') || '');
    const applyType = String(data.get('apply_type') || 'individual');
    const proposal = String(data.get('proposal') || '');
    const weeks = Number(data.get('weeks') || 4);
    const experience = String(data.get('experience') || '');

    let teamPayload: any = {
      proposal_text: proposal,
      estimated_completion_weeks: weeks,
      relevant_experience: experience,
    };

    if (applyType === 'team') {
      const teamName = String(data.get('team_name') || '');
      const collegeName = String(data.get('college_name') || '');
      const members: { full_name: string; email: string }[] = [];

      for (let i = 0; i < 20; i++) {
        const mName = data.get(`member_name_${i}`);
        const mEmail = data.get(`member_email_${i}`);
        if (mName && mEmail) {
          members.push({ full_name: String(mName).trim(), email: String(mEmail).trim() });
        }
      }

      teamPayload.team_name = teamName;
      teamPayload.college_name = collegeName;
      teamPayload.team_members = members;
    }

    const submitBtn = document.getElementById('submit-application-btn') as HTMLButtonElement;
    if (submitBtn) submitBtn.disabled = true;

    try {
      await ApiClient.applyToProblem(problemId, teamPayload);
      
      // Update local problem status immediately
      const targetProb = liveProblems.find(p => p.id === problemId);
      if (targetProb) {
        targetProb.is_taken = true;
        targetProb.status = 'in_progress';
        targetProb.progress_percentage = 15;
        if (teamPayload.team_name) {
          targetProb.assigned_team_name = teamPayload.team_name;
        } else if (currentUser) {
          targetProb.assigned_solver_name = currentUser.full_name;
        }
      }

      applyModalOpen = false;
      render();

      if (applyType === 'team') {
        showToast('Team application submitted! Confirmation emails dispatched to teammates.');
      } else {
        showToast('Application submitted successfully! Problem marked as Taken.');
      }
    } catch (err: any) {
      showToast(`Application error: ${err.message}`);
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  }
});

// Boot the app
initAppData();
