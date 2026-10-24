import './style.css';
import { ApiClient, type User, type Problem, type DemoUser, type StudentDirectoryItem } from './api';

type View = 'home' | 'register' | 'organisation' | 'provider' | 'solver';
type Role = 'provider' | 'solver' | 'organisation';
type SolverRegType = 'individual' | 'organisation';

let currentView: View = 'home';
let selectedRole: Role = 'solver';
let solverRegTab: SolverRegType = 'individual';

// Navigation & Tab States
let activeOrgTab = 'Overview'; // 'Overview' | 'List of Students' | 'List of Collaborators' | 'Previous Projects'
let activeSolverWorkTab = 'individual'; // 'individual' | 'team'
let orgProjectFilter = 'All'; // 'All' | 'completed' | 'ongoing' | 'unsuccessful'

let modalOpen = false;
let applyModalOpen = false;
let studentDetailModalOpen = false;
let selectedStudentForModal: StudentDirectoryItem | null = null;
let selectedProblemForApply: Problem | null = null;
let applyTab: 'individual' | 'team' = 'individual';
let teamMembers: { name: string; email: string }[] = [{ name: '', email: '' }];

let authMode: 'login' | 'register' = 'register';
let authError = '';
let challengeFilter = 'All';

// State loaded from Backend
let currentUser: User | null = ApiClient.getUser();
let liveProblems: Problem[] = [];
let demoUsers: DemoUser[] = [];
let userProjects: any[] = [];
let solverSkills: { id: string; skill_name: string }[] = [];

// Pre-seeded initial student directory (4 columns: Name with Roll No, Successfully Solved, Unsuccessful, Ongoing)
let studentDirectory: StudentDirectoryItem[] = [
  {
    id: "stu-1",
    full_name: "Arjun Sharma",
    roll_number: "COEP-2022-CS-041",
    email: "arjun.sharma@coep.ac.in",
    phone: "+91 98230 44120",
    college_name: "COEP Technological University",
    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=ArjunSharma",
    solved_count: 3,
    ongoing_count: 1,
    unsuccessful_count: 0,
    skills: ["Python", "GIS", "IoT", "React"]
  },
  {
    id: "stu-2",
    full_name: "Priya Nair",
    roll_number: "COEP-2022-ENV-019",
    email: "priya.nair@coep.ac.in",
    phone: "+91 98230 44121",
    college_name: "COEP Technological University",
    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=PriyaNair",
    solved_count: 2,
    ongoing_count: 2,
    unsuccessful_count: 0,
    skills: ["Environmental Science", "Water Quality", "Data Analysis"]
  },
  {
    id: "stu-3",
    full_name: "Rohit Patil",
    roll_number: "COEP-2022-IT-088",
    email: "rohit.patil@coep.ac.in",
    phone: "+91 98230 44122",
    college_name: "COEP Technological University",
    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=RohitPatil",
    solved_count: 1,
    ongoing_count: 1,
    unsuccessful_count: 1,
    skills: ["Embedded C", "LoRaWAN", "Sensors"]
  },
  {
    id: "stu-4",
    full_name: "Ananya Deshmukh",
    roll_number: "COEP-2023-EXTC-012",
    email: "ananya.deshmukh@coep.ac.in",
    phone: "+91 98230 44123",
    college_name: "COEP Technological University",
    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=AnanyaDeshmukh",
    solved_count: 2,
    ongoing_count: 0,
    unsuccessful_count: 1,
    skills: ["Telemetry", "Arduino", "Signal Processing"]
  },
  {
    id: "stu-5",
    full_name: "Kunal Kulkarni",
    roll_number: "COEP-2023-MECH-055",
    email: "kunal.kulkarni@coep.ac.in",
    phone: "+91 98230 44124",
    college_name: "COEP Technological University",
    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=KunalKulkarni",
    solved_count: 1,
    ongoing_count: 1,
    unsuccessful_count: 0,
    skills: ["SolidWorks", "Thermal Analysis", "Solar Systems"]
  }
];

let directorySearchQuery = '';
let directorySortBy = 'name';

// Statistics states
let providerStats = {
  pie_chart: { problems_accepted: 4, problems_rejected: 1 },
  stats: { total_submitted: 5, pending_review: 0, currently_being_solved: 2, completed: 2 }
};

let solverDashboardData: {
  pie_chart: { problems_solved: number; problems_ongoing: number; problems_failed: number };
  individual_projects: any[];
  team_projects: any[];
} = {
  pie_chart: { problems_solved: 4, problems_ongoing: 2, problems_failed: 0 },
  individual_projects: [],
  team_projects: []
};

let orgDashboardData: any = {
  org_name: 'COEP Technological University',
  aicte_code: '1-34891024',
  spoc_name: 'Dr. Vikram Mehta',
  spoc_email: 'vikram.mehta@ruraltech.org',
  address: 'Wellesley Rd, Shivajinagar, Pune, Maharashtra 411005',
  logo_url: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=400&q=80',
  pie_chart: { solved_by_students: 14, solved_by_collaborators: 6 },
  collaborators: [
    { name: "Rural Technology Action Group (RuTAG)", role: "Technical Mentorship", projects: 4 },
    { name: "State Jal Shakti Mission", role: "Civic Partner", projects: 3 },
    { name: "Maharashtra Innovation Society", role: "CSR Sponsor", projects: 5 }
  ],
  previous_projects: [
    {
      id: "proj-1",
      title: "Panchayat Gravity Water Filtration & Fluoride Removal",
      problem_statement: "Fluoride contamination in drinking water affecting 450 households.",
      participants: "Arjun Sharma, Priya Nair, RuTAG Mentors",
      status: "completed",
      solution_summary: "Activated alumina filter system installed at primary borewell.",
      completion_date: "2026-08-15",
      supporting_docs: "https://cosolve.gov.in/docs/water-test-report.pdf",
      recognition: "State Rural Innovation Award 2026"
    },
    {
      id: "proj-2",
      title: "Flood Alert & Drainage Sensor Network",
      problem_statement: "Heavy seasonal waterlogging blocking market roads and transit.",
      participants: "Enactus Civic Sensing Pod, Prof. Kulkarni",
      status: "ongoing",
      solution_summary: "Ultrasonic depth sensors with LoRaWAN telemetry to ward control.",
      completion_date: "Expected Nov 2026",
      supporting_docs: "https://cosolve.gov.in/docs/sensor-specs.pdf",
      recognition: "Smart Cities Grant"
    },
    {
      id: "proj-3",
      title: "Solar Powered Cold Storage Prototype",
      problem_statement: "Perishable vegetable post-harvest losses among local farming clusters.",
      participants: "Mechanical Engineering Pod 4",
      status: "unsuccessful",
      solution_summary: "Peltier based experimental cooler; lacked thermal capacity for peak summer.",
      completion_date: "2026-05-10",
      supporting_docs: "https://cosolve.gov.in/docs/post-mortem.pdf",
      recognition: "Prototype Documented"
    }
  ]
};

const photos = {
  hero: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1400&q=85',
  field: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1000&q=85',
  community: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=1000&q=85',
  student: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=85',
  school: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1000&q=85',
  flood: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=1000&q=85',
  water: 'https://images.unsplash.com/photo-1530053969600-caed2596d242?auto=format&fit=crop&w=1000&q=85',
  hospital: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1000&q=85',
  bus: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=1000&q=85',
  lights: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1000&q=85'
};

