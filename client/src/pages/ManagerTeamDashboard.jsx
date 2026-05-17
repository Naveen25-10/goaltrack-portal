import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { Users, Target, CheckCircle, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';

const ManagerTeamDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [teamGoals, setTeamGoals] = useState([]);
  const [checkins, setCheckins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const [goalsRes, checkinsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/goals/team', config),
          axios.get('http://localhost:5000/api/checkins/team', config)
        ]);
        setTeamGoals(goalsRes.data);
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

  const total = teamGoals.length;
  const approved = teamGoals.filter(g => g.status === 'Approved').length;
  const pending = teamGoals.filter(g => g.status === 'Submitted').length;
  const rejected = teamGoals.filter(g => g.status === 'Rejected').length;

  // Group goals by employee
  const byEmployee = teamGoals.reduce((acc, goal) => {
    const name = goal.employeeId?.name || 'Unknown';
    if (!acc[name]) acc[name] = { name, total: 0, approved: 0, pending: 0 };
    acc[name].total += 1;
    if (goal.status === 'Approved') acc[name].approved += 1;
    if (goal.status === 'Submitted') acc[name].pending += 1;
    return acc;
  }, {});
  const teamData = Object.values(byEmployee);

  // Recent check-ins
  const recentCheckins = [...checkins].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Team Dashboard</h2>
        <p className="text-sm text-slate-500 mt-1">Overview of your team's goal progress and performance.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Total Goals</p>
            <p className="text-2xl font-bold text-slate-900">{total}</p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Pending Approval</p>
            <p className="text-2xl font-bold text-yellow-600">{pending}</p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Approved</p>
            <p className="text-2xl font-bold text-green-600">{approved}</p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Team Members</p>
            <p className="text-2xl font-bold text-slate-900">{teamData.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Progress Chart */}
        <div className="card p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-primary-600" /> Goals by Team Member
          </h3>
          {teamData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No data available</div>
          ) : (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={teamData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="approved" name="Approved" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pending" name="Pending" fill="#eab308" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Recent Check-ins */}
        <div className="card p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-800">Recent Check-ins</h3>
            <button onClick={() => navigate('/reviews')} className="text-xs text-primary-600 hover:underline">View all →</button>
          </div>
          <div className="space-y-3">
            {recentCheckins.length === 0 ? (
              <div className="flex flex-col items-center py-6 text-slate-400">
                <AlertCircle className="w-6 h-6 mb-2" />
                <p className="text-sm">No check-ins submitted yet</p>
              </div>
            ) : recentCheckins.map(c => (
              <div key={c._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-slate-900">{c.employeeId?.name}</p>
                  <p className="text-xs text-slate-500">{c.goalId?.title} · {c.quarter}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${
                    c.progressScore >= 80 ? 'text-green-600' :
                    c.progressScore >= 50 ? 'text-yellow-600' : 'text-red-500'
                  }`}>{c.progressScore?.toFixed(1)}%</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${c.isReviewed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {c.isReviewed ? 'Reviewed' : 'Pending'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pending Approvals Alert */}
      {pending > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center">
            <Clock className="w-5 h-5 text-yellow-600 mr-3" />
            <p className="text-sm font-medium text-yellow-800">
              You have <strong>{pending}</strong> goal{pending > 1 ? 's' : ''} waiting for your approval.
            </p>
          </div>
          <button onClick={() => navigate('/approvals')} className="btn-primary text-sm py-1.5">
            Review Now →
          </button>
        </div>
      )}
    </div>
  );
};

export default ManagerTeamDashboard;
