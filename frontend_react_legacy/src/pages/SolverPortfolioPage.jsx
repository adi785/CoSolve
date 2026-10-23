import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/Badge';
import { 
  Award, 
  CheckCircle2, 
  ExternalLink, 
  Github, 
  ShieldCheck, 
  MapPin, 
  Sparkles, 
  Calendar,
  Lock,
  Globe,
  Layers,
  ArrowLeft
} from 'lucide-react';

export const SolverPortfolioPage = ({ userId, navigate }) => {
  const { user } = useAuth();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPortfolio() {
      try {
        const data = await apiRequest(`/solver/portfolio/${userId}`);
        setPortfolio(data);
      } catch (err) {
        alert('Failed to load portfolio: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
    loadPortfolio();
  }, [userId]);

  if (loading) {
    return <div className="text-center py-24 text-slate-400 text-xs">Loading verified portfolio credentials...</div>;
  }

  if (!portfolio) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center space-y-4">
        <h2 className="text-base font-bold text-slate-800">Portfolio Not Found or Private</h2>
        <button onClick={() => navigate('/problems')} className="text-xs text-emerald-700 underline font-semibold">
          Return to Marketplace
        </button>
      </div>
    );
  }

  const { solver, skills, metrics, projects, rewards } = portfolio;
  const isOwner = user && user.id === solver.id;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {solver.full_name}
              </h1>
              <span className="bg-emerald-100 text-emerald-800 font-bold text-xs px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Civic Contributor</span>
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {solver.college_name ? `${solver.college_name}` : 'Student Solver'} • {solver.location || 'India'}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 flex items-center space-x-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              <span>Public Impact Record</span>
            </span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
          {solver.bio || "Engineering student dedicated to building verifiable, open-source technological solutions for grassroots rural development challenges."}
        </p>

        {/* Verified Metrics Counter */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
          <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100 text-center">
            <span className="text-slate-400 text-[10px] font-bold block uppercase">Verified Beneficiaries</span>
            <div className="text-2xl font-black text-emerald-950 mt-1">
              {metrics.total_beneficiaries_impacted.toLocaleString('en-IN')}
            </div>
          </div>

          <div className="bg-teal-50/60 p-4 rounded-2xl border border-teal-100 text-center">
            <span className="text-slate-400 text-[10px] font-bold block uppercase">Verified Adoptions</span>
            <div className="text-2xl font-black text-teal-950 mt-1">
              {metrics.verified_adopted_projects}
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
            <span className="text-slate-400 text-[10px] font-bold block uppercase">Completed Projects</span>
            <div className="text-2xl font-black text-slate-800 mt-1">
              {metrics.total_projects}
            </div>
          </div>

          <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-100 text-center">
            <span className="text-slate-400 text-[10px] font-bold block uppercase">Digital Credentials</span>
            <div className="text-2xl font-black text-amber-950 mt-1">
              {metrics.rewards_count}
            </div>
          </div>
        </div>
      </div>

      {/* Verified Digital Credentials & Awards */}
      {rewards.length > 0 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 text-slate-900">
            <Award className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold uppercase tracking-wide">
              Verified Digital Credentials & Endorsements
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {rewards.map((r) => (
              <div key={r.id} className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-emerald-950 text-xs">{r.title}</span>
                  <span className="text-[10px] font-bold text-emerald-800 bg-white px-2 py-0.5 rounded-full border border-emerald-300">
                    {r.type.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <p className="text-slate-700 leading-relaxed text-[11px]">{r.description}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-emerald-200/60">
                  <span>Sponsor: {r.sponsor || 'Gram Panchayat Council'}</span>
                  <span>{new Date(r.issued_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed & Adopted Projects */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-5">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
          Field Projects & Real-World Deployments
        </h2>

        {projects.length === 0 ? (
          <p className="text-slate-400 text-xs py-4 text-center">No projects completed yet.</p>
        ) : (
          <div className="space-y-5">
            {projects.map((p) => (
              <div
                key={p.project_id}
                className="p-5 sm:p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{p.title}</h3>
                    <span className="text-slate-500 text-[11px]">
                      {p.community} ({p.locality}) • Role: <strong>{p.role}</strong>
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      p.adoption_status === 'verified_adopted'
                        ? 'bg-teal-100 text-teal-800 border border-teal-300'
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      {p.adoption_status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Evidence snippet */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700">
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-800 block mb-1">Testing Outcome:</span>
                    <span className="text-emerald-700 font-semibold">{p.testing_outcome}</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-800 block mb-1">Community Impact:</span>
                    <span>{p.beneficiaries_served.toLocaleString('en-IN')} Beneficiaries Served</span>
                  </div>
                </div>

                {/* Artifact links */}
                <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px]">
                  {p.prototype_url && (
                    <a
                      href={p.prototype_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-700 font-bold underline flex items-center space-x-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Live Telemetry & Demo</span>
                    </a>
                  )}
                  {p.prototype_repo && (
                    <a
                      href={p.prototype_repo}
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-700 font-semibold underline flex items-center space-x-1"
                    >
                      <Github className="w-3.5 h-3.5" />
                      <span>Source Code Repository</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Verified Skills Demonstrated */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
          Demonstrated Technical Competencies
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {skills.map((s, idx) => (
            <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-0.5">
              <span className="font-bold text-slate-800 block">{s.skill_name}</span>
              <span className="text-[11px] text-slate-500 capitalize">
                {s.proficiency_level} • {s.years_experience} yrs
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
