import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { Target, TrendingUp, Save } from 'lucide-react';

const Checkins = () => {
  const { user } = useContext(AuthContext);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({});
  const [currentQuarter, setCurrentQuarter] = useState('Q1');
  const [saveStatus, setSaveStatus] = useState('');
  const [demoMonth, setDemoMonth] = useState(new Date().getMonth()); // For hackathon demo

  const getActiveQuarter = (month) => {
    if (month === 6 || month === 7 || month === 8) return 'Q1'; // Jul-Sep
    if (month === 9 || month === 10 || month === 11) return 'Q2'; // Oct-Dec
    if (month === 0 || month === 1 || month === 2) return 'Q3'; // Jan-Mar
    if (month === 3 || month === 4) return 'Q4'; // Apr-May
    return null; // Phase 1 (Goal Setting) etc.
  };

  const activeQuarter = getActiveQuarter(demoMonth);
  const isWindowOpen = activeQuarter === currentQuarter;

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      // Fetch approved goals
      const goalsRes = await axios.get('https://goaltrack-portal.onrender.com/api/goals', config);
      const approvedGoals = goalsRes.data.filter(g => g.status === 'Approved');
      setGoals(approvedGoals);

      // Fetch existing checkins
      const checkinsRes = await axios.get('https://goaltrack-portal.onrender.com/api/checkins', config);
      
      const initialForm = {};
      approvedGoals.forEach(goal => {
        const existingCheckin = checkinsRes.data.find(c => c.goalId._id === goal._id && c.quarter === currentQuarter);
        initialForm[goal._id] = {
          actualAchievement: existingCheckin?.actualAchievement || '',
          status: existingCheckin?.status || 'Not Started',
          employeeComment: existingCheckin?.employeeComment || ''
        };
      });
      setFormData(initialForm);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleInputChange = (goalId, field, value) => {
    setFormData(prev => ({
      ...prev,
      [goalId]: {
        ...prev[goalId],
        [field]: value
      }
    }));
  };

  const handleSubmit = async (goalId) => {
    try {
      setSaveStatus('Saving...');
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const payload = {
        goalId,
        quarter: currentQuarter,
        ...formData[goalId]
      };
      await axios.post('https://goaltrack-portal.onrender.com/api/checkins', payload, config);
      setSaveStatus('Saved successfully');
      setTimeout(() => setSaveStatus(''), 2000);
      fetchData(); // Refresh progress score
    } catch (error) {
      console.error(error);
      setSaveStatus('Error saving');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Quarterly Check-ins</h2>
          <p className="text-sm text-slate-500 mt-1">Update your progress against planned targets.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-yellow-50 border border-yellow-200 px-3 py-1.5 rounded-lg">
            <span className="text-xs font-medium text-yellow-800 mr-2">Demo: Simulate Month</span>
            <select
              value={demoMonth}
              onChange={(e) => setDemoMonth(Number(e.target.value))}
              className="text-sm bg-transparent border-none font-bold text-yellow-900 focus:ring-0 cursor-pointer"
            >
              <option value={4}>May (Goal Setting)</option>
              <option value={6}>July (Q1 Window)</option>
              <option value={9}>October (Q2 Window)</option>
              <option value={0}>January (Q3 Window)</option>
              <option value={3}>April (Q4 Window)</option>
            </select>
          </div>
          <select 
            value={currentQuarter} 
            onChange={(e) => { setCurrentQuarter(e.target.value); fetchData(); }}
            className="input-field w-32 font-bold"
          >
            <option value="Q1">Q1 Update</option>
            <option value="Q2">Q2 Update</option>
            <option value="Q3">Q3 Update</option>
            <option value="Q4">Q4 Update</option>
          </select>
        </div>
      </div>

      {!isWindowOpen && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
          <span className="font-semibold mr-2">Check-in Window Closed.</span>
          <span className="text-sm">You can only edit achievements during the active quarterly window. Currently active: {activeQuarter || 'None (Goal Setting)'}</span>
        </div>
      )}

      {saveStatus && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative">
          {saveStatus}
        </div>
      )}

      {goals.length === 0 ? (
        <div className="card p-12 text-center text-slate-500">
          <Target className="w-12 h-12 mx-auto text-slate-300 mb-4" />
          <p>No approved goals found. Goals must be approved by your manager before check-ins.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {goals.map(goal => (
            <div key={goal._id} className="card p-6 border-l-4 border-l-blue-500">
              <div className="flex justify-between items-start mb-4 pb-4 border-b border-slate-100">
                <div>
                  <h4 className="text-lg font-semibold text-slate-800">{goal.title}</h4>
                  <div className="flex space-x-4 text-sm text-slate-500 mt-1">
                    <span>Target: <strong className="text-slate-800">{goal.target} {goal.uomType}</strong></span>
                    <span>Weightage: <strong className="text-slate-800">{goal.weightage}%</strong></span>
                  </div>
                </div>
                <div className="text-right">
                   <p className="text-sm text-slate-500">Q-o-Q Progress</p>
                   {/* We will just show a static placeholder or fetch from checkins if we want */}
                   <div className="flex items-center text-green-600 font-bold">
                     <TrendingUp className="w-4 h-4 mr-1" />
                     Tracking
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Actual Achievement</label>
                  <input 
                    type="text" 
                    className={`input-field ${!isWindowOpen && 'opacity-50 cursor-not-allowed bg-slate-50'}`}
                    value={formData[goal._id]?.actualAchievement || ''}
                    onChange={(e) => handleInputChange(goal._id, 'actualAchievement', e.target.value)}
                    placeholder="e.g. 50"
                    disabled={!isWindowOpen}
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select 
                    className={`input-field ${!isWindowOpen && 'opacity-50 cursor-not-allowed bg-slate-50'}`}
                    value={formData[goal._id]?.status || 'Not Started'}
                    onChange={(e) => handleInputChange(goal._id, 'status', e.target.value)}
                    disabled={!isWindowOpen}
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="On Track">On Track</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div className="col-span-2 flex space-x-3 items-end">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Comments</label>
                    <input 
                      type="text" 
                      className={`input-field ${!isWindowOpen && 'opacity-50 cursor-not-allowed bg-slate-50'}`}
                      value={formData[goal._id]?.employeeComment || ''}
                      onChange={(e) => handleInputChange(goal._id, 'employeeComment', e.target.value)}
                      placeholder="Brief update..."
                      disabled={!isWindowOpen}
                    />
                  </div>
                  <button 
                    onClick={() => handleSubmit(goal._id)} 
                    disabled={!isWindowOpen}
                    className={`btn-primary flex items-center h-[38px] ${!isWindowOpen && 'opacity-50 cursor-not-allowed'}`}
                  >
                    <Save className="w-4 h-4 mr-2" /> Save
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Checkins;
