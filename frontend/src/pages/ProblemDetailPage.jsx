import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/Badge';
import {
  MapPin,
  IndianRupee,
  Sparkles,
  Calendar,
  Users,
  CheckCircle2,
  AlertCircle,
  Send,
  FileText,
  ArrowLeft,
  ShieldCheck,
  Check,
  Layers,
  ChevronRight
} from 'lucide-react';

export const ProblemDetailPage = ({ problemId, navigate }) => {
  const { user } = useAuth();
  const [problem, setProblem] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'ai_analysis'

  // Application Modal state
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [solverTab, setSolverTab] = useState('individual'); // 'individual' or 'team'
  const [teamName, setTeamName] = useState('');
  const [collegeName, setCollegeName] = useState(user?.college_name || '');
  const [teamMembers, setTeamMembers] = useState([
    { name: '', email: '', role: 'Hardware Lead' },
    { name: '', email: '', role: 'Software Lead' }
  ]);
  const [proposal, setProposal] = useState('');
  const [approach, setApproach] = useState('');
  const [experience, setExperience] = useState('');
  const [timelineWeeks, setTimelineWeeks] = useState(8);
  const [weeklyHours, setWeeklyHours] = useState(15);
  const [submittingApp, setSubmittingApp] = useState(false);
  const [existingApp, setExistingApp] = useState(null);

  const handleAddMember = () => {
    setTeamMembers(prev => [...prev, { name: '', email: '', role: 'Member' }]);
  };

  const handleRemoveMember = (idx) => {
    setTeamMembers(prev => prev.filter((_, i) => i !== idx));
  };

  const handleMemberChange = (idx, field, value) => {
    setTeamMembers(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  useEffect(() => {
    async function loadData() {
      try {
        const p = await apiRequest(`/problems/${problemId}`);
        setProblem(p);

        try {
          const ai = await apiRequest(`/problems/${problemId}/analysis`);
          setAiAnalysis(ai);
        } catch (e) {
          // AI analysis might be generating or absent
        }

        if (user) {
          // Check if solver already applied
          try {
            const myApps = await apiRequest('/applications/my');
            const found = myApps.find(a => a.problem_id === problemId);
            if (found) setExistingApp(found);
          } catch (e) {
            // ignore
          }
        }
      } catch (err) {
        alert('Failed to load challenge details: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [problemId, user]);

  const handleApply = async (e) => {
    e.preventDefault();
    if (proposal.length < 20 || approach.length < 20) {
      alert('Please provide a substantive proposal and technical approach (min 20 characters each).');
      return;
    }

    if (solverTab === 'team') {
      if (!teamName.trim() || !collegeName.trim()) {
        alert('Please enter your Team Name and College Name.');
        return;
      }
      const validMembers = teamMembers.filter(m => m.name.trim() && m.email.trim());
      if (validMembers.length === 0) {
        alert('Please enter at least one teammate name and email.');
        return;
      }
    }

    setSubmittingApp(true);
    try {
      const validMembers = solverTab === 'team'
        ? teamMembers.filter(m => m.name.trim() && m.email.trim())
        : [];

      const res = await apiRequest('/applications', 'POST', {
        problem_id: problemId,
        solver_type: solverTab,
        team_name: solverTab === 'team' ? teamName.trim() : null,
        college_name: solverTab === 'team' ? collegeName.trim() : null,
        team_members: validMembers,
        proposal,
        approach,
        relevant_experience: experience,
        estimated_timeline_weeks: parseFloat(timelineWeeks),
        weekly_availability_hours: parseFloat(weeklyHours),
        team_composition_notes: solverTab === 'team' ? `Team: ${teamName}` : null
      });

      if (solverTab === 'team') {
        alert(`Application submitted! Confirmation emails with project details have been sent to ${validMembers.length} teammates.`);
      } else {
        alert('Proposal submitted successfully! The problem provider has been notified.');
      }
      setApplyModalOpen(false);
      setExistingApp(res);
    } catch (err) {
      alert('Application failed: ' + err.message);
    } finally {
      setSubmittingApp(false);
    }
  };

  if (loading) {
    return <div className="text-center py-24 text-slate-400 text-xs">Loading challenge specifications...</div>;
  }

  if (!problem) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center space-y-4">
        <h2 className="text-lg font-bold text-slate-800">Challenge Not Found</h2>
        <button onClick={() => navigate('/problems')} className="text-xs text-emerald-700 font-semibold underline">
          Back to Directory
        </button>
      </div>
    );
  }

  const isCreator = user && user.id === problem.creator_id;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

      {/* Back button */}
      <button
        onClick={() => navigate('/problems')}
        className="flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Challenges</span>
      </button>

      {/* Main Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full text-xs">
              {problem.domain}
            </span>
            <Badge variant={problem.moderation_status === 'published' ? 'published' : 'warning'}>
              {problem.moderation_status.toUpperCase()}
            </Badge>
          </div>

          <div className="text-xs text-slate-500 flex items-center space-x-3">
            <span>Urgency: <strong className="text-slate-800 capitalize">{problem.urgency}</strong></span>
            <span>•</span>
            <span>Solver Type: <strong className="text-slate-800 capitalize">{problem.preferred_solver_type}</strong></span>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
          {problem.title}
        </h1>

        {/* Location & Authority Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Submitted By</span>
            <span className="font-bold text-slate-800 block mt-0.5">
              {problem.panchayat_name || problem.creator_name}
            </span>
            <span className="text-slate-500 text-[11px] block">{problem.creator_type ? problem.creator_type.replace('_', ' ') : 'Verified Authority'}</span>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px]">Target Region</span>
            <span className="font-bold text-slate-800 block mt-0.5">
              {problem.affected_community}
            </span>
            <span className="text-slate-500 text-[11px] block">{problem.geographic_district}, {problem.geographic_state}</span>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px]">Funding & Rewards</span>
            <span className="font-bold text-emerald-800 block mt-0.5">
              {problem.funding_amount > 0 ? `₹${problem.funding_amount.toLocaleString('en-IN')}` : 'Voluntary / Community Benefit'}
            </span>
            <span className="text-slate-500 text-[11px] block capitalize">{problem.funding_model.replace('_', ' ')} ({problem.funding_status})</span>
          </div>
        </div>

        {/* Project Status & Progress Insight Banner */}
        {problem.is_taken ? (
          <div className="p-4 bg-amber-50/90 border border-amber-200 rounded-2xl space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                <span className="font-extrabold text-amber-950 text-xs tracking-wide uppercase">
                  PROJECT TAKEN • IN PROGRESS
                </span>
              </div>
              <span className="text-xs font-black text-amber-950 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-full">
                {Math.round(problem.progress_percentage || 0)}% Complete
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-amber-200/70 rounded-full h-2 overflow-hidden">
              <div
                className="bg-amber-600 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(100, Math.max(5, problem.progress_percentage || 0))}%` }}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-amber-900 pt-1">
              <div>
                <span>Assigned Solver / Team: </span>
                <strong className="text-amber-950">{problem.taken_by || 'Assigned Solver'}</strong>
                {problem.solver_type && <span className="ml-1 text-[10px] text-amber-700 capitalize">({problem.solver_type})</span>}
              </div>
              <div>
                {problem.days_until_inactivity_warning <= 2 ? (
                  <span className="text-red-700 font-bold bg-red-100 px-2 py-0.5 rounded">
                    Re-opens in {problem.days_until_inactivity_warning} days if inactive
                  </span>
                ) : (
                  <span>Active {problem.last_activity_days_ago === 0 ? 'today' : `${problem.last_activity_days_ago} days ago`} (7-day activity check)</span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="font-bold text-emerald-950 text-xs tracking-wide uppercase">
                AVAILABLE • OPEN FOR SOLVERS
              </span>
            </div>
            <span className="text-xs text-emerald-800 font-medium">
              Accepting Individual Solver & Team Proposals
            </span>
          </div>
        )}

        {/* Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${activeTab === 'overview' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
            >
              Problem Details
            </button>
            <button
              onClick={() => setActiveTab('ai_analysis')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors ${activeTab === 'ai_analysis' ? 'bg-emerald-700 text-white shadow-xs' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Problem Report {aiAnalysis ? `(v${aiAnalysis.version})` : ''}</span>
            </button>
          </div>

          <div>
            {problem.is_taken ? (
              <button
                onClick={() => navigate(`/projects/${problem.project_id}`)}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center space-x-2"
              >
                <span>View Active Project Workspace</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : isCreator ? (
              <button
                onClick={() => navigate(`/problems/${problem.id}/applications`)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center space-x-2"
              >
                <span>Review Applicants & Compare Candidates</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : existingApp ? (
              <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-800 border border-emerald-300 px-4 py-2 rounded-xl text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Proposal Submitted ({existingApp.status.toUpperCase()})</span>
              </div>
            ) : (
              <button
                onClick={() => {
                  if (!user) {
                    navigate('/login');
                  } else {
                    setApplyModalOpen(true);
                  }
                }}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center space-x-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Apply as Solver</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="lg:col-span-2 space-y-6">

            {/* Description */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Problem Description
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {problem.description}
              </p>
            </div>

            {/* Current Situation & Root Cause */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <h4 className="text-xs font-bold text-slate-900">Current Ground Situation</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {problem.current_situation || "Manual, delayed, or absent periodic measurements."}
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <h4 className="text-xs font-bold text-slate-900">Root Cause (Identified)</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {problem.root_cause || "Infrastructure deficits and lack of localized alerting."}
                </p>
              </div>
            </div>

            {/* Deliverables & Acceptance Criteria */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Agreed Deliverables & Acceptance Standards
              </h3>

              <div className="space-y-3">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-800 mb-1">Expected Deliverables:</h4>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                    {problem.deliverables_text || "Calibrated working prototype, source code/schematics, user caretaker guide, and field validation report."}
                  </p>
                </div>

                <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200">
                  <h4 className="text-xs font-bold text-emerald-900 mb-1">Acceptance Criteria (Testing Gate):</h4>
                  <p className="text-xs text-emerald-800 leading-relaxed whitespace-pre-line">
                    {problem.acceptance_criteria_text || "Field accuracy verified against benchmark; continuous reliable operation during agreed trial period."}
                  </p>
                </div>
              </div>
            </div>

            {/* Testing Approach & Adoption Plan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <h4 className="text-xs font-bold text-slate-900">Testing Approach</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {problem.testing_approach || "Controlled test trial with community stakeholders before adoption review."}
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <h4 className="text-xs font-bold text-slate-900">Adoption Strategy</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {problem.adoption_plan || "Integrated into village council ongoing operations with local youth caretakers."}
                </p>
              </div>
            </div>

          </div>

          {/* Sidebar Specifications */}
          <div className="space-y-6">

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Required Technical Skills
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {(problem.required_skills_declared || 'Engineering, Field Testing')
                  .split(',')
                  .map((s, idx) => (
                    <span key={idx} className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs px-2.5 py-1 rounded-lg font-medium">
                      {s.trim()}
                    </span>
                  ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Available Village Resources
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {problem.available_resources || "Gram Panchayat field site access, local caretaker assistance, and test points."}
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Known Constraints
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {problem.constraints || "Low cellular bandwidth in remote hamlets; weather exposure; component budget cap."}
              </p>
            </div>

          </div>

        </div>
      )}

      {/* Tab 2: AI Problem Report */}
      {activeTab === 'ai_analysis' && (
        <div className="space-y-6">
          {!aiAnalysis ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500 text-xs space-y-3">
              <Sparkles className="w-8 h-8 text-emerald-600 mx-auto animate-bounce" />
              <p>AI structured analysis report is being generated...</p>
            </div>
          ) : (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">

              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <h2 className="text-base font-bold text-slate-900">
                      AI Problem Analyst Report (v{aiAnalysis.version})
                    </h2>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Model: {aiAnalysis.model_name} • Provider: {aiAnalysis.provider} • Confidence: {(aiAnalysis.confidence_score * 100).toFixed(0)}%
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    Complexity: {aiAnalysis.complexity_score}/5
                  </span>
                  {aiAnalysis.is_confirmed_by_provider && (
                    <span className="text-xs font-semibold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200 flex items-center space-x-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>Confirmed by Provider</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Executive Summary */}
              <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200 space-y-1.5">
                <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wide">Executive Summary</h4>
                <p className="text-xs sm:text-sm text-emerald-900 leading-relaxed">{aiAnalysis.executive_summary}</p>
              </div>

              {/* Root Cause Hypotheses */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Root Cause Hypotheses (AI Identified)
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {aiAnalysis.potential_root_causes.map((rc, idx) => (
                    <li key={idx} className="flex items-start space-x-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span>{rc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Required Skills Matrix */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Required Competency Matrix
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {aiAnalysis.required_skills.map((s, idx) => (
                    <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-800">{s.skill}</span>
                        <span className="text-[11px] text-slate-400 block">{s.category}</span>
                      </div>
                      <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Level {s.importance || 4}/5
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Suggested Milestones */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  AI Suggested Project Milestones
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {aiAnalysis.suggested_milestones.map((m, idx) => (
                    <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <div className="text-xs font-bold text-slate-900">{m.title}</div>
                      <div className="text-[11px] text-slate-600 leading-snug">{m.description}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risks & Clarification Questions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-2">
                  <h4 className="text-xs font-bold text-amber-900">Risks & Field Constraints</h4>
                  <ul className="space-y-1 text-xs text-amber-800 list-disc list-inside">
                    {aiAnalysis.risks_and_constraints.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-sky-50 rounded-2xl border border-sky-200 space-y-2">
                  <h4 className="text-xs font-bold text-sky-900">Clarification Questions for Solver</h4>
                  <ul className="space-y-1 text-xs text-sky-800 list-disc list-inside">
                    {aiAnalysis.missing_information_questions.map((q, i) => (
                      <li key={i}>{q}</li>
                    ))}
                  </ul>
                </div>
              </div>

            </div>
          )}
        </div>
      )}

      {/* Application Modal with Individual & Team Tabs */}
      {applyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl my-8 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Apply as Solver</h3>
                <p className="text-xs text-slate-500 mt-0.5 truncate max-w-md">{problem.title}</p>
              </div>
              <button
                onClick={() => setApplyModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Solver Type Selection Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl text-xs font-bold text-center">
              <button
                type="button"
                onClick={() => setSolverTab('individual')}
                className={`py-2 rounded-lg transition-colors ${solverTab === 'individual' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}
              >
                Individual Solver
              </button>
              <button
                type="button"
                onClick={() => setSolverTab('team')}
                className={`py-2 rounded-lg transition-colors ${solverTab === 'team' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}
              >
                Team
              </button>
            </div>

            <form onSubmit={handleApply} className="space-y-4 text-xs">

              {/* Team Section */}
              {solverTab === 'team' && (
                <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-blue-950 text-xs">Team Information</h4>
                    <span className="text-[10px] text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full font-semibold">
                      Email Dispatch Active
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-blue-900 mb-1">Team Name *</label>
                      <input
                        type="text"
                        required={solverTab === 'team'}
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        placeholder="e.g. COEP Solar Innovators"
                        className="w-full p-2 bg-white border border-blue-200 rounded-xl focus:outline-none focus:border-blue-500 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-blue-900 mb-1">College / Institution *</label>
                      <input
                        type="text"
                        required={solverTab === 'team'}
                        value={collegeName}
                        onChange={(e) => setCollegeName(e.target.value)}
                        placeholder="e.g. COEP Technological University"
                        className="w-full p-2 bg-white border border-blue-200 rounded-xl focus:outline-none focus:border-blue-500 text-xs"
                      />
                    </div>
                  </div>

                  {/* Dynamic Teammates Roster */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between">
                      <label className="block font-bold text-blue-950 text-[11px]">
                        Teammates (Name & Email ID)
                      </label>
                      <button
                        type="button"
                        onClick={handleAddMember}
                        className="text-[11px] font-bold text-blue-700 hover:text-blue-900 flex items-center space-x-1"
                      >
                        <span>+ Add Teammate</span>
                      </button>
                    </div>

                    {teamMembers.map((member, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={member.name}
                          onChange={(e) => handleMemberChange(idx, 'name', e.target.value)}
                          placeholder={`Member ${idx + 1} Name`}
                          className="w-1/3 p-2 bg-white border border-blue-200 rounded-lg text-xs"
                        />
                        <input
                          type="email"
                          value={member.email}
                          onChange={(e) => handleMemberChange(idx, 'email', e.target.value)}
                          placeholder="member@college.edu"
                          className="flex-1 p-2 bg-white border border-blue-200 rounded-lg text-xs"
                        />
                        <input
                          type="text"
                          value={member.role}
                          onChange={(e) => handleMemberChange(idx, 'role', e.target.value)}
                          placeholder="Role / Focus"
                          className="w-1/4 p-2 bg-white border border-blue-200 rounded-lg text-xs hidden sm:block"
                        />
                        {teamMembers.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(idx)}
                            className="p-1.5 text-red-500 hover:text-red-700 text-xs font-bold"
                            title="Remove member"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}

                    <p className="text-[10px] text-blue-800 italic pt-1">
                      Teammates will receive project confirmation and details via Email upon submission.
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Technical Proposal & Solution Architecture *
                </label>
                <textarea
                  required
                  rows={3}
                  value={proposal}
                  onChange={(e) => setProposal(e.target.value)}
                  placeholder="Outline your solution architecture, hardware/software stack, and how it addresses root causes..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Implementation Approach & Testing *
                </label>
                <textarea
                  required
                  rows={3}
                  value={approach}
                  onChange={(e) => setApproach(e.target.value)}
                  placeholder="Step-by-step development, bench testing, calibration, and on-ground deployment plan..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Relevant Experience & Prior Projects
                </label>
                <textarea
                  rows={2}
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="Coursework, hackathons, lab prototypes, or field experience..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Estimated Timeline (Weeks)
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="24"
                    value={timelineWeeks}
                    onChange={(e) => setTimelineWeeks(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Weekly Commitment (Hours/Week)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="60"
                    value={weeklyHours}
                    onChange={(e) => setWeeklyHours(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setApplyModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingApp}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submittingApp ? 'Submitting...' : solverTab === 'team' ? 'Submit Team Application' : 'Submit Application'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
