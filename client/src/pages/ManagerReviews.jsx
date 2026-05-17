import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { Check, Edit2, AlertCircle, RefreshCw } from 'lucide-react';

const ManagerReviews = () => {
  const { user } = useContext(AuthContext);
  const [checkins, setCheckins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({});

  useEffect(() => {
    fetchCheckins();
  }, [user]);

  const fetchCheckins = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get('https://goaltrack-portal.onrender.com/api/checkins/team', config);
      setCheckins(data);
      
      const initialFeedback = {};
      data.forEach(c => {
        initialFeedback[c._id] = c.managerComment || '';
      });
      setFeedback(initialFeedback);
      
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleReview = async (id) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`https://goaltrack-portal.onrender.com/api/checkins/${id}/review`, { managerComment: feedback[id] }, config);
      fetchCheckins();
    } catch (error) {
      console.error(error);
      alert('Failed to save feedback. Please try again.');
    }
  };

  // Allow manager to re-edit a reviewed check-in
  const handleReEdit = (id) => {
    setCheckins(prev => prev.map(c => c._id === id ? { ...c, isReviewed: false } : c));
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Check-in Reviews</h2>
        <p className="text-sm text-slate-500 mt-1">Review quarterly progress updates from your team.</p>
      </div>

      <div className="space-y-6">
        {checkins.length === 0 ? (
          <div className="card p-8 text-center text-slate-500 flex flex-col items-center">
            <AlertCircle className="w-8 h-8 text-slate-300 mb-2" />
            <p>No check-ins submitted by your team yet.</p>
          </div>
        ) : (
          checkins.map(checkin => (
            <div key={checkin._id} className={`card p-6 border-l-4 ${checkin.isReviewed ? 'border-l-green-500' : 'border-l-yellow-500'}`}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="col-span-2">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-lg font-semibold text-slate-800">{checkin.goalId?.title}</h4>
                    <span className={`badge-${checkin.isReviewed ? 'success' : 'warning'}`}>
                      {checkin.isReviewed ? 'Reviewed' : 'Pending Review'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                    <div>
                      <p className="text-slate-500">Employee</p>
                      <p className="font-medium text-slate-900">{checkin.employeeId?.name}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Quarter</p>
                      <p className="font-medium text-slate-900">{checkin.quarter}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Target</p>
                      <p className="font-medium text-slate-900">{checkin.goalId?.target} {checkin.goalId?.uomType}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Actual Achievement</p>
                      <p className="font-medium text-primary-600">{checkin.actualAchievement}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Employee Comment</p>
                    <p className="text-sm text-slate-800">{checkin.employeeComment || 'No comment provided.'}</p>
                  </div>
                </div>
                
                <div className="flex flex-col justify-between border-l border-slate-100 pl-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-sm font-medium text-slate-700">Manager Feedback</label>
                      {checkin.isReviewed && (
                        <button
                          onClick={() => handleReEdit(checkin._id)}
                          className="text-xs text-primary-600 hover:underline flex items-center"
                        >
                          <Edit2 className="w-3 h-3 mr-1" /> Edit
                        </button>
                      )}
                    </div>
                    <textarea 
                      className="input-field" 
                      rows="4"
                      value={feedback[checkin._id] || ''}
                      onChange={(e) => setFeedback({ ...feedback, [checkin._id]: e.target.value })}
                      placeholder="Add coaching feedback..."
                      disabled={checkin.isReviewed}
                    />
                    {checkin.progressScore !== undefined && (
                      <div className="mt-3 p-2 bg-blue-50 rounded-lg text-center">
                        <p className="text-xs text-blue-600 font-medium">Progress Score</p>
                        <p className={`text-2xl font-bold ${
                          checkin.progressScore >= 80 ? 'text-green-600' :
                          checkin.progressScore >= 50 ? 'text-yellow-600' : 'text-red-500'
                        }`}>{checkin.progressScore?.toFixed(1)}%</p>
                      </div>
                    )}
                  </div>
                  {!checkin.isReviewed && (
                    <button onClick={() => handleReview(checkin._id)} className="btn-primary flex items-center justify-center mt-4">
                      <Check className="w-4 h-4 mr-2" /> Save & Mark Reviewed
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ManagerReviews;
