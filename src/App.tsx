/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import Chat from './pages/Chat';
import Notifications from './pages/Notifications';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { token, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return token ? <>{children}</> : <Navigate to="/login" />;
};

const AppContent = () => {
  const { token } = useAuth();

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      {token && <Navbar />}
      <div className="flex max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-10 gap-8">
        {token && (
          <div className="hidden lg:block w-64 shrink-0">
            <Sidebar />
          </div>
        )}
        <main className="flex-1 min-w-0">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
            <Route path="/profile/:id" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/chat" element={<PrivateRoute><Chat /></PrivateRoute>} />
            <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}
