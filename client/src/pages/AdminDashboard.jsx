import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { Shield, Target, CheckCircle, Clock, Activity } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const [analyticsRes, logsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/admin/analytics', config),
          axios.get('http://localhost:5000/api/admin/auditlogs', config)
        ]);
        setStats(analyticsRes.data);
        setAuditLogs(logsRes.data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading || !stats) return <div>Loading...</div>;

  const COLORS = ['#94a3b8', '#eab308', '#22c55e', '#ef4444']; // Draft, Submitted, Approved, Rejected

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">System Dashboard</h2>
        <p className="text-sm text-slate-500 mt-1">Platform overview and compliance monitoring.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Total Goals Created</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{stats.totalGoals}</p>
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
            <Target className="w-6 h-6" />
          </div>
        </div>
        
        <div className="card p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Approved & Locked</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{stats.approvedGoals}</p>
          </div>
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="card p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Pending Approvals</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{stats.pendingGoals}</p>
          </div>
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-6 lg:col-span-1">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-primary-600" /> Goal Status Distribution
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6 lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-primary-600" /> Recent Audit Logs
          </h3>
          <div className="space-y-4">
            {auditLogs.length === 0 ? (
              <p className="text-sm text-slate-500">No recent audit logs found.</p>
            ) : (
              auditLogs.map((log) => (
                <div key={log._id} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-lg transition">
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-slate-300 mr-3"></div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {log.changedBy?.name} changed <span className="font-bold">{log.fieldChanged}</span> on goal "{log.goalId?.title || 'Unknown Goal'}"
                      </p>
                      <p className="text-xs text-slate-500">From "{log.previousValue}" to "{log.newValue}"</p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400">
                    {new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
