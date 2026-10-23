import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/Badge';
import {
  Sparkles,
  MapPin,
  IndianRupee,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Layers,
  Award,
  AlertCircle
} from 'lucide-react';

export const SolverRecommendationsPage = ({ navigate }) => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    async function loadRecs() {
      if (!user) return;
      try {
        const data = await apiRequest('/solver/recommendations');
        setRecommendations(data);
      } catch (err) {
        console.warn('Error loading recommendations:', err);
      } finally {
        setLoading(false);
      }
    }
    loadRecs();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center space-y-4">
        <h2 className="text-base font-bold text-slate-800">Please Sign In as a Solver</h2>
        <p className="text-xs text-slate-500">
          Personalized recommendations require a solver profile with registered skills and interests.
        </p>
        <button
          onClick={() => navigate('/login')}
          className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Badge variant="purple" size="sm">
            <Sparkles className="w-3.5 h-3.5 mr-1" /> Explainable Matching Engine
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Personalized Challenge Matches
          </h1>
          <p className="text-xs text-slate-500">
            Ranked for <strong className="text-slate-800">{user.full_name}</strong> based on required skills (40%), domain focus (20%), availability (15%), experience (15%), and fieldwork suitability (10%).
          </p>
        </div>

        <button
          onClick={() => navigate('/solver/skills')}
          className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0"
        >
          Update Skills & Preferences
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400 text-xs">Computing explainable match scores...</div>
      ) : recommendations.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-2">
          <p className="text-sm font-bold text-slate-800">No active challenges available right now.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {recommendations.map(({ problem, match }) => {
            const isExpanded = expandedId === problem.id;
            const score = match.match_score;

            // Score color styling
            let scoreBg = "bg-emerald-50 text-emerald-900 border-emerald-300";
            if (score < 70) scoreBg = "bg-amber-50 text-amber-900 border-amber-300";

            return (
              <div
                key={problem.id}
                className="bg-white rounded-3xl border border-slate-200 hover:border-emerald-300 p-6 sm:p-7 shadow-xs transition-all space-y-5"
              >

                {/* Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs">
                        {problem.domain}
                      </span>
                      <span className="text-xs text-slate-500 capitalize">
                        {problem.funding_model.replace('_', ' ')}
                      </span>
                    </div>

                    <h3
                      onClick={() => navigate(`/problems/${problem.id}`)}
                      className="text-base sm:text-lg font-bold text-slate-900 hover:text-emerald-700 cursor-pointer transition-colors"
                    >
                      {problem.title}
                    </h3>

                    <div className="text-xs text-slate-500 flex items-center space-x-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{problem.affected_community} ({problem.geographic_district}, {problem.geographic_state})</span>
                    </div>
                  </div>

                  {/* Big Match Score */}
                  <div className={`flex items-center space-x-3 px-4 py-2.5 rounded-2xl border shrink-0 ${scoreBg}`}>
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider">Match Score</div>
                      <div className="text-2xl font-black leading-none mt-0.5">{score.toFixed(1)}%</div>
                    </div>
                    <Sparkles className="w-6 h-6 text-emerald-600 shrink-0" />
                  </div>
                </div>

                {/* Score Breakdown Radar / Progress Bars */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 text-[11px]">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">
                    <span className="text-slate-400 block text-[10px]">Skills (40%)</span>
                    <span className="font-bold text-slate-800">{match.breakdown.skills_score}%</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">
                    <span className="text-slate-400 block text-[10px]">Domain (20%)</span>
                    <span className="font-bold text-slate-800">{match.breakdown.domain_score}%</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">
                    <span className="text-slate-400 block text-[10px]">Availability (15%)</span>
                    <span className="font-bold text-slate-800">{match.breakdown.availability_score}%</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">
                    <span className="text-slate-400 block text-[10px]">Experience (15%)</span>
                    <span className="font-bold text-slate-800">{match.breakdown.experience_score}%</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center col-span-2 sm:col-span-1">
                    <span className="text-slate-400 block text-[10px]">Location (10%)</span>
                    <span className="font-bold text-slate-800">{match.breakdown.location_score}%</span>
                  </div>
                </div>

                {/* Matched vs Missing Skills Badges */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-slate-400 text-[11px] font-bold uppercase">Matched Skills:</span>
                  {match.matched_skills.map((m, idx) => (
                    <span key={idx} className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-semibold flex items-center space-x-1">
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>{m.skill}</span>
                    </span>
                  ))}
                  {match.missing_skills.length > 0 && (
                    <>
                      <span className="text-slate-400 text-[11px] font-bold uppercase ml-2">Missing:</span>
                      {match.missing_skills.slice(0, 2).map((m, idx) => (
                        <span key={idx} className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[11px]">
                          {m}
                        </span>
                      ))}
                    </>
                  )}
                </div>

                {/* Expandable "Why it matches" Reasons */}
                {isExpanded && (
                  <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-2 text-xs text-emerald-950">
                    <span className="font-bold block uppercase text-[10px] tracking-wide text-emerald-800">
                      Whyrecommends this:
                    </span>
                    <ul className="space-y-1 list-disc list-inside">
                      {match.reasons.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                    {match.limitations.length > 0 && (
                      <div className="pt-2 border-t border-emerald-200 text-amber-900">
                        <span className="font-bold block text-[10px]">Considerations:</span>
                        <ul className="list-disc list-inside text-[11px]">
                          {match.limitations.map((l, i) => (
                            <li key={i}>{l}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Footer Controls */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : problem.id)}
                    className="text-slate-500 hover:text-slate-800 font-semibold flex items-center space-x-1"
                  >
                    <span>{isExpanded ? 'Hide explanation' : 'Why this matches'}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => navigate(`/problems/${problem.id}`)}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center space-x-1"
                  >
                    <span>View & Apply</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
