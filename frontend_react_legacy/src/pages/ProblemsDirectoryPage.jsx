import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api/client';
import { Badge } from '../components/Badge';
import { 
  Search, 
  Filter, 
  MapPin, 
  IndianRupee, 
  ArrowRight, 
  Sparkles, 
  Calendar,
  Layers,
  Users
} from 'lucide-react';

export const ProblemsDirectoryPage = ({ navigate }) => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [selectedFunding, setSelectedFunding] = useState('all');

  const domains = [
    'all',
    'Water & Sanitation',
    'Agriculture & Rural Tech',
    'Renewable Energy',
    'Education & Digital Literacy',
    'Healthcare & Nutrition'
  ];

  const fundingModels = [
    { label: 'All Funding Models', value: 'all' },
    { label: 'Voluntary / Community Benefit', value: 'voluntary' },
    { label: 'Prize-Based Challenge', value: 'prize_based' },
    { label: 'Grant-Funded', value: 'grant_funded' },
    { label: 'Sponsored', value: 'sponsored' }
  ];

  useEffect(() => {
    fetchProblems();
  }, [selectedDomain, selectedFunding]);

  const fetchProblems = async () => {
    setLoading(true);
    try {
      let queryParams = [];
      if (selectedDomain !== 'all') queryParams.push(`domain=${encodeURIComponent(selectedDomain)}`);
      if (selectedFunding !== 'all') queryParams.push(`funding_model=${encodeURIComponent(selectedFunding)}`);
      if (search.trim()) queryParams.push(`search=${encodeURIComponent(search.trim())}`);

      const qs = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
      const data = await apiRequest(`/problems${qs}`);
      setProblems(data);
    } catch (err) {
      console.warn('Error fetching problems:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProblems();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Title & Description */}
      <div className="max-w-3xl space-y-2">
        <Badge variant="published" size="sm">Civic Problem Marketplace</Badge>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Explore Societal Challenges
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          Real grassroots problems submitted by verified village councils and community providers. Apply individually or as a student club or university research team.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by keywords, crop, water, village, or technology..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors"
          >
            Search
          </button>
        </form>

        {/* Domain Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-medium shrink-0 mr-1 flex items-center">
            <Filter className="w-3.5 h-3.5 mr-1" /> Domain:
          </span>
          {domains.map((dom) => (
            <button
              key={dom}
              onClick={() => setSelectedDomain(dom)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedDomain === dom
                  ? 'bg-emerald-700 text-white font-semibold shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {dom === 'all' ? 'All Domains' : dom}
            </button>
          ))}
        </div>

        {/* Funding Model Filter */}
        <div className="flex items-center gap-2 text-xs border-t border-slate-100 pt-3">
          <span className="text-slate-500 font-medium">Funding Type:</span>
          <select
            value={selectedFunding}
            onChange={(e) => setSelectedFunding(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 focus:outline-none focus:border-emerald-500"
          >
            {fundingModels.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
          <span className="text-slate-400 text-[11px] ml-auto">
            Showing {problems.length} published opportunities
          </span>
        </div>

      </div>

      {/* Problems Grid */}
      {loading ? (
        <div className="text-center py-20 text-slate-400 text-xs">Loading societal challenges...</div>
      ) : problems.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 space-y-3">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            🔍
          </div>
          <h3 className="text-sm font-bold text-slate-800">No published challenges match these filters</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search terms or domain selections to view available opportunities.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {problems.map((prob) => {
            const declaredSkills = prob.required_skills_declared
              ? prob.required_skills_declared.split(',').slice(0, 3)
              : ['Engineering', 'Field Testing'];

            return (
              <div
                key={prob.id}
                onClick={() => navigate(`/problems/${prob.id}`)}
                className="bg-white rounded-2xl border border-slate-200 hover:border-emerald-400 p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      {prob.domain}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium capitalize">
                      {prob.funding_model.replace('_', ' ')}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2">
                    {prob.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {prob.description}
                  </p>

                  {/* Skills tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {declaredSkills.map((s, idx) => (
                      <span key={idx} className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded font-medium">
                        {s.trim()}
                      </span>
                    ))}
                  </div>

                  {/* Challenge Progress & Inactivity Insight Block */}
                  {prob.is_taken ? (
                    <div className="p-3 bg-rose-50/80 border border-rose-300 rounded-xl space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-600 shrink-0" />
                          <span className="font-bold text-rose-950 text-xs tracking-wide">
                            NOT AVAILABLE • TAKEN
                          </span>
                        </div>
                        <span className="text-xs font-bold text-rose-700">
                          {Math.round(prob.progress_percentage || 0)}% Progress
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-rose-200/70 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-rose-600 h-1.5 rounded-full transition-all"
                          style={{ width: `${Math.min(100, Math.max(5, prob.progress_percentage || 10))}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-rose-900 pt-0.5">
                        <span className="truncate max-w-[150px]">
                          Registered: <strong>{prob.taken_by || 'Assigned Solver'}</strong>
                        </span>
                        <span>
                          {prob.days_until_inactivity_warning <= 2 ? (
                            <span className="text-rose-700 font-bold">Auto-reopens in {prob.days_until_inactivity_warning}d</span>
                          ) : (
                            <span>Active {prob.last_activity_days_ago === 0 ? 'today' : `${prob.last_activity_days_ago}d ago`}</span>
                          )}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-emerald-50/80 border border-emerald-300 rounded-xl flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                        <span className="font-bold text-emerald-950 text-xs tracking-wide">
                          AVAILABLE • NOT TAKEN
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-emerald-700">Individual or Team</span>
                    </div>
                  )}

                  <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-500">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{prob.affected_community} ({prob.geographic_district}, {prob.geographic_state})</span>
                    </div>
                    {prob.funding_amount > 0 && (
                      <div className="flex items-center space-x-2 text-emerald-700 font-semibold">
                        <IndianRupee className="w-3.5 h-3.5 shrink-0" />
                        <span>₹{prob.funding_amount.toLocaleString('en-IN')} ({prob.funding_status})</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-medium">
                    {prob.panchayat_name || prob.creator_name}
                  </span>
                  <span className="text-xs font-semibold text-emerald-700 flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
                    <span>Inspect</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
