import React, { useState } from 'react';
import { UserProfile } from '../types';
import UserIdentityCard from '../components/UserIdentityCard';
import { ArrowLeft, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props {
  user: UserProfile;
  updateUser: (u: Partial<UserProfile>) => void;
}

const IdentityPage: React.FC<Props> = ({ user, updateUser }) => {
  const navigate = useNavigate();
  const [tempTheme, setTempTheme] = useState(user.idTheme || 'cyan');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API delay
    setTimeout(() => {
        updateUser({ idTheme: tempTheme });
        setIsSaving(false);
        navigate('/dashboard');
    }, 800);
  };

  return (
    <div className="min-h-screen pt-20 pb-10 flex flex-col items-center justify-center relative">
       {/* Background accent */}
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyber-500/5 blur-[100px] pointer-events-none" />

       <div className="container mx-auto px-4 max-w-4xl">
         <div className="flex items-center justify-between mb-12">
            <button 
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} /> Back to Terminal
            </button>
            <h1 className="text-2xl font-black italic tracking-tighter text-white">OPERATIVE IDENTITY</h1>
            <div className="w-24"></div> {/* Spacer */}
         </div>

         <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Controls & Info */}
            <div className="space-y-8 animate-in slide-in-from-left-8 duration-700">
               <div>
                 <h2 className="text-4xl font-bold text-white mb-4">Customize Your Access Card.</h2>
                 <p className="text-gray-400 leading-relaxed">
                   Your Trade Vision ID is your passport to the network. Select a holographic theme that represents your trading style. 
                   Team members (Founders/CEOs) have exclusive access to Gold and Obsidian tiers.
                 </p>
               </div>
               
               <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                 <h3 className="text-sm font-bold text-cyber-500 uppercase tracking-widest mb-4">Identity Data</h3>
                 <div className="space-y-4">
                    <div className="flex justify-between border-b border-gray-800 pb-2">
                       <span className="text-gray-500">Operative Name</span>
                       <span className="text-white font-mono">{user.username}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-800 pb-2">
                       <span className="text-gray-500">Clearance Level</span>
                       <span className="text-cyber-400 font-mono">{user.plan}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-800 pb-2">
                       <span className="text-gray-500">Join Date</span>
                       <span className="text-white font-mono">{new Date(user.joinDate).toLocaleDateString()}</span>
                    </div>
                 </div>
               </div>

               <button 
                 onClick={handleSave}
                 className="w-full py-4 bg-cyber-600 hover:bg-cyber-500 text-black font-black rounded-xl transition-all hover:scale-[1.02] shadow-[0_0_20px_rgba(0,188,212,0.3)] flex items-center justify-center gap-2"
               >
                 {isSaving ? 'ENCRYPTING...' : 'SAVE & RETURN'}
                 {!isSaving && <Save size={20} />}
               </button>
            </div>

            {/* Right: The Card */}
            <div className="flex justify-center animate-in zoom-in-95 duration-700 delay-100">
               <UserIdentityCard 
                 user={user} 
                 theme={tempTheme} 
                 showControls={true} 
                 onThemeChange={setTempTheme} 
               />
            </div>
         </div>
       </div>
    </div>
  );
};

export default IdentityPage;