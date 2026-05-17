import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LogOut, User, Target, CheckSquare, Users, Settings, FileText, Unlock, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  const getNavItems = () => {
    switch(user?.role) {
      case 'Employee':
        return [
          { name: 'Dashboard', path: '/', icon: <Target className="w-5 h-5" /> },
          { name: 'Create Goals', path: '/goals/create', icon: <FileText className="w-5 h-5" /> },
          { name: 'Quarterly Check-ins', path: '/checkins', icon: <CheckSquare className="w-5 h-5" /> }
        ];
      case 'Manager':
        return [
          { name: 'Team Dashboard', path: '/', icon: <Users className="w-5 h-5" /> },
          { name: 'Goal Approvals', path: '/approvals', icon: <Target className="w-5 h-5" /> },
          { name: 'Check-in Reviews', path: '/reviews', icon: <CheckSquare className="w-5 h-5" /> }
        ];
      case 'Admin':
        return [
          { name: 'Admin Dashboard', path: '/', icon: <Settings className="w-5 h-5" /> },
          { name: 'User Management', path: '/users', icon: <Users className="w-5 h-5" /> },
          { name: 'Goal Management', path: '/goal-management', icon: <Unlock className="w-5 h-5" /> },
          { name: 'Reports', path: '/reports', icon: <FileText className="w-5 h-5" /> }
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <div className={`
      fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-slate-900 text-white min-h-screen transition-transform duration-300 ease-in-out md:relative md:translate-x-0
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <div className="flex items-center justify-between px-4 h-20 border-b border-slate-800">
        <h1 className="text-lg font-bold tracking-tight text-white leading-tight flex-1 text-center">Goal<span className="text-primary-400">Track</span> <span className="text-slate-400 font-normal text-xs block">Goal & Tracking Portal</span></h1>
        {/* Mobile close button */}
        <button 
          onClick={() => setIsOpen(false)} 
          className="md:hidden p-1 text-slate-400 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <div className="px-4 mb-6">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Navigation</p>
        </div>
        <nav className="px-2 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                location.pathname === item.path 
                  ? 'bg-primary-600 text-white' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item.icon}
              <span className="ml-3">{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="p-1.5 bg-slate-800 rounded-full">
              <User className="w-5 h-5 text-slate-300" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">{user?.name}</p>
              <p className="text-xs text-slate-400">{user?.role}</p>
            </div>
          </div>
          <button onClick={logout} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
