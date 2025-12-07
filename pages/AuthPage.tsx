import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserProfile, PlanTier, AccountType } from '../types';
import { Eye, Shield, ArrowRight, User, Key, Mail } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface Props {
  onLogin: (user: UserProfile) => void;
}

const AuthPage: React.FC<Props> = ({ onLogin }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    // If email is passed from landing page, switch to signup (or login) and pre-fill
    if (location.state?.email) {
      setFormData(prev => ({ ...prev, email: location.state.email }));
      setIsLogin(false); // Assume they want to sign up if coming from "Join Now"
    }
  }, [location]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please fill in email and password');
      showToast('Missing credentials', 'warning');
      return;
    }

    // For Signup, username is required
    if (!isLogin && !formData.username) {
       setError('Identity Name is required for new operatives');
       showToast('Identity Name missing', 'warning');
       return;
    }

    if (isLogin) {
      const stored = localStorage.getItem('sniper_user');
      if (stored) {
        const user = JSON.parse(stored);
        // Login Logic: Check Email and "Password" (Mock: Check against stored user)
        if (user.email.toLowerCase() === formData.email.toLowerCase()) {
          onLogin(user);
          showToast(`Welcome back, ${user.username}`, 'success');
          navigate('/dashboard');
        } else {
            setError('Invalid credentials. Identity not found.');
            showToast('Authentication Failed', 'error');
        }
      } else {
        setError('No account found. Please sign up.');
        showToast('Identity not found', 'error');
      }
    } else {
      handleSignup();
    }
  };

  const handleSignup = () => {
    const newUser: UserProfile = {
      id: crypto.randomUUID(),
      username: formData.username,
      email: formData.email,
      plan: PlanTier.FREE,
      signalsUsedLifetime: 0,
      signalsUsedToday: 0,
      joinDate: new Date().toISOString(),
      settings: {
        accountSize: 1000,
        riskPercentage: 1,
        accountType: AccountType.STANDARD
      },
      idTheme: 'cyan',
      tradeHistory: []
    };
    
    localStorage.setItem('sniper_user', JSON.stringify(newUser));
    onLogin(newUser);
    showToast('Identity Created Successfully', 'success');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-black z-0"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyber-500/10 rounded-full blur-[120px] z-0 animate-pulse-slow"></div>

      <div className="glass-panel w-full max-w-md p-8 rounded-2xl relative z-10 border border-cyber-500/30 shadow-[0_0_50px_rgba(0,188,212,0.1)]">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyber-900/50 border border-cyber-500/50 mb-4 shadow-[0_0_15px_rgba(0,188,212,0.3)]">
            <Eye size={32} className="text-cyber-500" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter mb-2">
            TRADE <span className="text-cyber-500 neon-text">VISION</span>
          </h1>
          <p className="text-gray-400 text-sm">
            {isLogin ? 'Authenticate via Secure Link' : 'Initialize new operative identity'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Identity Name - Only for Signup */}
          {!isLogin && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
              <label className="text-xs font-bold text-cyber-500 uppercase tracking-widest ml-1">Identity Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-cyber-500 transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="Enter Username"
                  className="w-full bg-black/50 border border-gray-700 rounded-xl py-3 pl-12 pr-4 text-white focus:border-cyber-500 focus:outline-none focus:ring-1 focus:ring-cyber-500 transition-all"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold text-cyber-500 uppercase tracking-widest ml-1">Secure Email</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-cyber-500 transition-colors" size={18} />
              <input 
                type="email" 
                placeholder="Enter Email Address"
                className="w-full bg-black/50 border border-gray-700 rounded-xl py-3 pl-12 pr-4 text-white focus:border-cyber-500 focus:outline-none focus:ring-1 focus:ring-cyber-500 transition-all"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-cyber-500 uppercase tracking-widest ml-1">Access Key</label>
            <div className="relative group">
              <Key className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-cyber-500 transition-colors" size={18} />
              <input 
                type="password" 
                placeholder="Enter Password"
                className="w-full bg-black/50 border border-gray-700 rounded-xl py-3 pl-12 pr-4 text-white focus:border-cyber-500 focus:outline-none focus:ring-1 focus:ring-cyber-500 transition-all"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs text-center font-bold">
              {error}
            </div>
          )}

          <button 
            type="submit"
            className="w-full bg-cyber-600 hover:bg-cyber-500 text-black font-black py-4 rounded-xl transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(0,188,212,0.4)] flex items-center justify-center gap-2 group mt-4"
          >
            {isLogin ? 'ACCESS TERMINAL' : 'CREATE IDENTITY'}
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              // Preserve email if switching modes
              setFormData(prev => ({ ...prev, username: '', password: '' }));
            }}
            className="text-gray-500 text-sm hover:text-white transition-colors underline decoration-dotted"
          >
            {isLogin ? "New operative? Create identity" : "Existing operative? Login"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default AuthPage;
