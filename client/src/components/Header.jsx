import React, { useState, useEffect, useContext, useRef } from 'react';
import { Bell, Search, CheckCircle, Target, Lock, X, Menu } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const Header = ({ toggleSidebar }) => {
  const { user } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const panelRef = useRef(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };

        if (user.role === 'Admin') {
          const { data } = await axios.get('https://goaltrack-portal.onrender.com/api/admin/auditlogs', config);
          setNotifications(data.slice(0, 8).map(log => ({
            id: log._id,
            icon: 'lock',
            title: `Goal field "${log.fieldChanged}" changed`,
            subtitle: `By ${log.changedBy?.name} · ${new Date(log.createdAt).toLocaleDateString()}`,
          })));
        } else if (user.role === 'Manager') {
          const { data } = await axios.get('https://goaltrack-portal.onrender.com/api/goals/team', config);
          const submitted = data.filter(g => g.status === 'Submitted').slice(0, 8);
          setNotifications(submitted.map(g => ({
            id: g._id,
            icon: 'goal',
            title: `${g.employeeId?.name} submitted a goal`,
            subtitle: `"${g.title}" — awaiting your approval`,
          })));
        } else {
          const { data } = await axios.get('https://goaltrack-portal.onrender.com/api/goals', config);
          const approved = data.filter(g => g.status === 'Approved').slice(0, 8);
          setNotifications(approved.map(g => ({
            id: g._id,
            icon: 'check',
            title: `Goal approved: "${g.title}"`,
            subtitle: 'Your manager approved this goal',
          })));
        }
      } catch (e) { /* silent */ }
    };
    if (user) fetchNotifications();
  }, [user]);

  // Close panel on outside click
  useEffect(() => {
    const handler = (e) => { if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const iconFor = (type) => {
    if (type === 'check') return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (type === 'goal') return <Target className="w-5 h-5 text-blue-500" />;
    return <Lock className="w-5 h-5 text-orange-500" />;
  };

  return (
    <header className="bg-white border-b border-slate-200 h-20 flex items-center justify-between px-4 md:px-8">
      <div className="flex items-center">
        {/* Mobile menu button */}
        <button 
          onClick={toggleSidebar}
          className="md:hidden p-2 mr-2 text-slate-500 hover:bg-slate-100 rounded-md"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        <div className="flex items-center bg-slate-100 px-3 py-2 rounded-lg w-48 md:w-96">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="bg-transparent border-none focus:outline-none ml-2 text-sm w-full text-slate-700"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-4 relative" ref={panelRef}>
        <button
          onClick={() => setOpen(o => !o)}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors relative"
        >
          <Bell className="w-5 h-5" />
          {notifications.length > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          )}
        </button>

        {open && (
          <div className="absolute right-0 top-12 w-96 bg-white rounded-xl shadow-xl border border-slate-200 z-50">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900">Notifications</h3>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-slate-400 text-sm">No new notifications</div>
              ) : notifications.map(n => (
                <div key={n.id} className="flex items-start px-4 py-3 hover:bg-slate-50 border-b border-slate-50 last:border-0">
                  <div className="mt-0.5 mr-3 shrink-0">{iconFor(n.icon)}</div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{n.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{n.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

