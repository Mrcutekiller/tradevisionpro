import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserProfile, PlanTier, AccountType } from '../types';
import PlanCard from '../components/PlanCard';
import UserIdentityCard from '../components/UserIdentityCard';
import { ArrowRight, BarChart2, Shield, Zap, Instagram, Send, Eye, Mail, PlayCircle, Upload, CheckCircle, TrendingUp, Cpu, Users } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

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

// --- HERO DASHBOARD PREVIEW COMPONENTS ---

const HeroChartWidget = () => {
  const data = [
    { name: '1', value: 4000 },
    { name: '2', value: 3000 },
    { name: '3', value: 2000 },
    { name: '4', value: 2780 },
    { name: '5', value: 1890 },
    { name: '6', value: 2390 },
    { name: '7', value: 3490 },
    { name: '8', value: 4000 },
    { name: '9', value: 4500 },
    { name: '10', value: 4200 },
    { name: '11', value: 5000 },
    { name: '12', value: 5500 },
    { name: '13', value: 5200 },
    { name: '14', value: 5800 },
  ];

  return (
    <div className="absolute top-0 right-0 z-20 w-[380px] bg-[#0b1221]/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform hover:scale-105 transition-transform duration-500">
       <div className="flex justify-between items-start mb-4">
          <div>
             <h4 className="text-white font-bold text-sm">AI SIGNAL DETECTED</h4>
             <p className="text-xs text-gray-400">USD/JPY, USD/DP, 1M, BIH</p>
          </div>
          <div className="flex gap-2">
             <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400"><Upload size={14}/></div>
             <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400"><CheckCircle size={14}/></div>
          </div>
       </div>

       <div className="h-[120px] w-full relative">
          <ResponsiveContainer width="100%" height="100%">
             <AreaChart data={data}>
                <defs>
                   <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                   </linearGradient>
                </defs>
                <Area type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorVal)" />
             </AreaChart>
          </ResponsiveContainer>
          
          {/* Buy Button Overlay */}
          <div className="absolute top-1/2 right-4 transform -translate-y-1/2">
             <button className="bg-orange-500 hover:bg-orange-600 text-white font-black px-6 py-2 rounded-lg shadow-[0_0_20px_rgba(249,115,22,0.4)] text-sm">
                BUY
             </button>
          </div>
       </div>

       <div className="flex justify-between mt-4 text-[10px] text-gray-500 font-mono">
          <span>1.0401</span>
          <span>1.0420</span>
          <span>1.0435</span>
          <span>1.0485</span>
       </div>
    </div>
  );
};

const HeroMetricsWidget = () => {
   const data1 = [{ name: 'A', value: 33 }, { name: 'B', value: 67 }];
   const data2 = [{ name: 'A', value: 36 }, { name: 'B', value: 64 }];
   const data3 = [{ name: 'A', value: 79 }, { name: 'B', value: 21 }];
   
   const Ring = ({ data, color, label }: any) => (
      <div className="flex flex-col items-center">
         <div className="w-20 h-20 relative">
            <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                  <Pie data={data} innerRadius={28} outerRadius={36} startAngle={90} endAngle={-270} dataKey="value">
                     <Cell fill={color} />
                     <Cell fill="#1f2937" />
                  </Pie>
               </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center">
               <span className="text-white font-bold text-sm">{data[0].value}%</span>
            </div>
         </div>
         <span className="text-[9px] text-gray-500 uppercase font-bold mt-1">{label}</span>
      </div>
   );

   return (
      <div className="absolute bottom-0 right-10 z-10 w-[340px] bg-[#0b1221]/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-5 shadow-2xl">
         <h4 className="text-white font-bold text-xs mb-4">Performance Metrics</h4>
         <div className="flex justify-between">
            <Ring data={data1} color="#00bcd4" label="Win Rate" />
            <Ring data={data2} color="#f97316" label="Total Trades" />
            <Ring data={data3} color="#10b981" label="Avg Time" />
         </div>
      </div>
   );
};

const HeroUploadWidget = () => {
   return (
      <div className="absolute top-20 left-0 z-10 w-[240px] bg-[#0b1221]/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-5 shadow-xl">
         <div className="flex justify-between items-center mb-3">
            <span className="text-white font-bold text-xs">Upload Chart</span>
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
         </div>
         <div className="bg-gray-800/50 rounded-lg p-3 mb-3 border border-gray-700 border-dashed flex items-center justify-center h-20">
             <Upload size={20} className="text-gray-500" />
         </div>
         <button className="w-full bg-orange-500 text-white text-xs font-bold py-2 rounded-lg">
            Upload Chart
         </button>
      </div>
   );
};

