import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/Badge';
import { Sparkles, Users, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

export const LoginPage = ({ navigate }) => {
  const { login, switchPersona } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user = await login(email, password);
      if (user.role === 'provider') navigate('/provider/dashboard');
      else if (user.role === 'admin') navigate('/admin');
      else navigate('/solver/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickLogin = async (pEmail) => {
    setError('');
    setSubmitting(true);
    try {
      const user = await switchPersona(pEmail);
      if (user.role === 'provider') navigate('/provider/dashboard');
      else if (user.role === 'admin') navigate('/admin');
      else navigate('/solver/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">

      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold text-xl mx-auto shadow-md">
          🌱
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Sign In to Co-Solve
        </h1>
        <p className="text-xs text-slate-500">
          AI-Powered Grassroots Societal Challenge Coordination Platform
        </p>
      </div>

      {/* 1-Click Quick Demo Login Helper */}
      <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 space-y-2.5 text-xs">
        <div className="flex items-center space-x-1.5 text-emerald-950 font-bold">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>1-Click Persona Sign-In:</span>
        </div>
        <div className="grid grid-cols-1 gap-1.5">
          <button
            type="button"
            onClick={() => handleQuickLogin('sarpanch.ramesh@shirur-panchayat.org')}
            className="w-full text-left px-3 py-1.5 bg-white hover:bg-emerald-100/50 rounded-xl border border-emerald-200 font-semibold text-slate-800 text-[11px] flex items-center justify-between"
          >
            <span>Ramesh Patil (Gram Panchayat Sarpanch)</span>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">Provider</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin('arjun.sharma@coep.ac.in')}
            className="w-full text-left px-3 py-1.5 bg-white hover:bg-emerald-100/50 rounded-xl border border-emerald-200 font-semibold text-slate-800 text-[11px] flex items-center justify-between"
          >
            <span>Arjun Sharma (COEP Engineering Student)</span>
            <span className="text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded font-bold">Student Solver</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin('priya.nair@iitb.ac.in')}
            className="w-full text-left px-3 py-1.5 bg-white hover:bg-emerald-100/50 rounded-xl border border-emerald-200 font-semibold text-slate-800 text-[11px] flex items-center justify-between"
          >
            <span>Priya Nair (IIT Bombay Student)</span>
            <span className="text-[10px] text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded font-bold">Student Solver</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin('vikram.mehta@ruraltech.org')}
            className="w-full text-left px-3 py-1.5 bg-white hover:bg-emerald-100/50 rounded-xl border border-emerald-200 font-semibold text-slate-800 text-[11px] flex items-center justify-between"
          >
            <span>Dr. Vikram Mehta (RTIC Collective)</span>
            <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-bold">Institution Lead</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin('admin@samarthya.gov.in')}
            className="w-full text-left px-3 py-1.5 bg-white hover:bg-emerald-100/50 rounded-xl border border-emerald-200 font-semibold text-slate-800 text-[11px] flex items-center justify-between"
          >
            <span>Dr. Sunita Rao (Institution Governance)</span>
            <span className="text-[10px] text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded font-bold">Institution Authority</span>
          </button>
        </div>
      </div>

      {/* Main Login Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4 text-xs">

        {error && (
          <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        <div>
          <label className="block font-bold text-slate-800 mb-1">Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@organization.org"
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 text-xs"
            />
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-800 mb-1">Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 text-xs"
            />
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Demo password: <strong className="text-slate-600">DemoPassword123!</strong> (or any password in local dev)
          </span>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-1"
        >
          <span>{submitting ? 'Authenticating...' : 'Sign In'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <div className="pt-2 text-center text-[11px] text-slate-500">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={() => navigate('/register')}
            className="text-emerald-700 font-bold hover:underline"
          >
            Create an Account
          </button>
        </div>

      </form>

    </div>
  );
};
