import React from 'react';
import { Check, X } from 'lucide-react';
import { PlanTier } from '../types';

interface PlanCardProps {
  name: string;
  price: string;
  features: string[];
  missing?: string[];
  tier: PlanTier;
  recommended?: boolean;
  onSelect: () => void;
}

const PlanCard: React.FC<PlanCardProps> = ({ name, price, features, missing, recommended, onSelect }) => {
  return (
    <div className={`relative p-6 rounded-2xl glass-panel transition-all duration-300 hover:scale-105 ${recommended ? 'border-cyber-500 shadow-[0_0_30px_rgba(0,188,212,0.15)]' : 'border-gray-800'}`}>
      {recommended && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-cyber-500 text-black font-bold px-4 py-1 rounded-full text-sm">
          MOST POPULAR
        </div>
      )}
      <h3 className="text-xl font-bold text-cyber-300">{name}</h3>
      <div className="mt-4 mb-6">
        <span className="text-4xl font-bold text-white">{price}</span>
        {price !== 'Free' && <span className="text-gray-400">/month</span>}
      </div>
      
      <button 
        onClick={onSelect}
        className={`w-full py-3 rounded-lg font-bold mb-6 transition-colors ${recommended ? 'bg-cyber-500 hover:bg-cyber-400 text-black' : 'bg-gray-800 hover:bg-gray-700 text-white'}`}
      >
        {price === 'Free' ? 'Current Plan' : 'Upgrade Now'}
      </button>

      <div className="space-y-3">
        {features.map((feat, i) => (
          <div key={i} className="flex items-start gap-2">
            <Check size={18} className="text-cyber-500 mt-1 shrink-0" />
            <span className="text-gray-300 text-sm">{feat}</span>
          </div>
        ))}
        {missing?.map((feat, i) => (
          <div key={i} className="flex items-start gap-2 opacity-50">
            <X size={18} className="text-red-500 mt-1 shrink-0" />
            <span className="text-gray-500 text-sm">{feat}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlanCard;
