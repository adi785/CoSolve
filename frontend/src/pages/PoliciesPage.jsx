import React from 'react';
import { Badge } from '../components/Badge';
import { ShieldCheck, Lock, Scale, AlertTriangle, FileText } from 'lucide-react';

export const PoliciesPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 text-xs">

      <div className="space-y-2">
        <Badge variant="published" size="sm">Governance & Legal Framework</Badge>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Platform Governance, Privacy & IP Policies
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          Co-Solve coordinates technology deployment with ethical accountability, privacy by design, and strict verification protocols.
        </p>
      </div>

      <div className="space-y-6">

        {/* Privacy & Identity */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center space-x-2 text-slate-900">
            <Lock className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold uppercase tracking-wide">1. Data Minimization & Privacy Protection</h2>
          </div>
          <p className="text-slate-600 leading-relaxed">
            In compliance with national data privacy standards:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-700">
            <li>We do NOT collect, store, or process raw Aadhaar or PAN card numbers.</li>
            <li>Verification evidence is held in private, access-controlled storage buckets and never exposed to public profiles, APIs, or AI prompts.</li>
            <li>User identity details are kept separate from public contribution metrics.</li>
          </ul>
        </div>

        {/* Intellectual Property */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center space-x-2 text-slate-900">
            <FileText className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold uppercase tracking-wide">2. Intellectual Property & Community Licensing</h2>
          </div>
          <p className="text-slate-600 leading-relaxed">
            All societal challenges published on Co-Solve default to Public Good open-source licensing (MIT / CERN Open Hardware Licence). Solutions created to serve rural community needs cannot be locked behind proprietary paywalls or punitive licensing terms without prior written consent from the community authority.
          </p>
        </div>

        {/* Prototype vs Adoption */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center space-x-2 text-slate-900">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <h2 className="text-sm font-bold uppercase tracking-wide">3. Anti-Fabrication & Adoption Verification</h2>
          </div>
          <p className="text-slate-600 leading-relaxed">
            A software repository or hardware bench prototype NEVER constitutes proof of community adoption. Project completion is legally and operationally distinct from adoption verification:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-700">
            <li>Adoption requires on-ground verification: signed Gram Panchayat resolutions, verifiable community beneficiary metrics, and confirmed maintenance training.</li>
            <li>Fabrication of real-world outcomes, partnerships, or impact metrics will result in permanent account suspension and revocation of all verified digital credentials.</li>
          </ul>
        </div>

        {/* Disputes */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center space-x-2 text-slate-900">
            <Scale className="w-4 h-4 text-purple-600" />
            <h2 className="text-sm font-bold uppercase tracking-wide">4. Structured Dispute Resolution</h2>
          </div>
          <p className="text-slate-600 leading-relaxed">
            All disputes regarding unpaid grants, unfair reviews, or false adoption claims are routed to independent, conflict-free faculty and civic evaluators. Direct parties to a project are prohibited from adjudicating their own disputes.
          </p>
        </div>

      </div>

    </div>
  );
};
