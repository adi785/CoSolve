import React, { useState } from 'react';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/Badge';
import { 
  Sparkles, 
  MapPin, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  Send,
  HelpCircle,
  FileText
} from 'lucide-react';

export const CreateProblemPage = ({ navigate }) => {
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    current_situation: '',
    root_cause: '',
    affected_community: user?.panchayat_name ? `${user.panchayat_name} Community` : '',
    beneficiaries_estimate: 500,
    domain: 'Water & Sanitation',
    category: 'Drinking Water Infrastructure',
    geographic_state: user?.panchayat_state || 'Maharashtra',
    geographic_district: user?.panchayat_district || 'Pune',
    locality: '',
    expected_outcome: '',
    constraints: '',
    available_resources: '',
    required_skills_declared: '',
    preferred_solver_type: 'any',
    urgency: 'medium',
    deliverables_text: '',
    acceptance_criteria_text: '',
    testing_approach: '',
    adoption_plan: '',
    funding_model: 'grant_funded',
    funding_amount: 25000,
    funding_currency: 'INR',
    sponsor_details: '',
    award_conditions: '',
    payment_milestones: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1); // 1: Core Problem, 2: Technical Scope, 3: Funding & Moderation

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.title.length < 5 || formData.description.length < 20) {
      alert('Please fill out the title (min 5 chars) and description (min 20 chars).');
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiRequest('/problems', 'POST', {
        ...formData,
        beneficiaries_estimate: parseInt(formData.beneficiaries_estimate) || 0,
        funding_amount: parseFloat(formData.funding_amount) || 0
      });

      alert('Challenge drafted successfully! AI Problem Analysis is being generated.');
      navigate(`/provider/ai-analysis/${res.id}`);
    } catch (err) {
      alert('Error creating challenge: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const domains = [
    'Water & Sanitation',
    'Agriculture & Rural Tech',
    'Renewable Energy',
    'Education & Digital Literacy',
    'Healthcare & Nutrition',
    'Livelihoods & Waste Management'
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Title */}
      <div className="space-y-2">
        <Badge variant="published" size="sm">Provider Challenge Submission</Badge>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Post a Societal Challenge
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Submit your community problem with ground constraints. Our AI Problem Analyst will structure requirements, extract root hypotheses, and recommend student & organization solvers.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 rounded-xl text-xs font-bold text-center">
        <button
          type="button"
          onClick={() => setStep(1)}
          className={`py-2 rounded-lg transition-colors ${step === 1 ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}
        >
          1. Problem & Locality
        </button>
        <button
          type="button"
          onClick={() => setStep(2)}
          className={`py-2 rounded-lg transition-colors ${step === 2 ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}
        >
          2. Scope & Criteria
        </button>
        <button
          type="button"
          onClick={() => setStep(3)}
          className={`py-2 rounded-lg transition-colors ${step === 3 ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}
        >
          3. Funding & Review
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs text-xs">
        
        {/* Step 1: Problem & Community */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              Community Ground Details
            </h3>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Challenge Title *</label>
              <input
                type="text"
                required
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Solar-Powered Turbidity & Mineral Telemetry for Village Wells"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Domain *</label>
                <select
                  name="domain"
                  value={formData.domain}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 text-xs"
                >
                  {domains.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Subcategory</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="e.g. Potable Water Security"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Detailed Problem Description *</label>
              <textarea
                required
                rows={4}
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe what is failing, who is affected, why current approaches do not work, and the consequences of inaction..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Current Situation & Workarounds</label>
                <input
                  type="text"
                  name="current_situation"
                  value={formData.current_situation}
                  onChange={handleChange}
                  placeholder="e.g. Water tested manually only once every 6 months"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Suspected Root Cause</label>
                <input
                  type="text"
                  name="root_cause"
                  value={formData.root_cause}
                  onChange={handleChange}
                  placeholder="e.g. Runoff into shallow groundwater aquifers during monsoons"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Affected Community *</label>
                <input
                  type="text"
                  required
                  name="affected_community"
                  value={formData.affected_community}
                  onChange={handleChange}
                  placeholder="e.g. Shirur Village Residents"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">District *</label>
                <input
                  type="text"
                  required
                  name="geographic_district"
                  value={formData.geographic_district}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">State *</label>
                <input
                  type="text"
                  required
                  name="geographic_state"
                  value={formData.geographic_state}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl flex items-center space-x-1"
              >
                <span>Continue to Scope & Criteria</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Scope & Acceptance */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              Technical Scope & Acceptance Standards
            </h3>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Expected Tangible Outcome *</label>
              <textarea
                required
                rows={2}
                name="expected_outcome"
                value={formData.expected_outcome}
                onChange={handleChange}
                placeholder="What must be operational at the end of the project? e.g. Automated daily telemetry with SMS threshold alerts to Gram Panchayat..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Known Physical & Environmental Constraints</label>
                <textarea
                  rows={2}
                  name="constraints"
                  value={formData.constraints}
                  onChange={handleChange}
                  placeholder="e.g. Extreme direct heat, low cellular signal at well heads, power cuts..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Locally Available Resources</label>
                <textarea
                  rows={2}
                  name="available_resources"
                  value={formData.available_resources}
                  onChange={handleChange}
                  placeholder="e.g. Panchayat office electricity, 2 local youth appointed as caretakers, access to well sites..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Required Skills Declared (Comma-separated)</label>
              <input
                type="text"
                name="required_skills_declared"
                value={formData.required_skills_declared}
                onChange={handleChange}
                placeholder="e.g. IoT & Sensor Interfacing, Embedded Systems, Water Quality Chemistry, Vernacular UX"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 text-xs"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                The AI Problem Analyst will expand and categorize these into technical vs domain skills automatically.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Deliverables Description</label>
                <input
                  type="text"
                  name="deliverables_text"
                  value={formData.deliverables_text}
                  onChange={handleChange}
                  placeholder="e.g. 1. Calibrated node; 2. Firmware; 3. Bilingual manual"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Acceptance & Testing Criteria</label>
                <input
                  type="text"
                  name="acceptance_criteria_text"
                  value={formData.acceptance_criteria_text}
                  onChange={handleChange}
                  placeholder="e.g. Accurate readings verified against district lab; 14-day uptime"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-semibold"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl flex items-center space-x-1"
              >
                <span>Continue to Funding</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Funding & Moderation Submission */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              Funding Terms & Submission
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Funding Model</label>
                <select
                  name="funding_model"
                  value={formData.funding_model}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 text-xs"
                >
                  <option value="grant_funded">Grant-Funded</option>
                  <option value="prize_based">Prize-Based Challenge</option>
                  <option value="sponsored">Corporate / Foundation Sponsored</option>
                  <option value="voluntary">Voluntary / Community Benefit</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Funding Amount (INR)</label>
                <input
                  type="number"
                  name="funding_amount"
                  value={formData.funding_amount}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Urgency</label>
                <select
                  name="urgency"
                  value={formData.urgency}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 text-xs"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Sponsor / Funding Body (if applicable)</label>
              <input
                type="text"
                name="sponsor_details"
                value={formData.sponsor_details}
                onChange={handleChange}
                placeholder="e.g. District Rural Development Agency (DRDA) Innovation Fund"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 text-xs"
              />
            </div>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1.5">
              <div className="flex items-center space-x-2 text-emerald-950 font-bold">
                <Sparkles className="w-4 h-4 text-emerald-700" />
                <span>AI Problem Analyst Workflow</span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                Upon submitting, our AI module will decompose your inputs, extract stakeholder hypotheses, identify risk factors, and prepare a structured report. You will have full authority to edit and confirm the AI parameters before requesting moderator publication.
              </p>
            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-semibold"
              >
                Back
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Analyzing Problem...' : 'Submit & Generate AI Report'}</span>
              </button>
            </div>
          </div>
        )}

      </form>

    </div>
  );
};
