import React, { useState, useEffect } from 'react';
    import { UserProfile, PlanTier } from '../types';
    
    const AdminPanel: React.FC = () => {
      const [users, setUsers] = useState<UserProfile[]>([]);
    
      useEffect(() => {
        // In a real app, fetch from DB. 
        // Here we just grab the local user for demo purposes as we only have client side storage
        const stored = localStorage.getItem('sniper_user');
        if (stored) {
          setUsers([JSON.parse(stored)]);
        }
      }, []);
    
      const updatePlan = (id: string, plan: PlanTier) => {
        const updatedUsers = users.map(u => {
            if (u.id === id) {
                const updated = { ...u, plan };
                // Persist back to local for the demo flow
                localStorage.setItem('sniper_user', JSON.stringify(updated));
                return updated;
            }
            return u;
        });
        setUsers(updatedUsers);
      };
    
      const resetSignals = (id: string) => {
         const updatedUsers = users.map(u => {
            if (u.id === id) {
                const updated = { ...u, signalsUsedLifetime: 0, signalsUsedToday: 0 };
                localStorage.setItem('sniper_user', JSON.stringify(updated));
                return updated;
            }
            return u;
        });
        setUsers(updatedUsers);
      }
    
      return (
        <div className="container mx-auto px-4 py-8">
           <h1 className="text-3xl font-bold text-cyber-500 mb-8">ADMIN COMMAND CENTER</h1>
           
           <div className="glass-panel p-6 rounded-xl overflow-x-auto">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="text-gray-500 border-b border-gray-800">
                       <th className="p-3">User</th>
                       <th className="p-3">ID</th>
                       <th className="p-3">Current Plan</th>
                       <th className="p-3">Signals Used</th>
                       <th className="p-3">Actions</th>
                    </tr>
                 </thead>
                 <tbody>
                    {users.map(u => (
                       <tr key={u.id} className="border-b border-gray-800 hover:bg-white/5">
                          <td className="p-3 font-bold">{u.username}</td>
                          <td className="p-3 font-mono text-xs text-gray-500">{u.id.substring(0,8)}...</td>
                          <td className="p-3">
                             <span className={`px-2 py-1 rounded text-xs ${u.plan === 'PRO' ? 'bg-red-500/20 text-red-500' : 'bg-cyan-500/20 text-cyan-500'}`}>
                                {u.plan}
                             </span>
                          </td>
                          <td className="p-3">{u.signalsUsedLifetime}</td>
                          <td className="p-3 flex gap-2">
                             <select 
                                onChange={(e) => updatePlan(u.id, e.target.value as PlanTier)}
                                value={u.plan}
                                className="bg-black border border-gray-700 rounded text-xs p-1"
                             >
                                {Object.values(PlanTier).map(p => <option key={p} value={p}>{p}</option>)}
                             </select>
                             <button 
                               onClick={() => resetSignals(u.id)}
                               className="bg-gray-700 hover:bg-gray-600 text-white text-xs px-2 py-1 rounded"
                             >
                                Reset Limit
                             </button>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      );
    };
    
    export default AdminPanel;
    