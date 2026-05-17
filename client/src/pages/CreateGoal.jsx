import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Save, Send } from 'lucide-react';

const CreateGoal = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [goals, setGoals] = useState([{
    title: '', description: '', thrustArea: '', uomType: 'Percentage', target: '', weightage: 10
  }]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchDrafts = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get('http://localhost:5000/api/goals', config);
        const drafts = data.filter(g => g.status === 'Draft' || g.status === 'Rejected');
        if (drafts.length > 0) {
          setGoals(drafts);
        }
      } catch(err) {}
    }
    fetchDrafts();
  }, [user]);

  const totalWeightage = goals.reduce((sum, g) => sum + Number(g.weightage), 0);

  const handleAddGoal = () => {
    if (goals.length >= 8) {
      setError('Maximum 8 goals allowed.');
      return;
    }
    setGoals([...goals, { title: '', description: '', thrustArea: '', uomType: 'Percentage', target: '', weightage: 10 }]);
  };

  const handleRemoveGoal = (index) => {
    setGoals(goals.filter((_, i) => i !== index));
  };

  const handleChange = (index, field, value) => {
    const newGoals = [...goals];
    newGoals[index][field] = value;
    setGoals(newGoals);
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    if (totalWeightage !== 100) {
      setError(`Total weightage must be exactly 100%. Current is ${totalWeightage}%.`);
      return;
    }

    const invalidGoal = goals.find(g => Number(g.weightage) < 10);
    if (invalidGoal) {
      setError('Minimum 10% weightage required for each goal.');
      return;
    }

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post('http://localhost:5000/api/goals', { goals }, config);
      setSuccess('Goals submitted successfully to your manager!');
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error submitting goals');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Create Goal Sheet</h2>
          <p className="text-sm text-slate-500 mt-1">Define your performance goals for the year.</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500">Total Weightage</p>
          <p className={`text-2xl font-bold ${totalWeightage === 100 ? 'text-green-600' : 'text-red-600'}`}>
            {totalWeightage}%
          </p>
        </div>
      </div>

      {error && <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md text-red-700">{error}</div>}
      {success && <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md text-green-700">{success}</div>}

      <div className="space-y-4">
        {goals.map((goal, index) => (
          <div key={index} className="card p-6 border-l-4 border-l-primary-500">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-100">
              <h4 className="text-lg font-semibold text-slate-800">
                Goal #{index + 1} {goal.isShared && <span className="ml-2 badge-warning text-xs">Shared by Manager</span>}
              </h4>
              {goals.length > 1 && !goal.isShared && (
                <button onClick={() => handleRemoveGoal(index)} className="text-red-500 hover:text-red-700 p-2 rounded-md hover:bg-red-50 transition">
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Goal Title *</label>
                <input type="text" className={`input-field ${goal.isShared ? 'bg-slate-100' : ''}`} value={goal.title} onChange={(e) => handleChange(index, 'title', e.target.value)} disabled={goal.isShared} required />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Thrust Area</label>
                <input type="text" className={`input-field ${goal.isShared ? 'bg-slate-100' : ''}`} value={goal.thrustArea} onChange={(e) => handleChange(index, 'thrustArea', e.target.value)} disabled={goal.isShared} />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Weightage (%) *</label>
                <input type="number" min="10" max="100" className="input-field border-primary-300 bg-primary-50" value={goal.weightage} onChange={(e) => handleChange(index, 'weightage', e.target.value)} required />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">UoM Type *</label>
                <select className={`input-field ${goal.isShared ? 'bg-slate-100' : ''}`} value={goal.uomType} onChange={(e) => handleChange(index, 'uomType', e.target.value)} disabled={goal.isShared}>
                  <option value="Percentage">Percentage</option>
                  <option value="Numeric Min">Numeric Min</option>
                  <option value="Numeric Max">Numeric Max</option>
                  <option value="Timeline">Timeline</option>
                  <option value="Zero-based">Zero-based</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Target *</label>
                <input type="text" className={`input-field ${goal.isShared ? 'bg-slate-100' : ''}`} placeholder="e.g. 100, Q3 End, 0" value={goal.target} onChange={(e) => handleChange(index, 'target', e.target.value)} disabled={goal.isShared} required />
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea className={`input-field ${goal.isShared ? 'bg-slate-100' : ''}`} rows="2" value={goal.description} onChange={(e) => handleChange(index, 'description', e.target.value)} disabled={goal.isShared}></textarea>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center pt-4">
        <button onClick={handleAddGoal} className="btn-secondary flex items-center">
          <Plus className="w-4 h-4 mr-2" /> Add Goal
        </button>
        <div className="space-x-3">
          <button className="btn-secondary flex items-center inline-flex">
            <Save className="w-4 h-4 mr-2" /> Save Draft
          </button>
          <button onClick={handleSubmit} className="btn-primary flex items-center inline-flex">
            <Send className="w-4 h-4 mr-2" /> Submit Goals
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGoal;
