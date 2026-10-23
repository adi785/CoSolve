import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/Badge';
import { ArrowRight, User, Mail, Lock, Building, GraduationCap } from 'lucide-react';

export const RegisterPage = ({ navigate }) => {
  const { register } = useAuth();
  
  const [role, setRole] = useState('solver'); // 'solver', 'provider'
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Solver fields
  const [isStudent, setIsStudent] = useState(true);
  const [collegeName, setCollegeName] = useState('');
  const [graduationYear, setGraduationYear] = useState(2026);
  
  // Provider fields
  const [providerType, setProviderType] = useState('panchayat_rep');
  const [panchayatName, setPanchayatName] = useState('');
  const [panchayatState, setPanchayatState] = useState('Maharashtra');
  const [panchayatDistrict, setPanchayatDistrict] = useState('Pune');
  const [designation, setDesignation] = useState('Sarpanch');
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload = {
        email,
        password,
        full_name: fullName,
        role,
        is_student: role === 'solver' ? isStudent : false,
        college_name: role === 'solver' && isStudent ? collegeName : null,
        graduation_year: role === 'solver' && isStudent ? parseInt(graduationYear) : null,
        provider_type: role === 'provider' ? providerType : null,
        panchayat_name: role === 'provider' && providerType === 'panchayat_rep' ? panchayatName : null,
        panchayat_state: role === 'provider' ? panchayatState : null,
        panchayat_district: role === 'provider' ? panchayatDistrict : null,
        designation: role === 'provider' ? designation : null
      };

      const user = await register(payload);
      if (user.role === 'provider') navigate('/provider/dashboard');
      else navigate('/solver/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6 text-xs">
      
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Create Your Samarthya Account
        </h1>
        <p className="text-slate-500">
          Join verified village authorities and student innovators.
        </p>
      </div>

      {/* Role Picker Buttons */}
      <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl">
        <button
          type="button"
          onClick={() => setRole('solver')}
          className={`py-2.5 rounded-xl font-bold transition-colors flex items-center justify-center space-x-1.5 ${
            role === 'solver' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-500'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Student / Solver</span>
        </button>

        <button
          type="button"
          onClick={() => setRole('provider')}
          className={`py-2.5 rounded-xl font-bold transition-colors flex items-center justify-center space-x-1.5 ${
            role === 'provider' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-500'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Problem Provider</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        
        {error && (
          <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl font-semibold">
            {error}
          </div>
        )}

        <div>
          <label className="block font-bold text-slate-800 mb-1">Full Legal Name *</label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. Ramesh Patil / Arjun Sharma"
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 text-xs"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-800 mb-1">Email Address *</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@college.ac.in"
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 text-xs"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-800 mb-1">Password (min 6 chars) *</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 text-xs"
          />
        </div>

        {/* Solver Specifics */}
        {role === 'solver' && (
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1">University / College Name</label>
              <input
                type="text"
                value={collegeName}
                onChange={(e) => setCollegeName(e.target.value)}
                placeholder="e.g. College of Engineering Pune (COEP)"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Graduation Year</label>
              <input
                type="number"
                value={graduationYear}
                onChange={(e) => setGraduationYear(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>
        )}

        {/* Provider Specifics */}
        {role === 'provider' && (
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1">Provider Type</label>
              <select
                value={providerType}
                onChange={(e) => setProviderType(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              >
                <option value="panchayat_rep">Gram Panchayat Official Representative</option>
                <option value="individual">Verified Individual / Community Coordinator</option>
              </select>
            </div>

            {providerType === 'panchayat_rep' && (
              <>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Gram Panchayat Name *</label>
                  <input
                    type="text"
                    required
                    value={panchayatName}
                    onChange={(e) => setPanchayatName(e.target.value)}
                    placeholder="e.g. Shirur Gram Panchayat"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Designation</label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="e.g. Sarpanch / Village Secretary"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-800 mb-1">District</label>
                <input
                  type="text"
                  value={panchayatDistrict}
                  onChange={(e) => setPanchayatDistrict(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-800 mb-1">State</label>
                <input
                  type="text"
                  value={panchayatState}
                  onChange={(e) => setPanchayatState(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-1"
        >
          <span>{submitting ? 'Creating Profile...' : 'Complete Registration'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <div className="pt-2 text-center text-slate-500 text-[11px]">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-emerald-700 font-bold hover:underline"
          >
            Sign In
          </button>
        </div>

      </form>

    </div>
  );
};
