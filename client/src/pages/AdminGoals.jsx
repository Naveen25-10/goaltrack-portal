import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { Unlock, Lock, AlertCircle } from 'lucide-react';

const AdminGoals = () => {
  const { user } = useContext(AuthContext);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unlocking, setUnlocking] = useState(null);
  const [message, setMessage] = useState('');

  const fetchGoals = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get('https://goaltrack-portal.onrender.com/api/admin/reports/goals', config);
      setGoals(data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => { fetchGoals(); }, [user]);

  const handleUnlock = async (goalId) => {
    setUnlocking(goalId);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`https://goaltrack-portal.onrender.com/api/admin/goals/${goalId}/unlock`, {}, config);
      setMessage('Goal unlocked successfully. Employee can now revise it.');
      setTimeout(() => setMessage(''), 4000);
      fetchGoals();
    } catch (err) {
      setMessage('Failed to unlock goal.');
    }
    setUnlocking(null);
  };

  if (loading) return <div>Loading...</div>;

  const lockedGoals = goals.filter(g => g.isLocked);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Goal Management</h2>
        <p className="text-sm text-slate-500 mt-1">View and unlock approved goals for mid-year revision.</p>
      </div>

      {message && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md text-green-700">{message}</div>
      )}

      <div className="card">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center">
          <Lock className="w-4 h-4 mr-2 text-slate-500" />
          <h3 className="font-semibold text-slate-700">Locked Goals ({lockedGoals.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <div className="overflow-x-auto w-full"><table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Goal Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Manager</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {lockedGoals.length === 0 ? (
                <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-400">
                  <AlertCircle className="w-6 h-6 mx-auto mb-2" /> No locked goals to manage
                </td></tr>
              ) : lockedGoals.map(goal => (
                <tr key={goal._id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm text-slate-900">{goal.employeeId?.name}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{goal.title}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{goal.managerId?.name}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleUnlock(goal._id)}
                      disabled={unlocking === goal._id}
                      className="inline-flex items-center px-3 py-1.5 text-sm bg-orange-50 text-orange-700 hover:bg-orange-100 rounded-md border border-orange-200 transition"
                    >
                      <Unlock className="w-3.5 h-3.5 mr-1" />
                      {unlocking === goal._id ? 'Unlocking...' : 'Unlock for Revision'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>
      </div>
    </div>
  );
};

export default AdminGoals;
