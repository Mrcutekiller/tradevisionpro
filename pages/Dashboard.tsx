import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, TradeSignal, PlanTier, AccountType } from '../types';
import { analyzeChartWithGemini } from '../services/geminiService';
import TradingJourney from '../components/TradingJourney';
import TradingChart from '../components/TradingChart';
import { 
  Upload, Activity, RefreshCw, Eye, 
  Target, ShieldAlert, LayoutGrid, 
  History, User as UserIcon, LogOut, ChevronRight, BarChart2,
  Share2, Copy, Check, X, Settings, ArrowUpRight, ArrowDownRight, Menu, Scan, CreditCard,
  Zap, TrendingUp, Layers, Award, Bell
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';

interface Props {
  user: UserProfile;
  updateUser: (u: Partial<UserProfile>) => void;
}

// --- NEW WIDGETS BASED ON DESIGN ---

const PerformanceMetricsWidget: React.FC<{ user: UserProfile }> = ({ user }) => {
   const history = user.tradeHistory || [];
   const totalTrades = history.length;
   const winCount = history.filter(t => t.status === 'WIN').length;
   const winRate = totalTrades > 0 ? Math.round((winCount / totalTrades) * 100) : 0;
   
   // Mock data for display if no history, else real calculations
   const displayWinRate = totalTrades > 0 ? winRate : 0;
   const displayTrades = totalTrades; // Cap for visual if needed
   const displayAvgTime = 79; // Mock for "Avg Time" as we don't track duration yet

   const Ring = ({ value, color, label }: { value: number, color: string, label: string }) => {
      const data = [{ value: value }, { value: 100 - value }];
      return (
         <div className="flex flex-col items-center">
            <div className="w-16 h-16 md:w-20 md:h-20 relative">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                     <Pie 
                        data={data} 
                        innerRadius="70%" 
                        outerRadius="100%" 
                        startAngle={90} 
                        endAngle={-270} 
                        dataKey="value"
                        stroke="none"
                     >
                        <Cell fill={color} />
                        <Cell fill="#1f2937" />
                     </Pie>
                  </PieChart>
               </ResponsiveContainer>
               <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white font-bold text-xs md:text-sm">{value}%</span>
               </div>
            </div>
            <span className="text-[9px] md:text-[10px] text-gray-500 uppercase font-bold mt-2">{label}</span>
         </div>
      );
   };

   return (
      <div className="bg-[#0b101a]/90 backdrop-blur-md border border-gray-800 rounded-2xl p-5 shadow-lg w-full">
         <h4 className="text-white font-bold text-xs mb-4">Performance Metrics</h4>
         <div className="flex justify-between items-center px-2">
            <Ring value={displayWinRate} color="#06b6d4" label="WIN RATE" />
            <Ring value={displayTrades > 100 ? 100 : displayTrades} color="#f97316" label="TOTAL TRADES" />
            <Ring value={displayAvgTime} color="#10b981" label="AVG TIME" />
         </div>
      </div>
   );
};

const ActiveSignalWidget: React.FC<{ signal: TradeSignal | null }> = ({ signal }) => {
   if (!signal) return (
      <div className="bg-[#0b101a]/90 backdrop-blur-md border border-gray-800 rounded-2xl p-5 shadow-lg w-full min-h-[180px] flex flex-col justify-center items-center text-center">
          <Activity className="text-gray-600 mb-2" />
          <p className="text-gray-500 text-xs">No Active Signal</p>
          <p className="text-gray-600 text-[10px]">Upload a chart to scan</p>
      </div>
   );

   const isBuy = signal.direction === 'BUY';
   // Strict Buy = Green, Sell = Red
   const mainColor = isBuy ? '#22c55e' : '#ef4444'; // Green-500 : Red-500
   const gradientId = isBuy ? "colorBuy" : "colorSell";
   
   // Mock sparkline data
   const data = [
      { v: 40 }, { v: 30 }, { v: 20 }, { v: 27 }, { v: 18 }, { v: 23 }, 
      { v: 34 }, { v: 40 }, { v: 45 }, { v: 42 }, { v: 50 }, { v: 55 }, 
      { v: 52 }, { v: 58 }, { v: 65 }, { v: 60 }, { v: 70 }
   ];
   // Flip data for sell visualization
   const chartData = isBuy ? data : data.map(d => ({ v: 100 - d.v }));

   return (
      <div className="bg-[#0b101a]/90 backdrop-blur-md border border-gray-800 rounded-2xl p-5 shadow-lg w-full relative overflow-hidden group">
         <div className="flex justify-between items-start mb-2 relative z-10">
            <div>
               <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-0.5">AI SIGNAL DETECTED</h4>
               <p className="text-[10px] text-gray-400 font-mono">
                  {signal.pair}, {signal.timeframe}, {signal.strategy.split(' ')[0]}
               </p>
            </div>
            <div className="flex gap-2">
               <div className="w-7 h-7 rounded bg-gray-800 flex items-center justify-center text-gray-400">
                  <Upload size={12} />
               </div>
               <div className="w-7 h-7 rounded bg-gray-800 flex items-center justify-center text-gray-400">
                  <Check size={12} />
               </div>
            </div>
         </div>

         {/* Sparkline Chart */}
         <div className="h-[100px] w-full -mx-2 relative z-0 mt-2">
            <ResponsiveContainer width="110%" height="100%">
               <AreaChart data={chartData}>
                  <defs>
                     <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={mainColor} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={mainColor} stopOpacity={0}/>
                     </linearGradient>
                  </defs>
                  <Area 
                     type="monotone" 
                     dataKey="v" 
                     stroke={mainColor} 
                     strokeWidth={2} 
                     fillOpacity={1} 
                     fill={`url(#${gradientId})`} 
                  />
               </AreaChart>
            </ResponsiveContainer>
         </div>

         {/* Buy/Sell Button & Price Labels */}
         <div className="absolute bottom-5 right-5 z-20">
            <button className={`font-black text-white px-6 py-2 rounded-lg text-sm shadow-lg tracking-wide ${isBuy ? 'bg-green-500 shadow-green-500/20' : 'bg-red-500 shadow-red-500/20'}`}>
               {signal.direction}
            </button>
         </div>

         <div className="flex justify-between mt-2 text-[9px] text-gray-600 font-mono relative z-10">
            <span>{signal.entry.toFixed(2)}</span>
            <span>{signal.tp1.toFixed(2)}</span>
            <span>{signal.tp2.toFixed(2)}</span>
         </div>
      </div>
   );
}


// --- EXISTING COMPONENTS (Refined) ---

// Share Card Component
const SignalCard: React.FC<{ signal: TradeSignal; appName: string }> = ({ signal, appName }) => {
  const isBuy = signal.direction === 'BUY';
  const colorClass = isBuy ? 'text-green-400' : 'text-red-400';
  const bgClass = isBuy ? 'bg-green-500' : 'bg-red-500';
  const borderClass = isBuy ? 'border-green-500' : 'border-red-500';

  return (
    <div className="relative w-full bg-[#0a0a0a] rounded-3xl border border-gray-800 overflow-hidden shadow-2xl transform transition-all select-none font-mono backdrop-blur-xl">
      {/* Holographic header */}
      <div className={`h-2 ${bgClass} shadow-[0_0_20px] ${isBuy ? 'shadow-green-500/50' : 'shadow-red-500/50'}`}></div>
      
      <div className="p-6 relative">
        {/* Background mesh */}
        <div className="absolute inset-0 opacity-10" 
             style={{backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', backgroundSize: '20px 20px'}}>
        </div>

        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-3xl font-black text-white tracking-tighter">{signal.pair}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-gray-400">{signal.timeframe}</span>
                <span className={`text-xs font-bold ${isBuy ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'} px-2 py-0.5 rounded uppercase tracking-widest flex items-center gap-1`}>
                  {isBuy ? <ArrowUpRight size={12}/> : <ArrowDownRight size={12}/>} {signal.direction}
                </span>
              </div>
            </div>
            <div className={`w-12 h-12 rounded-xl ${bgClass}/20 border ${borderClass}/50 flex items-center justify-center`}>
              {isBuy ? <Target className="text-green-400" /> : <Target className="text-red-400" />}
            </div>
          </div>

          {/* Confidence Meter */}
          <div className="mb-6">
             <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider mb-1 text-gray-400">
                <span>AI Confidence</span>
                <span className={signal.confidence > 80 ? 'text-green-400' : 'text-yellow-400'}>{signal.confidence}%</span>
             </div>
             <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${signal.confidence > 80 ? 'bg-green-500' : 'bg-yellow-500'}`} 
                  style={{ width: `${signal.confidence}%` }}
                />
             </div>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-end border-b border-gray-800 pb-2">
              <span className="text-xs text-gray-500 uppercase">Entry</span>
              <span className="text-xl text-white font-bold">{signal.entry}</span>
            </div>
            <div className="flex justify-between items-end border-b border-gray-800 pb-2">
               <div>
                  <span className="text-xs text-red-500 uppercase block">Stop Loss</span>
                  <span className="text-[10px] text-gray-600">-{signal.slPips} pips</span>
               </div>
              <span className="text-xl text-red-400 font-bold">{signal.sl}</span>
            </div>
            <div className="flex justify-between items-end border-b border-gray-800 pb-2">
               <div>
                  <span className="text-xs text-green-500 uppercase block">TP 1 (1:1)</span>
                  <span className="text-[10px] text-gray-600">+{signal.tpPips} pips</span>
               </div>
              <span className="text-xl text-green-400 font-bold">{signal.tp1}</span>
            </div>
            <div className="flex justify-between items-end border-b border-gray-800 pb-2">
               <div>
                  <span className="text-xs text-green-500 uppercase block">TP 2 (1:2)</span>
                  <span className="text-[10px] text-gray-600">+{signal.tpPips * 2} pips</span>
               </div>
              <span className="text-xl text-green-400 font-bold">{signal.tp2}</span>
            </div>
            <div className="flex justify-between items-end border-b border-gray-800 pb-2 bg-green-500/5 px-2 rounded">
               <div>
                  <span className="text-xs text-green-400 uppercase block font-bold">TP 3 (1:3)</span>
                  <span className="text-[10px] text-gray-600">+{signal.tpPips * 3} pips</span>
               </div>
              <span className="text-xl text-green-400 font-bold">{signal.tp3}</span>
            </div>
          </div>

          <div className="bg-gray-900/50 rounded-xl p-4 mb-4 border border-gray-800">
             <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] text-cyber-500 uppercase font-bold flex items-center gap-1">
                   <Zap size={10} /> Strategy
                </span>
                <span className="text-[10px] text-white bg-gray-800 px-2 py-0.5 rounded border border-gray-700">
                   {signal.strategy || 'Price Action'}
                </span>
             </div>
            <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Breakdown</p>
            <p className="text-xs text-gray-300 italic leading-relaxed whitespace-pre-wrap">{signal.breakdown}</p>
          </div>

          <div className="flex justify-between items-center pt-2">
            <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">{new Date(signal.timestamp).toLocaleDateString()}</span>
            <span className="text-xs font-black italic text-white flex items-center gap-1">
              <Eye size={12} className="text-cyber-500"/> {appName}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC<Props> = ({ user, updateUser }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [activeView, setActiveView] = useState<'OVERVIEW' | 'JOURNEY' | 'SETTINGS'>('OVERVIEW');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastSignal, setLastSignal] = useState<TradeSignal | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [settingsForm, setSettingsForm] = useState(user.settings);
  
  // Header Dropdown State
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  
  // Share Modal State
  const [showShareModal, setShowShareModal] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Mobile Menu State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Stats Logic
  const totalSignals = user.signalsUsedLifetime;
  // Calculate most traded pair
  const pairCounts = (user.tradeHistory || []).reduce((acc: any, val: any) => {
    acc[val.pair] = (acc[val.pair] || 0) + 1;
    return acc;
  }, {});
  const mostTradedPair = Object.keys(pairCounts).reduce((a, b) => pairCounts[a] > pairCounts[b] ? a : b, 'N/A');

  // --- DAILY REMINDER LOGIC ---
  useEffect(() => {
    const checkDailyReminder = () => {
        const lastRemindedDate = localStorage.getItem('last_tp_reminder_date');
        const today = new Date().toDateString();

        if (lastRemindedDate !== today) {
            // Trigger Notification
            setTimeout(() => {
                showToast("🔔 Daily Reminder: Stick to your TP Plan!", 'info');
                showToast("Target 1:3 RR for consistent growth.", 'success');
            }, 2000);
            localStorage.setItem('last_tp_reminder_date', today);
        }
    };
    checkDailyReminder();
  }, [showToast]);


  // --- Helper to map AI symbol to TradingView Symbol ---
  const getTradingViewSymbol = (pair: string): string => {
    const p = pair.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (p.includes('XAU') || p.includes('GOLD')) return 'OANDA:XAUUSD';
    if (p.includes('NDX') || p.includes('NASDAQ') || p.includes('US100')) return 'CAPITALCOM:US100';
    if (p.includes('DJI') || p.includes('US30')) return 'CAPITALCOM:US30';
    if (p.includes('BTC')) return 'BINANCE:BTCUSDT';
    if (p.includes('ETH')) return 'BINANCE:ETHUSDT';
    return `FX:${p}`;
  };

  // If signal exists, use its pair, otherwise default
  const activeSymbol = lastSignal ? getTradingViewSymbol(lastSignal.pair) : 'OANDA:XAUUSD';

  const checkLimits = () => {
    if (user.plan === PlanTier.FREE && user.signalsUsedLifetime >= 5) {
      return "Free limit reached (5/5). Upgrade your plan to continue.";
    }
    return null;
  };

  const calculateLots = (slPrice: number, entryPrice: number, pair: string): { lots: number, slPips: number } => {
    const isGold = pair.toUpperCase().includes('XAU') || pair.toUpperCase().includes('GOLD');
    const isJpy = pair.toUpperCase().includes('JPY');
    let slPips = 0;
    const slDiff = Math.abs(entryPrice - slPrice);
    
    if (isGold) {
      slPips = slDiff * 10; 
      if (slPips < 1) slPips = 1;
    } else {
        if (isJpy) slPips = slDiff * 100;
        else slPips = slDiff * 10000;
    }
    
    if (slPips === 0) slPips = 10;

    const riskAmount = user.settings.accountSize * (user.settings.riskPercentage / 100);
    const lotSize = riskAmount / (slPips * 10); 
    
    return { lots: parseFloat(lotSize.toFixed(2)), slPips: parseFloat(slPips.toFixed(1)) };
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const limitError = checkLimits();
    if (limitError) {
      setErrorMsg(limitError);
      showToast(limitError, 'error');
      return;
    }

    setIsAnalyzing(true);
    setLastSignal(null);
    setPreviewImage(null); // Reset temporarily

    const reader = new FileReader();
    reader.onload = async (event) => {
        const result = event.target?.result as string;
        setPreviewImage(result); 
        
        const base64 = result.split(',')[1];
        
        try {
            const analysis = await analyzeChartWithGemini(base64);

            if (!analysis.isSetupValid) {
                setErrorMsg("No valid setup detected. Please upload a clearer chart.");
                showToast("Analysis failed: No valid setup detected", 'warning');
                setIsAnalyzing(false);
                return;
            }

            const entry = analysis.entry;
            const sl = analysis.sl;
            const riskDist = Math.abs(entry - sl);
            
            let finalTp1, finalTp2, finalTp3;
            const isJpy = analysis.pair.toUpperCase().includes('JPY');
            const isGold = analysis.pair.toUpperCase().includes('XAU');
            const precision = isJpy ? 3 : isGold ? 2 : 5;

            if (analysis.direction === 'BUY') {
                finalTp1 = entry + riskDist; 
                finalTp2 = entry + (riskDist * 2); 
                finalTp3 = entry + (riskDist * 3);
            } else {
                finalTp1 = entry - riskDist; 
                finalTp2 = entry - (riskDist * 2); 
                finalTp3 = entry - (riskDist * 3);
            }
            
            finalTp1 = Number(finalTp1.toFixed(precision));
            finalTp2 = Number(finalTp2.toFixed(precision));
            finalTp3 = Number(finalTp3.toFixed(precision));
            const finalEntry = Number(entry.toFixed(precision));
            const finalSl = Number(sl.toFixed(precision));

            const { lots, slPips } = calculateLots(finalSl, finalEntry, analysis.pair);
            
            let tp1Pips = 0;
            const tp1Diff = Math.abs(finalTp1 - finalEntry);
            
            if (analysis.pair.toUpperCase().includes('XAU')) {
                tp1Pips = tp1Diff * 10;
            } else if (analysis.pair.toUpperCase().includes('JPY')) {
                tp1Pips = tp1Diff * 100;
            } else {
                tp1Pips = tp1Diff * 10000;
            }
            
            const riskAmount = user.settings.accountSize * (user.settings.riskPercentage / 100);
            
            const newSignal: TradeSignal = {
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            ...analysis,
            entry: finalEntry,
            sl: finalSl,
            tp1: finalTp1,
            tp2: finalTp2,
            tp3: finalTp3,
            direction: analysis.direction as 'BUY' | 'SELL',
            slPips,
            tpPips: parseFloat(tp1Pips.toFixed(1)),
            lotSize: lots,
            riskAmount: parseFloat(riskAmount.toFixed(2)),
            rewardTp1: parseFloat(riskAmount.toFixed(2)),
            rewardTp2: parseFloat((riskAmount * 2).toFixed(2)),
            rewardTp3: parseFloat((riskAmount * 3).toFixed(2)),
            reasoning: analysis.reasoning,
            confidence: analysis.confidence || 85,
            strategy: analysis.strategy || 'Price Action',
            breakdown: analysis.breakdown || analysis.reasoning
            };

            setLastSignal(newSignal);
            setIsAnalyzing(false);
            showToast("Signal Synced to Market Feed", 'success');
            
            const tradeLogItem = {
                id: newSignal.id,
                date: new Date().toISOString(),
                pair: newSignal.pair,
                type: newSignal.direction,
                entry: newSignal.entry,
                exit: 0,
                pnl: 0,
                status: 'PENDING' as const,
                timeframe: newSignal.timeframe,
                sl: newSignal.sl,
                tp1: newSignal.tp1,
                tp2: newSignal.tp2,
                tp3: newSignal.tp3,
                reasoning: newSignal.reasoning,
                riskAmount: newSignal.riskAmount,
                lotSize: newSignal.lotSize
            };
            
            const history = user.tradeHistory || [];
            updateUser({
            signalsUsedLifetime: user.plan === PlanTier.FREE ? user.signalsUsedLifetime + 1 : user.signalsUsedLifetime,
            signalsUsedToday: user.signalsUsedToday + 1,
            tradeHistory: [tradeLogItem, ...history]
            });

        } catch (err) {
            console.error(err);
            setErrorMsg("Error generating signal. Please try again.");
            showToast("Critical Error: Failed to analyze image.", 'error');
            setIsAnalyzing(false);
        }
    };
    reader.readAsDataURL(file);
  };

  const resetAnalysis = () => {
    setLastSignal(null);
    setPreviewImage(null);
    setIsAnalyzing(false);
    setErrorMsg(null);
  }

  const saveSettings = () => {
    updateUser({ settings: settingsForm });
    showToast("System configuration updated", 'success');
  };

  const handleCopyShare = () => {
    // ... share logic
    navigator.clipboard.writeText("Trade Vision Signal...");
    setIsCopied(true);
    showToast("Signal copied to clipboard", 'success');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleNavClick = (id: 'OVERVIEW' | 'JOURNEY' | 'SETTINGS') => {
    setActiveView(id);
    setIsMobileMenuOpen(false);
    setIsProfileMenuOpen(false); // Close profile if open
  };

  const handleLogout = () => {
    localStorage.removeItem('sniper_user');
    window.location.reload();
  };

  const NavItem = ({ id, icon: Icon, label }: any) => (
    <button 
      onClick={() => handleNavClick(id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all mb-1 ${activeView === id ? 'bg-cyber-500 text-black font-bold shadow-lg shadow-cyber-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
    >
      <Icon size={20} />
      <span className="text-sm">{label}</span>
      {activeView === id && <ChevronRight size={16} className="ml-auto opacity-70"/>}
    </button>
  );

  return (
    <div className="min-h-screen bg-transparent text-gray-200 flex flex-col md:flex-row font-sans relative">
      
      {/* MOBILE OVERLAY BACKDROP */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden animate-in fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`
        fixed top-0 left-0 z-50 h-screen w-[280px] bg-[#0a0a0a]/90 backdrop-blur-xl border-r border-gray-800 flex flex-col transition-transform duration-300 ease-in-out
        md:sticky
        ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl shadow-cyber-500/10' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-8 flex items-center justify-between">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-cyber-500 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(0,188,212,0.3)]">
               <Eye className="text-black" size={24}/>
             </div>
             <span className="font-black italic text-xl tracking-tighter text-white">TRADE<span className="text-cyber-500">VISION</span></span>
           </div>
           <button 
             onClick={() => setIsMobileMenuOpen(false)}
             className="md:hidden text-gray-400 hover:text-white"
           >
             <X size={24} />
           </button>
        </div>
        
        <nav className="flex-1 px-6 py-4 overflow-y-auto">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-4 px-2">Main Menu</p>
          <NavItem id="OVERVIEW" icon={LayoutGrid} label="Dashboard" />
          <NavItem id="JOURNEY" icon={History} label="Trading Journey" />
          <NavItem id="SETTINGS" icon={Settings} label="Settings" />
          
          <div className="my-6 border-t border-gray-800"></div>
          
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-4 px-2">Personal</p>
          <button 
             onClick={() => navigate('/id')}
             className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-gray-400 hover:text-white hover:bg-white/5 mb-1"
          >
             <UserIcon size={20} />
             <span className="text-sm">My Identity Card</span>
          </button>
        </nav>

        <div className="p-6 mt-auto">
           <div className="bg-gray-900/50 rounded-xl p-3 border border-gray-800 text-xs text-gray-500 text-center">
              v2.5.0 • Pro Build
           </div>
        </div>
      </aside>

      {/* MAIN CONTENT - Background is transparent to let 3D canvas show */}
      <main className="flex-1 overflow-y-auto h-screen bg-transparent flex flex-col relative z-10">
        
        {/* Mobile Header */}
        <header className="md:hidden h-16 border-b border-gray-800 flex items-center justify-between px-6 bg-[#0a0a0a]/90 backdrop-blur-md sticky top-0 z-30">
           <div className="flex items-center gap-3">
             <button onClick={() => setIsMobileMenuOpen(true)} className="text-gray-300 hover:text-white">
               <Menu size={24} />
             </button>
             <span className="font-bold text-white text-lg">Trade Vision</span>
           </div>
           
           <div className={`w-8 h-8 rounded-full bg-${user.idTheme || 'cyan'}-500 flex items-center justify-center text-black font-bold shadow-lg`}>
              {user.username.charAt(0)}
           </div>
        </header>

        <div className="p-4 md:p-10 max-w-[1600px] mx-auto w-full">
          
          {/* TOP HEADER SECTION WITH AVATAR */}
          <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500 relative z-20">
             <div>
                <h1 className="text-3xl md:text-4xl font-black text-white mb-2 drop-shadow-lg">Welcome back, {user.username.split(' ')[0]}</h1>
                <p className="text-gray-400 text-sm md:text-base">Your professional command center is ready.</p>
             </div>
             
             <div className="flex items-center gap-4 w-full md:w-auto">
                {/* Balance Pill */}
                <div className="hidden md:flex flex-col items-end mr-4">
                   <p className="text-[10px] uppercase text-gray-500 font-bold">Balance</p>
                   <p className="text-xl font-mono font-bold text-white bg-black/40 px-3 py-1 rounded-lg border border-gray-800 backdrop-blur-sm">
                      ${user.settings.accountSize.toLocaleString()}
                   </p>
                </div>

                {/* Notification Bell */}
                <button className="bg-gray-900/80 backdrop-blur border border-gray-800 p-3 rounded-full hover:bg-gray-800 transition shadow-lg relative">
                    <Bell size={18} className="text-gray-400" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                </button>

                {/* USER DROPDOWN */}
                <div className="relative">
                   <button 
                     onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                     className="flex items-center gap-3 bg-gray-900/80 backdrop-blur hover:bg-gray-800 border border-gray-700 hover:border-cyber-500/50 rounded-full p-1 pr-4 transition-all"
                   >
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-${user.idTheme || 'cyan'}-400 to-${user.idTheme || 'cyan'}-600 flex items-center justify-center text-black font-bold shadow-lg`}>
                         {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="text-left hidden sm:block">
                         <p className="text-xs font-bold text-white leading-tight">{user.username}</p>
                         <p className="text-[9px] text-cyber-500 uppercase">{user.plan} Operative</p>
                      </div>
                   </button>

                   {/* Dropdown Menu */}
                   {isProfileMenuOpen && (
                      <div className="absolute right-0 top-14 w-56 bg-[#0e0e0e]/95 backdrop-blur-xl border border-gray-800 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in zoom-in-95 origin-top-right z-50">
                         <div className="p-2 space-y-1">
                            <button onClick={() => navigate('/id')} className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-white/5 text-sm text-gray-300 hover:text-white flex items-center gap-3 transition-colors">
                               <CreditCard size={16} className="text-cyber-500"/> My Identity Card
                            </button>
                            <button onClick={() => handleNavClick('SETTINGS')} className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-white/5 text-sm text-gray-300 hover:text-white flex items-center gap-3 transition-colors">
                               <Settings size={16} className="text-gray-500"/> Settings
                            </button>
                            <div className="h-px bg-gray-800 my-1"></div>
                            <button onClick={handleLogout} className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-red-500/10 text-sm text-red-400 hover:text-red-300 flex items-center gap-3 transition-colors">
                               <LogOut size={16} /> Sign Out
                            </button>
                         </div>
                      </div>
                   )}
                </div>
             </div>
          </div>

          {activeView === 'OVERVIEW' && (
            <div className="space-y-8 animate-in fade-in duration-500">
               
               {/* MAIN GRID - FLIPPED LAYOUT */}
               <div className="grid lg:grid-cols-3 gap-8">
                  
                  {/* LEFT COLUMN: VISION AI PROCESSOR (SMALLER) */}
                  <div className="flex flex-col gap-6 lg:col-span-1">
                      
                      {/* NEW STATS WIDGETS */}
                      <PerformanceMetricsWidget user={user} />
                      <ActiveSignalWidget signal={lastSignal} />

                      {/* AI SCANNER BOX */}
                      <div className="bg-[#0e0e0e]/90 backdrop-blur-md border border-gray-800 rounded-3xl p-6 flex flex-col relative overflow-hidden min-h-[300px] shadow-2xl">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyber-500 to-purple-600"></div>
                        
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Activity size={20} className="text-cyber-500" /> Vision AI
                            </h3>
                            {isAnalyzing && <span className="text-[10px] text-cyber-400 font-mono animate-pulse">SCANNING...</span>}
                        </div>

                        <div className="flex-1 flex flex-col gap-6">
                            {/* UPLOAD STATE - ONLY IF NO PREVIEW */}
                            {!previewImage && !lastSignal && (
                            <div 
                                className="border-2 border-dashed border-gray-800 hover:border-cyber-500/30 rounded-2xl flex-1 flex flex-col items-center justify-center cursor-pointer transition-all group bg-gray-900/30 hover:bg-gray-900/60"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                                <div className="w-12 h-12 rounded-full bg-cyber-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition shadow-[0_0_30px_rgba(0,188,212,0.1)]">
                                    {isAnalyzing ? <RefreshCw className="animate-spin text-cyber-500" size={24} /> : <Upload className="text-cyber-500" size={24} />}
                                </div>
                                <p className="text-white font-bold text-sm text-center">Upload Chart</p>
                            </div>
                            )}

                            {/* PREVIEW & ANALYSIS STATE */}
                            {previewImage && (
                            <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 flex-1">
                                {/* Chart Display */}
                                <div className="relative w-full h-40 rounded-xl overflow-hidden border border-gray-700 bg-black shadow-lg">
                                    <img src={previewImage} alt="Analysis Target" className="w-full h-full object-cover opacity-80" />
                                    
                                    {/* Scanning Effect */}
                                    {isAnalyzing && (
                                    <div className="absolute inset-0 z-10 bg-cyber-500/5 pointer-events-none">
                                        <div className="absolute top-0 left-0 w-full h-[2px] bg-cyber-400 shadow-[0_0_15px_#00bcd4] animate-scan z-20"></div>
                                    </div>
                                    )}
                                    
                                    {!isAnalyzing && (
                                    <button 
                                        onClick={resetAnalysis}
                                        className="absolute top-2 right-2 bg-black/60 hover:bg-red-500/80 hover:text-white text-gray-400 p-1.5 rounded-lg backdrop-blur-sm transition-all border border-gray-700"
                                    >
                                        <X size={14} />
                                    </button>
                                    )}
                                </div>
                            </div>
                            )}
                        </div>
                      </div>
                  </div>

                  {/* RIGHT COLUMN: BIG CHART & SIGNAL DETAILS (LARGER) */}
                  <div className="flex flex-col gap-8 lg:col-span-2">
                     
                     {/* Live Chart Widget (BIGGER) */}
                     <div className="bg-[#0e0e0e]/90 backdrop-blur-md border border-gray-800 rounded-3xl p-6 h-[500px] flex flex-col relative overflow-hidden shadow-lg">
                        <div className="flex justify-between items-center mb-6">
                           <h3 className="text-base font-bold text-gray-400 flex items-center gap-2 uppercase tracking-wide">
                              <BarChart2 size={18}/> Pro Live Market Feed
                           </h3>
                           <div className="flex items-center gap-4">
                               {/* Confidence Badge for Chart */}
                               {lastSignal && (
                                 <div className="flex items-center gap-2 bg-gray-900 px-3 py-1 rounded-full border border-gray-800">
                                    <span className="text-[10px] text-gray-500 font-bold uppercase">Confidence</span>
                                    <div className="flex gap-0.5">
                                       {[1,2,3,4,5].map(i => (
                                          <div key={i} className={`w-1 h-2 rounded-full ${i <= (lastSignal.confidence/20) ? 'bg-green-500' : 'bg-gray-700'}`}></div>
                                       ))}
                                    </div>
                                 </div>
                               )}

                               <div className="flex items-center gap-2">
                                  <span className="flex h-2 w-2 relative">
                                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                     <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                  </span>
                                  <span className="text-[10px] font-bold text-green-500 uppercase">Live</span>
                               </div>
                           </div>
                        </div>
                        
                        <div className="flex-1 w-full min-h-0 relative rounded-xl overflow-hidden bg-black/50 border border-gray-800">
                           <TradingChart symbol={activeSymbol} signal={lastSignal} />
                        </div>
                     </div>

                     {/* Signal Details Expanded */}
                     {lastSignal && (
                        <div className="animate-in fade-in slide-in-from-bottom-8">
                           <div className="flex flex-col md:flex-row gap-6">
                              
                              {/* Left: The Card */}
                              <div className="w-full md:w-1/2">
                                 <SignalCard signal={lastSignal} appName="Trade Vision Pro" />
                              </div>

                              {/* Right: Detailed Breakdown & Metrics */}
                              <div className="w-full md:w-1/2 space-y-4">
                                 
                                 {/* TP3 High Reward Highlight */}
                                 <div className="bg-gradient-to-r from-green-900/40 to-green-600/10 border border-green-500/30 rounded-2xl p-6 flex items-center justify-between backdrop-blur-md">
                                    <div>
                                       <p className="text-xs text-green-400 font-bold uppercase tracking-widest mb-1">Max Potential (1:3 RR)</p>
                                       <h3 className="text-2xl font-black text-white">+${lastSignal.rewardTp3}</h3>
                                       <p className="text-[10px] text-gray-400">Targeting {lastSignal.tp3}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                                       <TrendingUp className="text-green-400" />
                                    </div>
                                 </div>

                                 {/* Strategy Logic Text */}
                                 <div className="bg-[#0e0e0e]/90 backdrop-blur-md border border-gray-800 rounded-2xl p-6">
                                    <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                                       <Zap size={16} className="text-yellow-500" /> Execution Logic
                                    </h4>
                                    <p className="text-sm text-gray-400 leading-relaxed">
                                       {lastSignal.breakdown}
                                    </p>
                                 </div>

                                 <button 
                                   onClick={() => setShowShareModal(true)}
                                   className="w-full py-4 bg-cyber-600 hover:bg-cyber-500 text-black font-black rounded-xl transition-all shadow-lg hover:shadow-cyber-500/20 flex items-center justify-center gap-2"
                                 >
                                    <Share2 size={20} /> Share Signal
                                 </button>
                              </div>
                           </div>
                        </div>
                     )}

                  </div>

               </div>
            </div>
          )}

          {activeView === 'JOURNEY' && <TradingJourney user={user} updateUser={updateUser} />}

          {activeView === 'SETTINGS' && (
             <div className="max-w-3xl mx-auto bg-[#0e0e0e]/95 backdrop-blur-xl border border-gray-800 rounded-3xl p-6 md:p-10 animate-in slide-in-from-right-8 shadow-2xl">
                <h3 className="text-xl md:text-2xl font-black text-white mb-8 border-b border-gray-800 pb-6 flex items-center gap-3">
                   <Settings className="text-cyber-500"/> Account Configuration
                </h3>
                {/* ... existing settings form ... */}
                <div className="space-y-8">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                         <label className="text-xs text-gray-500 uppercase font-bold tracking-wider block mb-3">Account Balance ($)</label>
                         <input 
                            type="number" 
                            className="w-full bg-black/50 border border-gray-700 rounded-xl p-4 text-white focus:border-cyber-500 focus:ring-1 focus:ring-cyber-500 transition outline-none font-mono text-lg" 
                            value={settingsForm.accountSize}
                            onChange={(e) => setSettingsForm({...settingsForm, accountSize: parseFloat(e.target.value)})}
                         />
                      </div>
                      <div>
                         <label className="text-xs text-gray-500 uppercase font-bold tracking-wider block mb-3">Risk per Trade (%)</label>
                         <input 
                            type="number" 
                            className="w-full bg-black/50 border border-gray-700 rounded-xl p-4 text-white focus:border-cyber-500 focus:ring-1 focus:ring-cyber-500 transition outline-none font-mono text-lg" 
                            value={settingsForm.riskPercentage}
                            onChange={(e) => setSettingsForm({...settingsForm, riskPercentage: parseFloat(e.target.value)})}
                         />
                      </div>
                   </div>
                   <div>
                       <label className="text-xs text-gray-500 uppercase font-bold tracking-wider block mb-3">Broker Account Type</label>
                       <div className="grid grid-cols-3 gap-4">
                          {[AccountType.STANDARD, AccountType.RAW, AccountType.PRO].map((type) => (
                             <button
                                key={type}
                                onClick={() => setSettingsForm({...settingsForm, accountType: type})}
                                className={`p-4 rounded-xl border text-xs md:text-sm font-bold transition ${settingsForm.accountType === type ? 'bg-cyber-500 text-black border-cyber-500' : 'bg-black/50 border-gray-700 text-gray-400 hover:border-gray-500'}`}
                             >
                                {type}
                             </button>
                          ))}
                       </div>
                   </div>
                   <button onClick={saveSettings} className="w-full bg-cyber-600 text-black font-black text-lg py-4 rounded-xl hover:bg-cyber-500 transition shadow-lg shadow-cyber-500/20 mt-4">
                      Save System Configuration
                   </button>
                </div>
             </div>
          )}

        </div>
      </main>
      
      {/* ... Share Modal ... */}
      {showShareModal && lastSignal && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setShowShareModal(false)}
        >
           <div 
             className="flex flex-col items-center gap-6 w-full max-w-sm"
             onClick={e => e.stopPropagation()}
           >
              {/* Card Preview */}
              <div className="animate-in zoom-in-95 duration-300 w-full flex justify-center scale-90">
                <SignalCard signal={lastSignal} appName="Trade Vision Pro" />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col md:flex-row gap-4 w-full justify-center">
                <button 
                  onClick={handleCopyShare}
                  className={`px-8 py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all duration-300 shadow-lg ${isCopied ? 'bg-green-500 text-black shadow-green-500/20' : 'bg-white text-black hover:bg-gray-200 shadow-white/20'}`}
                >
                  {isCopied ? <Check size={18} /> : <Copy size={18} />}
                  {isCopied ? 'COPIED' : 'COPY'}
                </button>
                <button 
                  onClick={() => setShowShareModal(false)} 
                  className="px-6 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold text-sm transition"
                >
                  CLOSE
                </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;