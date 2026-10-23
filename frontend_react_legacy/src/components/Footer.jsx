import React from 'react';

export const Footer = ({ navigate }) => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-base">
                🌱
              </div>
              <span className="text-white font-bold text-lg tracking-tight">Co-Solve</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              AI-Powered Societal Challenge Coordination Platform bridging grassroots village panchayats and community providers with student and organizational solvers.
            </p>
            <div className="text-[11px] text-slate-500">
              Built with ethical AI, explainable skill matching, and verified real-world adoption audits.
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => navigate('/problems')} className="hover:text-emerald-400 transition-colors">
                  Explore Challenges
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/how-it-works')} className="hover:text-emerald-400 transition-colors">
                  Project Lifecycle
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/solver/recommendations')} className="hover:text-emerald-400 transition-colors">
                  AI Skill Matching
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/policies')} className="hover:text-emerald-400 transition-colors">
                  Governance & IP Terms
                </button>
              </li>
            </ul>
          </div>

          {/* Personas */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">Stakeholders</h4>
            <ul className="space-y-2 text-xs">
              <li><span className="text-slate-300">Gram Panchayats:</span> Problem verification & local adoption</li>
              <li><span className="text-slate-300">Student Solvers:</span> Verified engineering portfolios</li>
              <li><span className="text-slate-300">NGOs & Labs:</span> Team-level capability coordination</li>
              <li><span className="text-slate-300">Independent Reviewers:</span> Conflict-free adoption audits</li>
            </ul>
          </div>

          {/* Transparency */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">Integrity Notice</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real adoption requires verified on-ground evidence. Prototypes are never counted as proof of adoption. No sensitive personal identifiers (Aadhaar/PAN) stored.
            </p>
            <div className="mt-3 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[11px] text-emerald-400 font-medium">Autonomous Coordination Active</span>
            </div>
          </div>

        </div>

        <div className="mt-8 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© 2026 Co-Solve Civic Tech Platform. Open Public Good.</p>
          <p className="mt-2 sm:mt-0">Verified against National Rural Development & AI Governance Frameworks</p>
        </div>
      </div>
    </footer>
  );
};
