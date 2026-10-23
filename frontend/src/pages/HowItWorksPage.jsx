import React from 'react';
import { Badge } from '../components/Badge';
import { 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  ShieldCheck, 
  Scale, 
  HelpCircle, 
  Cpu, 
  FileCheck2,
  AlertTriangle,
  Award
} from 'lucide-react';

export const HowItWorksPage = ({ navigate }) => {
  const steps = [
    {
      num: "01",
      title: "Problem Submission",
      actor: "Verified Panchayat / Individual Provider",
      detail: "Author submits complete problem statement, current situation, root cause hypotheses, affected community, constraints, declared skills, and funding terms (voluntary, prize, grant, or sponsored)."
    },
    {
      num: "02",
      title: "Authority Verification",
      actor: "Platform Moderator",
      detail: "Admin checks village council credentials or authorized organizational mandate. Identity evidence is held strictly private; no raw Aadhaar/PAN data collected."
    },
    {
      num: "03",
      title: "AI Problem Decomposition",
      actor: "AI Problem Analyst",
      detail: "Server-side LLM analyzes problem into 17 structured parameters: root causes (labeled as hypotheses), technical/domain skill breakdown, team structure, complexity score, milestones, acceptance criteria, and adoption risks."
    },
    {
      num: "04",
      title: "Provider Confirmation & Moderation",
      actor: "Provider & Admin",
      detail: "Provider reviews, edits, and confirms AI parameters. Moderator issues publication approval. AI never auto-publishes without human authorization."
    },
    {
      num: "05",
      title: "Explainable Skill Matching",
      actor: "Matching Engine",
      detail: "5-factor explainable algorithm ranks eligible individual solvers and university teams (40% skills, 20% domain interest, 15% availability, 15% experience, 10% fieldwork suitability)."
    },
    {
      num: "06",
      title: "Application & Proposal",
      actor: "Solver / Student Team",
      detail: "Solvers submit detailed proposal, technical approach, timeline, and weekly hours commitment. A match score snapshot is sealed at application time."
    },
    {
      num: "07",
      title: "Explicit Solver Selection & Charter",
      actor: "Problem Provider",
      detail: "Provider compares candidates with explainable match breakdowns and selects winning solver. Project Charter establishes binding deliverables, acceptance criteria, IP/open-source terms, and funding milestones."
    },
    {
      num: "08",
      title: "Interactive Workspace & Prototype",
      actor: "Solver & Provider",
      detail: "Collaborative tracking of milestones and tasks. Solver submits working prototype, live demo link, GitHub repository, documentation, test instructions, and known limitations."
    },
    {
      num: "09",
      title: "Multi-Round Testing Verification",
      actor: "Provider & Field Reviewers",
      detail: "Systematic evaluation against acceptance criteria with real lab or field test samples. Can result in 'Passed', 'Revision Required', or 'Failed'. Multiple iterations supported."
    },
    {
      num: "10",
      title: "Adoption Verification Audit",
      actor: "Provider & Independent Reviewer",
      detail: "CRITICAL SEPARATION: A completed prototype does NOT equal adoption. Real adoption requires documented community resolution, implementation date, beneficiary counts, and maintenance handover. High-impact or disputed cases route to independent reviewers."
    },
    {
      num: "11",
      title: "Tamper-Proof Contribution Record",
      actor: "Platform Ledger",
      detail: "Solver receives verified digital credentials and achievements tied to ground-truth impact metrics. Logged in immutable audit ledger."
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-14">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <Badge variant="published" size="sm">Structured Methodology</Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          How Samarthya Coordinates Civic Impact
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          From grassroots village council challenges to verified student portfolio credentials. Built on transparency, explainable AI, and strict separation between code delivery and community adoption.
        </p>
      </div>

      {/* 11 Steps Timeline */}
      <div className="space-y-4">
        {steps.map((s) => (
          <div key={s.num} className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-300 transition-all flex flex-col sm:flex-row gap-4 items-start shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 font-extrabold flex items-center justify-center shrink-0 border border-emerald-200 text-sm">
              {s.num}
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-base font-bold text-slate-900">{s.title}</h3>
                <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                  {s.actor}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{s.detail}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Matching Algorithm Formula Box */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 sm:p-8 text-white space-y-6 shadow-lg">
        <div className="flex items-center space-x-2 text-emerald-400">
          <Sparkles className="w-5 h-5" />
          <h2 className="text-lg font-bold tracking-tight text-white">Explainable Multi-Factor Matching Algorithm</h2>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
          Unlike black-box algorithmic ranking, Samarthya calculates normalized, transparent 0-100 match scores based on five publicly documented criteria. Unknown profile data is never penalized as incompetence.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          <div className="bg-slate-800/90 p-4 rounded-xl border border-slate-700 text-center">
            <div className="text-2xl font-black text-emerald-400">40%</div>
            <div className="text-xs font-semibold text-slate-200 mt-1">Required Skills</div>
            <div className="text-[10px] text-slate-400 mt-1">Direct & semantic skill overlap</div>
          </div>
          <div className="bg-slate-800/90 p-4 rounded-xl border border-slate-700 text-center">
            <div className="text-2xl font-black text-teal-400">20%</div>
            <div className="text-xs font-semibold text-slate-200 mt-1">Domain & Interest</div>
            <div className="text-[10px] text-slate-400 mt-1">Stated civic focus alignment</div>
          </div>
          <div className="bg-slate-800/90 p-4 rounded-xl border border-slate-700 text-center">
            <div className="text-2xl font-black text-sky-400">15%</div>
            <div className="text-xs font-semibold text-slate-200 mt-1">Availability Fit</div>
            <div className="text-[10px] text-slate-400 mt-1">Weekly hours & duration</div>
          </div>
          <div className="bg-slate-800/90 p-4 rounded-xl border border-slate-700 text-center">
            <div className="text-2xl font-black text-amber-400">15%</div>
            <div className="text-xs font-semibold text-slate-200 mt-1">Experience</div>
            <div className="text-[10px] text-slate-400 mt-1">Prior verified projects & work</div>
          </div>
          <div className="bg-slate-800/90 p-4 rounded-xl border border-slate-700 text-center">
            <div className="text-2xl font-black text-purple-400">10%</div>
            <div className="text-xs font-semibold text-slate-200 mt-1">Fieldwork Fit</div>
            <div className="text-[10px] text-slate-400 mt-1">Proximity & on-ground trials</div>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 border-t border-slate-700 pt-3">
          Note: Organizations are evaluated on aggregated team capacity, collective skill coverage, and fieldwork member allocations.
        </div>
      </div>

      {/* Adoption vs Prototype Distinction */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 space-y-3">
        <div className="flex items-center space-x-2 text-amber-900 font-bold text-sm">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <span>Core Integrity Rule: Prototype ≠ Adoption</span>
        </div>
        <p className="text-xs text-amber-800 leading-relaxed">
          Many hackathon projects claim impact simply because a website or mobile app was compiled. On Samarthya, a project workspace cannot be marked as adopted without verifiable proof of real-world use: official village council resolutions, confirmed beneficiaries, and local operational maintenance agreements.
        </p>
      </div>

    </div>
  );
};