const HeroPracticeWidget = () => {
   return (
      <div className="absolute bottom-32 left-8 z-0 w-[200px] bg-[#0b1221]/80 backdrop-blur-md border border-gray-700/30 rounded-2xl p-4 shadow-lg opacity-80 scale-90">
         <div className="flex justify-between items-center mb-2">
            <span className="text-gray-300 font-bold text-[10px]">Practice Metrics</span>
            <span className="text-orange-500 text-[10px]">P60 Identif</span>
         </div>
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border-4 border-gray-700 border-t-cyan-500"></div>
            <div className="w-10 h-10 rounded-full border-4 border-gray-700 border-t-orange-500"></div>
         </div>
         <button className="w-full mt-3 bg-orange-500/20 text-orange-500 text-[9px] font-bold py-1.5 rounded">
            Generate
         </button>
      </div>
   );
};

// --- MAIN LANDING PAGE COMPONENT ---

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

  const HexFeature = ({ icon: Icon, title, sub }: any) => (
      <div className="flex flex-col items-center gap-2">
         <div className="w-14 h-14 relative flex items-center justify-center">
            {/* CSS Hexagon shape via border or simple polygon clip */}
            <div className="absolute inset-0 bg-transparent border-2 border-orange-500/30 rotate-45 rounded-lg"></div>
            <Icon size={20} className="text-orange-500 relative z-10" />
         </div>
         <div className="text-center">
            <p className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">{title}</p>
            <p className="text-[9px] text-gray-600 font-mono">{sub}</p>
         </div>
      </div>
  );

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 font-sans overflow-x-hidden">
      
      {/* NAVBAR */}
      <nav className="flex justify-between items-center mb-16 md:mb-24 relative z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-orange-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.4)]">
            <TrendingUp className="text-white font-bold" size={20} />
          </div>
          <span className="text-xl md:text-2xl font-black tracking-tighter text-white italic">TradeVision <span className="text-orange-500">Pro</span></span>
        </div>
        <div className="flex gap-4 items-center">
           {/* Socials */}
           <div className="hidden md:flex gap-2 mr-4 border-r border-gray-800 pr-4">
              <a href="https://t.me/Prodbynatyy" target="_blank" className="p-2 text-gray-400 hover:text-cyan-500 transition"><Send size={18}/></a>
              <a href="https://instagram.com/prodby.natty" target="_blank" className="p-2 text-gray-400 hover:text-pink-500 transition"><Instagram size={18}/></a>
           </div>
           
          <button 
            onClick={handleAction}
            className="px-5 py-2 md:px-6 md:py-2.5 border border-gray-700 text-white font-bold rounded-lg hover:border-orange-500 hover:text-orange-500 transition text-sm"
          >
            {user ? 'Dashboard' : 'Sign In'}
          </button>
        </div>
      </nav>

      {/* HERO SECTION - REBUILT TO MATCH DESIGN */}
      <section className="relative grid lg:grid-cols-2 gap-12 lg:gap-8 items-center mb-32">
        
        {/* LEFT COLUMN: Typography & CTA */}
        <div className="z-20 text-center lg:text-left">
           <div className="inline-block px-3 py-1 bg-gray-900 border border-gray-800 rounded-full mb-6">
              <span className="text-[10px] md:text-xs font-bold text-cyan-400 tracking-widest uppercase">The Future of Trading</span>
           </div>
           
           <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[0.9] mb-6 tracking-tighter">
             <span className="text-white block">TRADE SMARTER,</span>
             <span className="text-white block">NOT HARDER.</span>
             <span className="text-cyan-400 block mt-2 text-4xl md:text-6xl">Zero Guesswork.</span>
           </h1>

           <p className="text-gray-400 text-sm md:text-lg mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed">
             Instant AI powered trading digests. Precision. Profit. Peace of mind. 
             Automated analysis that thinks like a pro trader.
           </p>

           <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-16">
              <button 
                onClick={handleAction}
                className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-xl shadow-[0_0_30px_rgba(249,115,22,0.3)] transition-all transform hover:scale-105"
              >
                Start Your Free Trial
              </button>
              <button 
                onClick={() => window.open('https://youtube.com', '_blank')}
                className="px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-black rounded-xl shadow-[0_0_30px_rgba(34,211,238,0.3)] transition-all flex items-center justify-center gap-2"
              >
                <PlayCircle size={20} /> Watch Demo Video
              </button>
           </div>

           {/* Features Hexagons */}
           <div className="flex justify-center lg:justify-start gap-8 md:gap-12">
              <HexFeature icon={Cpu} title="AI Grant" sub="ANALYSIS" />
              <HexFeature icon={Zap} title="Gamma API" sub="PRECISION" />
              <HexFeature icon={Shield} title="Real-Time" sub="TAGGING" />
           </div>

           <div className="mt-12 text-left">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Founders</p>
              <p className="text-xs text-gray-300">THE FUTURE OF TRADING IS HERE. AND IT'S INTELLIGENT.</p>
           </div>
        </div>

        {/* RIGHT COLUMN: DASHBOARD COMPOSITION */}
        <div className="relative h-[500px] w-full hidden lg:block perspective-1000">
           {/* Ambient Glows */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] -z-10" />
           <div className="absolute top-20 right-20 w-[300px] h-[300px] bg-orange-500/10 rounded-full blur-[80px] -z-10" />

           {/* The Widgets Composition */}
           <HeroChartWidget />
           <HeroMetricsWidget />
           <HeroUploadWidget />
           <HeroPracticeWidget />
        </div>

        {/* Mobile View of Composition (Simplified) */}
        <div className="lg:hidden relative h-[350px] w-full flex items-center justify-center">
            <div className="scale-75 origin-center relative w-[380px] h-[400px]">
               <HeroChartWidget />
            </div>
        </div>

      </section>

      {/* EMAIL BAR SECTION */}
      <section className="mb-24 max-w-4xl mx-auto">
         <div className="bg-[#0b1221] border border-gray-800 rounded-2xl p-8 relative overflow-hidden group shadow-2xl">
            {/* Visual Bar Accent */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-cyan-500 to-orange-500"></div>
            
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent opacity-50 group-hover:opacity-100 transition duration-500"></div>
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
                       className="w-full bg-black/50 border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:border-cyan-500 outline-none transition"
                       value={emailInput}
                       onChange={(e) => setEmailInput(e.target.value)}
                     />
                  </div>
                  <button onClick={handleJoinWithEmail} className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-6 py-2.5 rounded-lg transition whitespace-nowrap shadow-[0_0_15px_rgba(34,211,238,0.4)]">
                     Join Now
                  </button>
               </div>
            </div>
         </div>
      </section>

      {/* Pricing - ONLY SNIPER PRO */}
      <section className="mb-32">
        <h2 className="text-4xl font-black text-center mb-4 text-white">ACCESS MEMBERSHIP</h2>
        <p className="text-center text-gray-400 mb-12">Limited spots available for the beta program.</p>
        
        <div className="max-w-md mx-auto relative">
          {/* Animated Glow behind card */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-cyber-500/20 blur-2xl rounded-3xl -z-10 animate-pulse-slow"></div>
          
          <div className="relative">
             <PlanCard 
               name="SNIPER PRO" 
               price="$16" 
               tier={PlanTier.PRO}
               recommended={true}
               features={[
                 'Unlimited AI Signals',
                 'All Markets (Crypto, Indices, Forex)',
                 'Full Deep-Dive AI Analysis',
                 'Auto-Trade Beta Access',
                 'Premium Live Chart Feed',
                 'Priority Support',
                 'Exclusive Founder Access Card'
               ]}
               onSelect={() => handleUpgradeClick('Sniper Pro')}
             />
             
             {/* Visual Capacity Bar on the Card */}
             <div className="absolute bottom-[-15px] left-6 right-6 bg-[#0a0a0a] border border-gray-800 rounded-lg p-3 shadow-xl flex items-center gap-3">
                <div className="flex-1">
                   <div className="flex justify-between text-[9px] font-bold uppercase text-gray-400 mb-1">
                      <span>Server Capacity</span>
                      <span className="text-orange-500">87% Full</span>
                   </div>
                   <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-orange-500 to-red-500 w-[87%] rounded-full"></div>
                   </div>
                </div>
                <Users size={16} className="text-gray-500" />
             </div>
          </div>
        </div>
      </section>

      {/* Team & Footer */}
      <footer className="border-t border-gray-800 pt-20 pb-12 text-center relative overflow-hidden bg-gradient-to-b from-transparent to-black">
        {/* Ambient Glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-cyan-500/5 blur-[120px] pointer-events-none" />

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