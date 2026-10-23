import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api/client';
import { Badge } from '../components/Badge';
import { 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  Compass, 
  Users, 
  Layers, 
  Award, 
  TrendingUp,
  MapPin,
  Calendar,
  IndianRupee,
  Cpu,
  Droplets,
  Sprout,
  Sun
} from 'lucide-react';

export const LandingPage = ({ navigate }) => {
  const [featuredProblems, setFeaturedProblems] = useState([]);
  const [metrics, setMetrics] = useState({
    beneficiaries: 1450,
    activeChallenges: 4,
    verifiedAdopted: 1,
    studentSolvers: 24
  });

  useEffect(() => {
    async function loadData() {
      try {
        const problems = await apiRequest('/problems');
        setFeaturedProblems(problems.slice(0, 3));
      } catch (e) {
        console.warn('Failed to load problems:', e);
      }
    }
    loadData();
  }, []);

  const domains = [
    { name: "Water & Sanitation", icon: Droplets, color: "text-blue-600 bg-blue-50 border-blue-200" },
    { name: "Agriculture & Rural Tech", icon: Sprout, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
    { name: "Renewable Energy", icon: Sun, color: "text-amber-600 bg-amber-50 border-amber-200" },
    { name: "Education & Digital Tech", icon: Cpu, color: "text-purple-600 bg-purple-50 border-purple-200" },
  ];

  const lifecycleStages = [
    { step: "01", title: "Problem Submission", desc: "Verified Panchayat or community provider submits verified local challenge." },
    { step: "02", title: "AI Analysis Report", desc: "Server-side AI extracts root hypotheses, skills, milestones & acceptance criteria." },
    { step: "03", title: "Skill Matching", desc: "Explainable 5-factor scoring connects eligible individual & org solvers." },
    { step: "04", title: "Charter & Workspace", desc: "Provider compares candidates, signs project charter, and tracks deliverables." },
    { step: "05", title: "Field Testing", desc: "Multi-round verification against ground-truth laboratory & field criteria." },
    { step: "06", title: "Adoption Verification", desc: "Independent audit of real-world community adoption and tamper-proof impact." }
  ];

  return (
    <div className="space-y-16">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24 bg-gradient-to-b from-emerald-50/60 via-slate-50 to-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            
            <div className="inline-flex items-center space-x-2 bg-emerald-100/80 border border-emerald-300 text-emerald-800 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-700 animate-pulse" />
              <span>AI-Powered Societal Challenge Coordination Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Empowering Students to Solve <span className="text-emerald-700 bg-clip-text">Real Grassroots Challenges</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Bridging verified village panchayats with student engineers and university labs. From structured AI problem decomposition to on-ground testing and audited community adoption.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => navigate('/problems')}
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center space-x-2"
              >
                <span>Browse Challenges</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => navigate('/solver/recommendations')}
                className="px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-semibold text-sm shadow-xs transition-all flex items-center space-x-2"
              >
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Try AI Skill Matcher</span>
              </button>
            </div>

            {/* Quick Demo Hint */}
            <p className="text-xs text-slate-500 pt-2">
              💡 Use the <span className="font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">Demo Persona Switcher</span> in the top navigation bar to test all user roles instantly.
            </p>

          </div>

          {/* Stats Bar */}
          <div className="mt-14 max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 sm:p-6 bg-white rounded-2xl shadow-sm border border-slate-200">
            <div className="text-center p-2">
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">1,450+</div>
              <div className="text-xs text-slate-500 font-medium mt-1">Beneficiaries Served</div>
            </div>
            <div className="text-center p-2 border-l border-slate-100">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700">100%</div>
              <div className="text-xs text-slate-500 font-medium mt-1">Verified Field Adoptions</div>
            </div>
            <div className="text-center p-2 border-l border-slate-100">
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">40% / 60%</div>
              <div className="text-xs text-slate-500 font-medium mt-1">Skill & Field Weighting</div>
            </div>
            <div className="text-center p-2 border-l border-slate-100">
              <div className="text-2xl sm:text-3xl font-extrabold text-teal-700">Zero</div>
              <div className="text-xs text-slate-500 font-medium mt-1">Fabricated Credentials</div>
            </div>
          </div>

        </div>
      </section>

      {/* Structured Lifecycle Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <Badge variant="info" size="sm" className="mb-2">Audited Workflow</Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            The Verified Project Lifecycle
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            Prototypes are never counted as adoption. Every step has explicit accountability and tamper-proof audit trails.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lifecycleStages.map((s) => (
            <div key={s.step} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all space-y-2">
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                STAGE {s.step}
              </span>
              <h3 className="text-base font-bold text-slate-900">{s.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Societal Challenges */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <Badge variant="published" size="sm" className="mb-2">Open for Solvers</Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Featured Societal Challenges
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Real problems submitted by verified village panchayats and grassroots rural cooperatives.
            </p>
          </div>
          <button
            onClick={() => navigate('/problems')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1"
          >
            <span>View all challenges</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredProblems.map((prob) => (
            <div
              key={prob.id}
              onClick={() => navigate(`/problems/${prob.id}`)}
              className="bg-white rounded-2xl border border-slate-200 hover:border-emerald-400 p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    {prob.domain}
                  </span>
                  <span className="text-slate-500 capitalize">{prob.funding_model.replace('_', ' ')}</span>
                </div>

                <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2">
                  {prob.title}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {prob.description}
                </p>

                <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-500">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{prob.affected_community} ({prob.geographic_district}, {prob.geographic_state})</span>
                  </div>
                  {prob.funding_amount > 0 && (
                    <div className="flex items-center space-x-2 text-emerald-700 font-semibold">
                      <IndianRupee className="w-3.5 h-3.5 shrink-0" />
                      <span>₹{prob.funding_amount.toLocaleString('en-IN')} ({prob.funding_status})</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-medium">
                  By {prob.panchayat_name || prob.creator_name}
                </span>
                <span className="text-xs font-semibold text-emerald-700 flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Target Domains */}
      <section className="bg-slate-100/70 py-14 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Focus Domains for Grassroots Impact
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Curated domains addressing critical village infrastructure, livelihoods, and civic resilience.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {domains.map((d) => {
              const IconComp = d.icon;
              return (
                <div
                  key={d.name}
                  onClick={() => navigate(`/problems?domain=${encodeURIComponent(d.name)}`)}
                  className="bg-white p-5 rounded-xl border border-slate-200 hover:border-emerald-400 cursor-pointer shadow-xs transition-all text-center space-y-2"
                >
                  <div className={`w-10 h-10 mx-auto rounded-lg flex items-center justify-center border ${d.color}`}>
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-bold text-slate-900">{d.name}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 rounded-3xl p-8 sm:p-12 text-white text-center space-y-6 shadow-xl">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Build Verifiable Civic Solutions?
          </h2>
          <p className="text-emerald-100 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Whether you are a student engineer looking for a real-world capstone project, or a village representative in need of technical assistance.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button
              onClick={() => navigate('/register')}
              className="px-6 py-3 rounded-xl bg-white text-emerald-900 font-bold text-sm shadow hover:bg-emerald-50 transition-all"
            >
              Register on Samarthya
            </button>
            <button
              onClick={() => navigate('/how-it-works')}
              className="px-6 py-3 rounded-xl bg-emerald-900/60 text-white font-semibold text-sm border border-emerald-400/40 hover:bg-emerald-900/80 transition-all"
            >
              Read Implementation Charter
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
