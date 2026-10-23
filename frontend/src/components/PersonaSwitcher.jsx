import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, ChevronDown, Check, ShieldCheck, Sparkles, UserCheck } from 'lucide-react';

export const PersonaSwitcher = () => {
  const { user, switchPersona, demoAccounts } = useAuth();
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState(false);

  const personas = [
    {
      label: "Ramesh Patil (Gram Panchayat Sarpanch)",
      role: "Problem Provider",
      email: "sarpanch.ramesh@shirur-panchayat.org",
      tag: "Provider - Village Panchayat",
      badgeColor: "bg-emerald-100 text-emerald-800"
    },
    {
      label: "Arjun Sharma (Engineering Student)",
      role: "Individual Solver (IoT/Water)",
      email: "arjun.sharma@coep.ac.in",
      tag: "Student Solver (COEP)",
      badgeColor: "bg-blue-100 text-blue-800"
    },
    {
      label: "Priya Nair (IIT Bombay Student)",
      role: "Individual Solver (CV/AI)",
      email: "priya.nair@iitb.ac.in",
      tag: "Student Solver (IITB)",
      badgeColor: "bg-purple-100 text-purple-800"
    },
    {
      label: "Dr. Vikram Mehta (RTIC Director)",
      role: "Organization Solver Lead",
      email: "vikram.mehta@ruraltech.org",
      tag: "Organization Lead",
      badgeColor: "bg-amber-100 text-amber-800"
    },
    {
      label: "Dr. Sunita Rao (Platform Admin)",
      role: "Platform Administrator",
      email: "admin@samarthya.gov.in",
      tag: "Administrator",
      badgeColor: "bg-rose-100 text-rose-800"
    }
  ];

  const handleSelect = async (email) => {
    setSwitching(true);
    try {
      await switchPersona(email);
      setOpen(false);
    } catch (e) {
      alert("Error switching persona: " + e.message);
    } finally {
      setSwitching(false);
    }
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center space-x-2 bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 text-emerald-900 border border-emerald-300 rounded-lg px-3 py-1.5 text-xs font-medium shadow-sm transition-all focus:outline-none"
        title="Quickly switch between pre-configured test personas"
      >
        <Users className="w-4 h-4 text-emerald-700" />
        <span className="font-semibold text-slate-800">Demo Persona:</span>
        <span className="max-w-[140px] truncate font-medium text-emerald-800">
          {user ? user.full_name : "Select Persona"}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
      </button>

      {open && (
        <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-xl shadow-xl bg-white ring-1 ring-black ring-opacity-5 divide-y divide-slate-100 z-50">
          <div className="p-3 bg-slate-50 rounded-t-xl border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <p className="text-xs font-bold text-slate-900">1-Click Demo Persona Switcher</p>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Instantly test workflows as a village provider, student solver, organization, or admin.
            </p>
          </div>

          <div className="py-1 max-h-80 overflow-y-auto">
            {personas.map((p) => {
              const isCurrent = user && user.email === p.email;
              return (
                <button
                  key={p.email}
                  disabled={switching}
                  onClick={() => handleSelect(p.email)}
                  className={`w-full text-left px-3 py-2.5 text-xs hover:bg-slate-50 transition-colors flex items-start justify-between ${
                    isCurrent ? 'bg-emerald-50/60 font-semibold' : ''
                  }`}
                >
                  <div className="flex-1 pr-2">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-slate-900 font-medium">{p.label}</span>
                      {isCurrent && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${p.badgeColor}`}>
                        {p.tag}
                      </span>
                      <span className="text-[11px] text-slate-400 truncate">{p.email}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
