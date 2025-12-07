import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserProfile, PlanTier, AccountType } from '../types';
import PlanCard from '../components/PlanCard';
import UserIdentityCard from '../components/UserIdentityCard';
import { ArrowRight, BarChart2, Shield, Zap, Instagram, Send, Eye, Mail } from 'lucide-react';

interface Props {
  user: UserProfile | null;
}

// Mock profiles for Team section
const FOUNDER_PROFILE: UserProfile = {
  id: "@mrcute_killer",
  username: "Biruk Fikru",
  email: "founder@tradevision.pro",
  plan: PlanTier.PRO,
  signalsUsedLifetime: 9999,
  signalsUsedToday: 9999,
  joinDate: "2023-01-01",
  settings: {
    accountSize: 0,
    riskPercentage: 0,
    accountType: AccountType.PRO // Founder
  },
  idTheme: 'founder',
  tradeHistory: []
};

const CEO_PROFILE: UserProfile = {
  id: "@Prodbynatyy",
  username: "Naty",
  email: "ceo@tradevision.pro",
  plan: PlanTier.PRO,
  signalsUsedLifetime: 9999,
  signalsUsedToday: 9999,
  joinDate: "2023-01-01",
  settings: {
    accountSize: 0,
    riskPercentage: 0,
    accountType: AccountType.STANDARD // CEO
  },
  idTheme: 'ceo',
  tradeHistory: []
};

