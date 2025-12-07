import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import ThreeBackground from './components/ThreeBackground';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import AuthPage from './pages/AuthPage';
import AdminPanel from './pages/AdminPanel';
import IdentityPage from './pages/IdentityPage';
import { UserProfile } from './types';
import { ToastProvider } from './context/ToastContext';

const App: React.FC = () => {
  // --- Global State ---
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize/Load User from LocalStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('sniper_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const updateUser = (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('sniper_user', JSON.stringify(updated));
  };

  const handleLogin = (loggedInUser: UserProfile) => {
    setUser(loggedInUser);
  };

  if (isLoading) return null;

  return (
    <ToastProvider>
      <ThreeBackground />
      <HashRouter>
        <div className="min-h-screen relative z-10 text-gray-200">
          <Routes>
            <Route path="/" element={<LandingPage user={user} />} />
            <Route path="/auth" element={<AuthPage onLogin={handleLogin} />} />
            
            <Route 
              path="/dashboard" 
              element={
                user ? (
                  <Dashboard user={user} updateUser={updateUser} />
                ) : (
                  <Navigate to="/auth" replace />
                )
              } 
            />
            
            <Route 
              path="/id" 
              element={
                user ? (
                  <IdentityPage user={user} updateUser={updateUser} />
                ) : (
                  <Navigate to="/auth" replace />
                )
              } 
            />
            
            <Route 
              path="/admin" 
              element={<AdminPanel />} 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </HashRouter>
    </ToastProvider>
  );
};

export default App;
