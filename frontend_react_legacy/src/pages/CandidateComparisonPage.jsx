import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api/client';
import { Badge } from '../components/Badge';
import {
  Users,
  Sparkles,
  Check,
  ArrowLeft,
  FileCheck2,
  Calendar,
  Clock,
  CheckCircle2,
  Award,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export const CandidateComparisonPage = ({ problemId, navigate }) => {
  const [problem, setProblem] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selection Charter modal
  const [selectedApp, setSelectedApp] = useState(null);
  const [charterScope, setCharterScope] = useState('');
  const [charterDeliverables, setCharterDeliverables] = useState('');
  const [charterCriteria, setCharterCriteria] = useState('');
  const [charterIP, setCharterIP] = useState('Open source / CERN Open Hardware Licence for village community benefit');
  const [charterFunding, setCharterFunding] = useState('');
  const [creatingProject, setCreatingProject] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const p = await apiRequest(`/problems/${problemId}`);
        setProblem(p);
        const apps = await apiRequest(`/applications/problem/${problemId}`);
        setApplications(apps);
      } catch (err) {
        alert('Failed to load applicants: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [problemId]);

  const openSelectionModal = (app) => {
    setSelectedApp(app);
    setCharterScope(`Development, calibration, and community testing of solution for '${problem.title}'.`);
    setCharterDeliverables(problem.deliverables_text || "Calibrated prototype unit, source code/schematics, user manual, and field validation report.");
    setCharterCriteria(problem.acceptance_criteria_text || "Demonstrated accuracy within acceptable bounds and continuous field operation during testing.");
    setCharterFunding(`${problem.funding_model.replace('_', ' ').toUpperCase()} — ${problem.funding_currency} ${problem.funding_amount.toLocaleString('en-IN')}`);
  };

  const handleConfirmSelection = async (e) => {
    e.preventDefault();
    setCreatingProject(true);
    try {
      const res = await apiRequest('/applications/select-solver', 'POST', {
        application_id: selectedApp.id,
        charter_scope: charterScope,
        charter_deliverables: charterDeliverables,
        charter_acceptance_criteria: charterCriteria,
        charter_funding_terms: charterFunding,
        charter_ip_terms: charterIP,
        charter_confidentiality_terms: "Public civic data; operational results published for community transparency.",
        charter_withdrawal_rules: "2 weeks advance notice required with deliverable and code repository handover."
      });

      alert('Solver officially selected! Project workspace is now active.');
      navigate(`/projects/${res.project_id}`);
    } catch (err) {
      alert('Selection failed: ' + err.message);
    } finally {
      setCreatingProject(false);
    }
  };

  if (loading) {
    return <div className="text-center py-24 text-slate-400 text-xs">Loading candidate comparisons...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

      {/* Back button */}
      <button
        onClick={() => navigate(`/problems/${problemId}`)}
        className="flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Challenge Details</span>
      </button>

      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Badge variant="published" size="sm">Provider Candidate Review</Badge>
          <span className="text-xs text-slate-500 font-medium">
            {applications.length} Solvers Applied
          </span>
        </div>

        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Candidate Comparison & Solver Selection
        </h1>
        <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
          Challenge: <strong className="text-slate-800">{problem?.title}</strong>. As the problem provider, you hold final authority over solver selection. Review proposals, timeline commitments, and explainable AI skill match scores below.
        </p>
      </div>

      {/* Applications List */}
      {applications.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-2">
          <p className="text-sm font-bold text-slate-800">No applications received yet for this challenge.</p>
          <p className="text-xs text-slate-500">
            Published challenges are actively matched against registered student and organization solver profiles.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {applications.map((app) => {
            let explanation = {};
            try {
              if (app.match_explanation_snapshot) explanation = JSON.parse(app.match_explanation_snapshot);
            } catch (e) {
              // ignore
            }

            const isAccepted = app.status === 'accepted';

            return (
              <div
                key={app.id}
                className={`bg-white rounded-3xl border p-6 sm:p-8 shadow-xs space-y-6 transition-all ${isAccepted ? 'border-emerald-500 ring-2 ring-emerald-100' : 'border-slate-200 hover:border-slate-300'
                  }`}
              >

                {/* Candidate Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-base font-bold text-slate-900">{app.applicant_name}</h3>
                      <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                        {app.solver_type === 'team' ? 'Team' : app.solver_type === 'organization' ? 'Institution' : 'Individual Solver'}
                      </span>
                      {isAccepted && (
                        <Badge variant="published" size="xs">OFFICIALLY SELECTED</Badge>
                      )}
                    </div>
                    <div className="text-xs text-slate-500">
                      {app.team_name ? (
                        <span className="font-semibold text-blue-700">Team {app.team_name} • {app.college_name}</span>
                      ) : app.college_name ? (
                        `${app.college_name}`
                      ) : (
                        app.org_name || 'Individual Contributor'
                      )}
                    </div>
                    {app.team_members && app.team_members.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[10px] text-slate-400 font-bold">Roster:</span>
                        {app.team_members.map((tm, idx) => (
                          <span key={idx} className="bg-blue-50 text-blue-800 text-[10px] px-2 py-0.5 rounded border border-blue-200 font-medium">
                            {tm.name} ({tm.email})
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Match Score Badge */}
                  <div className="flex items-center space-x-3 bg-emerald-50 px-4 py-2.5 rounded-2xl border border-emerald-200">
                    <div>
                      <div className="text-xs text-emerald-800 font-bold">AI Match Score</div>
                      <div className="text-xl font-black text-emerald-900 leading-none mt-0.5">
                        {app.match_score_at_application.toFixed(1)}%
                      </div>
                    </div>
                    <Sparkles className="w-5 h-5 text-emerald-600" />
                  </div>
                </div>

                {/* Proposal & Approach */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                    <span className="font-bold text-slate-900 block">Proposed Solution Architecture</span>
                    <p className="text-slate-700 leading-relaxed whitespace-pre-line">{app.proposal}</p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                    <span className="font-bold text-slate-900 block">Implementation Approach</span>
                    <p className="text-slate-700 leading-relaxed whitespace-pre-line">{app.approach}</p>
                  </div>
                </div>

                {/* Practical commitments */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Timeline</span>
                    <span className="font-bold text-slate-800">{app.estimated_timeline_weeks} Weeks</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Weekly Availability</span>
                    <span className="font-bold text-slate-800">{app.weekly_availability_hours} Hrs / Week</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block text-[10px]">Team Composition</span>
                    <span className="font-bold text-slate-800 truncate block">{app.team_composition_notes || "Individual solver with faculty/mentor guidance"}</span>
                  </div>
                </div>

                {/* Match Explanation Insights */}
                {explanation.reasons && explanation.reasons.length > 0 && (
                  <div className="space-y-1.5 text-xs">
                    <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wide">
                      Why this candidate matches:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {explanation.reasons.map((r, i) => (
                        <span key={i} className="bg-emerald-50 text-emerald-800 text-[11px] px-2.5 py-1 rounded-lg border border-emerald-200">
                          ✓ {r}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Footer */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-slate-400">
                    Submitted on {new Date(app.submitted_at).toLocaleDateString()}
                  </span>

                  {!isAccepted && (
                    <button
                      onClick={() => openSelectionModal(app)}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
                    >
                      <span>Select This Solver & Establish Charter</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Selection Charter Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Establish Project Charter & Award Challenge</h3>
                <p className="text-xs text-slate-500 mt-0.5">Selected Solver: {selectedApp.applicant_name}</p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmSelection} className="space-y-4 text-xs">

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Agreed Project Scope & Boundaries *
                </label>
                <textarea
                  required
                  rows={2}
                  value={charterScope}
                  onChange={(e) => setCharterScope(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Agreed Deliverables Checklist *
                </label>
                <textarea
                  required
                  rows={2}
                  value={charterDeliverables}
                  onChange={(e) => setCharterDeliverables(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Acceptance Criteria for Testing Stage *
                </label>
                <textarea
                  required
                  rows={2}
                  value={charterCriteria}
                  onChange={(e) => setCharterCriteria(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Intellectual Property & Licensing Terms
                  </label>
                  <input
                    type="text"
                    value={charterIP}
                    onChange={(e) => setCharterIP(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Funding & Milestone Terms
                  </label>
                  <input
                    type="text"
                    value={charterFunding}
                    onChange={(e) => setCharterFunding(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 text-xs"
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800">
                ⚠️ Signing this charter formally binds the scope, creates the interactive project workspace, and notifies the solver. Only one active workspace is allowed per challenge.
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedApp(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingProject}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{creatingProject ? 'Initializing Workspace...' : 'Confirm & Initialize Project'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
