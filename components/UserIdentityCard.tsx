import React, { useRef, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { Shield, Copy, Check, QrCode, Crown, Fingerprint, Share2, Download, Link as LinkIcon, X } from 'lucide-react';

interface Props {
  user: UserProfile;
  isTeamMember?: boolean;
  theme?: string; // Controlled theme
  showControls?: boolean; // Whether to show color picker
  onThemeChange?: (theme: string) => void;
}

const THEMES: Record<string, any> = {
  cyan: {
    bg: 'bg-gradient-to-br from-[#1c0a00] via-[#5a2000] to-[#1c0a00]', // Updated to Orange base
    border: 'border-cyber-500/30',
    accent: 'text-cyber-400',
    glow: 'shadow-[0_0_40px_rgba(249,115,22,0.3)]', // Orange glow
    sashColor: 'bg-cyber-500',
    sashText: 'text-black',
    ringColor: 'border-cyber-400',
    hex: '#f97316' // Orange hex
  },
  emerald: {
    bg: 'bg-gradient-to-br from-[#022405] via-[#005a15] to-[#022405]',
    border: 'border-emerald-500/30',
    accent: 'text-emerald-400',
    glow: 'shadow-[0_0_40px_rgba(52,211,153,0.3)]',
    sashColor: 'bg-emerald-500',
    sashText: 'text-black',
    ringColor: 'border-emerald-400',
    hex: '#34d399'
  },
  violet: {
    bg: 'bg-gradient-to-br from-[#1a0224] via-[#4e005a] to-[#1a0224]',
    border: 'border-violet-500/30',
    accent: 'text-violet-400',
    glow: 'shadow-[0_0_40px_rgba(167,139,250,0.3)]',
    sashColor: 'bg-violet-500',
    sashText: 'text-black',
    ringColor: 'border-violet-400',
    hex: '#a78bfa'
  },
  rose: {
    bg: 'bg-gradient-to-br from-[#240202] via-[#5a0000] to-[#240202]',
    border: 'border-rose-500/30',
    accent: 'text-rose-400',
    glow: 'shadow-[0_0_40px_rgba(251,113,133,0.3)]',
    sashColor: 'bg-rose-500',
    sashText: 'text-black',
    ringColor: 'border-rose-400',
    hex: '#fb7185'
  },
  amber: {
    bg: 'bg-gradient-to-br from-[#241a02] via-[#5a4300] to-[#241a02]',
    border: 'border-amber-500/30',
    accent: 'text-amber-400',
    glow: 'shadow-[0_0_40px_rgba(251,191,36,0.3)]',
    sashColor: 'bg-amber-500',
    sashText: 'text-black',
    ringColor: 'border-amber-400',
    hex: '#fbbf24'
  },
  // Special themes
  founder: {
    bg: 'bg-gradient-to-br from-[#1a1200] via-[#5c4d00] to-[#1a1200]',
    border: 'border-yellow-500/30',
    accent: 'text-yellow-400',
    glow: 'shadow-[0_0_40px_rgba(234,179,8,0.3)]',
    sashColor: 'bg-yellow-500',
    sashText: 'text-black',
    ringColor: 'border-yellow-400',
    hex: '#eab308'
  },
  ceo: {
    bg: 'bg-gradient-to-br from-[#200505] via-[#5a0000] to-[#200505]',
    border: 'border-red-500/30',
    accent: 'text-red-400',
    glow: 'shadow-[0_0_40px_rgba(239,68,68,0.3)]',
    sashColor: 'bg-red-500',
    sashText: 'text-black',
    ringColor: 'border-red-400',
    hex: '#ef4444'
  }
};

const UserIdentityCard: React.FC<Props> = ({ user, isTeamMember, theme, showControls = false, onThemeChange }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  
  // Use passed theme or user preference, fallback to cyan (now orange)
  const activeThemeKey = isTeamMember 
    ? (user.settings.accountType === 'Pro' ? 'founder' : 'ceo') 
    : (theme || user.idTheme || 'cyan');
    
  const styles = THEMES[activeThemeKey] || THEMES['cyan'];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -15; 
    const rotateY = ((x - centerX) / centerX) * 15;
    const rotateZ = ((x - centerX) / centerX) * 2;

    setRotation({ x: rotateX, y: rotateY, z: rotateZ });
  };

  const handleMouseEnter = () => setIsHovered(true);
  
  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0, z: 0 });
    setIsHovered(false);
  };

  const copyToClipboard = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(user.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyLinkToClipboard = () => {
    const shareUrl = `https://tradevision.pro/u/${user.username.replace(/\s+/g, '').toLowerCase()}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayName = user.username.toUpperCase();
  const displayId = user.id;

  return (
    <div className="flex flex-col items-center z-20">
      <div className="perspective-1000 py-10">
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={`relative w-[300px] h-[480px] rounded-[30px] transition-transform duration-100 ease-out transform-style-3d cursor-pointer select-none ${isHovered ? styles.glow : ''}`}
          style={{
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) rotateZ(${rotation.z}deg) scale(${isHovered ? 1.05 : 1})`,
          }}
        >
          {/* Card Body */}
          <div className={`absolute inset-0 rounded-[30px] ${styles.bg} ${styles.border} border-2 overflow-hidden flex flex-col items-center justify-between py-6 shadow-2xl transition-colors duration-500`}>
            
            {/* Animated Liquid/Texture Background */}
            <div className="absolute inset-0 opacity-30 pointer-events-none">
               <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1),transparent_50%)] animate-spin-slow"></div>
               <Fingerprint className="absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] text-white opacity-5 rotate-[-20deg]" />
            </div>

            {/* Dynamic Glare Effect */}
            <div 
              className="absolute inset-0 pointer-events-none z-30 transition-opacity duration-300"
              style={{
                opacity: isHovered ? 1 : 0,
                background: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 20%, transparent 60%)`,
                mixBlendMode: 'overlay'
              }}
            />

            {/* SASH */}
            <div className="absolute top-[30px] right-[-35px] rotate-[45deg] z-20 shadow-lg">
               <div className={`${styles.sashColor} w-[150px] py-1 text-center shadow-lg transition-colors duration-500`}>
                  <span className={`${styles.sashText} text-[10px] font-black tracking-widest uppercase`}>
                    {isTeamMember ? 'OFFICIAL' : user.plan}
                  </span>
               </div>
            </div>

            {/* Top Branding */}
            <div className="text-center z-10 mt-2">
              <h2 className={`text-xl font-black tracking-tighter ${styles.accent} drop-shadow-md transition-colors duration-500`}>
                TRADE VISION
              </h2>
              <div className="h-[2px] w-12 bg-white/20 mx-auto mt-1"></div>
            </div>

            {/* Center Avatar & QR */}
            <div className="relative z-10 flex flex-col items-center gap-6 mt-4">
              {/* 3D Ring Avatar */}
              <div className="relative w-28 h-28 transform-style-3d">
                 <div className={`absolute inset-0 rounded-full border-4 ${styles.ringColor} shadow-[0_0_20px_inset] shadow-white/10 animate-pulse-fast transition-colors duration-500`}></div>
                 <div className="absolute inset-2 rounded-full overflow-hidden bg-black/40 backdrop-blur-sm flex items-center justify-center border border-white/10">
                    {isTeamMember ? (
                       <Crown size={40} className={styles.accent} strokeWidth={1.5} />
                    ) : (
                       <Shield size={40} className={styles.accent} strokeWidth={1.5} />
                    )}
                 </div>
                 {/* Orbiting Dot */}
                 <div className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 ${styles.sashColor} rounded-full shadow-[0_0_10px] shadow-white transition-colors duration-500`}></div>
              </div>

              {/* QR Code Zone */}
              <div className="flex flex-col items-center gap-1">
                 <p className="text-[9px] uppercase tracking-[0.2em] text-white/60">Scan to Verify</p>
                 <div className="bg-white p-2 rounded-lg shadow-lg relative overflow-hidden group">
                    <QrCode size={64} className="text-black relative z-10" />
                    {/* QR Scan line animation */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-cyber-500/50 z-20 animate-scan"></div>
                 </div>
              </div>
            </div>

            {/* Bottom Info */}
            <div className="w-full px-6 z-10 mt-auto">
               <div className="mb-4 text-center">
                  <p className="text-[10px] text-white/50 uppercase tracking-wider mb-1">
                     {isTeamMember ? (user.settings.accountType === 'Pro' ? 'FOUNDER NAME' : 'CEO NAME') : 'OPERATIVE NAME'}
                  </p>
                  
                  <h3 className={`text-2xl font-black tracking-tight ${styles.accent} drop-shadow-sm`}>
                     {displayName}
                  </h3>

                  <div 
                     onClick={copyToClipboard}
                     className="flex items-center justify-center gap-2 mt-2 cursor-pointer opacity-60 hover:opacity-100 transition"
                  >
                     <code className="text-[10px] font-mono text-white/80">
                        {displayId.length > 12 ? displayId.substring(0,8) + '...' + displayId.substring(displayId.length-4) : displayId}
                     </code>
                     {copied && !showShareModal ? <Check size={10} className="text-green-400"/> : <Copy size={10} className="text-white"/>}
                  </div>
               </div>
               
               {/* Bottom Pill */}
               <div className="w-full bg-black/40 border border-white/10 rounded-full py-2 px-4 flex justify-between items-center backdrop-blur-md">
                  <span className="text-[10px] text-white/70 font-bold">
                     {isTeamMember ? 'ROLE' : 'BALANCE'}
                  </span>
                  <span className={`text-xs font-bold ${styles.accent} transition-colors duration-500`}>
                     {isTeamMember 
                        ? (user.settings.accountType === 'Pro' ? 'FOUNDER' : 'CEO') 
                        : `$${user.settings.accountSize.toLocaleString()}`}
                  </span>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Container */}
      {showControls && !isTeamMember && (
        <div className="flex flex-col items-center gap-4 mt-2 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <div className="flex gap-4 bg-black/40 backdrop-blur-md p-3 rounded-full border border-white/10">
            {(['cyan', 'emerald', 'violet', 'rose', 'amber'] as const).map((color) => (
              <button
                key={color}
                onClick={() => onThemeChange?.(color)}
                className={`w-6 h-6 rounded-full transition-all duration-300 ${activeThemeKey === color ? 'scale-125 ring-2 ring-white' : 'hover:scale-110 opacity-70 hover:opacity-100'}`}
                style={{ backgroundColor: THEMES[color].hex }}
                title={color.charAt(0).toUpperCase() + color.slice(1)}
              />
            ))}
          </div>

          <button 
            onClick={() => setShowShareModal(true)}
            className="flex items-center gap-2 px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyber-500/50 rounded-full text-sm font-bold text-gray-300 hover:text-white transition-all duration-300 group"
          >
            <Share2 size={16} className="group-hover:text-cyber-500 transition-colors" />
            <span>SHARE ID</span>
          </button>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={() => setShowShareModal(false)}
        >
           <div 
             className="bg-[#0a0a0a] border border-gray-800 rounded-2xl w-full max-w-sm p-6 relative shadow-[0_0_50px_rgba(249,115,22,0.15)] animate-in zoom-in-95 duration-200"
             onClick={e => e.stopPropagation()}
           >
              <button 
                onClick={() => setShowShareModal(false)} 
                className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
              >
                 <X size={20} />
              </button>

              <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                <Share2 size={20} className="text-cyber-500" /> Share Access Card
              </h3>
              <p className="text-gray-400 text-xs mb-6">Distribute your operative identity to the network.</p>

              {/* Link Section */}
              <div className="bg-white/5 rounded-lg p-3 mb-4 border border-white/5 group-hover:border-cyber-500/30 transition-colors">
                 <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] uppercase font-bold text-cyber-500 flex items-center gap-1">
                       <LinkIcon size={10} /> Public Uplink
                    </span>
                    {copied ? <span className="text-[10px] text-green-400 font-bold animate-pulse">COPIED</span> : null}
                 </div>
                 <div className="flex gap-2">
                    <code className="bg-black/50 text-gray-300 text-xs p-2 rounded flex-1 overflow-hidden text-ellipsis whitespace-nowrap font-mono border border-white/5">
                       {`https://tradevision.pro/u/${user.username.replace(/\s+/g, '').toLowerCase()}`}
                    </code>
                    <button 
                       onClick={copyLinkToClipboard}
                       className="bg-cyber-600 hover:bg-cyber-500 text-black p-2 rounded transition-colors"
                       title="Copy Link"
                    >
                       {copied ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                 </div>
              </div>

              {/* Download Section */}
              <button 
                className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyber-500/30 py-3 rounded-lg text-sm font-bold text-gray-300 hover:text-white transition-all group"
                onClick={() => alert("Snapshot downloaded (Simulation)")}
              >
                 <Download size={16} className="text-gray-500 group-hover:text-cyber-500 transition-colors" />
                 Download Holographic Snapshot
              </button>

           </div>
        </div>
      )}
    </div>
  );
};

export default UserIdentityCard;