import { Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated } from './lib/api';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AcceptInvite from './pages/AcceptInvite';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import UserDetail from './pages/UserDetail';
import Admins from './pages/Admins';
import Mods from './pages/Mods';
import Films from './pages/Films';
import FilmDetail from './pages/FilmDetail';
import FilmPageEdit from './pages/FilmPageEdit';
import FilmPages from './pages/FilmPages';
import FilmsWithInvestments from './pages/FilmsWithInvestments';
import Contributions from './pages/Contributions';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/accept-invite" element={<AcceptInvite />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="users/:id" element={<UserDetail />} />
        <Route path="films" element={<Films />} />
        <Route path="films/:id" element={<FilmDetail />} />
        <Route path="film-pages" element={<FilmPages />} />
        <Route path="film-pages/:id" element={<FilmPageEdit />} />
        <Route path="contributions" element={<Contributions />} />
        <Route path="films-with-investments" element={<FilmsWithInvestments />} />
        <Route path="admins" element={<Admins />} />
        <Route path="mods" element={<Mods />} />
      </Route>
      <Route path="team" element={<Navigate to="/admins" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
