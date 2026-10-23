import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/Badge';
import { 
  CheckCircle2, 
  Sparkles, 
  FileText, 
  Clock, 
  Check, 
  AlertTriangle, 
  ArrowLeft, 
  ExternalLink, 
  Github, 
  Video, 
  UploadCloud, 
  Plus, 
  Layers, 
  Users, 
  ShieldCheck, 
  Send,
  HelpCircle,
  Award
} from 'lucide-react';

export const ProjectWorkspacePage = ({ projectId, navigate }) => {
  const { user } = useAuth();
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, milestones, prototype, testing, adoption, activity

  // Prototype Modal
  const [protoModalOpen, setProtoModalOpen] = useState(false);
  const [protoDemoUrl, setProtoDemoUrl] = useState('');
  const [protoRepoUrl, setProtoRepoUrl] = useState('');
  const [protoVideoUrl, setProtoVideoUrl] = useState('');
  const [protoDocs, setProtoDocs] = useState('');
  const [protoTestInst, setProtoTestInst] = useState('');
  const [protoLimits, setProtoLimits] = useState('');
  const [submittingProto, setSubmittingProto] = useState(false);

  // Review Modal
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewDecision, setReviewDecision] = useState('approved');
  const [reviewComments, setReviewComments] = useState('');

  // Testing Round Modal
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testPlan, setTestPlan] = useState('');
  const [testResults, setTestResults] = useState('');
  const [testStatus, setTestStatus] = useState('passed');
  const [testComments, setTestComments] = useState('');

  // Adoption Verification Modal
  const [adoptModalOpen, setAdoptModalOpen] = useState(false);
  const [adoptStatus, setAdoptStatus] = useState('verified_adopted');
  const [beneficiaries, setBeneficiaries] = useState(1450);
  const [adoptEvidence, setAdoptEvidence] = useState('');
  const [adoptOutcomes, setAdoptOutcomes] = useState('');
  const [adoptMaintenance, setAdoptMaintenance] = useState('');
  const [adoptRationale, setAdoptRationale] = useState('');

  // Dispute Modal
  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [disputeType, setDisputeType] = useState('unpaid_reward');
  const [disputeTitle, setDisputeTitle] = useState('');
  const [disputeDesc, setDisputeDesc] = useState('');

  // Task creation
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedMilestoneId, setSelectedMilestoneId] = useState('');

  useEffect(() => {
    fetchWorkspace();
  }, [projectId]);

  const fetchWorkspace = async () => {
    try {
      const data = await apiRequest(`/projects/${projectId}`);
      setWorkspace(data);
      if (data.prototype) {
        setProtoDemoUrl(data.prototype.demo_url || '');
        setProtoRepoUrl(data.prototype.repo_url || '');
        setProtoVideoUrl(data.prototype.video_url || '');
        setProtoDocs(data.prototype.documentation || '');
        setProtoTestInst(data.prototype.test_instructions || '');
        setProtoLimits(data.prototype.known_limitations || '');
      }
    } catch (err) {
      alert('Error loading project workspace: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPrototype = async (e) => {
    e.preventDefault();
    setSubmittingProto(true);
    try {
      await apiRequest(`/projects/${projectId}/prototype`, 'POST', {
        prototype_demo_url: protoDemoUrl,
        prototype_repo_url: protoRepoUrl,
        prototype_video_url: protoVideoUrl,
        prototype_documentation: protoDocs,
        prototype_test_instructions: protoTestInst,
        prototype_known_limitations: protoLimits
      });
      alert('Working prototype submitted for provider review!');
      setProtoModalOpen(false);
      fetchWorkspace();
    } catch (err) {
      alert('Submission failed: ' + err.message);
    } finally {
      setSubmittingProto(false);
    }
  };

  const handleProviderReview = async (e) => {
    e.preventDefault();
    try {
      await apiRequest(`/projects/${projectId}/reviews`, 'POST', {
        target_type: 'prototype',
        target_id: projectId,
        rating: 5,
        decision: reviewDecision,
        comments: reviewComments
      });
      alert(`Review recorded as '${reviewDecision}'!`);
      setReviewModalOpen(false);
      fetchWorkspace();
    } catch (err) {
      alert('Review failed: ' + err.message);
    }
  };

  const handleRecordTesting = async (e) => {
    e.preventDefault();
    try {
      await apiRequest(`/projects/${projectId}/testing`, 'POST', {
        test_plan: testPlan,
        test_results: testResults,
        status: testStatus,
        reviewer_comments: testComments
      });
      alert(`Testing round recorded as '${testStatus}'!`);
      setTestModalOpen(false);
      fetchWorkspace();
    } catch (err) {
      alert('Testing record failed: ' + err.message);
    }
  };

  const handleRecordAdoption = async (e) => {
    e.preventDefault();
    try {
      await apiRequest(`/projects/${projectId}/adoption`, 'POST', {
        adoption_status: adoptStatus,
        beneficiaries_served: parseInt(beneficiaries) || 0,
        real_world_evidence: adoptEvidence,
        outcomes_achieved: adoptOutcomes,
        maintenance_plan: adoptMaintenance,
        review_rationale: adoptRationale
      });
      alert(`Adoption status recorded as '${adoptStatus}'!`);
      setAdoptModalOpen(false);
      fetchWorkspace();
    } catch (err) {
      alert('Adoption record failed: ' + err.message);
    }
  };

  const handleRaiseDispute = async (e) => {
    e.preventDefault();
    try {
      await apiRequest('/disputes', 'POST', {
        project_id: projectId,
        dispute_type: disputeType,
        title: disputeTitle,
        description: disputeDesc
      });
      alert('Dispute successfully lodged. An independent reviewer will be assigned.');
      setDisputeModalOpen(false);
    } catch (err) {
      alert('Dispute submission failed: ' + err.message);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    try {
      await apiRequest(`/projects/${projectId}/tasks`, 'POST', {
        milestone_id: selectedMilestoneId || (workspace.milestones[0]?.id),
        title: newTaskTitle.trim()
      });
      setNewTaskTitle('');
      fetchWorkspace();
    } catch (err) {
      alert('Task addition failed: ' + err.message);
    }
  };

  const handleToggleTask = async (taskId, currentStatus) => {
    const nextStatus = currentStatus === 'done' ? 'todo' : 'done';
    try {
      await apiRequest(`/projects/${projectId}/tasks/${taskId}`, 'PUT', {
        status: nextStatus
      });
      fetchWorkspace();
    } catch (err) {
      alert('Failed to update task: ' + err.message);
    }
  };

  const handleToggleMilestone = async (milestoneId, currentStatus) => {
    const nextStatus = currentStatus === 'approved' ? 'in_progress' : 'approved';
    try {
      await apiRequest(`/projects/${projectId}/milestones/${milestoneId}`, 'PUT', {
        status: nextStatus
      });
      fetchWorkspace();
    } catch (err) {
      alert('Failed to update milestone: ' + err.message);
    }
  };

  if (loading) {
    return <div className="text-center py-24 text-slate-400 text-xs">Loading project workspace...</div>;
  }

  if (!workspace) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center space-y-4">
        <h2 className="text-sm font-bold text-slate-800">Project Not Found</h2>
        <button onClick={() => navigate('/problems')} className="text-xs text-emerald-700 underline font-semibold">
          Return to Directory
        </button>
      </div>
    );
  }

  const { is_provider, is_lead_solver, is_admin } = workspace.user_permissions;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Breadcrumb & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => navigate(`/problems/${workspace.problem.id}`)}
          className="flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Challenge: {workspace.problem.title}</span>
        </button>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setDisputeModalOpen(true)}
            className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200 transition-colors flex items-center space-x-1"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Report Dispute</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full text-xs">
              {workspace.problem.domain}
            </span>
            <Badge variant={workspace.status === 'completed' ? 'verified_adopted' : 'published'}>
              PROJECT: {workspace.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>

          <div className="text-xs text-slate-500 flex items-center space-x-3">
            <span>Provider: <strong className="text-slate-800">{workspace.problem.creator_name} ({workspace.problem.panchayat_name || 'Village Authority'})</strong></span>
            <span>•</span>
            <span>Lead Solver: <strong className="text-slate-800">{workspace.lead_solver.name} ({workspace.lead_solver.college_name || 'Student'})</strong></span>
          </div>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Project Workspace: {workspace.problem.title}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Target Locality: {workspace.problem.affected_community} ({workspace.problem.geographic_district}, {workspace.problem.geographic_state})
          </p>
        </div>

        {/* Quick Action Navigation Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-bold">
            {[
              { id: 'overview', label: 'Overview & Charter' },
              { id: 'milestones', label: `Milestones (${workspace.milestones.length})` },
              { id: 'prototype', label: 'Prototype' },
              { id: 'testing', label: `Testing Rounds (${workspace.testing_records.length})` },
              { id: 'adoption', label: 'Adoption Verification' },
              { id: 'activity', label: 'Audit Log' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Role-Specific Action Pills */}
          <div className="flex items-center space-x-2">
            {(is_lead_solver || is_admin) && (
              <button
                onClick={() => setProtoModalOpen(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Submit / Edit Prototype</span>
              </button>
            )}

            {(is_provider || is_admin) && (
              <>
                <button
                  onClick={() => setTestModalOpen(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Record Testing Round</span>
                </button>

                <button
                  onClick={() => setAdoptModalOpen(true)}
                  className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Record Adoption Decision</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tab 1: Overview & Charter */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            {/* Project Charter */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center space-x-2 text-slate-900">
                <FileText className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold uppercase tracking-wide">
                  Agreed Project Charter & Binding Terms
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="font-bold text-slate-900 block mb-1">Agreed Scope:</span>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-line">{workspace.charter.scope}</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="font-bold text-slate-900 block mb-1">Agreed Deliverables:</span>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-line">{workspace.charter.deliverables}</p>
                </div>

                <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                  <span className="font-bold text-emerald-950 block mb-1">Acceptance Criteria (Testing Gate):</span>
                  <p className="text-emerald-900 leading-relaxed whitespace-pre-line">{workspace.charter.acceptance_criteria}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">IP & Licensing Terms</span>
                    <span className="font-bold text-slate-800">{workspace.charter.ip_terms || "Open Public Good"}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">Funding & Payment Terms</span>
                    <span className="font-bold text-slate-800">{workspace.charter.funding_terms || "Voluntary / Grant"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Lifecycle Status Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Lifecycle Progression Tracker
              </h3>

              <div className="flex items-center justify-between text-xs font-semibold py-3 border-y border-slate-100 overflow-x-auto gap-3">
                <span className="text-emerald-700 flex items-center space-x-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>1. Charter Agreed</span>
                </span>
                <span className="text-slate-300">→</span>
                <span className={workspace.prototype.submitted_at ? 'text-emerald-700 flex items-center space-x-1' : 'text-slate-400'}>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>2. Prototype Built</span>
                </span>
                <span className="text-slate-300">→</span>
                <span className={workspace.testing_records.length > 0 ? 'text-emerald-700 flex items-center space-x-1' : 'text-slate-400'}>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>3. Field Tested</span>
                </span>
                <span className="text-slate-300">→</span>
                <span className={workspace.adoption_records.length > 0 && workspace.adoption_records[0].adoption_status === 'verified_adopted' ? 'text-teal-700 font-bold flex items-center space-x-1' : 'text-slate-400'}>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>4. Verified Adoption</span>
                </span>
              </div>
            </div>

          </div>

          {/* Team Members Sidebar */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center space-x-1.5">
                <Users className="w-3.5 h-3.5 text-slate-500" />
                <span>Authorized Project Members</span>
              </h3>

              <div className="space-y-2">
                {workspace.team_members.map(m => (
                  <div key={m.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-800">{m.name}</div>
                      <div className="text-[10px] text-slate-400">{m.email}</div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded capitalize">
                      {m.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Prototype Preview if exists */}
            {workspace.prototype.demo_url && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3 text-xs">
                <h3 className="font-bold text-slate-900 uppercase tracking-wide">
                  Live Prototype Demo
                </h3>
                <a
                  href={workspace.prototype.demo_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center space-x-2 text-emerald-700 font-bold underline truncate"
                >
                  <ExternalLink className="w-4 h-4 shrink-0" />
                  <span className="truncate">{workspace.prototype.demo_url}</span>
                </a>
                {workspace.prototype.repo_url && (
                  <a
                    href={workspace.prototype.repo_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center space-x-2 text-slate-700 font-medium underline truncate"
                  >
                    <Github className="w-4 h-4 shrink-0" />
                    <span className="truncate">{workspace.prototype.repo_url}</span>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Milestones & Tasks */}
      {activeTab === 'milestones' && (
        <div className="space-y-8">
          
          {/* Milestones list */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Project Milestones
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {workspace.milestones.map((m) => (
                <div key={m.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                      MILESTONE {m.order}
                    </span>
                    <button
                      onClick={() => handleToggleMilestone(m.id, m.status)}
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                        m.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {m.status.toUpperCase()}
                    </button>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900">{m.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{m.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tasks checklist */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Task Execution Board
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Break down milestones into concrete development & testing tasks.
                </p>
              </div>

              {/* Add Task Form */}
              <form onSubmit={handleAddTask} className="flex gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="New task description..."
                  className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 w-64"
                />
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Task</span>
                </button>
              </form>
            </div>

            <div className="space-y-2">
              {workspace.tasks.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No tasks added yet. Add tasks above to track team progress.</p>
              ) : (
                workspace.tasks.map((t) => {
                  const isDone = t.status === 'done';
                  return (
                    <div
                      key={t.id}
                      onClick={() => handleToggleTask(t.id, t.status)}
                      className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-colors text-xs ${
                        isDone ? 'bg-emerald-50/50 border-emerald-200 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                          isDone ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                        }`}>
                          {isDone && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <span className={isDone ? 'line-through text-slate-400' : 'font-medium'}>
                          {t.title}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">{t.assigned_to_name}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>
      )}

      {/* Tab 3: Prototype Stage */}
      {activeTab === 'prototype' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Working Prototype Submissions
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Technical demo links, source code repository, hardware wiring, and test instructions.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              {(is_lead_solver || is_admin) && (
                <button
                  onClick={() => setProtoModalOpen(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-1"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Update Prototype Submission</span>
                </button>
              )}

              {(is_provider || is_admin) && (
                <button
                  onClick={() => setReviewModalOpen(true)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                >
                  Record Provider Review
                </button>
              )}
            </div>
          </div>

          {!workspace.prototype.demo_url && !workspace.prototype.repo_url ? (
            <div className="text-center py-12 text-slate-400 text-xs space-y-2">
              <UploadCloud className="w-8 h-8 text-slate-300 mx-auto" />
              <p>No prototype submitted yet. The solver will upload demo links and schematics here.</p>
            </div>
          ) : (
            <div className="space-y-6 text-xs">
              
              {/* Links Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {workspace.prototype.demo_url && (
                  <a
                    href={workspace.prototype.demo_url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 hover:bg-emerald-100 transition-colors block space-y-1"
                  >
                    <span className="font-bold text-emerald-950 flex items-center space-x-1.5">
                      <ExternalLink className="w-4 h-4" />
                      <span>Live Demo & Telemetry</span>
                    </span>
                    <span className="text-[11px] text-emerald-700 truncate block">
                      {workspace.prototype.demo_url}
                    </span>
                  </a>
                )}

                {workspace.prototype.repo_url && (
                  <a
                    href={workspace.prototype.repo_url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-4 bg-slate-50 rounded-2xl border border-slate-200 hover:bg-slate-100 transition-colors block space-y-1"
                  >
                    <span className="font-bold text-slate-900 flex items-center space-x-1.5">
                      <Github className="w-4 h-4" />
                      <span>Source Code & Schematics</span>
                    </span>
                    <span className="text-[11px] text-slate-500 truncate block">
                      {workspace.prototype.repo_url}
                    </span>
                  </a>
                )}

                {workspace.prototype.video_url && (
                  <a
                    href={workspace.prototype.video_url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-4 bg-purple-50 rounded-2xl border border-purple-200 hover:bg-purple-100 transition-colors block space-y-1"
                  >
                    <span className="font-bold text-purple-950 flex items-center space-x-1.5">
                      <Video className="w-4 h-4" />
                      <span>Video Walkthrough</span>
                    </span>
                    <span className="text-[11px] text-purple-700 truncate block">
                      {workspace.prototype.video_url}
                    </span>
                  </a>
                )}
              </div>

              {/* Technical Docs & Test Instructions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wide text-[11px]">
                    Technical Documentation & BOM
                  </h4>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                    {workspace.prototype.documentation || "Complete circuit wiring and component bill of materials provided in GitHub repository."}
                  </p>
                </div>

                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wide text-[11px]">
                    Test Instructions for Village Evaluators
                  </h4>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                    {workspace.prototype.test_instructions || "Follow step-by-step operating checklist provided by solver."}
                  </p>
                </div>
              </div>

              {/* Known Limitations */}
              {workspace.prototype.known_limitations && (
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 space-y-1">
                  <h4 className="font-bold text-xs flex items-center space-x-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-700" />
                    <span>Known Hardware & Environmental Limitations</span>
                  </h4>
                  <p className="text-[11px] leading-relaxed">
                    {workspace.prototype.known_limitations}
                  </p>
                </div>
              )}

            </div>
          )}

          {/* Prototype Reviews Section */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Provider Review Decisions
            </h4>
            {workspace.reviews.length === 0 ? (
              <p className="text-xs text-slate-400">No review recorded yet by the problem provider.</p>
            ) : (
              workspace.reviews.map(r => (
                <div key={r.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{r.reviewer_name}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      r.decision === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {r.decision}
                    </span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">{r.comments}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Multi-Round Testing Stage */}
      {activeTab === 'testing' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Multi-Round Testing Records
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluation against predefined acceptance criteria. Supports multiple iterative testing rounds.
              </p>
            </div>

            {(is_provider || is_admin) && (
              <button
                onClick={() => setTestModalOpen(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log New Testing Round</span>
              </button>
            )}
          </div>

          {workspace.testing_records.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs space-y-2">
              <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto" />
              <p>No testing rounds recorded yet. The provider will log field test results here.</p>
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              {workspace.testing_records.map(t => (
                <div key={t.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900">Testing Round #{t.round_number}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        t.status === 'passed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {t.status.replace('_', ' ')}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Conducted by {t.reviewer_name} on {new Date(t.conducted_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700">
                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-900 block mb-1">Test Plan / Protocol:</span>
                      <p className="leading-relaxed">{t.test_plan}</p>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-900 block mb-1">Results & Observed Metrics:</span>
                      <p className="leading-relaxed">{t.test_results}</p>
                    </div>
                  </div>

                  {t.reviewer_comments && (
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-900">
                      <span className="font-bold block mb-0.5">Reviewer Feedback:</span>
                      <p className="leading-relaxed">{t.reviewer_comments}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Adoption Verification */}
      {activeTab === 'adoption' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Real-World Community Adoption Verification
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Proof of genuine community utilization. Completely independent from code completion.
              </p>
            </div>

            {(is_provider || is_admin) && (
              <button
                onClick={() => setAdoptModalOpen(true)}
                className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-1"
              >
                <Award className="w-3.5 h-3.5" />
                <span>Record Adoption Decision</span>
              </button>
            )}
          </div>

          {workspace.adoption_records.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs space-y-2">
              <Award className="w-8 h-8 text-slate-300 mx-auto" />
              <p>Adoption review not yet conducted. The project must first pass testing before adoption is confirmed.</p>
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              {workspace.adoption_records.map(a => (
                <div key={a.id} className="p-6 bg-teal-50/50 rounded-2xl border border-teal-200 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <Badge variant="verified_adopted" size="sm">
                        {a.adoption_status.replace('_', ' ').toUpperCase()}
                      </Badge>
                      {a.is_independent_review && (
                        <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-purple-200">
                          INDEPENDENT REVIEW VERIFIED
                        </span>
                      )}
                    </div>
                    <span className="text-slate-500 text-[11px]">
                      Audited by {a.reviewer_name}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 bg-white rounded-xl border border-teal-200">
                      <span className="text-slate-400 block text-[10px]">Verified Beneficiaries</span>
                      <span className="text-xl font-black text-slate-900 block mt-0.5">
                        {a.beneficiaries_served.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-slate-500">Villagers & community members</span>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-teal-200 col-span-2">
                      <span className="text-slate-400 block text-[10px]">Ground-Truth Real World Evidence</span>
                      <p className="font-medium text-slate-800 mt-1 leading-relaxed">
                        {a.real_world_evidence}
                      </p>
                    </div>
                  </div>

                  {a.outcomes_achieved && (
                    <div className="p-3 bg-white rounded-xl border border-teal-200 space-y-1">
                      <span className="font-bold text-slate-900 block">Outcomes & Quality of Life Gains:</span>
                      <p className="text-slate-700 leading-relaxed">{a.outcomes_achieved}</p>
                    </div>
                  )}

                  {a.maintenance_plan && (
                    <div className="p-3 bg-white rounded-xl border border-teal-200 space-y-1">
                      <span className="font-bold text-slate-900 block">Long-Term Maintenance & Caretaker Plan:</span>
                      <p className="text-slate-700 leading-relaxed">{a.maintenance_plan}</p>
                    </div>
                  )}

                  {a.review_rationale && (
                    <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-purple-900 space-y-1">
                      <span className="font-bold block">Independent Reviewer Audit Rationale:</span>
                      <p className="leading-relaxed">{a.review_rationale}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 6: Activity History & Immutable Audit Log */}
      {activeTab === 'activity' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            Immutable Project Audit Log
          </h3>
          <p className="text-xs text-slate-500">
            Cryptographically timestamped actions recorded for auditability and compliance.
          </p>

          <div className="space-y-2 pt-2 text-xs">
            {workspace.activity_log.length === 0 ? (
              <p className="text-slate-400 py-6 text-center">No activity recorded yet.</p>
            ) : (
              workspace.activity_log.map(a => (
                <div key={a.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-800">{a.action}</span>
                    <p className="text-slate-600 text-[11px]">{a.details}</p>
                  </div>
                  <div className="text-right text-[10px] text-slate-400 shrink-0">
                    <div>{a.actor_name}</div>
                    <div>{new Date(a.timestamp).toLocaleString()}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Prototype Modal */}
      {protoModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl my-8 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Submit Working Prototype</h3>
              <button onClick={() => setProtoModalOpen(false)} className="text-slate-400 font-bold">✕</button>
            </div>

            <form onSubmit={handleSubmitPrototype} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Working Demo / Simulator URL *</label>
                <input
                  type="url"
                  required
                  value={protoDemoUrl}
                  onChange={(e) => setProtoDemoUrl(e.target.value)}
                  placeholder="https://jal-drishti.example.org"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Source Code Repository Link</label>
                <input
                  type="url"
                  value={protoRepoUrl}
                  onChange={(e) => setProtoRepoUrl(e.target.value)}
                  placeholder="https://github.com/myteam/civic-node"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Demonstration Video Link</label>
                <input
                  type="url"
                  value={protoVideoUrl}
                  onChange={(e) => setProtoVideoUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Technical Documentation & BOM</label>
                <textarea
                  rows={3}
                  value={protoDocs}
                  onChange={(e) => setProtoDocs(e.target.value)}
                  placeholder="Wiring diagram overview, component list, power consumption stats..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Test Instructions for Evaluators</label>
                <textarea
                  rows={2}
                  value={protoTestInst}
                  onChange={(e) => setProtoTestInst(e.target.value)}
                  placeholder="How to power up, observe sensor lights, and verify readings..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Known Limitations</label>
                <input
                  type="text"
                  value={protoLimits}
                  onChange={(e) => setProtoLimits(e.target.value)}
                  placeholder="e.g. Probe needs wipe every 30 days in hard water"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setProtoModalOpen(false)}
                  className="px-4 py-2 border rounded-xl text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingProto}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs"
                >
                  {submittingProto ? 'Saving...' : 'Submit Prototype'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-xs">
            <h3 className="text-base font-bold text-slate-900">Record Provider Review</h3>
            
            <form onSubmit={handleProviderReview} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Review Decision *</label>
                <select
                  value={reviewDecision}
                  onChange={(e) => setReviewDecision(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  <option value="approved">Approved (Proceed to Testing)</option>
                  <option value="revisions_required">Revisions Required</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Reviewer Feedback & Comments *</label>
                <textarea
                  required
                  rows={4}
                  value={reviewComments}
                  onChange={(e) => setReviewComments(e.target.value)}
                  placeholder="Explain why the prototype meets the criteria or what revisions must be completed..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setReviewModalOpen(false)} className="px-4 py-2 border rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-slate-900 text-white font-bold rounded-xl">Save Review</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Testing Record Modal */}
      {testModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-xs">
            <h3 className="text-base font-bold text-slate-900">Log Testing Round</h3>

            <form onSubmit={handleRecordTesting} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Testing Protocol / Plan *</label>
                <textarea
                  required
                  rows={2}
                  value={testPlan}
                  onChange={(e) => setTestPlan(e.target.value)}
                  placeholder="e.g. 14-day field deployment at Well #2 with daily parallel split-sample testing..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Observed Results & Data *</label>
                <textarea
                  required
                  rows={3}
                  value={testResults}
                  onChange={(e) => setTestResults(e.target.value)}
                  placeholder="e.g. Readings matched lab samples within 4% variance; SMS alerts received promptly..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Testing Outcome Status *</label>
                <select
                  value={testStatus}
                  onChange={(e) => setTestStatus(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  <option value="passed">Passed (Ready for Adoption Review)</option>
                  <option value="revision_required">Revision Required</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setTestModalOpen(false)} className="px-4 py-2 border rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl">Save Testing Round</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adoption Record Modal */}
      {adoptModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-xs">
            <h3 className="text-base font-bold text-slate-900">Record Real-World Adoption Decision</h3>

            <form onSubmit={handleRecordAdoption} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Adoption Status *</label>
                <select
                  value={adoptStatus}
                  onChange={(e) => setAdoptStatus(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  <option value="verified_adopted">Adopted and Verified (Permanent Community Use)</option>
                  <option value="adoption_claimed">Adoption Claimed (Awaiting Verification)</option>
                  <option value="not_adopted">Not Adopted</option>
                  <option value="unable_to_verify">Unable to Verify</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Verified Beneficiaries Count *</label>
                <input
                  type="number"
                  required
                  value={beneficiaries}
                  onChange={(e) => setBeneficiaries(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Real-World Evidence (Panchayat Resolution / Photos) *</label>
                <textarea
                  required
                  rows={3}
                  value={adoptEvidence}
                  onChange={(e) => setAdoptEvidence(e.target.value)}
                  placeholder="e.g. Gram Panchayat Resolution #2026/09 officially accepting the telemetry unit into Shirur municipal grid..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Long-Term Maintenance Plan</label>
                <input
                  type="text"
                  value={adoptMaintenance}
                  onChange={(e) => setAdoptMaintenance(e.target.value)}
                  placeholder="e.g. Allocated in village council annual budget; 2 youth trained"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setAdoptModalOpen(false)} className="px-4 py-2 border rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-teal-700 text-white font-bold rounded-xl">Confirm Adoption</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dispute Modal */}
      {disputeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-xs">
            <h3 className="text-base font-bold text-slate-900">Report Platform Dispute</h3>

            <form onSubmit={handleRaiseDispute} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Dispute Type *</label>
                <select
                  value={disputeType}
                  onChange={(e) => setDisputeType(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  <option value="unpaid_reward">Unpaid or Delayed Promised Grant/Reward</option>
                  <option value="unfair_rejection">Unfair Rejection of Deliverable</option>
                  <option value="false_adoption">False or Exaggerated Adoption Claim</option>
                  <option value="nonresponsive_provider">Nonresponsive Problem Provider</option>
                  <option value="ip_dispute">Intellectual Property Disagreement</option>
                  <option value="other">Other Dispute</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Dispute Title *</label>
                <input
                  type="text"
                  required
                  value={disputeTitle}
                  onChange={(e) => setDisputeTitle(e.target.value)}
                  placeholder="e.g. Delay in Grant Disbursement"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Detailed Description & Evidence *</label>
                <textarea
                  required
                  rows={4}
                  value={disputeDesc}
                  onChange={(e) => setDisputeDesc(e.target.value)}
                  placeholder="Describe the issue factually and reference evidence files..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="p-3 bg-rose-50 text-rose-800 rounded-xl text-[11px]">
                ⚖️ An independent conflict-free reviewer will be assigned to evaluate findings.
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setDisputeModalOpen(false)} className="px-4 py-2 border rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-rose-600 text-white font-bold rounded-xl">Lodge Dispute</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
