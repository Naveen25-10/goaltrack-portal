import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import EmployeeDashboard from './pages/EmployeeDashboard';
import CreateGoal from './pages/CreateGoal';
import ManagerDashboard from './pages/ManagerDashboard';
import ManagerTeamDashboard from './pages/ManagerTeamDashboard';
import Checkins from './pages/Checkins';
import AdminDashboard from './pages/AdminDashboard';
import ManagerReviews from './pages/ManagerReviews';
import UserManagement from './pages/UserManagement';
import Reports from './pages/Reports';
import AdminGoals from './pages/AdminGoals';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = React.useContext(AuthContext);
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  
  return children;
};

const RoleBasedDashboard = () => {
  const { user } = React.useContext(AuthContext);
  if (user?.role === 'Admin') return <AdminDashboard />;
  if (user?.role === 'Manager') return <ManagerTeamDashboard />;
  return <EmployeeDashboard />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Employee Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<RoleBasedDashboard />} />
            <Route path="goals/create" element={<CreateGoal />} />
            <Route path="checkins" element={<Checkins />} />
            <Route path="approvals" element={<ManagerDashboard />} />
            <Route path="reviews" element={<ManagerReviews />} />
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="reports" element={<Reports />} />
            <Route path="goal-management" element={<AdminGoals />} />
            {/* Add more routes here later */}
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
