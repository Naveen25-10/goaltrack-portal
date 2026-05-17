import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { Download, FileText, PieChart as PieChartIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

const Reports = () => {
  const { user } = useContext(AuthContext);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get('http://localhost:5000/api/admin/reports/goals', config);
        setGoals(data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    fetchGoals();
  }, [user]);

  const handleExportCSV = () => {
    const headers = ['Employee Name', 'Department', 'Manager Name', 'Goal Title', 'Thrust Area', 'Target', 'UoM', 'Weightage', 'Status'];
    const csvContent = [
      headers.join(','),
      ...goals.map(g => [
        `"${g.employeeId?.name || ''}"`,
        `"${g.employeeId?.department || ''}"`,
        `"${g.managerId?.name || ''}"`,
        `"${g.title}"`,
        `"${g.thrustArea}"`,
        `"${g.target}"`,
        `"${g.uomType}"`,
        g.weightage,
        `"${g.status}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'goal_achievement_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Organizational Reports</h2>
          <p className="text-sm text-slate-500 mt-1">Export organizational goal data and achievement reports.</p>
        </div>
        <button onClick={handleExportCSV} className="btn-primary flex items-center">
          <Download className="w-4 h-4 mr-2" /> Export to CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-8 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 text-blue-600">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Achievement Report</h3>
          <p className="text-slate-500 text-sm mb-6">
            Detailed CSV extract containing all goals, planned targets, weightages, and approval statuses across the organization.
          </p>
          <button onClick={handleExportCSV} className="btn-secondary w-full">Generate Report</button>
        </div>

        <div className="card p-8 flex flex-col justify-between">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center mr-3 text-purple-600">
              <PieChartIcon className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Completion Analytics</h3>
          </div>
          
          <div className="h-48 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: 'Draft', count: goals.filter(g => g.status === 'Draft').length },
                  { name: 'Pending', count: goals.filter(g => g.status === 'Submitted').length },
                  { name: 'Approved', count: goals.filter(g => g.status === 'Approved').length }
                ]}
                margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{fontSize: 12}} />
                <YAxis allowDecimals={false} tick={{fontSize: 12}} />
                <RechartsTooltip cursor={{fill: '#f8fafc'}} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
