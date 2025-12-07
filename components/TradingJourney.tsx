import React, { useState } from 'react';
import { UserProfile, TradeLog } from '../types';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { TrendingUp, Target, Plus, Edit2, Trash2, X, Save, Filter, Trophy, CheckCircle, XCircle, Minus, Clock, AlertTriangle, Activity } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface Props {
  user: UserProfile;
  updateUser: (u: Partial<UserProfile>) => void;
}

const TradingJourney: React.FC<Props> = ({ user, updateUser }) => {
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingTradeId, setEditingTradeId] = useState<string | null>(null);
  const [tradeToDeleteId, setTradeToDeleteId] = useState<string | null>(null);
  
  // Form State
  const [formData, setFormData] = useState<Partial<TradeLog>>({
    pair: 'XAUUSD',
    type: 'BUY',
    entry: 0,
    exit: 0,
    status: 'BE',
    pnl: 0
  });

  const history = user.tradeHistory || [];

  // Stats Calculation
  const totalTrades = history.length;
  const winCount = history.filter(t => t.status === 'WIN').length;
  const lossCount = history.filter(t => t.status === 'LOSS').length;
  const winRateNum = totalTrades > 0 ? (winCount / totalTrades) * 100 : 0;
  const winRate = winRateNum.toFixed(1);
  const totalPnL = history.reduce((acc, curr) => acc + (curr.pnl || 0), 0);
  
  // Equity Curve Calculation (Balance over time)
  // We assume: Current Balance - Total PnL = Starting Balance (relative to tracked history)
  const currentBalance = user.settings.accountSize;
  const startingBalance = currentBalance - totalPnL;
  
  let runningBalance = startingBalance;
  
  // Create dataset: Start point (0) + trades
  const chartData = [
    { name: 0, value: startingBalance, date: 'Start' },
    ...[...history].reverse().map((t, i) => {
      runningBalance += (t.pnl || 0);
      return { 
        name: i + 1, 
        value: Number(runningBalance.toFixed(2)), 
        date: new Date(t.date).toLocaleDateString() 
      };
    })
  ];

  // Circular Chart calculations
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (winRateNum / 100) * circumference;

  const handleOpenModal = (trade?: TradeLog) => {
    if (trade) {
      setEditingTradeId(trade.id);
      setFormData(trade);
    } else {
      setEditingTradeId(null);
      setFormData({
        pair: 'XAUUSD',
        type: 'BUY',
        entry: 0,
        exit: 0,
        status: 'BE',
        pnl: 0,
        date: new Date().toISOString()
      });
    }
    setIsModalOpen(true);
  };

  const initiateDelete = (id: string) => {
    setTradeToDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (!tradeToDeleteId) return;

    const tradeToDelete = history.find(t => t.id === tradeToDeleteId);
    let newBalance = user.settings.accountSize;

    // Revert balance impact if trade was not pending
    if (tradeToDelete && tradeToDelete.status !== 'PENDING') {
        newBalance -= (tradeToDelete.pnl || 0);
    }

    const updatedHistory = history.filter(t => t.id !== tradeToDeleteId);
    updateUser({ 
        tradeHistory: updatedHistory,
        settings: { ...user.settings, accountSize: parseFloat(newBalance.toFixed(2)) }
    });
    showToast('Trade record permanently deleted', 'info');
    setIsDeleteModalOpen(false);
    setTradeToDeleteId(null);
  };

  const handleSave = () => {
    if (!formData.pair || !formData.entry) {
        showToast('Please enter at least Pair and Entry Price', 'error');
        return;
    }

    let finalPnl = Number(formData.pnl || 0);
    
    // Create new trade object
    const tradePayload: TradeLog = {
      id: editingTradeId || crypto.randomUUID(),
      date: formData.date || new Date().toISOString(),
      pair: formData.pair,
      type: formData.type as 'BUY' | 'SELL',
      entry: Number(formData.entry),
      exit: Number(formData.exit || 0),
      pnl: finalPnl,
      status: formData.status as 'WIN' | 'LOSS' | 'BE' | 'PENDING',
      timeframe: formData.timeframe,
      reasoning: formData.reasoning
    };

    let newHistory;
    let newBalance = user.settings.accountSize;

    if (editingTradeId) {
      // Logic: Revert old trade's PnL from balance, then add new trade's PnL
      const originalTrade = history.find(t => t.id === editingTradeId);
      
      if (originalTrade && originalTrade.status !== 'PENDING') {
         newBalance -= (originalTrade.pnl || 0);
      }

      if (tradePayload.status !== 'PENDING') {
         newBalance += finalPnl;
      }

      newHistory = history.map(t => t.id === editingTradeId ? tradePayload : t);
    } else {
      // Logic: Just add new PnL if not pending
      if (tradePayload.status !== 'PENDING') {
          newBalance += finalPnl;
      }
      newHistory = [tradePayload, ...history];
    }
    
    // Safety check
    if (isNaN(newBalance)) newBalance = user.settings.accountSize;

    updateUser({ 
        tradeHistory: newHistory,
        settings: { ...user.settings, accountSize: parseFloat(newBalance.toFixed(2)) }
    });
    showToast(editingTradeId ? 'Trade log updated' : 'New trade logged successfully', 'success');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      
      {/* HEADER SECTION WITH LIVE WIN RATE */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-800 pb-6">
         <div>
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
               <Activity className="text-cyber-500" /> Trading Journey
            </h2>
            <p className="text-gray-400 text-sm mt-1">Track your performance and master your psychology.</p>
         </div>

         {/* PROMINENT LIVE WIN RATE BADGE */}
         <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex items-center gap-5 shadow-xl shadow-cyber-500/5">
            <div>
               <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block">Live Win Rate</span>
               <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full animate-pulse ${winRateNum >= 50 ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <span className="text-xs font-bold text-gray-300">REAL-TIME</span>
               </div>
            </div>
            <div className="h-10 w-px bg-gray-800"></div>
            <div>
               <span className={`text-4xl font-black tracking-tighter ${winRateNum >= 50 ? 'text-green-400' : 'text-red-400'}`}>
                  {winRate}%
               </span>
            </div>
         </div>
      </div>

      {/* 1. KEY METRICS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Net Profit', value: `${totalPnL >= 0 ? '+' : ''}$${totalPnL.toLocaleString()}`, color: totalPnL >= 0 ? 'text-green-400' : 'text-red-400' },
          { label: 'Avg Win', value: `+$${totalTrades && winCount ? (history.filter(t => t.pnl > 0).reduce((a,b) => a + b.pnl, 0) / winCount).toFixed(0) : '0'}`, color: 'text-green-400' },
          { label: 'Total Trades', value: totalTrades, color: 'text-white' },
          { label: 'Profit Factor', value: lossCount > 0 ? (winCount / lossCount).toFixed(2) : '∞', color: 'text-yellow-400' }
        ].map((stat, i) => (
          <div key={i} className="bg-void-900 border border-gray-800 p-5 rounded-2xl shadow-lg hover:border-gray-700 transition">
            <p className="text-gray-500 text-[10px] uppercase tracking-wider font-bold mb-2">{stat.label}</p>
            <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* 2. EQUITY CURVE */}
        <div className="lg:col-span-2 bg-void-900 border border-gray-800 rounded-2xl p-6 shadow-lg flex flex-col min-h-[350px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-white font-bold flex items-center gap-2">
              <TrendingUp size={20} className="text-cyber-500"/> Equity Curve
            </h3>
            <div className="flex gap-2">
               <span className="text-[10px] bg-white/5 px-2 py-1 rounded text-gray-400">Account Growth</span>
            </div>
          </div>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#555" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(val) => val === 0 ? 'Start' : `#${val}`}
                />
                <YAxis 
                  stroke="#555" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(val) => `$${val.toLocaleString()}`} 
                  domain={['auto', 'auto']}
                />
                <Tooltip 
                  contentStyle={{background: '#050505', border: '1px solid #333', borderRadius: '8px'}} 
                  itemStyle={{color: '#fff'}}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Balance']}
                  labelFormatter={(label) => label === 0 ? 'Initial Balance' : `Trade #${label}`}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#f97316" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorEquity)" 
                  animationDuration={1000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. PERFORMANCE HUB (Win Rate) */}
        <div className="bg-void-900 border border-gray-800 rounded-2xl p-6 shadow-lg flex flex-col">
           <h3 className="text-white font-bold mb-6 flex items-center gap-2">
              <Trophy size={20} className="text-cyber-500"/> Performance Hub
           </h3>
           <div className="flex-1 flex flex-col items-center justify-center gap-8">
              
              {/* Circular Win Rate Gauge */}
              <div className="relative w-48 h-48 flex items-center justify-center">
                 <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="96"
                      cy="96"
                      r={radius}
                      stroke="#1f2937"
                      strokeWidth="8"
                      fill="transparent"
                    />
                    <circle
                      cx="96"
                      cy="96"
                      r={radius}
                      stroke={winRateNum >= 50 ? '#10b981' : '#ef4444'}
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                    />
                 </svg>
                 <div className="absolute flex flex-col items-center">
                    <span className={`text-4xl font-black ${winRateNum >= 50 ? 'text-green-400' : 'text-red-400'}`}>
                      {winRate}%
                    </span>
                    <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mt-1">Win Rate</span>
                 </div>
              </div>

              {/* Detailed Stats */}
              <div className="w-full grid grid-cols-2 gap-4">
                 <div className="bg-green-500/5 border border-green-500/10 p-4 rounded-xl text-center">
                    <span className="block text-2xl font-bold text-green-400">{winCount}</span>
                    <span className="text-[10px] uppercase text-green-500/70 font-bold tracking-wider">Wins</span>
                 </div>
                 <div className="bg-red-500/5 border border-red-500/10 p-4 rounded-xl text-center">
                    <span className="block text-2xl font-bold text-red-400">{lossCount}</span>
                    <span className="text-[10px] uppercase text-red-500/70 font-bold tracking-wider">Losses</span>
                 </div>
              </div>

              <div className="w-full pt-4 border-t border-gray-800">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Best Trade</span>
                    <span className="text-green-400 font-mono font-bold">
                       +${Math.max(...history.map(t => t.pnl || 0), 0)}
                    </span>
                  </div>
              </div>
           </div>
        </div>
      </div>

      {/* 4. DATA TABLE */}
      <div className="bg-void-900 border border-gray-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="p-6 border-b border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
           <div>
              <h3 className="text-lg font-bold text-white">Trade Log</h3>
              <p className="text-xs text-gray-500">Manage and track your trading history</p>
           </div>
           <div className="flex gap-2 w-full md:w-auto">
              <button className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-gray-700 transition">
                 <Filter size={16} /> Filter
              </button>
              <button 
                onClick={() => handleOpenModal()} 
                className="px-4 py-2 bg-cyber-600 text-black rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-cyber-500 transition shadow-[0_0_15px_rgba(249,115,22,0.3)]"
              >
                 <Plus size={16} /> Log Trade
              </button>
           </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider">
                <th className="p-4 font-bold">Date</th>
                <th className="p-4 font-bold">Pair</th>
                <th className="p-4 font-bold">Type</th>
                <th className="p-4 font-bold text-right">Entry</th>
                <th className="p-4 font-bold text-right">Exit</th>
                <th className="p-4 font-bold text-right">P/L</th>
                <th className="p-4 font-bold text-center">Status</th>
                <th className="p-4 font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 text-sm">
              {history.length === 0 ? (
                <tr>
                   <td colSpan={8} className="p-8 text-center text-gray-500 italic">No trades recorded yet. Start your journey.</td>
                </tr>
              ) : (
                history.map((trade) => (
                  <tr key={trade.id} className={`transition-all duration-300 group border-b border-gray-800/50 ${
                      trade.status === 'WIN' ? 'hover:bg-green-500/5 hover:shadow-[inset_2px_0_0_#4ade80]' : 
                      trade.status === 'LOSS' ? 'hover:bg-red-500/5 hover:shadow-[inset_2px_0_0_#ef4444]' : 
                      'hover:bg-yellow-500/5 hover:shadow-[inset_2px_0_0_#eab308]'
                    }`}>
                    <td className="p-4 text-gray-300 font-mono text-xs">{new Date(trade.date).toLocaleDateString()}</td>
                    <td className="p-4 font-bold text-white">{trade.pair}</td>
                    <td className="p-4">
                       <span className={`px-2 py-1 rounded text-[10px] font-bold ${trade.type === 'BUY' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                          {trade.type}
                       </span>
                    </td>
                    <td className="p-4 text-right font-mono text-gray-300">{trade.entry}</td>
                    <td className="p-4 text-right font-mono text-gray-300">{trade.exit || '-'}</td>
                    <td className={`p-4 text-right font-mono font-bold ${trade.pnl > 0 ? 'text-green-400' : trade.pnl < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                       {trade.pnl > 0 ? '+' : ''}{trade.pnl}
                    </td>
                    <td className="p-4 text-center">
                       <div className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black border uppercase tracking-wider ${
                          trade.status === 'WIN' ? 'border-green-500/30 text-green-400 bg-green-500/10 shadow-[0_0_10px_rgba(74,222,128,0.1)]' :
                          trade.status === 'LOSS' ? 'border-red-500/30 text-red-400 bg-red-500/10 shadow-[0_0_10px_rgba(239,68,68,0.1)]' :
                          'border-yellow-500/30 text-yellow-400 bg-yellow-500/10'
                       }`}>
                          {trade.status === 'WIN' && <CheckCircle size={10} strokeWidth={3} />}
                          {trade.status === 'LOSS' && <XCircle size={10} strokeWidth={3} />}
                          {(trade.status === 'BE' || trade.status === 'PENDING') && <Minus size={10} strokeWidth={3} />}
                          {trade.status}
                       </div>
                    </td>
                    <td className="p-4">
                       <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleOpenModal(trade)} className="p-1.5 hover:bg-white/10 rounded text-cyber-400 transition-colors"><Edit2 size={14}/></button>
                          <button onClick={() => initiateDelete(trade.id)} className="p-1.5 hover:bg-white/10 rounded text-red-400 transition-colors"><Trash2 size={14}/></button>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT MODAL */}
      {isModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-void-900 border border-gray-800 rounded-2xl w-full max-w-lg shadow-2xl animate-in zoom-in-95">
               <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                     {editingTradeId ? <Edit2 size={20} className="text-cyber-500"/> : <Plus size={20} className="text-cyber-500"/>}
                     {editingTradeId ? 'Edit Trade Log' : 'Log New Trade'}
                  </h3>
                  <button onClick={() => setIsModalOpen(false)}><X className="text-gray-500 hover:text-white" size={24}/></button>
               </div>
               
               <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="text-[10px] uppercase text-gray-500 font-bold mb-1 block">Pair / Asset</label>
                        <input 
                           className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white text-sm focus:border-cyber-500 outline-none"
                           value={formData.pair}
                           onChange={e => setFormData({...formData, pair: e.target.value.toUpperCase()})}
                           placeholder="e.g. XAUUSD"
                        />
                     </div>
                     <div>
                        <label className="text-[10px] uppercase text-gray-500 font-bold mb-1 block">Direction</label>
                        <select 
                           className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white text-sm focus:border-cyber-500 outline-none"
                           value={formData.type}
                           onChange={e => setFormData({...formData, type: e.target.value as any})}
                        >
                           <option value="BUY">BUY</option>
                           <option value="SELL">SELL</option>
                        </select>
                     </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                     <div>
                        <label className="text-[10px] uppercase text-gray-500 font-bold mb-1 block">Entry Price</label>
                        <input type="number" step="any"
                           className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white text-sm focus:border-cyber-500 outline-none"
                           value={formData.entry}
                           onChange={e => setFormData({...formData, entry: parseFloat(e.target.value)})}
                        />
                     </div>
                     <div>
                        <label className="text-[10px] uppercase text-gray-500 font-bold mb-1 block">Exit Price</label>
                        <input type="number" step="any"
                           className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white text-sm focus:border-cyber-500 outline-none"
                           value={formData.exit}
                           onChange={e => setFormData({...formData, exit: parseFloat(e.target.value)})}
                        />
                     </div>
                     <div>
                        <label className="text-[10px] uppercase text-gray-500 font-bold mb-1 block">Real P/L ($)</label>
                        <input type="number" step="any"
                           className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white text-sm focus:border-cyber-500 outline-none"
                           value={formData.pnl}
                           onChange={e => setFormData({...formData, pnl: parseFloat(e.target.value)})}
                        />
                     </div>
                  </div>

                  <div>
                     <label className="text-[10px] uppercase text-gray-500 font-bold mb-1 block">Trade Status</label>
                     <div className="flex gap-2">
                        {['WIN', 'LOSS', 'BE'].map(status => (
                           <button
                              key={status}
                              onClick={() => setFormData({...formData, status: status as any})}
                              className={`flex-1 py-2 rounded-lg text-xs font-bold border transition ${
                                 formData.status === status 
                                    ? status === 'WIN' ? 'bg-green-500 text-black border-green-500' 
                                    : status === 'LOSS' ? 'bg-red-500 text-black border-red-500'
                                    : 'bg-yellow-500 text-black border-yellow-500'
                                    : 'bg-transparent border-gray-700 text-gray-400 hover:border-gray-500'
                              }`}
                           >
                              {status}
                           </button>
                        ))}
                     </div>
                  </div>
               </div>

               <div className="p-6 border-t border-gray-800">
                  <button 
                     onClick={handleSave}
                     className="w-full py-3 bg-cyber-600 hover:bg-cyber-500 text-black font-black rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                     <Save size={18} /> SAVE RECORD
                  </button>
               </div>
            </div>
         </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && (
         <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in">
             <div className="bg-[#1a0505] border border-red-500/30 rounded-2xl w-full max-w-sm p-6 shadow-[0_0_50px_rgba(239,68,68,0.2)] animate-in zoom-in-95">
                 <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                       <AlertTriangle size={32} className="text-red-500" />
                    </div>
                    <h3 className="text-xl font-black text-white mb-2">Confirm Deletion</h3>
                    <p className="text-sm text-gray-400">
                       This action will permanently remove this trade log and recalculate your balance. This cannot be undone.
                    </p>
                 </div>
                 
                 <div className="flex gap-3">
                    <button 
                       onClick={() => setIsDeleteModalOpen(false)}
                       className="flex-1 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold transition"
                    >
                       Cancel
                    </button>
                    <button 
                       onClick={confirmDelete}
                       className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition shadow-lg shadow-red-500/20"
                    >
                       Delete
                    </button>
                 </div>
             </div>
         </div>
      )}

    </div>
  );
};

export default TradingJourney;