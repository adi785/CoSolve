import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/Badge';
import { 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  FileText, 
  Users, 
  Scale, 
  Sparkles,
  Search,
  Filter,
  Check,
  Building2
} from 'lucide-react';

export const AdminDashboard = ({ navigate }) => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [moderationQueue, setModerationQueue] = useState([]);
  const [verifications, setVerifications] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('moderation'); // moderation, verifications, disputes, audit

  // Moderation notes
  const [actionNotes, setActionNotes] = useState('');

  useEffect(() => {
    async function loadAdminData() {
      if (!user || user.role !== 'admin') return;
      try {
        const [m, q, v, d, a] = await Promise.all([
          apiRequest('/admin/metrics'),
          apiRequest('/admin/moderation-queue'),
          apiRequest('/admin/verifications'),
          apiRequest('/disputes'),
          apiRequest('/admin/audit-logs?limit=40')
        ]);
        setMetrics(m);
        setModerationQueue(q);
        setVerifications(v);
        setDisputes(d);
        setAuditLogs(a);
      } catch (err) {
        console.warn('Error loading admin dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAdminData();
  }, [user]);

  const handleModerateProblem = async (problemId, action) => {
    try {
      await apiRequest(`/problems/${problemId}/moderate`, 'POST', {
        action,
        notes: actionNotes || `Administrative decision: ${action}`
      });
      alert(`Problem successfully ${action}d!`);
      setActionNotes('');
      // Refresh moderation queue & metrics
      const [m, q] = await Promise.all([
        apiRequest('/admin/metrics'),
        apiRequest('/admin/moderation-queue')
      ]);
      setMetrics(m);
      setModerationQueue(q);
    } catch (err) {
      alert('Moderation action failed: ' + err.message);
    }
  };

  const handleReviewVerification = async (reqId, status) => {
    try {
      await apiRequest(`/admin/verifications/${reqId}/review`, 'POST', {
        status,
        admin_feedback: `Verified against official documentation registry (${status})`
      });
      alert(`Verification request marked as ${status}!`);
      const [m, v] = await Promise.all([
        apiRequest('/admin/metrics'),
        apiRequest('/admin/verifications')
      ]);
      setMetrics(m);
      setVerifications(v);
    } catch (err) {
      alert('Verification review failed: ' + err.message);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center space-y-4">
        <h2 className="text-base font-bold text-rose-800">Administrative Privileges Required</h2>
        <p className="text-xs text-slate-500">
          Switch to Dr. Sunita Rao via the Demo Persona Switcher at the top right to access moderation.
        </p>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-24 text-slate-400 text-xs">Loading administrative control center...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Badge variant="danger" size="sm">
            <ShieldAlert className="w-3.5 h-3.5 mr-1" /> Platform Administration
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Moderation & Compliance Center
          </h1>
          <p className="text-xs text-slate-500">
            Logged in as <strong className="text-slate-800">{user.full_name}</strong>. Maintain platform integrity, verify authority, moderate challenges, and resolve disputes.
          </p>
        </div>
      </div>

      {/* Metrics Counter */}
      {metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-slate-400 text-[11px] font-bold block uppercase">Moderation Queue</span>
            <div className="text-2xl font-extrabold text-amber-600 mt-1">
              {metrics.challenges.pending_moderation}
            </div>
            <span className="text-[10px] text-slate-400">Challenges awaiting approval</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-slate-400 text-[11px] font-bold block uppercase">Pending Verifications</span>
            <div className="text-2xl font-extrabold text-blue-600 mt-1">
              {metrics.queues.pending_verifications}
            </div>
            <span className="text-[10px] text-slate-400">Panchayat & student credentials</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-slate-400 text-[11px] font-bold block uppercase">Active Projects</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">
              {metrics.projects.active}
            </div>
            <span className="text-[10px] text-slate-400">{metrics.projects.completed} completed & adopted</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-slate-400 text-[11px] font-bold block uppercase">Open Disputes</span>
            <div className="text-2xl font-extrabold text-rose-600 mt-1">
              {metrics.queues.open_disputes}
            </div>
            <span className="text-[10px] text-slate-400">Assigned independent review</span>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-bold overflow-x-auto">
        <button
          onClick={() => setActiveTab('moderation')}
          className={`px-4 py-2 rounded-xl transition-colors whitespace-nowrap ${
            activeTab === 'moderation' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Challenge Approval Queue ({moderationQueue.length})
        </button>

        <button
          onClick={() => setActiveTab('verifications')}
          className={`px-4 py-2 rounded-xl transition-colors whitespace-nowrap ${
            activeTab === 'verifications' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Verification Queue ({verifications.length})
        </button>

        <button
          onClick={() => setActiveTab('disputes')}
          className={`px-4 py-2 rounded-xl transition-colors whitespace-nowrap ${
            activeTab === 'disputes' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Disputes & Independent Audits ({disputes.length})
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-xl transition-colors whitespace-nowrap ${
            activeTab === 'audit' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Immutable Audit Log ({auditLogs.length})
        </button>
      </div>

      {/* Tab 1: Moderation Queue */}
      {activeTab === 'moderation' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Societal Challenge Publication Approval Queue
            </h2>
            <span className="text-xs text-slate-400">
              AI analysis does not auto-publish. Authorized human review required.
            </span>
          </div>

          {moderationQueue.length === 0 ? (
            <p className="text-xs text-slate-400 py-12 text-center">No challenges currently waiting in moderation queue.</p>
          ) : (
            <div className="space-y-6">
              {moderationQueue.map((item) => (
                <div
                  key={item.id}
                  className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 text-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-1">
                      <span className="font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        {item.domain}
                      </span>
                      <h3
                        onClick={() => navigate(`/problems/${item.id}`)}
                        className="text-base font-bold text-slate-900 hover:text-emerald-700 cursor-pointer transition-colors"
                      >
                        {item.title}
                      </h3>
                      <p className="text-slate-500 text-xs">
                        Author: <strong>{item.creator_name}</strong> • Region: <strong>{item.affected_community}</strong> • Provider Verified: {item.provider_verified ? 'Yes' : 'Pending'}
                      </p>
                    </div>

                    <Badge variant="warning">{item.moderation_status.toUpperCase()}</Badge>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200">
                    <button
                      onClick={() => navigate(`/provider/ai-analysis/${item.id}`)}
                      className="text-xs font-bold text-emerald-700 hover:underline flex items-center space-x-1"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Inspect AI Analysis & Clarifications</span>
                    </button>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleModerateProblem(item.id, 'approve')}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center space-x-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve & Publish</span>
                      </button>

                      <button
                        onClick={() => handleModerateProblem(item.id, 'reject')}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Verifications Queue */}
      {activeTab === 'verifications' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Identity & Institutional Authority Verification Queue
            </h2>
            <span className="text-xs text-slate-400">
              Zero Aadhaar/PAN numbers stored. Verified against registered institutional portals.
            </span>
          </div>

          <div className="space-y-4 text-xs">
            {verifications.map((v) => (
              <div key={v.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">
                    {v.user_name || v.org_name}
                  </span>
                  <Badge variant={v.status === 'approved' ? 'published' : 'warning'}>
                    {v.status.toUpperCase()}
                  </Badge>
                </div>

                <div className="text-slate-600 space-y-1">
                  <div>Type: <strong>{v.request_type.replace('_', ' ').toUpperCase()}</strong></div>
                  <div>Notes: {v.notes}</div>
                  <div>Sanitized Document Reference: <code className="bg-white px-2 py-0.5 rounded border">{v.document_ref}</code></div>
                </div>

                {v.status === 'pending' && (
                  <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200">
                    <button
                      onClick={() => handleReviewVerification(v.id, 'approved')}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
                    >
                      Approve Credentials
                    </button>
                    <button
                      onClick={() => handleReviewVerification(v.id, 'rejected')}
                      className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Disputes Queue */}
      {activeTab === 'disputes' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Disputes & Independent Review Assignments
            </h2>
            <span className="text-xs text-slate-400">
              Evaluated by independent committee; parties never evaluate their own disputes.
            </span>
          </div>

          <div className="space-y-4 text-xs">
            {disputes.map((d) => (
              <div key={d.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{d.title}</h3>
                    <span className="text-slate-500 text-[11px]">
                      Project: {d.project_title} • Raised by: {d.raised_by_name}
                    </span>
                  </div>
                  <Badge variant={d.status === 'resolved' ? 'published' : 'danger'}>
                    {d.status.toUpperCase()}
                  </Badge>
                </div>

                <p className="text-slate-700 leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
                  {d.description}
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>Assigned Reviewer: <strong>{d.reviewer_name || 'Independent Committee'}</strong></span>
                  <span>{new Date(d.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Audit Logs */}
      {activeTab === 'audit' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4 text-xs">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            Real-Time Audit Ledger
          </h2>
          <div className="space-y-2">
            {auditLogs.map((l) => (
              <div key={l.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between">
                <div>
                  <span className="font-mono font-bold text-slate-900 bg-slate-200 px-1.5 py-0.5 rounded text-[10px] mr-2">
                    {l.action}
                  </span>
                  <span className="text-slate-700">{l.details}</span>
                </div>
                <div className="text-right text-[10px] text-slate-400 shrink-0">
                  <div>{l.actor_name}</div>
                  <div>{new Date(l.timestamp).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
