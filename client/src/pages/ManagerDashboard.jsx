import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { Check, X, Edit2, Plus, Send } from 'lucide-react';

const ManagerDashboard = () => {
  const { user } = useContext(AuthContext);
  const [teamGoals, setTeamGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSharedModal, setShowSharedModal] = useState(false);
  const [sharedGoal, setSharedGoal] = useState({ title: '', thrustArea: '', uomType: 'Percentage', target: '', description: '' });
  const [editGoal, setEditGoal] = useState(null); // holds goal being edited

  useEffect(() => {
    fetchTeamGoals();
  }, [user]);

  const fetchTeamGoals = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get('https://goaltrack-portal.onrender.com/api/goals/team', config);
      setTeamGoals(data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleReview = async (id, status, extra = {}) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`https://goaltrack-portal.onrender.com/api/goals/${id}/review`, { status, ...extra }, config);
      fetchTeamGoals();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSaveEdit = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`https://goaltrack-portal.onrender.com/api/goals/${editGoal._id}/review`, {
        target: editGoal.target,
        weightage: Number(editGoal.weightage),
        managerComments: editGoal.managerComments,
        status: editGoal.status
      }, config);
      setEditGoal(null);
      fetchTeamGoals();
    } catch (error) {
      console.error(error);
      alert('Failed to save changes.');
    }
  };

  const handlePushSharedGoal = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post('https://goaltrack-portal.onrender.com/api/goals/shared', sharedGoal, config);
      setShowSharedModal(false);
      setSharedGoal({ title: '', thrustArea: '', uomType: 'Percentage', target: '', description: '' });
      alert('Shared goal pushed to all team members successfully!');
      fetchTeamGoals();
    } catch (error) {
      console.error(error);
      alert('Error pushing shared goal');
    }
  };

  if (loading) return <div>Loading...</div>;

  const pendingGoals = teamGoals.filter(g => g.status === 'Submitted');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Team Goal Approvals</h2>
          <p className="text-sm text-slate-500 mt-1">Review and approve your team's submitted goals.</p>
        </div>
        <button onClick={() => setShowSharedModal(true)} className="btn-primary flex items-center">
          <Plus className="w-4 h-4 mr-2" /> Push Shared Goal
        </button>
      </div>

      <div className="card mt-4">
        <div className="px-6 py-5 border-b border-slate-200">
          <h3 className="text-lg font-medium leading-6 text-slate-900">Pending Approvals ({pendingGoals.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <div className="overflow-x-auto w-full"><table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Goal Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Target</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Weightage</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {pendingGoals.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                    No goals pending approval.
                  </td>
                </tr>
              ) : (
                pendingGoals.map((goal) => (
                  <tr key={goal._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      {goal.employeeId?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900">{goal.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{goal.target} {goal.uomType}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">{goal.weightage}%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => setEditGoal({ ...goal, managerComments: goal.managerComments || '' })}
                        className="text-slate-400 hover:text-primary-600 p-1 bg-slate-50 rounded-md transition"
                        title="Edit goal before approving"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleReview(goal._id, 'Approved')} className="text-green-600 hover:text-green-900 p-1 bg-green-50 rounded-md">
                        <Check className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleReview(goal._id, 'Rejected')} className="text-red-600 hover:text-red-900 p-1 bg-red-50 rounded-md">
                        <X className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table></div>
        </div>
      </div>

      {/* Edit Goal Modal */}
      {editGoal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-slate-900">Edit Goal Details</h3>
              <button onClick={() => setEditGoal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="text-sm text-slate-500 mb-5">
              Reviewing: <span className="font-semibold text-slate-800">{editGoal.title}</span>
              {' '}by <span className="font-semibold text-slate-800">{editGoal.employeeId?.name}</span>
            </p>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Target</label>
                  <input
                    type="text"
                    className="input-field"
                    value={editGoal.target}
                    onChange={e => setEditGoal({ ...editGoal, target: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Weightage (%)</label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    className="input-field"
                    value={editGoal.weightage}
                    onChange={e => setEditGoal({ ...editGoal, weightage: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Manager Comments</label>
                <textarea
                  className="input-field"
                  rows="3"
                  placeholder="Add your comments or reason for changes..."
                  value={editGoal.managerComments}
                  onChange={e => setEditGoal({ ...editGoal, managerComments: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Decision</label>
                <select
                  className="input-field"
                  value={editGoal.status}
                  onChange={e => setEditGoal({ ...editGoal, status: e.target.value })}
                >
                  <option value="Submitted">Keep as Pending</option>
                  <option value="Approved">Approve</option>
                  <option value="Rejected">Reject</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setEditGoal(null)} className="btn-secondary">Cancel</button>
              <button onClick={handleSaveEdit} className="btn-primary flex items-center">
                <Check className="w-4 h-4 mr-2" /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {showSharedModal && (

        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-slate-900">Push Shared Goal to Team</h3>
              <button onClick={() => setShowSharedModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="text-sm text-slate-500 mb-6">This goal will be added to every reporting employee's goal sheet as a Draft. They must allocate weightage and submit it to you.</p>
            
            <form onSubmit={handlePushSharedGoal} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Goal Title *</label>
                <input type="text" className="input-field" required value={sharedGoal.title} onChange={e => setSharedGoal({...sharedGoal, title: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Thrust Area</label>
                  <input type="text" className="input-field" value={sharedGoal.thrustArea} onChange={e => setSharedGoal({...sharedGoal, thrustArea: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">UoM Type</label>
                  <select className="input-field" value={sharedGoal.uomType} onChange={e => setSharedGoal({...sharedGoal, uomType: e.target.value})}>
                    <option value="Percentage">Percentage</option>
                    <option value="Numeric Min">Numeric Min</option>
                    <option value="Numeric Max">Numeric Max</option>
                    <option value="Timeline">Timeline</option>
                    <option value="Zero-based">Zero-based</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Target *</label>
                  <input type="text" className="input-field" required value={sharedGoal.target} onChange={e => setSharedGoal({...sharedGoal, target: e.target.value})} />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea className="input-field" rows="2" value={sharedGoal.description} onChange={e => setSharedGoal({...sharedGoal, description: e.target.value})}></textarea>
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <button type="button" onClick={() => setShowSharedModal(false)} className="btn-secondary mr-3">Cancel</button>
                <button type="submit" className="btn-primary flex items-center">
                  <Send className="w-4 h-4 mr-2" /> Push to Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerDashboard;
