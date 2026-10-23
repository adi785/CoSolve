import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api/client';
import { Badge } from '../components/Badge';
import { 
  Sparkles, 
  Check, 
  ArrowLeft, 
  Send, 
  AlertCircle, 
  Layers, 
  Edit3, 
  CheckCircle2,
  HelpCircle,
  Cpu
} from 'lucide-react';

export const AIAnalysisReportPage = ({ problemId, navigate }) => {
  const [report, setReport] = useState(null);
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [moderationSubmitted, setModerationSubmitted] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const p = await apiRequest(`/problems/${problemId}`);
        setProblem(p);
        const ai = await apiRequest(`/problems/${problemId}/analysis`);
        setReport(ai);
        setConfirmed(ai.is_confirmed_by_provider);
      } catch (err) {
        console.warn('Error loading AI report:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [problemId]);

  const handleConfirmAndSave = async () => {
    setSaving(true);
    try {
      await apiRequest(`/problems/${problemId}/analysis`, 'PUT', {
        is_confirmed_by_provider: true,
        provider_edits: {}
      });
      setConfirmed(true);
      alert('AI Analysis confirmed by provider!');
    } catch (err) {
      alert('Failed to save confirmation: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitForModeration = async () => {
    try {
      await apiRequest(`/problems/${problemId}/submit`, 'POST');
      setModerationSubmitted(true);
      alert('Challenge successfully submitted for administrative moderation review!');
      navigate('/provider/dashboard');
    } catch (err) {
      alert('Submission failed: ' + err.message);
    }
  };

  if (loading) {
    return <div className="text-center py-24 text-slate-400 text-xs">Loading structured analysis...</div>;
  }

  if (!report) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center space-y-4">
        <h2 className="text-sm font-bold text-slate-800">No AI analysis available for this challenge yet.</h2>
        <button onClick={() => navigate('/provider/dashboard')} className="text-xs text-emerald-700 underline font-semibold">
          Return to Provider Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Back link */}
      <button
        onClick={() => navigate(`/problems/${problemId}`)}
        className="flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Challenge Details</span>
      </button>

      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Badge variant="purple" size="sm">
              <Sparkles className="w-3.5 h-3.5 mr-1" /> AI Problem Analyst
            </Badge>
            <Badge variant="default" size="sm">Version {report.version}.0</Badge>
          </div>

          <div className="text-xs text-slate-500">
            Engine: <strong className="text-slate-800">{report.model_name}</strong> • Confidence: <strong className="text-emerald-700">{(report.confidence_score * 100).toFixed(0)}%</strong>
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            AI Structured Analysis & Requirements Report
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Challenge: {problem?.title}
          </p>
        </div>

        {/* Confirmation banner */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs">
          <div className="flex items-center space-x-2 text-emerald-900">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              {confirmed 
                ? 'Requirements confirmed by Problem Provider. Ready for publication review.' 
                : 'Please review the AI extracted hypotheses and milestones below before publishing.'}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {!confirmed && (
              <button
                onClick={handleConfirmAndSave}
                disabled={saving}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-xs transition-colors"
              >
                {saving ? 'Saving...' : 'Confirm Analysis Parameters'}
              </button>
            )}

            {problem?.moderation_status === 'draft' && (
              <button
                onClick={handleSubmitForModeration}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center space-x-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit for Moderation Approval</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Structured Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main 2 Cols */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Executive Summary */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Executive Summary
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {report.executive_summary}
            </p>
          </div>

          {/* Root Cause Hypotheses */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Potential Root Causes (Labeled Hypotheses)
            </h3>
            <div className="space-y-2">
              {report.potential_root_causes.map((rc, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
                  {rc}
                </div>
              ))}
            </div>
          </div>

          {/* Suggested Milestones */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Structured Project Milestones
            </h3>
            <div className="space-y-2.5">
              {report.suggested_milestones.map((m, idx) => (
                <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{m.title}</div>
                    <div className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">{m.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Acceptance Criteria */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Acceptance & Verification Standards
            </h3>
            <ul className="space-y-2 text-xs text-slate-700">
              {report.acceptance_criteria.map((c, idx) => (
                <li key={idx} className="flex items-start space-x-2 p-2.5 bg-emerald-50/40 rounded-xl border border-emerald-100">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          
          {/* Complexity Score */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Complexity Evaluation
            </h3>
            <div className="flex items-center space-x-3">
              <div className="text-3xl font-extrabold text-slate-900">{report.complexity_score} / 5</div>
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Moderate to High
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {report.complexity_explanation}
            </p>
          </div>

          {/* Required Skills Matrix */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Extracted Skills Matrix
            </h3>
            <div className="space-y-1.5">
              {report.required_skills.map((s, idx) => (
                <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-800">{s.skill}</span>
                    <span className="text-[10px] text-slate-400 block">{s.category}</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-600 bg-slate-200 px-1.5 py-0.5 rounded">
                    Lvl {s.importance || 4}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Suggested Team */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Recommended Team Structure
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {report.suggested_team_composition}
            </p>
          </div>

          {/* Adoption Strategy */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Adoption Strategy
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {report.suggested_adoption_strategy}
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
