import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/Badge';
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  Check, 
  ArrowLeft, 
  Save, 
  Layers,
  Clock,
  Compass
} from 'lucide-react';

export const SolverSkillsPage = ({ navigate }) => {
  const { user } = useAuth();
  const [skills, setSkills] = useState([]);
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);

  // New skill form
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState('intermediate');
  const [newSkillExp, setNewSkillExp] = useState(1.5);
  const [addingSkill, setAddingSkill] = useState(false);

  // Profile preferences
  const [hours, setHours] = useState(15);
  const [durationWeeks, setDurationWeeks] = useState(8);
  const [fieldwork, setFieldwork] = useState(true);
  const [remotePref, setRemotePref] = useState('hybrid');
  const [savingPrefs, setSavingPrefs] = useState(false);

  const availableDomains = [
    'Water & Sanitation',
    'Agriculture & Rural Tech',
    'Renewable Energy',
    'Education & Digital Literacy',
    'Healthcare & Nutrition',
    'Livelihoods & Waste Management'
  ];

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        const [sList, iList] = await Promise.all([
          apiRequest('/solver/skills'),
          apiRequest('/solver/interests')
        ]);
        setSkills(sList);
        setInterests(iList);
        setHours(user.availability_hours_per_week || 15);
        setDurationWeeks(user.preferred_duration_weeks || 8);
        setFieldwork(user.fieldwork_willing ?? true);
        setRemotePref(user.remote_preference || 'hybrid');
      } catch (err) {
        console.warn('Error loading skills:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    setAddingSkill(true);
    try {
      const added = await apiRequest('/solver/skills', 'POST', {
        skill_name: newSkillName.trim(),
        proficiency_level: newSkillLevel,
        years_experience: parseFloat(newSkillExp)
      });
      setSkills(prev => [...prev.filter(s => s.id !== added.id), added]);
      setNewSkillName('');
    } catch (err) {
      alert('Error adding skill: ' + err.message);
    } finally {
      setAddingSkill(false);
    }
  };

  const handleDeleteSkill = async (skillId) => {
    try {
      await apiRequest(`/solver/skills/${skillId}`, 'DELETE');
      setSkills(prev => prev.filter(s => s.id !== skillId));
    } catch (err) {
      alert('Failed to delete skill: ' + err.message);
    }
  };

  const handleToggleInterest = async (dom) => {
    const updated = interests.includes(dom)
      ? interests.filter(i => i !== dom)
      : [...interests, dom];
    setInterests(updated);
    try {
      await apiRequest('/solver/interests', 'POST', updated);
    } catch (err) {
      console.warn('Failed to update interests:', err);
    }
  };

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    setSavingPrefs(true);
    try {
      await apiRequest('/auth/profile', 'PUT', {
        availability_hours_per_week: parseInt(hours),
        preferred_duration_weeks: parseInt(durationWeeks),
        fieldwork_willing: fieldwork,
        remote_preference: remotePref
      });
      alert('Solver preferences saved successfully!');
    } catch (err) {
      alert('Failed to save preferences: ' + err.message);
    } finally {
      setSavingPrefs(false);
    }
  };

  if (loading) {
    return <div className="text-center py-24 text-slate-400 text-xs">Loading profile skills matrix...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Back button */}
      <button
        onClick={() => navigate('/solver/dashboard')}
        className="flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Solver Dashboard</span>
      </button>

      {/* Header */}
      <div className="space-y-1">
        <Badge variant="published" size="sm">Solver Competency Profile</Badge>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Skills Matrix & Discovery Preferences
        </h1>
        <p className="text-xs text-slate-500">
          These technical competencies and availability constraints power the explainable matching algorithm.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Skills list & Add Form */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Add Skill Form */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Add Verified Technical Skill
            </h3>

            <form onSubmit={handleAddSkill} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Skill Name *</label>
                  <input
                    type="text"
                    required
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    placeholder="e.g. IoT & Sensor Interfacing, Flutter, Edge ML..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Proficiency Level</label>
                  <select
                    value={newSkillLevel}
                    onChange={(e) => setNewSkillLevel(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="beginner">Beginner (Basic coursework)</option>
                    <option value="intermediate">Intermediate (Built working prototypes)</option>
                    <option value="advanced">Advanced (Field / industry deployed)</option>
                    <option value="expert">Expert (Published / core contributor)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center space-x-2">
                  <label className="font-bold text-slate-700">Years of Experience:</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="10"
                    value={newSkillExp}
                    onChange={(e) => setNewSkillExp(e.target.value)}
                    className="w-20 p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={addingSkill}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{addingSkill ? 'Adding...' : 'Add Skill'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Current Skills Grid */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Current Registered Skills ({skills.length})
            </h3>

            {skills.length === 0 ? (
              <p className="text-slate-400 text-xs py-4 text-center">No skills registered yet. Add your competencies above.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {skills.map((s) => (
                  <div key={s.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-800">{s.skill_name}</div>
                      <div className="text-[11px] text-slate-400 capitalize">
                        {s.proficiency_level} • {s.years_experience} yrs exp
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteSkill(s.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Remove skill"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Domains & Availability */}
        <div className="space-y-6">
          
          {/* Domain Focus */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Preferred Civic Domains (20% weight)
            </h3>
            <p className="text-[11px] text-slate-500">Select domains you are passionate about solving.</p>
            
            <div className="space-y-1.5 pt-1">
              {availableDomains.map(d => {
                const selected = interests.includes(d);
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => handleToggleInterest(d)}
                    className={`w-full text-left p-2.5 rounded-xl border text-xs font-medium flex items-center justify-between transition-colors ${
                      selected ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{d}</span>
                    {selected && <Check className="w-3.5 h-3.5 text-emerald-700" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Availability & Fieldwork Preferences */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 uppercase tracking-wide text-xs">
              Availability & Fieldwork
            </h3>

            <form onSubmit={handleSavePreferences} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Weekly Hours Commitment</label>
                <input
                  type="number"
                  min="5"
                  max="40"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Preferred Project Duration (Weeks)</label>
                <input
                  type="number"
                  min="2"
                  max="24"
                  value={durationWeeks}
                  onChange={(e) => setDurationWeeks(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center space-x-2 font-bold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={fieldwork}
                    onChange={(e) => setFieldwork(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span>Willing to travel for on-ground field trials</span>
                </label>
                <p className="text-[10px] text-slate-400 mt-0.5 ml-6">
                  Earns a 10% boost for rural village challenges needing on-site calibration.
                </p>
              </div>

              <button
                type="submit"
                disabled={savingPrefs}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl mt-3 flex items-center justify-center space-x-1"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingPrefs ? 'Saving...' : 'Save Preferences'}</span>
              </button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
};
