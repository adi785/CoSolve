import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/Badge';
import { 
  PlusCircle, 
  Users, 
  FolderGit2, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  ArrowRight,
  ShieldCheck,
  Send
} from 'lucide-react';

export const ProviderDashboard = ({ navigate }) => {
  const { user } = useAuth();
  const [problems, setProblems] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        const [myProbs, myProjs] = await Promise.all([
          apiRequest('/problems/my'),
          apiRequest('/projects')
        ]);
        setProblems(myProbs);
        setProjects(myProjs);
      } catch (err) {
        console.warn('Error loading provider dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center space-y-4">
        <h2 className="text-sm font-bold text-slate-800">Please Sign In as Problem Provider</h2>
        <button onClick={() => navigate('/login')} className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold">
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Provider Hub: {user.full_name}
            </h1>
            <Badge variant="published" size="xs">
              {user.verification_status.toUpperCase()}
            </Badge>
          </div>
          <p className="text-xs text-slate-500">
            {user.panchayat_name ? `${user.panchayat_name} (${user.designation || 'Gram Panchayat Council'})` : user.bio}
          </p>
        </div>

        <button
          onClick={() => navigate('/provider/create-problem')}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-1.5 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post New Challenge</span>
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 text-[11px] font-bold block uppercase">Total Challenges</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{problems.length}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 text-[11px] font-bold block uppercase">Published & Active</span>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1">
            {problems.filter(p => p.moderation_status === 'published').length}
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 text-[11px] font-bold block uppercase">Active Workspaces</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{projects.length}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 text-[11px] font-bold block uppercase">Adopted Solutions</span>
          <div className="text-2xl font-extrabold text-teal-700 mt-1">
            {projects.filter(p => p.adoption_status === 'verified_adopted').length}
          </div>
        </div>
      </div>

      {/* Main Grid: My Challenges & Active Workspaces */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* My Challenges */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              My Posted Challenges
            </h2>
            <span className="text-xs text-slate-400">{problems.length} Challenges</span>
          </div>

          {problems.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs space-y-2">
              <p>You have not posted any challenges yet.</p>
              <button
                onClick={() => navigate('/provider/create-problem')}
                className="text-emerald-700 font-bold underline"
              >
                Create your first challenge
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {problems.map(prob => (
                <div
                  key={prob.id}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-slate-300 transition-all space-y-3 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      {prob.domain}
                    </span>
                    <Badge variant={prob.moderation_status === 'published' ? 'published' : 'warning'} size="xs">
                      {prob.moderation_status.toUpperCase()}
                    </Badge>
                  </div>

                  <h3
                    onClick={() => navigate(`/problems/${prob.id}`)}
                    className="text-sm font-bold text-slate-900 hover:text-emerald-700 cursor-pointer transition-colors"
                  >
                    {prob.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => navigate(`/problems/${prob.id}/applications`)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] transition-colors flex items-center space-x-1"
                    >
                      <Users className="w-3 h-3" />
                      <span>Compare Candidates</span>
                    </button>

                    <button
                      onClick={() => navigate(`/provider/ai-analysis/${prob.id}`)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-[11px] transition-colors flex items-center space-x-1"
                    >
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      <span>AI Analysis Report</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Project Workspaces Under Review */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Active Project Workspaces
            </h2>
            <span className="text-xs text-slate-400">{projects.length} Workspaces</span>
          </div>

          {projects.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              <p>No project workspaces active yet. Select a winning solver from candidate applications to initialize one.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map(p => (
                <div
                  key={p.id}
                  onClick={() => navigate(`/projects/${p.id}`)}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-emerald-400 cursor-pointer transition-all space-y-2 text-xs group"
                >
                  <div className="flex items-center justify-between">
                    <Badge variant={p.status === 'completed' ? 'verified_adopted' : 'published'} size="xs">
                      {p.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <span className="text-[11px] text-slate-400">
                      Solver: {p.lead_solver_name}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {p.problem_title}
                  </h3>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                    <span>Adoption: <strong>{p.adoption_status.replace('_', ' ')}</strong></span>
                    <span className="text-emerald-700 font-bold flex items-center space-x-1">
                      <span>Workspace</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
