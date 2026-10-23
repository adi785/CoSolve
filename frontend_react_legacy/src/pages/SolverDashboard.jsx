import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/Badge';
import { 
  FolderGit2, 
  Sparkles, 
  Clock, 
  Award, 
  CheckCircle2, 
  ArrowRight, 
  Send,
  ExternalLink,
  ChevronRight,
  BookOpen
} from 'lucide-react';

export const SolverDashboard = ({ navigate }) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        const [projs, apps] = await Promise.all([
          apiRequest('/projects'),
          apiRequest('/applications/my')
        ]);
        setProjects(projs);
        setApplications(apps);
      } catch (err) {
        console.warn('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center space-y-4">
        <h2 className="text-sm font-bold text-slate-800">Please Sign In</h2>
        <button onClick={() => navigate('/login')} className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold">
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Welcome, {user.full_name}
            </h1>
            <Badge variant="published" size="xs">
              {user.is_student ? 'Verified Student Solver' : 'Solver'}
            </Badge>
          </div>
          <p className="text-xs text-slate-500">
            {user.college_name ? `${user.college_name} • Class of ${user.graduation_year || 2026}` : 'Independent Innovator'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate('/solver/recommendations')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Match Feed</span>
          </button>

          <button
            onClick={() => navigate(`/solver/portfolio/${user.id}`)}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
          >
            <Award className="w-3.5 h-3.5 text-emerald-600" />
            <span>Public Portfolio</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 text-[11px] font-bold block uppercase">Active Projects</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{projects.length}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 text-[11px] font-bold block uppercase">Applications Filed</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{applications.length}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 text-[11px] font-bold block uppercase">Weekly Availability</span>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1">{user.availability_hours_per_week || 15}h</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 text-[11px] font-bold block uppercase">Fieldwork Willing</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{user.fieldwork_willing ? 'Yes' : 'Remote'}</div>
        </div>
      </div>

      {/* Main Grid: Active Workspaces & Applications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Active Project Workspaces */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <FolderGit2 className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                My Project Workspaces
              </h2>
            </div>
            <span className="text-xs text-slate-400">{projects.length} Assigned</span>
          </div>

          {projects.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs space-y-2">
              <p>No active project assignments currently.</p>
              <button
                onClick={() => navigate('/solver/recommendations')}
                className="text-emerald-700 font-bold underline"
              >
                Explore Recommended Challenges
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map(p => (
                <div
                  key={p.id}
                  onClick={() => navigate(`/projects/${p.id}`)}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/20 cursor-pointer transition-all space-y-2 group"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      {p.domain}
                    </span>
                    <Badge variant={p.status === 'completed' ? 'verified_adopted' : 'published'} size="xs">
                      {p.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {p.problem_title}
                  </h3>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                    <span>Provider: {p.panchayat_name || p.provider_name}</span>
                    <span className="text-emerald-700 font-bold flex items-center space-x-1">
                      <span>Open Workspace</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Applications Tracker */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <Send className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Application Tracker
              </h2>
            </div>
            <span className="text-xs text-slate-400">{applications.length} Submitted</span>
          </div>

          {applications.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              <p>You have not applied to any challenges yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.map(app => (
                <div
                  key={app.id}
                  onClick={() => navigate(`/problems/${app.problem_id}`)}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-slate-300 cursor-pointer transition-all space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      app.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' :
                      app.status === 'rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {app.status}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Match: {app.match_score_at_application}%
                    </span>
                  </div>

                  <p className="text-slate-700 font-medium line-clamp-2">{app.proposal}</p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                    <span>{app.estimated_timeline_weeks} Weeks • {app.weekly_availability_hours}h/wk</span>
                    <span>{new Date(app.submitted_at).toLocaleDateString()}</span>
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
