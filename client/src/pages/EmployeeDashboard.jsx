import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { Target, AlertCircle, CheckCircle, Clock, TrendingUp, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EmployeeDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [goals, setGoals] = useState([]);
  const [checkins, setCheckins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const [goalsRes, checkinsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/goals', config),
          axios.get('http://localhost:5000/api/checkins', config)
        ]);
        setGoals(goalsRes.data);
        setCheckins(checkinsRes.data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) return <div>Loading...</div>;

  // Get latest check-in score for a goal
  const getLatestScore = (goalId) => {
    const goalCheckins = checkins.filter(c => c.goalId?._id === goalId || c.goalId === goalId);
    if (goalCheckins.length === 0) return null;
    // Sort by quarter descending (Q4 > Q3 > Q2 > Q1)
    goalCheckins.sort((a, b) => b.quarter.localeCompare(a.quarter));
    return goalCheckins[0].progressScore;
  };

  // Calculate weighted overall score across all approved goals
  const approvedGoals = goals.filter(g => g.status === 'Approved');
  const weightedScore = approvedGoals.reduce((total, goal) => {
    const score = getLatestScore(goal._id);
    if (score !== null && score !== undefined) {
      return total + (score * goal.weightage) / 100;
    }
    return total;
  }, 0);

  const hasAnyScore = approvedGoals.some(g => getLatestScore(g._id) !== null);

  const getStatusColor = (status) => {
    if (status === 'Approved') return 'success';
    if (status === 'Rejected') return 'danger';
    return 'warning';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Welcome back, {user?.name}</h2>
          <p className="text-sm text-slate-500 mt-1">Here is the overview of your performance goals.</p>
        </div>
        {hasAnyScore && (
          <div className="card p-4 text-center min-w-[140px]">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Overall Score</p>
            <p className={`text-4xl font-bold mt-1 ${
              weightedScore >= 80 ? 'text-green-600' :
              weightedScore >= 50 ? 'text-yellow-600' : 'text-red-600'
            }`}>{weightedScore.toFixed(1)}%</p>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 border-l-4 border-l-primary-500">
          <div className="flex items-center">
            <div className="p-3 bg-primary-50 rounded-lg text-primary-600">
              <Target className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-500">Total Goals</p>
              <h3 className="text-2xl font-bold text-slate-900">{goals.length}</h3>
            </div>
          </div>
        </div>
        
        <div className="card p-6 border-l-4 border-l-yellow-500">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-50 rounded-lg text-yellow-600">
              <Clock className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-500">Pending Approval</p>
              <h3 className="text-2xl font-bold text-slate-900">
                {goals.filter(g => g.status === 'Submitted' || g.status === 'Draft').length}
              </h3>
            </div>
          </div>
        </div>

        <div className="card p-6 border-l-4 border-l-green-500">
          <div className="flex items-center">
            <div className="p-3 bg-green-50 rounded-lg text-green-600">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-500">Approved Goals</p>
              <h3 className="text-2xl font-bold text-slate-900">
                {goals.filter(g => g.status === 'Approved').length}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Goal Sheet with Progress */}
      <div className="card">
        <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center">
          <h3 className="text-lg font-medium leading-6 text-slate-900">Your Goal Sheet & Progress</h3>
          {goals.filter(g => g.status !== 'Approved').length > 0 && (
            <button onClick={() => navigate('/goals/create')} className="btn-primary text-sm py-1.5">
              Edit Goal Sheet
            </button>
          )}
        </div>
        <div className="divide-y divide-slate-100">
          {goals.length === 0 ? (
            <div className="px-6 py-12 text-center text-slate-500 flex flex-col items-center">
              <AlertCircle className="w-8 h-8 text-slate-300 mb-2" />
              <p>No goals found. Create your goals to get started.</p>
            </div>
          ) : (
            goals.map((goal) => {
              const score = getLatestScore(goal._id);
              return (
                <div key={goal._id} className="px-6 py-5 hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 mr-6">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900">{goal.title}</span>
                        {goal.isLocked && <Lock className="w-3 h-3 text-slate-400" title="Goal is locked" />}
                        {goal.isShared && <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">Shared</span>}
                      </div>
                      <div className="flex gap-4 text-xs text-slate-500 mt-1">
                        <span>Target: <strong>{goal.target} {goal.uomType}</strong></span>
                        <span>Weightage: <strong>{goal.weightage}%</strong></span>
                        {goal.thrustArea && <span>Area: <strong>{goal.thrustArea}</strong></span>}
                      </div>

                      {/* Progress Bar */}
                      {goal.status === 'Approved' && (
                        <div className="mt-3">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-slate-500">Achievement Progress</span>
                            <span className={`text-xs font-bold ${
                              score >= 80 ? 'text-green-600' : score >= 50 ? 'text-yellow-600' : score !== null ? 'text-red-500' : 'text-slate-400'
                            }`}>{score !== null ? `${score.toFixed(1)}%` : 'No check-in yet'}</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                score >= 80 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : score !== null ? 'bg-red-400' : 'bg-slate-200'
                              }`}
                              style={{ width: `${Math.min(score || 0, 100)}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    <span className={`badge-${getStatusColor(goal.status)} shrink-0`}>{goal.status}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
