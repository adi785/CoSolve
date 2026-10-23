import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { PersonaSwitcher } from './PersonaSwitcher';
import { 
  Compass, 
  Sparkles, 
  Bell, 
  FolderGit2, 
  CheckCircle2, 
  ShieldAlert, 
  PlusCircle, 
  User, 
  LogOut, 
  Menu, 
  X,
  Award,
  Layers,
  ChevronDown
} from 'lucide-react';

export const Navbar = ({ currentRoute, navigate }) => {
  const { user, logout, notifications, unreadCount } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              🌱
            </div>
            <div>
              <span className="font-extrabold text-slate-900 tracking-tight text-lg">Samarthya</span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded ml-2 border border-emerald-200">
                Societal AI
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-3 text-sm font-medium text-slate-600">
            <button
              onClick={() => navigate('/problems')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1.5 ${
                currentRoute === '/problems' ? 'text-emerald-700 bg-emerald-50 font-semibold' : 'hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Challenges</span>
            </button>

            <button
              onClick={() => navigate('/how-it-works')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                currentRoute === '/how-it-works' ? 'text-emerald-700 bg-emerald-50 font-semibold' : 'hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>How It Works</span>
            </button>

            {/* Role-Specific Shortcuts */}
            {user && user.role === 'solver' && (
              <>
                <button
                  onClick={() => navigate('/solver/recommendations')}
                  className={`px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1.5 ${
                    currentRoute === '/solver/recommendations' ? 'text-emerald-700 bg-emerald-50 font-semibold' : 'hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>AI Matches</span>
                </button>
                <button
                  onClick={() => navigate('/solver/dashboard')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    currentRoute === '/solver/dashboard' ? 'text-emerald-700 bg-emerald-50 font-semibold' : 'hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span>Solver Dashboard</span>
                </button>
              </>
            )}

            {user && user.role === 'provider' && (
              <>
                <button
                  onClick={() => navigate('/provider/dashboard')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    currentRoute === '/provider/dashboard' ? 'text-emerald-700 bg-emerald-50 font-semibold' : 'hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span>Provider Hub</span>
                </button>
                <button
                  onClick={() => navigate('/provider/create-problem')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium flex items-center space-x-1.5 shadow-sm transition-all"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Post Challenge</span>
                </button>
              </>
            )}

            {user && user.role === 'admin' && (
              <button
                onClick={() => navigate('/admin')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1.5 ${
                  currentRoute === '/admin' ? 'text-rose-700 bg-rose-50 font-semibold' : 'hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>Admin Moderation</span>
              </button>
            )}
          </nav>

          {/* Right actions: Persona Switcher, Notifications, User */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Demo Switcher */}
            <PersonaSwitcher />

            {/* Notifications Bell */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg relative transition-colors"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-600 rounded-full animate-pulse" />
                  )}
                </button>

                {notifDropdownOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-xl shadow-xl bg-white border border-slate-200 z-50 p-2">
                    <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
                      <span className="text-xs font-bold text-slate-900">Notifications ({unreadCount})</span>
                      <span className="text-[11px] text-emerald-700 font-medium">Recent Activity</span>
                    </div>
                    <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <p className="p-4 text-xs text-slate-400 text-center">No notifications yet</p>
                      ) : (
                        notifications.map((n) => (
                          <div key={n.id} className="p-2.5 hover:bg-slate-50 transition-colors">
                            <p className="text-xs font-semibold text-slate-800">{n.title}</p>
                            <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Profile / Logout */}
            {user ? (
              <div className="flex items-center space-x-2 border-l border-slate-200 pl-3">
                <div 
                  onClick={() => {
                    if (user.role === 'solver') navigate(`/solver/portfolio/${user.id}`);
                    else if (user.role === 'provider') navigate('/provider/dashboard');
                    else navigate('/admin');
                  }}
                  className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                    {user.full_name ? user.full_name.charAt(0) : 'U'}
                  </div>
                  <div className="hidden lg:block text-left">
                    <div className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[120px]">
                      {user.full_name}
                    </div>
                    <div className="text-[10px] text-slate-500 capitalize">{user.role}</div>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-slate-100 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigate('/login')}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors"
                >
                  Register
                </button>
              </div>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-2">
          <button
            onClick={() => { navigate('/problems'); setMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2 text-sm font-medium text-slate-800 rounded-lg hover:bg-slate-100"
          >
            Browse Challenges
          </button>
          <button
            onClick={() => { navigate('/how-it-works'); setMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2 text-sm font-medium text-slate-800 rounded-lg hover:bg-slate-100"
          >
            How It Works
          </button>
          {user && (
            <>
              {user.role === 'solver' && (
                <>
                  <button
                    onClick={() => { navigate('/solver/recommendations'); setMobileMenuOpen(false); }}
                    className="w-full text-left px-3 py-2 text-sm font-medium text-emerald-700 rounded-lg hover:bg-emerald-50"
                  >
                    AI Recommendations
                  </button>
                  <button
                    onClick={() => { navigate('/solver/dashboard'); setMobileMenuOpen(false); }}
                    className="w-full text-left px-3 py-2 text-sm font-medium text-slate-800 rounded-lg hover:bg-slate-100"
                  >
                    Solver Dashboard
                  </button>
                </>
              )}
              {user.role === 'provider' && (
                <>
                  <button
                    onClick={() => { navigate('/provider/dashboard'); setMobileMenuOpen(false); }}
                    className="w-full text-left px-3 py-2 text-sm font-medium text-slate-800 rounded-lg hover:bg-slate-100"
                  >
                    Provider Hub
                  </button>
                  <button
                    onClick={() => { navigate('/provider/create-problem'); setMobileMenuOpen(false); }}
                    className="w-full text-left px-3 py-2 text-sm font-medium text-emerald-700 rounded-lg hover:bg-emerald-50"
                  >
                    Post Challenge
                  </button>
                </>
              )}
              {user.role === 'admin' && (
                <button
                  onClick={() => { navigate('/admin'); setMobileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 text-sm font-medium text-rose-700 rounded-lg hover:bg-rose-50"
                >
                  Admin Moderation
                </button>
              )}
            </>
          )}
        </div>
      )}
    </header>
  );
};