function getImageForCategory(cat: string): string {
  const c = (cat || '').toLowerCase();
  if (c.includes('water')) return photos.water;
  if (c.includes('environ') || c.includes('waste')) return photos.field;
  if (c.includes('infra') || c.includes('road')) return photos.flood;
  if (c.includes('edu') || c.includes('school')) return photos.school;
  if (c.includes('trans')) return photos.bus;
  if (c.includes('health')) return photos.hospital;
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

    // Always fetch live organisation data and student directory so Organisation view is fully loaded
    try {
      const fetchedOrg = await ApiClient.getOrgDashboardStats();
      if (fetchedOrg && fetchedOrg.org_name) {
        orgDashboardData = {
          ...orgDashboardData,
          ...fetchedOrg,
          previous_projects: (fetchedOrg.previous_projects && fetchedOrg.previous_projects.length > 0)
            ? fetchedOrg.previous_projects
            : orgDashboardData.previous_projects
        };
      }
    } catch (e) {
      console.debug("Org stats note:", e);
    }

    try {
      const fetchedStudents = await ApiClient.getOrgStudents(directorySearchQuery, directorySortBy);
      if (fetchedStudents && fetchedStudents.length > 0) {
        studentDirectory = fetchedStudents;
      }
    } catch (e) {
      console.debug("Student directory note:", e);
    }

    // Fetch role-specific stats
    if (currentUser) {
      if (currentUser.role === 'provider') {
        providerStats = await ApiClient.getProviderStats().catch(() => providerStats);
      } else if (currentUser.role === 'solver') {
        solverDashboardData = await ApiClient.getSolverStats().catch(() => solverDashboardData);
        solverSkills = await ApiClient.getSkills().catch(() => []);
      }
    }

    // Check hash route
    handleHashRoute();

    render();
  } catch (err) {
    console.warn("Initial sync note:", err);
  }
}

