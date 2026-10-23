import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/Badge';
import { 
  Building2, 
  Users, 
  Sparkles, 
  Plus, 
  Mail, 
  Check, 
  ExternalLink,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export const OrganizationDashboard = ({ navigate }) => {
  const { user } = useAuth();
  const [orgs, setOrgs] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [orgDetail, setOrgDetail] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Invite member form
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [inviting, setInviting] = useState(false);

  // Create Org modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [orgName, setOrgName] = useState('');
  const [orgType, setOrgType] = useState('university');
  const [regNumber, setRegNumber] = useState('');
  const [orgDesc, setOrgDesc] = useState('');
  const [orgWebsite, setOrgWebsite] = useState('');

  useEffect(() => {
    async function loadOrgs() {
      if (!user) return;
      try {
        const myOrgs = await apiRequest('/organizations/my');
        setOrgs(myOrgs);
        if (myOrgs.length > 0) {
          setSelectedOrg(myOrgs[0]);
          loadOrgDetail(myOrgs[0].id);
        }
      } catch (err) {
        console.warn('Error loading organizations:', err);
      } finally {
        setLoading(false);
      }
    }
    loadOrgs();
  }, [user]);

  const loadOrgDetail = async (orgId) => {
    try {
      const [detail, recs] = await Promise.all([
        apiRequest(`/organizations/${orgId}`),
        apiRequest(`/organizations/${orgId}/recommendations`)
      ]);
      setOrgDetail(detail);
      setRecommendations(recs);
    } catch (err) {
      console.warn('Error loading org detail:', err);
    }
  };

  const handleInviteMember = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviting(true);
    try {
      await apiRequest(`/organizations/${selectedOrg.id}/members`, 'POST', null, {}, {
        email: inviteEmail.trim(),
        role: inviteRole
      });
      // Use query params as implemented in backend router
      await fetch(`/api/organizations/${selectedOrg.id}/members?email=${encodeURIComponent(inviteEmail.trim())}&role=${encodeURIComponent(inviteRole)}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('samarthya_token')}`
        }
      });
      alert(`Member ${inviteEmail} successfully added to organization!`);
      setInviteEmail('');
      loadOrgDetail(selectedOrg.id);
    } catch (err) {
      alert('Failed to add member: ' + err.message);
    } finally {
      setInviting(false);
    }
  };

  const handleCreateOrg = async (e) => {
    e.preventDefault();
    try {
      const newOrg = await apiRequest('/organizations', 'POST', {
        name: orgName,
        type: orgType,
        registration_number: regNumber,
        description: orgDesc,
        website: orgWebsite
      });
      alert('Organization created successfully!');
      setCreateModalOpen(false);
      setOrgs(prev => [...prev, newOrg]);
      setSelectedOrg(newOrg);
      loadOrgDetail(newOrg.id);
    } catch (err) {
      alert('Failed to create organization: ' + err.message);
    }
  };

  if (loading) {
    return <div className="text-center py-24 text-slate-400 text-xs">Loading organization hub...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Badge variant="published" size="sm">Institution Workspace</Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {orgDetail ? orgDetail.name : "Institution Hub"}
          </h1>
          <p className="text-xs text-slate-500">
            Coordinating colleges, universities, research labs, NGOs, and student bodies for collective impact.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-1.5 shrink-0"
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Register New Institution</span>
        </button>
      </div>

      {!orgDetail ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
          <Building2 className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-800">You are not associated with any institution yet.</p>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl"
          >
            Create Institution Profile
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left 2 Cols: Members & Recommendations */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Team Roster & Add Member */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                    Authorized Team Members ({orgDetail.members.length})
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Member competencies are aggregated into team matching scores.
                  </p>
                </div>

                {/* Invite Member Inline Form */}
                <form onSubmit={handleInviteMember} className="flex gap-2 w-full sm:w-auto text-xs">
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="Member email..."
                    className="p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 w-48 text-xs"
                  />
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="member">Member</option>
                    <option value="coordinator">Coordinator</option>
                  </select>
                  <button
                    type="submit"
                    disabled={inviting}
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shrink-0"
                  >
                    {inviting ? 'Adding...' : 'Add'}
                  </button>
                </form>
              </div>

              {/* Members Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {orgDetail.members.map((m) => (
                  <div key={m.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{m.name}</span>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded capitalize">
                        {m.role}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">{m.email}</div>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {m.skills.map((s, idx) => (
                        <span key={idx} className="bg-white text-slate-700 text-[10px] px-1.5 py-0.5 rounded border border-slate-200">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Team Matching Recommendations */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                    Team-Level Challenge Matches
                  </h3>
                </div>
                <span className="text-xs text-slate-400">{recommendations.length} Matches</span>
              </div>

              {recommendations.length === 0 ? (
                <p className="text-slate-400 text-xs py-4 text-center">No matching challenges right now.</p>
              ) : (
                <div className="space-y-4">
                  {recommendations.map(({ problem, match }) => (
                    <div
                      key={problem.id}
                      onClick={() => navigate(`/problems/${problem.id}`)}
                      className="p-5 rounded-2xl border border-slate-200 hover:border-emerald-400 cursor-pointer transition-all space-y-3 text-xs group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          {problem.domain}
                        </span>
                        <div className="flex items-center space-x-1.5 bg-emerald-50 text-emerald-900 font-bold px-3 py-1 rounded-full border border-emerald-200 text-xs">
                          <span>Team Fit: {match.match_score}%</span>
                        </div>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {problem.title}
                      </h4>

                      <p className="text-slate-600 text-xs line-clamp-2">{problem.description}</p>

                      <div className="p-2.5 bg-slate-50 rounded-xl text-[11px] text-slate-600 space-y-1">
                        {match.reasons.map((r, i) => (
                          <div key={i} className="flex items-center space-x-1.5">
                            <span className="text-emerald-600 font-bold">✓</span>
                            <span>{r}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Right Sidebar: Aggregated Skills & Specs */}
          <div className="space-y-6">
            
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 text-xs">
              <h3 className="font-bold text-slate-900 uppercase tracking-wide">
                Organization Profile
              </h3>
              
              <div className="space-y-2">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 text-[10px] block">Registration No.</span>
                  <span className="font-bold text-slate-800">{orgDetail.registration_number || 'N/A'}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 text-[10px] block">Authorized Lead</span>
                  <span className="font-bold text-slate-800">{orgDetail.lead_name}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 text-[10px] block">Verification Status</span>
                  <Badge variant="published" size="xs">
                    {orgDetail.verification_status.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3 text-xs">
              <h3 className="font-bold text-slate-900 uppercase tracking-wide">
                Combined Team Competencies
              </h3>
              <p className="text-[11px] text-slate-400">
                Skills aggregated across all registered members:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {orgDetail.aggregated_skills.map((s, idx) => (
                  <span key={idx} className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Create Org Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-xs">
            <h3 className="text-base font-bold text-slate-900">Register Organization Profile</h3>

            <form onSubmit={handleCreateOrg} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Organization Name *</label>
                <input
                  type="text"
                  required
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="e.g. Rural Technology & Innovation Collective"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Type</label>
                  <select
                    value={orgType}
                    onChange={(e) => setOrgType(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="university">University / Department</option>
                    <option value="student_club">Student Tech Club</option>
                    <option value="ngo">NGO / Non-Profit</option>
                    <option value="shg">Self-Help Group (SHG)</option>
                    <option value="research_lab">Research Laboratory</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Registration No.</label>
                  <input
                    type="text"
                    value={regNumber}
                    onChange={(e) => setRegNumber(e.target.value)}
                    placeholder="e.g. MH/2021/PUNE/009182"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Description & Mandate</label>
                <textarea
                  rows={3}
                  value={orgDesc}
                  onChange={(e) => setOrgDesc(e.target.value)}
                  placeholder="Describe your organization's technical mission and grassroots focus..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setCreateModalOpen(false)} className="px-4 py-2 border rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-slate-900 text-white font-bold rounded-xl">Register Organization</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