const LandingPage: React.FC<Props> = ({ user }) => {
  const navigate = useNavigate();
  const [emailInput, setEmailInput] = useState('');

  const handleUpgradeClick = (planName: string) => {
    window.open(`https://t.me/Prodbynatyy?text=I want to upgrade to ${planName}`, '_blank');
  };

  const handleAction = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  const handleJoinWithEmail = () => {
    if (user) {
        navigate('/dashboard');
    } else {
        navigate('/auth', { state: { email: emailInput } });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <nav className="flex justify-between items-center mb-16">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-cyber-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_cyan]">
            <Eye className="text-black font-bold" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-white neon-text italic">TRADE VISION</span>
        </div>
        <div className="flex gap-4">
           {/* Socials */}
           <a href="https://t.me/Prodbynatyy" target="_blank" className="p-2 hover:text-cyber-500 transition"><Send size={20}/></a>
           <a href="https://instagram.com/prodby.natty" target="_blank" className="p-2 hover:text-pink-500 transition"><Instagram size={20}/></a>
           
          <button 
            onClick={handleAction}
            className="hidden md:block px-6 py-2 bg-cyber-500 text-black font-bold rounded hover:bg-cyber-400 transition shadow-[0_0_10px_rgba(0,188,212,0.5)]"
          >
            {user ? 'Open Console' : 'Sign In'}
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center mb-24 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyber-500/10 rounded-full blur-[100px] -z-10" />
        
        <div className="inline-block border border-cyber-500/30 rounded-full px-4 py-1 mb-6 bg-black/40 backdrop-blur-sm">
           <span className="text-cyber-400 text-sm font-bold tracking-widest uppercase">The Next Gen of Signals</span>
        </div>

        <h1 className="text-5xl md:text-8xl font-black mb-6 leading-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500">TRADE</span>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyber-400 to-cyber-600 ml-4">VISION</span>
        </h1>
        
        <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
          Turn screenshots into precision trades. AI-powered structural analysis with automated risk calculation.
        </p>
        
        <div className="flex justify-center gap-4">
           <button 
             onClick={handleAction}
             className="group relative px-8 py-4 bg-cyber-500 text-black font-bold rounded-lg overflow-hidden transition-all hover:bg-cyber-400 hover:scale-105 shadow-[0_0_30px_rgba(0,188,212,0.4)]"
           >
             <span className="relative z-10 flex items-center gap-2">
               Analyze Chart Free <ArrowRight className="group-hover:translate-x-1 transition-transform" />
             </span>
           </button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid md:grid-cols-3 gap-8 mb-24">
        {[
          { icon: <Zap size={32} />, title: 'Vision Logic', desc: 'Detects Market Structure, Liquidity Sweeps, and FVGs instantly from any chart image.' },
          { icon: <Shield size={32} />, title: 'Risk Guard', desc: 'Auto-calculates lot size based on your specific account balance & risk %.' },
          { icon: <BarChart2 size={32} />, title: 'Live Vision', desc: 'Integrated real-time charting for instant verification of setups.' },
        ].map((f, i) => (
          <div key={i} className="glass-panel p-8 rounded-xl border-t border-cyber-500/20 hover:border-cyber-500/50 transition duration-300 hover:-translate-y-2">
            <div className="text-cyber-500 mb-4 bg-cyber-500/10 w-fit p-3 rounded-lg">{f.icon}</div>
            <h3 className="text-xl font-bold mb-2">{f.title}</h3>
            <p className="text-gray-400">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Pricing */}
      <section className="mb-32">
        <h2 className="text-4xl font-black text-center mb-4">MEMBERSHIP TIERS</h2>
        <p className="text-center text-gray-400 mb-16">Select your level of access</p>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <PlanCard 
            name="Sniper Basic" 
            price="$14" 
            tier={PlanTier.BASIC}
            features={['5 Signals / Day', 'AI Lot Calculation', 'Basic Pairs + Gold']}
            missing={['Auto-Trade', 'Advanced Analysis', 'Crypto & Indices']}
            onSelect={() => handleUpgradeClick('Sniper Basic')}
          />
          <PlanCard 
            name="Sniper Advanced" 
            price="$29" 
            tier={PlanTier.ADVANCED}
            recommended={true}
            features={['20 Signals / Day', 'AI Lot Calculation', 'All Pairs + Gold + Indices', 'Live Chart', 'Backtesting']}
            missing={['Auto-Trade']}
            onSelect={() => handleUpgradeClick('Sniper Advanced')}
          />
          <PlanCard 
            name="Sniper Pro" 
            price="$49" 
            tier={PlanTier.PRO}
            features={['Unlimited Signals', 'All Markets (Crypto inc.)', 'Full AI Analysis', 'Auto-Trade (Beta Access)']}
            onSelect={() => handleUpgradeClick('Sniper Pro')}
          />
        </div>
      </section>

      {/* EMAIL BAR SECTION - Added per request */}
      <section className="mb-20 max-w-4xl mx-auto">
         <div className="glass-panel rounded-2xl p-8 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-cyber-500/10 to-transparent opacity-50 group-hover:opacity-100 transition duration-500"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
               <div className="text-left">
                  <h3 className="text-2xl font-black text-white italic">JOIN THE VISION</h3>
                  <p className="text-gray-400 text-sm mt-1">Get early access to signals and AI updates.</p>
               </div>
               <div className="flex w-full md:w-auto gap-2">
                  <div className="relative flex-1 md:w-64">
                     <Mail className="absolute left-3 top-3 text-gray-500" size={18} />
                     <input 
                       type="email" 
                       placeholder="Enter your email" 
                       className="w-full bg-black/50 border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:border-cyber-500 outline-none transition"
                       value={emailInput}
                       onChange={(e) => setEmailInput(e.target.value)}
                     />
                  </div>
                  <button onClick={handleJoinWithEmail} className="bg-cyber-500 hover:bg-cyber-400 text-black font-bold px-6 py-2.5 rounded-lg transition whitespace-nowrap">
                     Join Now
                  </button>
               </div>
            </div>
         </div>
      </section>

      {/* Team & Footer */}
      <footer className="border-t border-gray-800 pt-20 pb-12 text-center relative overflow-hidden bg-gradient-to-b from-transparent to-black">
        {/* Ambient Glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-cyber-500/5 blur-[120px] pointer-events-none" />

        <h3 className="text-3xl font-black mb-12 text-white">THE VISIONARIES</h3>
        
        <div className="flex flex-col md:flex-row justify-center items-center gap-16 mb-20 max-w-4xl mx-auto">
          <div className="group">
             <UserIdentityCard user={FOUNDER_PROFILE} isTeamMember />
             <div className="mt-6 flex justify-center">
                <a href="https://instagram.com/mrcute_killer" target="_blank" className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 transition text-sm text-gray-300 hover:text-white">
                  <Instagram size={16}/> @mrcute_killer
                </a>
             </div>
          </div>
          <div className="group">
             <UserIdentityCard user={CEO_PROFILE} isTeamMember />
             <div className="mt-6 flex flex-col items-center gap-2">
                <a href="https://t.me/Prodbynatyy" target="_blank" className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 transition text-sm text-gray-300 hover:text-white">
                  <Send size={16}/> @Prodbynatyy
                </a>
                <a href="https://instagram.com/prodby.natty" target="_blank" className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 transition text-sm text-gray-300 hover:text-white">
                  <Instagram size={16}/> @prodby.natty
                </a>
             </div>
          </div>
        </div>
        
        <p className="text-gray-600 text-sm">&copy; 2024 Trade Vision Pro. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;