// SVG Pie Chart Generator
function renderSvgPieChart(slices: { label: string; value: number; color: string }[], size = 180): string {
  const total = slices.reduce((acc, s) => acc + s.value, 0);
  const radius = size / 2;
  const center = radius;

  if (total === 0) {
    return `
      <div class="pie-chart-flex">
        <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
          <circle cx="${center}" cy="${center}" r="${radius - 12}" fill="none" stroke="#e9ddcc" stroke-width="24" />
          <text x="${center}" y="${center + 4}" text-anchor="middle" fill="#78716c" font-size="12" font-family="sans-serif">No Records</text>
        </svg>
        <div class="pie-legend">
          ${slices.map(s => `
            <div class="legend-item">
              <span class="legend-color-dot" style="background-color: ${s.color}"></span>
              <span>${escapeHTML(s.label)}</span>
              <span class="legend-val">0 (0%)</span>
            </div>
          `).join('')}
        </div>
      </div>`;
  }

  // Calculate paths
  let currentAngle = -Math.PI / 2; // start at 12 o'clock
  const paths: string[] = [];

  slices.forEach(slice => {
    if (slice.value === 0) return;
    const sliceAngle = (slice.value / total) * 2 * Math.PI;

    if (sliceAngle >= 2 * Math.PI - 0.001) {
      // Full circle
      paths.push(`<circle cx="${center}" cy="${center}" r="${radius - 16}" fill="${slice.color}" />`);
      return;
    }

    const x1 = center + (radius - 16) * Math.cos(currentAngle);
    const y1 = center + (radius - 16) * Math.sin(currentAngle);

    currentAngle += sliceAngle;

    const x2 = center + (radius - 16) * Math.cos(currentAngle);
    const y2 = center + (radius - 16) * Math.sin(currentAngle);

    const largeArcFlag = sliceAngle > Math.PI ? 1 : 0;
    const pathData = `M ${center} ${center} L ${x1} ${y1} A ${radius - 16} ${radius - 16} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

    paths.push(`<path d="${pathData}" fill="${slice.color}" stroke="#fffdf6" stroke-width="2" />`);
  });

  return `
    <div class="pie-chart-flex">
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        ${paths.join('')}
        <circle cx="${center}" cy="${center}" r="${radius - 50}" fill="var(--card)" />
        <text x="${center}" y="${center - 2}" text-anchor="middle" fill="var(--ink)" font-size="18" font-weight="bold" font-family="sans-serif">${total}</text>
        <text x="${center}" y="${center + 14}" text-anchor="middle" fill="var(--muted)" font-size="10" font-family="sans-serif">TOTAL</text>
      </svg>
      <div class="pie-legend">
        ${slices.map(s => {
          const pct = total > 0 ? Math.round((s.value / total) * 100) : 0;
          return `
            <div class="legend-item">
              <span class="legend-color-dot" style="background-color: ${s.color}"></span>
              <span>${escapeHTML(s.label)}</span>
              <span class="legend-val">${s.value} <small style="color:var(--muted)">(${pct}%)</small></span>
            </div>
          `;
        }).join('')}
      </div>
    </div>`;
}

function handleHashRoute() {
  const hash = window.location.hash.toLowerCase();
  if (hash === '#organisation' || hash === '#organization') {
    activeOrgTab = 'Overview';
    currentView = 'organisation';
  } else if (hash === '#students' || hash === '#organisation-students') {
    activeOrgTab = 'List of Students';
    currentView = 'organisation';
  } else if (hash === '#collaborators') {
    activeOrgTab = 'List of Collaborators';
    currentView = 'organisation';
  } else if (hash === '#solver') {
    currentView = 'solver';
  } else if (hash === '#provider') {
    currentView = 'provider';
  } else if (hash === '#register') {
    currentView = 'register';
  } else if (hash === '#home') {
    currentView = 'home';
  }
}

window.addEventListener('hashchange', () => {
  handleHashRoute();
  render();
});

function go(view: View) {
  currentView = view;
  modalOpen = false;
  applyModalOpen = false;
  studentDetailModalOpen = false;
  authError = '';
  if (view === 'organisation') {
    window.location.hash = activeOrgTab === 'List of Students' ? 'students' : 'organisation';
  } else {
    window.location.hash = view;
  }
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
            <button class="button button-dark nav-start" data-action="register">Get Started ↗</button>
            <button class="button button-outline nav-login" data-action="signin">Login</button>
          `}
        </div>
      </div>
      <nav class="desktop-actions site-links" aria-label="Main navigation">
        <button class="nav-link" data-scroll="who-we-are">Who are we?</button>
        <button class="nav-link" data-scroll="challenges">Explore</button>
        <button class="nav-link" data-scroll="solved-problems">Solved problems</button>
        <button class="nav-link" data-scroll="impact">Impact</button>
        <button class="nav-link ${currentView === 'organisation' ? 'active' : ''}" data-view="organisation" style="font-weight: 700; color: #422d27; border: 1px solid var(--line); border-radius: 20px; padding: 4px 12px; background: var(--card);">⌂ Organisation</button>
      </nav>
    </header>`;
}

function nav() {
  const items: { label: string; view: View; symbol: string }[] = [
    { label: 'PUBLIC', view: 'home', symbol: '◉' },
    { label: 'SOLVER', view: 'solver', symbol: '◎' },
    { label: 'PROVIDER', view: 'provider', symbol: '♧' },
    { label: 'ORGANISATION', view: 'organisation', symbol: '⌂' }
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
        <button class="button button-dark" data-action="register">Be Part of Change <span aria-hidden="true">→</span></button>
      </div>
    </section>

    <section class="section section-pad pillars-section">
      <div class="eyebrow">THREE PILLARS. ONE PURPOSE.</div><h2>Better, together.</h2>
      <div class="pillar-grid">
        <article class="pillar reveal"><span class="pillar-icon">♧</span><b>Citizens & providers</b><p>Share local problems and help define what needs to change.</p><button class="text-action" data-view="provider">Report a problem ↗</button></article>
        <article class="pillar reveal"><span class="pillar-icon">✳</span><b>Student solvers</b><p>Use your skills, curiosity and creativity to build solutions.</p><button class="text-action" data-view="solver">Explore solver space ↗</button></article>
        <article class="pillar reveal"><span class="pillar-icon">⌂</span><b>Institutions</b><p>Support teams, offer mentorship and help validate outcomes.</p><button class="text-action" data-view="organisation">Partner with us ↗</button></article>
      </div>
      <button class="button button-dark full" data-action="register">Join CO-SOLVE ↗</button>
    </section>`;
}

// PRD Section 1: Registration Form with 3 Types (Provider, Individual Solver, Organisation)
function registerPage() {
  return `
    <section class="section section-pad register-layout">
      <div class="register-intro">
        <div class="eyebrow">CIVIC REGISTRY</div>
        <h1 class="small-title">Join the<br>Coordination Network</h1>
        <p>Select your account type to enter your CO-SOLVE workspace.</p>
        <div class="register-visual">
          <img src="${photos.student}" alt="Students collaborating">
          <div><strong>Many perspectives.</strong><br>One shared purpose.</div>
        </div>

        <div class="demo-persona-container" style="margin-top: 20px;">
          <div class="demo-persona-title">Quick 1-Click Demo Login</div>
          <div class="demo-persona-list">
            <button type="button" class="demo-persona-btn" data-demo-email="sarpanch.ramesh@shirur-panchayat.org" data-demo-role="provider">
              <span>Ramesh Patil</span>
              <small>Provider</small>
            </button>
            <button type="button" class="demo-persona-btn" data-demo-email="arjun.sharma@coep.ac.in" data-demo-role="solver">
              <span>Arjun Sharma</span>
              <small>Student Solver</small>
            </button>
            <button type="button" class="demo-persona-btn" data-demo-email="vikram.mehta@ruraltech.org" data-demo-role="organization">
              <span>Dr. Vikram Mehta</span>
              <small>Organisation</small>
            </button>
          </div>
        </div>
      </div>

      <div class="register-panel">
        <div class="segmented">
          <button type="button" class="${authMode === 'login' ? 'selected' : ''}" data-auth-mode="login">Login</button>
          <button type="button" class="${authMode === 'register' ? 'selected' : ''}" data-auth-mode="register">Create account</button>
        </div>

        ${authMode === 'login' ? renderLoginForm() : renderRegisterForm()}
      </div>
    </section>`;
}

// PRD Section 2: User Login Form (Common interface for all three account types)
function renderLoginForm() {
  return `
    <form id="login-form">
      ${authError ? `<div style="padding: 10px 14px; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); border-radius: 8px; color: #b91c1c; font-size: 13px; font-weight: 600; margin-bottom: 14px;">${escapeHTML(authError)}</div>` : ''}

      <div class="form-heading">SIGN IN TO YOUR WORKSPACE</div>

      <label class="field">
        Phone Number or Email Address
        <input name="identifier" id="login-identifier" required placeholder="you@example.com or +91 98765 43210">
      </label>

      <label class="field">
        Password
        <input name="password" type="password" id="login-password" required placeholder="Enter password (Demo: DemoPassword123!)">
      </label>

      <div class="field-grid" style="align-items: flex-end;">
        <label class="field" style="margin: 0;">
          Verification Code (OTP) — Optional
          <input name="otp" placeholder="Enter OTP (Optional)">
        </label>
        <button type="button" class="button button-outline" data-action="request-login-otp" style="height: 44px;">
          Send OTP
        </button>
      </div>

      <div style="display: flex; justify-content: flex-end; margin: 8px 0 16px;">
        <button type="button" class="text-action" data-action="forgot-password" style="font-size: 13px;">Forgot Password?</button>
      </div>

      <button class="button button-dark full" type="submit" id="auth-submit-btn">
        Login to Workspace →
      </button>
    </form>`;
}

// PRD Section 1: User Registration Forms
function renderRegisterForm() {
  return `
    <form id="register-form">
      ${authError ? `<div style="padding: 10px 14px; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); border-radius: 8px; color: #b91c1c; font-size: 13px; font-weight: 600; margin-bottom: 14px;">${escapeHTML(authError)}</div>` : ''}

      <div class="form-heading">STEP 01 — SELECT ACCOUNT TYPE</div>
      <div class="role-list" style="margin-bottom: 20px;">
        ${[
          ['provider', 'Problem Provider', 'Verified individuals and village panchayats', '♧'],
          ['solver', 'Problem Solver', 'Students and educational organisations', '✳']
        ].map(([id, name, desc, symbol]) => `
          <label class="role-card ${selectedRole === id ? 'chosen' : ''}">
            <input type="radio" name="account_type" value="${id}" ${selectedRole === id ? 'checked' : ''}>
            <span class="role-symbol">${symbol}</span>
            <span class="role-copy"><b>${name}</b><small>${desc}</small></span>
          </label>`).join('')}
      </div>

      ${selectedRole === 'provider' ? renderProviderRegistrationFields() : renderSolverRegistrationTabs()}

      <button class="button button-dark full" type="submit" id="auth-submit-btn" style="margin-top: 20px;">
        Create Account & Continue →
      </button>
    </form>`;
}

// 1.1 Problem Provider Registration Fields
function renderProviderRegistrationFields() {
  return `
    <div class="form-heading">STEP 02 — PROVIDER CREDENTIALS & AADHAAR VERIFICATION</div>
    
    <label class="field">Full Name<input name="full_name" required placeholder="Enter full name as per official records"></label>
    
    <div class="field-grid">
      <label class="field">Phone Number<input name="phone" type="tel" required placeholder="+91 98765 43210"></label>
      <label class="field">Email Address<input name="email" type="email" required placeholder="provider@panchayat.org"></label>
    </div>

    <div class="field-grid">
      <label class="field">Aadhaar Number<input name="aadhaar_number" maxlength="14" required placeholder="12-digit Aadhaar number"></label>
      <div style="display: flex; align-items: flex-end; gap: 8px;">
        <label class="field" style="flex: 1; margin: 0;">Aadhaar Verification OTP<input name="aadhaar_otp" required placeholder="Enter OTP"></label>
        <button type="button" class="button button-outline" data-action="request-aadhaar-otp" style="height: 44px; white-space: nowrap;">Get OTP</button>
      </div>
    </div>

    <label class="field">Panchayat / Locality Address<textarea name="address" required rows="2" placeholder="Gram Panchayat, Taluka, District, State"></textarea></label>
    <label class="field">Profile Photo (Optional Upload / URL)<input name="avatar_url" type="url" placeholder="https://image-url or profile image"></label>

    <div class="field-grid">
      <label class="field">Password<input name="password" id="reg-pw" type="password" minlength="8" required placeholder="At least 8 characters"></label>
      <label class="field">Re-enter Password<input name="confirm_password" id="reg-cpw" type="password" minlength="8" required placeholder="Confirm password"></label>
    </div>

    <label class="consent"><input type="checkbox" required checked> I confirm authorized representation and consent to secure, lawful verification.</label>`;
}

// 1.2 Problem Solver Registration with 2 Tabs (Individual & Organisation)
function renderSolverRegistrationTabs() {
  return `
    <div class="form-heading">STEP 02 — SOLVER CLASSIFICATION</div>
    <div class="apply-tabs" style="margin-bottom: 18px;">
      <button type="button" class="apply-tab-btn ${solverRegTab === 'individual' ? 'active' : ''}" data-solver-reg-tab="individual">
        Individual (Student)
      </button>
      <button type="button" class="apply-tab-btn ${solverRegTab === 'organisation' ? 'active' : ''}" data-solver-reg-tab="organisation">
        Organisation (University / NGO)
      </button>
    </div>

    ${solverRegTab === 'individual' ? `
      <!-- A. Individual Registration -->
      <label class="field">Full Name<input name="full_name" required placeholder="Enter full name"></label>
      
      <div class="field-grid">
        <label class="field">Email Address<input name="email" type="email" required placeholder="student@college.ac.in"></label>
        <label class="field">Phone Number<input name="phone" type="tel" required placeholder="+91 98765 43210"></label>
      </div>

      <div class="field-grid">
        <label class="field">Institution Name (Optional for independent solvers)<input name="college_name" placeholder="e.g. COEP Technological University"></label>
        <label class="field">Roll Number (Optional)<input name="roll_number" placeholder="e.g. 2022-CS-041"></label>
      </div>

      <div style="display: flex; gap: 8px; align-items: flex-end; margin-bottom: 16px;">
        <label class="field" style="flex: 1; margin: 0;">Phone Verification Code (OTP)<input name="phone_otp" required placeholder="Enter 6-digit OTP"></label>
        <button type="button" class="button button-outline" data-action="request-phone-otp" style="height: 44px; white-space: nowrap;">Get OTP</button>
      </div>

      <label class="field">Profile Photo (Optional Upload / URL)<input name="avatar_url" type="url" placeholder="https://image-url"></label>
      <label class="field">Initial Skills (Comma-separated)<input name="skills" placeholder="e.g. Python, React, IoT, GIS"></label>

      <div class="field-grid">
        <label class="field">Password<input name="password" id="reg-pw" type="password" minlength="8" required placeholder="At least 8 characters"></label>
        <label class="field">Re-enter Password<input name="confirm_password" id="reg-cpw" type="password" minlength="8" required placeholder="Confirm password"></label>
      </div>
    ` : `
      <!-- B. Organisation Registration -->
      <label class="field">Institute Name<input name="full_name" required placeholder="e.g. Delhi Technological University"></label>
      
      <div class="field-grid">
        <label class="field">AICTE Institution Code<input name="aicte_code" required placeholder="e.g. 1-34891024"></label>
        <label class="field">Institute Logo (Optional URL)<input name="logo_url" type="url" placeholder="https://logo-url"></label>
      </div>

      <div class="field-grid">
        <label class="field">SPOC Name (Single Point of Contact)<input name="spoc_name" required placeholder="e.g. Dr. Vikram Mehta"></label>
        <label class="field">SPOC Phone Number<input name="spoc_phone" type="tel" required placeholder="+91 98230 44120"></label>
      </div>

      <label class="field">SPOC / Official Email Address<input name="email" type="email" required placeholder="spoc@institute.ac.in"></label>
      <label class="field">Institute Campus Address<input name="address" required placeholder="City, District, State, PIN"></label>

      <div class="field-grid">
        <label class="field">Password<input name="password" id="reg-pw" type="password" minlength="8" required placeholder="At least 8 characters"></label>
        <label class="field">Re-enter Password<input name="confirm_password" id="reg-cpw" type="password" minlength="8" required placeholder="Confirm password"></label>
      </div>
    `}

    <label class="consent"><input type="checkbox" required checked> I agree to follow CO-SOLVE’s verification, student coordination, and data privacy policies.</label>`;
}

// PRD Section 3: Problem Provider Dashboard (Left Sidebar + Main Dashboard)
function providerPage() {
  const pName = currentUser?.full_name || 'Ramesh Patil';
  const pEmail = currentUser?.email || 'sarpanch.ramesh@shirur-panchayat.org';
  const pAddress = currentUser?.address || 'Shirur Gram Panchayat, Pune District, Maharashtra';
  const pAvatar = currentUser?.avatar_url || photos.community;

  const pieSlices = [
    { label: 'Problems Accepted', value: providerStats.pie_chart.problems_accepted, color: '#16a34a' },
    { label: 'Problems Rejected', value: providerStats.pie_chart.problems_rejected, color: '#dc2626' }
  ];

  return `
    <div class="section section-pad prd-dashboard-layout">
      <!-- 3.1 Left Sidebar — Profile and Navigation -->
      <aside class="prd-sidebar">
        <div class="sidebar-profile">
          <img class="sidebar-avatar" src="${pAvatar}" alt="${escapeHTML(pName)}">
          <h2 class="sidebar-name">${escapeHTML(pName)}</h2>
          <span class="tag" style="align-self: center;">Problem Provider</span>
          <div class="sidebar-meta">✉ ${escapeHTML(pEmail)}</div>
          <div class="sidebar-meta">⌖ ${escapeHTML(pAddress)}</div>
        </div>

        <nav class="sidebar-nav-list">
          <button type="button" class="sidebar-nav-btn active" data-scroll="post-problem-section">
            <span>✍</span> Post a Problem
          </button>
          <button type="button" class="sidebar-nav-btn" data-action="rewards-recognition">
            <span>🏆</span> Rewards and Recognition
          </button>
        </nav>
      </aside>

      <!-- 3.2 Main Dashboard — Problem Statistics -->
      <main class="prd-main">
        <div class="eyebrow">PROVIDER PERFORMANCE & LEDGER</div>
        <h2>Problem Review & Verification Status</h2>

        <!-- Pie Chart -->
        <div class="pie-chart-card">
          <div class="pie-chart-header">
            <h3>Problems Review Outcome</h3>
            <p style="margin: 0; font-size: 13px; color: var(--muted);">Direct acceptance ratio calculated from verified community submissions.</p>
          </div>
          ${renderSvgPieChart(pieSlices, 190)}
        </div>

        <!-- Additional Recommended Statistics -->
        <div class="stats-grid" style="margin-bottom: 28px;">
          <div class="stat"><strong>${providerStats.stats.total_submitted}</strong><small>TOTAL SUBMITTED</small></div>
          <div class="stat"><strong>${providerStats.stats.pending_review}</strong><small>PENDING REVIEW</small></div>
          <div class="stat"><strong>${providerStats.stats.currently_being_solved}</strong><small>BEING SOLVED</small></div>
          <div class="stat"><strong>${providerStats.stats.completed}</strong><small>COMPLETED</small></div>
        </div>

        <!-- Post a Problem Form Section -->
        <section id="post-problem-section" class="form-panel" style="margin-bottom: 28px;">
          <div class="form-heading">SUBMIT A NEW SOCIETAL CHALLENGE</div>
          <form id="issue-form">
            <label class="field">Problem Title<input name="title" required placeholder="e.g. Fluoride Contamination in East Shirur Wells"></label>
            <div class="field-grid">
              <label class="field">Category
                <select name="category">
                  <option>Water Supply</option>
                  <option>Sanitation & Waste</option>
                  <option>Infrastructure</option>
                  <option>Healthcare</option>
                  <option>Education</option>
                  <option>Agriculture & Food</option>
                </select>
              </label>
              <label class="field">Urgency
                <select name="urgency">
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </label>
            </div>
            <label class="field">Location / Beneficiary Community<input name="location" required placeholder="Village, ward, or taluka name"></label>
            <label class="field">Problem Description & Root Cause<textarea name="description" required rows="3" placeholder="Describe the ground problem, current impact, and limitations..."></textarea></label>
            <label class="field">Expected Deliverables & Outcomes<input name="expected_outcomes" placeholder="e.g. Safe water supply testing kit and community filtration unit"></label>
            <button class="button button-dark full" type="submit" id="issue-submit-btn">Submit Challenge to AI Analysis →</button>
          </form>
        </section>

        <h3>Your Submitted Problems in Field</h3>
        <div class="challenge-list">
          ${liveProblems.slice(0, 4).map(challengeCard).join('')}
        </div>
      </main>
    </div>`;
}

// PRD Section 4: Individual Problem Solver Dashboard
function solverPage() {
  const sName = currentUser?.full_name || 'Arjun Sharma';
  const sEmail = currentUser?.email || 'arjun.sharma@coep.ac.in';
  const sPhone = currentUser?.phone || '+91 98230 44120';
  const sAvatar = currentUser?.avatar_url || photos.student;

  const pieSlices = [
    { label: 'Problems Solved', value: solverDashboardData.pie_chart.problems_solved, color: '#16a34a' },
    { label: 'Problems Ongoing', value: solverDashboardData.pie_chart.problems_ongoing, color: '#d97706' },
    { label: 'Problems Failed', value: solverDashboardData.pie_chart.problems_failed, color: '#dc2626' }
  ];

  return `
    <div class="section section-pad prd-dashboard-layout">
      <!-- 4.1 Left Sidebar — Profile and Navigation -->
      <aside class="prd-sidebar">
        <div class="sidebar-profile">
          <img class="sidebar-avatar" src="${sAvatar}" alt="${escapeHTML(sName)}">
          <h2 class="sidebar-name">${escapeHTML(sName)}</h2>
          <span class="tag" style="align-self: center;">Individual Solver</span>
          <div class="sidebar-meta">📞 ${escapeHTML(sPhone)}</div>
          <div class="sidebar-meta">✉ ${escapeHTML(sEmail)}</div>
        </div>

        <!-- Skills Section with Add / Remove -->
        <div class="skills-editor">
          <div class="eyebrow" style="margin-bottom: 4px;">SKILLS & DOMAINS</div>
          <div class="skills-tags-wrap" id="solver-skills-wrap">
            ${solverSkills.length ? solverSkills.map(s => `
              <span class="editable-skill-tag">
                ${escapeHTML(s.skill_name)}
                <button type="button" data-action="remove-skill" data-skill-id="${s.id}" title="Remove skill">×</button>
              </span>
            `).join('') : `
              <span class="editable-skill-tag">Python <button type="button" data-action="remove-skill" data-skill-id="demo-1">×</button></span>
              <span class="editable-skill-tag">IoT <button type="button" data-action="remove-skill" data-skill-id="demo-2">×</button></span>
              <span class="editable-skill-tag">GIS Mapping <button type="button" data-action="remove-skill" data-skill-id="demo-3">×</button></span>
            `}
          </div>
          <div class="add-skill-inline">
            <input id="new-skill-input" placeholder="New skill (e.g. React, Drone)...">
            <button type="button" class="button button-outline" data-action="add-new-skill">+ Add</button>
          </div>
        </div>

        <nav class="sidebar-nav-list">
          <button type="button" class="sidebar-nav-btn active" data-scroll="challenges">
            <span>🔨</span> Build (Explore Challenges)
          </button>
          <button type="button" class="sidebar-nav-btn" data-action="rewards-certifications">
            <span>📜</span> Rewards and Certifications
          </button>
        </nav>
      </aside>

      <!-- 4.2 Main Dashboard — Problem Statistics -->
      <main class="prd-main">
        <div class="eyebrow">STUDENT PARTICIPATION RECORDS</div>
        <h2>Problem Solving Statistics</h2>

        <!-- Problem Statistics Pie Chart -->
        <div class="pie-chart-card">
          <div class="pie-chart-header">
            <h3>Verified Problem Lifecycle Breakdown</h3>
            <p style="margin: 0; font-size: 13px; color: var(--muted);">Real participation outcomes tracked across individual and team projects.</p>
          </div>
          ${renderSvgPieChart(pieSlices, 190)}
        </div>

        <!-- 4.3 Previous Work with 2 Tabs -->
        <section class="previous-work-section" style="margin-top: 36px;">
          <div class="eyebrow">PORTFOLIO & CONTRIBUTION HISTORY</div>
          <h2>Previous Work</h2>

          <div class="apply-tabs" style="margin-bottom: 20px;">
            <button type="button" class="apply-tab-btn ${activeSolverWorkTab === 'individual' ? 'active' : ''}" data-solver-tab="individual">
              Tab 1: Individual Participation
            </button>
            <button type="button" class="apply-tab-btn ${activeSolverWorkTab === 'team' ? 'active' : ''}" data-solver-tab="team">
              Tab 2: Team Participation 👥
            </button>
          </div>

          ${activeSolverWorkTab === 'individual' ? `
            <!-- Individual Participation Cards -->
            <div class="previous-work-list">
              ${solverDashboardData.individual_projects.map(p => `
                <article class="project-card reveal" style="margin-bottom: 16px;">
                  <div class="project-content">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px;">
                      <div>
                        <span class="tag">${escapeHTML(p.status)}</span>
                        <h3 style="margin: 8px 0 4px;">${escapeHTML(p.title)}</h3>
                      </div>
                      <span class="muted-line" style="margin: 0;">Completed: ${escapeHTML(p.completion_date)}</span>
                    </div>
                    <p><strong>Problem Statement:</strong> ${escapeHTML(p.problem_statement)}</p>
                    <p><strong>Proposed Solution:</strong> ${escapeHTML(p.solution_description)}</p>
                    <div class="muted-line">Technologies: <strong>${escapeHTML(p.technologies_used)}</strong></div>
                    ${p.rewards ? `<div class="muted-line" style="color: #15803d;">★ Recognition: <strong>${escapeHTML(p.rewards)}</strong></div>` : ''}
                    <div style="margin-top: 10px;">
                      <a href="${escapeHTML(p.project_links)}" target="_blank" rel="noopener" class="button button-outline" style="font-size: 12px; padding: 6px 14px;">
                        View Project Docs ↗
                      </a>
                    </div>
                  </div>
                </article>
              `).join('')}
            </div>
          ` : `
            <!-- Team Participation Cards -->
            <div class="previous-work-list">
              ${solverDashboardData.team_projects.map(p => `
                <article class="project-card reveal" style="margin-bottom: 16px;">
                  <div class="project-content">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px;">
                      <div>
                        <span class="tag">Team Project</span>
                        <h3 style="margin: 8px 0 4px;">${escapeHTML(p.title)}</h3>
                      </div>
                      <span class="tag" style="background: rgba(34,197,94,0.1); color: #15803d;">${escapeHTML(p.status)}</span>
                    </div>
                    <p><strong>Team Name:</strong> ${escapeHTML(p.team_name)}</p>
                    <p><strong>Team Members:</strong> ${escapeHTML(p.team_members)}</p>
                    <p><strong>Your Role:</strong> ${escapeHTML(p.role)}</p>
                    <p><strong>Project Outcome:</strong> ${escapeHTML(p.outcome)}</p>
                    <div style="margin-top: 10px;">
                      <a href="${escapeHTML(p.project_links)}" target="_blank" rel="noopener" class="button button-outline" style="font-size: 12px; padding: 6px 14px;">
                        Project Repository & Deliverables ↗
                      </a>
                    </div>
                  </div>
                </article>
              `).join('')}
            </div>
          `}
        </section>
      </main>
    </div>`;
}

// PRD Section 5: Organisation Dashboard (Left Sidebar + Main Dashboard)
function organisationPage() {
  const orgName = orgDashboardData.org_name || 'COEP Technological University';
  const aicte = orgDashboardData.aicte_code || '1-34891024';
  const spocName = orgDashboardData.spoc_name || 'Dr. Vikram Mehta';
  const spocEmail = orgDashboardData.spoc_email || 'vikram.mehta@ruraltech.org';
  const orgAddress = orgDashboardData.address || 'Wellesley Rd, Shivajinagar, Pune, Maharashtra 411005';
  const orgLogo = orgDashboardData.logo_url || photos.school;

  // Strict categorical variables requested: "Problem solved by students" and "Problem solved by collaborators"
  const pieSlices = [
    { label: 'Problem solved by students', value: orgDashboardData.pie_chart?.solved_by_students ?? 14, color: '#16a34a' },
    { label: 'Problem solved by collaborators', value: orgDashboardData.pie_chart?.solved_by_collaborators ?? 6, color: '#8b5cf6' }
  ];

  return `
    <div class="section section-pad prd-dashboard-layout">
      <!-- 5.1 Left Sidebar: Imageholder for uploaded logo, Institute Name, SPOC Name, SPOC Email, Institute Address, List of student of that institute, List of collaborators -->
      <aside class="prd-sidebar">
        <!-- 1. Imageholder for uploaded logo -->
        <div class="logo-imageholder" id="org-logo-imageholder">
          <img src="${orgLogo}" alt="${escapeHTML(orgName)} Logo">
          <span class="logo-imageholder-label">Uploaded Institute Logo</span>
        </div>

        <!-- 2. Institute Name -->
        <div class="sidebar-profile" style="align-items: flex-start; text-align: left; width: 100%;">
          <div class="org-field-label">Institute Name</div>
          <h2 class="sidebar-name" style="font-size: 19px; margin-top: 2px;">${escapeHTML(orgName)}</h2>
          <span class="tag" style="align-self: flex-start; margin-top: 4px;">AICTE: ${escapeHTML(aicte)}</span>
        </div>

        <!-- 3. SPOC Name, 4. SPOC Email, 5. Institute Address -->
        <div class="org-profile-details" style="width: 100%;">
          <div class="org-profile-detail-item">
            <strong>SPOC Name</strong>
            <span>${escapeHTML(spocName)}</span>
          </div>
          <div class="org-profile-detail-item">
            <strong>SPOC Email</strong>
            <span>${escapeHTML(spocEmail)}</span>
          </div>
          <div class="org-profile-detail-item">
            <strong>Institute Address</strong>
            <span>${escapeHTML(orgAddress)}</span>
          </div>
        </div>

        <!-- 6. List of student of that institute, 7. List of collaborators -->
        <nav class="sidebar-nav-list" style="width: 100%;">
          <div style="font-size: 10.5px; font-weight: 800; letter-spacing: 0.8px; color: var(--muted); text-transform: uppercase; margin-bottom: 4px;">Navigation</div>
          <button type="button" class="sidebar-nav-btn ${activeOrgTab === 'Overview' ? 'active' : ''}" data-org-nav="Overview">
            <span>⌂</span> Organisation Overview
          </button>
          <button type="button" class="sidebar-nav-btn ${activeOrgTab === 'List of Students' ? 'active' : ''}" data-org-nav="List of Students">
            <span>👥</span> List of student of that institute
          </button>
          <button type="button" class="sidebar-nav-btn ${activeOrgTab === 'List of Collaborators' ? 'active' : ''}" data-org-nav="List of Collaborators">
            <span>🤝</span> List of collaborators
          </button>
        </nav>
      </aside>

      <!-- Main Content Area -->
      <main class="prd-main">
        ${activeOrgTab === 'Overview' ? renderOrgOverview(pieSlices) : ''}
        ${activeOrgTab === 'List of Students' ? renderStudentDirectory() : ''}
        ${activeOrgTab === 'List of Collaborators' ? renderCollaboratorsList() : ''}
      </main>
    </div>`;
}

// 5.2 Organisation Main Dashboard: Pie-chart & Previous projects made by that institute
function renderOrgOverview(pieSlices: { label: string; value: number; color: string }[]) {
  const orgName = orgDashboardData.org_name || 'COEP Technological University';
  return `
    <div class="eyebrow">ORGANISATION DASHBOARD · ${escapeHTML(orgName).toUpperCase()}</div>
    <h2>Institutional Problem-Solving & Attribution</h2>
    <p style="margin: 0 0 16px; font-size: 14px; color: var(--muted);">
      Direct attribution calculated from verified student completions and external partner collaborations.
    </p>

    <!-- Pie Chart (Categorical variables: Problem solved by students vs Problem solved by collaborators) -->
    <div class="pie-chart-card">
      <div class="pie-chart-header">
        <h3 style="margin: 0 0 4px;">Attribution of Solved Societal Challenges</h3>
        <p style="margin: 0; font-size: 13px; color: var(--muted);">
          Comparative breakdown between societal problems resolved by students vs external collaborators.
        </p>
      </div>
      ${renderSvgPieChart(pieSlices, 190)}
    </div>

    <!-- Scrolling down: Previous projects made by that institute -->
    ${renderOrgPreviousProjects()}`;
}

// Section 6: Organisation Student Directory (Dedicated page strictly for that institute's students)
function renderStudentDirectory() {
  const orgName = orgDashboardData.org_name || 'COEP Technological University';
  
  // Real-time client-side search and sort on studentDirectory
  let students = [...studentDirectory];
  if (directorySearchQuery.trim()) {
    const q = directorySearchQuery.toLowerCase().trim();
    students = students.filter(s => 
      s.full_name.toLowerCase().includes(q) || 
      (s.roll_number && s.roll_number.toLowerCase().includes(q))
    );
  }

  if (directorySortBy === 'solved') {
    students.sort((a, b) => b.solved_count - a.solved_count);
  } else if (directorySortBy === 'unsuccessful') {
    students.sort((a, b) => b.unsuccessful_count - a.unsuccessful_count);
  } else if (directorySortBy === 'ongoing') {
    students.sort((a, b) => b.ongoing_count - a.ongoing_count);
  } else {
    students.sort((a, b) => a.full_name.localeCompare(b.full_name));
  }

  return `
    <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; margin-bottom: 16px;">
      <div>
        <div class="eyebrow">RESTRICTED CAMPUS DIRECTORY · ${escapeHTML(orgName).toUpperCase()}</div>
        <h2 style="margin: 0;">List of Students</h2>
        <p style="color: var(--muted); font-size: 13.5px; margin: 4px 0 0;">
          This page is strictly restricted to students of <strong>${escapeHTML(orgName)}</strong>. Track individual resolution metrics and roll numbers.
        </p>
      </div>
      <button type="button" class="button button-outline" data-org-nav="Overview" style="font-size: 13px;">
        ← Back to Organisation Overview
      </button>
    </div>

    <!-- Search & Sorting Toolbar -->
    <div style="display: flex; gap: 12px; margin: 16px 0 20px; flex-wrap: wrap;">
      <input 
        id="directory-search-input" 
        value="${escapeHTML(directorySearchQuery)}" 
        placeholder="Search by student name or roll number..." 
        style="flex: 1; min-width: 240px; padding: 10px 14px; border-radius: 10px; border: 1px solid var(--line); background: var(--card);">
      
      <select id="directory-sort-select" style="padding: 10px 14px; border-radius: 10px; border: 1px solid var(--line); background: var(--card); font-weight: 600;">
        <option value="name" ${directorySortBy === 'name' ? 'selected' : ''}>Sort by: Student Name</option>
        <option value="solved" ${directorySortBy === 'solved' ? 'selected' : ''}>Sort by: Successfully solved Problems</option>
        <option value="unsuccessful" ${directorySortBy === 'unsuccessful' ? 'selected' : ''}>Sort by: Unsuccessful to solve Problems</option>
        <option value="ongoing" ${directorySortBy === 'ongoing' ? 'selected' : ''}>Sort by: Ongoing Problems</option>
      </select>
    </div>

    <!-- 4 Primary Columns Strictly: Name, Successfully solved Problems, Unsuccessful to solve Problems, Ongoing Problems -->
    <div class="directory-table-wrap">
      <table class="directory-table">
        <thead>
          <tr>
            <th style="width: 38%;">Name</th>
            <th style="width: 20%; text-align: center;">Successfully solved Problems</th>
            <th style="width: 22%; text-align: center;">Unsuccessful to solve Problems</th>
            <th style="width: 20%; text-align: center;">Ongoing Problems</th>
          </tr>
        </thead>
        <tbody>
          ${students.length ? students.map(s => `
            <tr style="cursor: pointer;" data-action="open-student-detail" data-student-id="${s.id}" title="Click to view detailed participation profile">
              <td>
                <div class="student-name-col">
                  <span class="student-name-text">${escapeHTML(s.full_name)}</span>
                  <!-- Roll number of that student written in small visible font directly below name -->
                  <span class="student-roll-small">Roll No: ${escapeHTML(s.roll_number)}</span>
                </div>
              </td>
              <td style="text-align: center;">
                <span class="count-badge count-solved">${s.solved_count}</span>
              </td>
              <td style="text-align: center;">
                <span class="count-badge count-unsuccessful">${s.unsuccessful_count}</span>
              </td>
              <td style="text-align: center;">
                <span class="count-badge count-ongoing">${s.ongoing_count}</span>
              </td>
            </tr>
          `).join('') : `
            <tr>
              <td colspan="4" style="text-align: center; padding: 32px; color: var(--muted);">
                No students found matching your criteria.
              </td>
            </tr>
          `}
        </tbody>
      </table>
    </div>`;
}

// 5.3 Previous projects made by that institute (Displayed on scrolling down)
function renderOrgPreviousProjects() {
  const orgName = orgDashboardData.org_name || 'COEP Technological University';
  const allProjects = orgDashboardData.previous_projects || [];
  const filtered = allProjects.filter((p: any) => orgProjectFilter === 'All' || p.status === orgProjectFilter);

  return `
    <section style="margin-top: 32px;" id="previous-projects-section">
      <div style="display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 12px; margin-bottom: 18px;">
        <div>
          <div class="eyebrow">CAMPUS IMPACT PORTFOLIO</div>
          <h2 style="margin: 0;">Previous projects made by that institute</h2>
          <p style="margin: 4px 0 0; font-size: 13.5px; color: var(--muted);">
            Verified societal engineering initiatives and solutions completed or underway at ${escapeHTML(orgName)}.
          </p>
        </div>
        <!-- Filters: All, Completed, Ongoing, Unsuccessful -->
        <div class="filter-row" style="margin: 0;">
          ${['All', 'completed', 'ongoing', 'unsuccessful'].map(f => `
            <button class="filter-chip ${orgProjectFilter === f ? 'selected' : ''}" data-org-project-filter="${f}">
              ${f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          `).join('')}
        </div>
      </div>

      <div class="previous-work-list">
        ${filtered.length ? filtered.map((p: any) => `
          <article class="project-card reveal" style="margin-bottom: 16px;">
            <div class="project-content">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px;">
                <div>
                  <span class="tag ${p.status === 'completed' ? 'count-solved' : (p.status === 'ongoing' ? 'count-ongoing' : 'count-unsuccessful')}">
                    ${escapeHTML(p.status.toUpperCase())}
                  </span>
                  <h3 style="margin: 8px 0 4px;">${escapeHTML(p.title)}</h3>
                </div>
                <span class="muted-line" style="margin: 0;">${escapeHTML(p.completion_date)}</span>
              </div>
              <p><strong>Problem Statement:</strong> ${escapeHTML(p.problem_statement)}</p>
              <p><strong>Participating Students / Collaborators:</strong> ${escapeHTML(p.participants)}</p>
              <p><strong>Solution Summary:</strong> ${escapeHTML(p.solution_summary)}</p>
              ${p.recognition ? `<div class="muted-line" style="color: #15803d; margin-top: 4px;">★ Recognition: <strong>${escapeHTML(p.recognition)}</strong></div>` : ''}
              <div style="margin-top: 12px;">
                <a href="${escapeHTML(p.supporting_docs)}" target="_blank" rel="noopener" class="button button-outline" style="font-size: 12px; padding: 6px 14px;">
                  Supporting Documents & Project Links ↗
                </a>
              </div>
            </div>
          </article>
        `).join('') : `
          <div class="empty-state"><span>📁</span><b>No projects in this category.</b></div>
        `}
      </div>
    </section>`;
}

// 5.1 Collaborators Directory
function renderCollaboratorsList() {
  const orgName = orgDashboardData.org_name || 'COEP Technological University';
  const collaborators = orgDashboardData.collaborators || [];
  return `
    <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; margin-bottom: 16px;">
      <div>
        <div class="eyebrow">EXTERNAL PARTNERSHIPS · ${escapeHTML(orgName).toUpperCase()}</div>
        <h2 style="margin: 0;">List of Collaborators & Mentors</h2>
        <p style="color: var(--muted); font-size: 13.5px; margin: 4px 0 0;">
          Verified civic organizations, CSR sponsors, and technical mentors collaborating with ${escapeHTML(orgName)}.
        </p>
      </div>
      <button type="button" class="button button-outline" data-org-nav="Overview" style="font-size: 13px;">
        ← Back to Organisation Overview
      </button>
    </div>

    <div class="previous-work-list" style="margin-top: 20px;">
      ${collaborators.map((c: any) => `
        <article class="project-card reveal" style="margin-bottom: 14px;">
          <div class="project-content">
            <span class="tag">${escapeHTML(c.role)}</span>
            <h3 style="margin: 8px 0 4px;">${escapeHTML(c.name)}</h3>
            <p>Active Joint Projects: <strong>${c.projects}</strong> verified civic sprints</p>
          </div>
        </article>
      `).join('')}
    </div>`;
}

// Student Detail Modal
function studentDetailModal() {
  if (!studentDetailModalOpen || !selectedStudentForModal) return '';
  const s = selectedStudentForModal;

  return `
    <div class="modal-backdrop" data-action="close-student-modal">
      <div class="apply-modal-box" role="dialog" aria-modal="true">
        <button class="modal-close" data-action="close-student-modal" aria-label="Close modal">×</button>
        <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
          <img src="${s.avatar_url}" alt="${escapeHTML(s.full_name)}" style="width: 64px; height: 64px; border-radius: 50%; border: 2px solid var(--brown);">
          <div>
            <h2 style="margin: 0;">${escapeHTML(s.full_name)}</h2>
            <div style="font-size: 13px; color: var(--muted); font-weight: 600;">Roll Number: ${escapeHTML(s.roll_number)}</div>
            <div style="font-size: 12px; color: var(--muted);">${escapeHTML(s.college_name)}</div>
          </div>
        </div>

        <div class="stats-grid" style="margin-bottom: 20px;">
          <div class="stat"><strong style="color:#16a34a">${s.solved_count}</strong><small>SOLVED</small></div>
          <div class="stat"><strong style="color:#d97706">${s.ongoing_count}</strong><small>ONGOING</small></div>
          <div class="stat"><strong style="color:#dc2626">${s.unsuccessful_count}</strong><small>UNSUCCESSFUL</small></div>
        </div>

        <h4>Verified Skills & Technologies</h4>
        <div class="chips" style="margin-bottom: 16px;">
          ${s.skills.map(sk => `<span class="tag">${escapeHTML(sk)}</span>`).join('')}
        </div>

        <h4>Institutional Contact Information</h4>
        <p style="font-size: 13px; margin: 4px 0;">✉ Email: <a href="mailto:${escapeHTML(s.email)}">${escapeHTML(s.email)}</a></p>
        <p style="font-size: 13px; margin: 4px 0;">📞 Phone: ${escapeHTML(s.phone)}</p>
      </div>
    </div>`;
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
    ${studentDetailModal()}
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
  const scrollButton = target.closest<HTMLElement>('[data-scroll]');
  const authButton = target.closest<HTMLElement>('[data-auth-mode]');
  const filterButton = target.closest<HTMLElement>('[data-filter]');
  const openApplyBtn = target.closest<HTMLElement>('[data-open-apply]');
  const applyTabBtn = target.closest<HTMLElement>('[data-apply-tab]');
  const solverRegTabBtn = target.closest<HTMLElement>('[data-solver-reg-tab]');
  const orgNavBtn = target.closest<HTMLElement>('[data-org-nav]');
  const solverTabBtn = target.closest<HTMLElement>('[data-solver-tab]');
  const orgProjFilterBtn = target.closest<HTMLElement>('[data-org-project-filter]');
  const demoBtn = target.closest<HTMLElement>('[data-demo-email]');

  if (viewButton) {
    event.preventDefault();
    go(viewButton.dataset.view as View);
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

    if (currentView === 'home' || document.getElementById(sectionId)) {
      scrollToSection();
    } else {
      currentView = 'home';
      render();
      window.requestAnimationFrame(scrollToSection);
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

  // Solver Registration Tabs (Individual vs Organisation)
  if (solverRegTabBtn) {
    solverRegTab = solverRegTabBtn.dataset.solverRegTab as SolverRegType;
    render();
    return;
  }

  // Organisation Nav Tabs
  if (orgNavBtn) {
    activeOrgTab = orgNavBtn.dataset.orgNav || 'Overview';
    render();
    return;
  }

  // Solver Previous Work Tabs
  if (solverTabBtn) {
    activeSolverWorkTab = solverTabBtn.dataset.solverTab || 'individual';
    render();
    return;
  }

  // Organisation Project Filter
  if (orgProjFilterBtn) {
    orgProjectFilter = orgProjFilterBtn.dataset.orgProjectFilter || 'All';
    render();
    return;
  }

  // Open Student Detail Modal
  const studentRow = target.closest<HTMLElement>('[data-student-id]');
  if (studentRow && target.closest('[data-action="open-student-detail"]')) {
    const sId = studentRow.dataset.studentId;
    const found = studentDirectory.find(s => s.id === sId);
    if (found) {
      selectedStudentForModal = found;
      studentDetailModalOpen = true;
      render();
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
        initAppData();
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

  // Action Buttons
  if (actionButton) {
    const action = actionButton.dataset.action;

    if (action === 'request-login-otp' || action === 'request-aadhaar-otp' || action === 'request-phone-otp') {
      showToast('OTP verification code sent! (Use demo code: 123456)');
      return;
    }

    if (action === 'forgot-password') {
      const email = prompt('Enter your registered email or phone for recovery:');
      if (email) {
        showToast(`Password recovery instructions sent to ${email}`);
      }
      return;
    }

    if (action === 'rewards-recognition' || action === 'rewards-certifications') {
      showToast('Verified Achievement Ledger: 4 certificates and 1 state citation issued.');
      return;
    }

    if (action === 'add-new-skill') {
      const input = document.getElementById('new-skill-input') as HTMLInputElement;
      if (input && input.value.trim()) {
        try {
          const res = await ApiClient.addSkill(input.value.trim());
          solverSkills.push(res);
          showToast(`Skill added: ${input.value.trim()}`);
          input.value = '';
          render();
        } catch {
          solverSkills.push({ id: `sk-${Date.now()}`, skill_name: input.value.trim() });
          showToast(`Skill added: ${input.value.trim()}`);
          input.value = '';
          render();
        }
      }
      return;
    }

    if (action === 'remove-skill') {
      const skillId = actionButton.dataset.skillId;
      if (skillId) {
        await ApiClient.deleteSkill(skillId).catch(() => {});
        solverSkills = solverSkills.filter(s => s.id !== skillId);
        showToast('Skill removed.');
        render();
      }
      return;
    }

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
    if (action === 'close-student-modal') {
      if (target.closest('.apply-modal-box') && !target.closest('.modal-close')) return;
      studentDetailModalOpen = false;
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
  if (target.name === 'account_type') {
    selectedRole = target.value as Role;
    render();
  }
  if (target.id === 'directory-sort-select') {
    directorySortBy = target.value;
    render();
  }
});

document.addEventListener('input', event => {
  const target = event.target as HTMLInputElement;
  if (target.id === 'directory-search-input') {
    directorySearchQuery = target.value;
    const cursorPosition = target.selectionStart;
    render();
    const refreshedInput = document.getElementById('directory-search-input') as HTMLInputElement;
    if (refreshedInput) {
      refreshedInput.focus();
      if (cursorPosition !== null) {
        refreshedInput.setSelectionRange(cursorPosition, cursorPosition);
      }
    }
  }
});

// Forms Submit
document.addEventListener('submit', async event => {
  event.preventDefault();
  const form = event.target as HTMLFormElement;
  const data = new FormData(form);

  // Login Form Submit
  if (form.id === 'login-form') {
    const identifier = String(data.get('identifier') || '').trim();
    const password = String(data.get('password') || '');
    const otp = String(data.get('otp') || '');
    const submitBtn = document.getElementById('auth-submit-btn') as HTMLButtonElement;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Authenticating...';
    }
    authError = '';

    try {
      const res = await ApiClient.login(identifier, password, otp);
      currentUser = res.user;
      showToast(`Welcome, ${res.user.full_name}!`);
      if (res.user.role === 'provider') go('provider');
      else if (res.user.role === 'organization' || res.user.role === 'institution' || res.user.role === 'admin') go('organisation');
      else go('solver');
      initAppData();
    } catch (err: any) {
      authError = err.message || 'Incorrect credentials or unverified account.';
      render();
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Login to Workspace →';
      }
    }
    return;
  }

  // Registration Form Submit
  if (form.id === 'register-form') {
    const pw = String(data.get('password') || '');
    const cpw = String(data.get('confirm_password') || '');

    if (pw !== cpw) {
      authError = 'Passwords do not match. Please re-enter passwords.';
      render();
      return;
    }

    const email = String(data.get('email') || '').trim();
    const fullName = String(data.get('full_name') || '').trim();
    const phone = String(data.get('phone') || '').trim();
    const address = String(data.get('address') || '');
    const aadhaar = String(data.get('aadhaar_number') || '');
    const college = String(data.get('college_name') || '');
    const roll = String(data.get('roll_number') || '');
    const aicte = String(data.get('aicte_code') || '');
    const spocName = String(data.get('spoc_name') || '');
    const spocPhone = String(data.get('spoc_phone') || '');
    const avatar = String(data.get('avatar_url') || data.get('logo_url') || '');

    let role = selectedRole;
    if (selectedRole === 'solver' && solverRegTab === 'organisation') {
      role = 'organisation';
    }

    const submitBtn = document.getElementById('auth-submit-btn') as HTMLButtonElement;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Creating Account...';
    }
    authError = '';

    try {
      const res = await ApiClient.register({
        email,
        password: pw,
        full_name: fullName,
        role: role === 'organisation' ? 'organization' : role,
        phone,
        address,
        aadhaar_number: aadhaar,
        roll_number: roll,
        college_name: college,
        aicte_code: aicte,
        spoc_name: spocName,
        spoc_phone: spocPhone,
        avatar_url: avatar,
        skills: data.get('skills') ? String(data.get('skills')).split(',').map(s => s.trim()) : undefined
      });

      currentUser = res.user;
      showToast(`Account successfully created for ${res.user.full_name}!`);
      if (res.user.role === 'provider') go('provider');
      else if (res.user.role === 'organization') go('organisation');
      else go('solver');
      initAppData();
    } catch (err: any) {
      authError = err.message || 'Registration failed. Please check required fields.';
      render();
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create Account & Continue →';
      }
    }
    return;
  }

  // Provider Problem Submit
  if (form.id === 'issue-form') {
    const title = String(data.get('title') || '').trim();
    const category = String(data.get('category') || 'Water Supply');
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
      providerStats.stats.total_submitted += 1;
      showToast('Problem submitted! AI has generated requirements & skills analysis.');
      go('provider');
    } catch (err: any) {
      showToast(`Submission error: ${err.message}`);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Challenge to AI Analysis →';
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

// Boot the application
initAppData();
