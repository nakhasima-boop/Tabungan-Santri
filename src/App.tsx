import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/Login';
import Dashboard from './pages/Dashboard';
import StudentsPage from './pages/Students';
import TransactionsPage from './pages/Transactions';
import ReportsPage from './pages/Reports';
import AdminSettingsPage from './pages/AdminSettings';

const ProtectedRoute = ({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : { role: 'admin' };

  if (!isLoggedIn) return <Navigate to="/login" />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" />;

  return <>{children}</>;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/siswa"
          element={
            <ProtectedRoute adminOnly>
              <StudentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transaksi"
          element={
            <ProtectedRoute adminOnly>
              <TransactionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/laporan"
          element={
            <ProtectedRoute adminOnly>
              <ReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pengaturan"
          element={
            <ProtectedRoute adminOnly>
              <AdminSettingsPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
