import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, ShieldAlert } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto dismiss
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              pointer-events-auto
              min-w-[320px] max-w-md p-4 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.5)] flex items-start gap-4 
              animate-in slide-in-from-right-full duration-300 ease-out
              backdrop-blur-xl border border-l-4
              ${toast.type === 'error' ? 'bg-[#1a0505]/95 border-red-500/30 border-l-red-500' : 
                toast.type === 'success' ? 'bg-[#051a1a]/95 border-cyber-500/30 border-l-cyber-500' : 
                toast.type === 'warning' ? 'bg-[#1a1500]/95 border-yellow-500/30 border-l-yellow-500' :
                'bg-[#0a0a0a]/95 border-gray-700/50 border-l-gray-500'}
            `}
          >
            <div className={`mt-0.5 shrink-0 ${
              toast.type === 'error' ? 'text-red-500' : 
              toast.type === 'success' ? 'text-cyber-500' : 
              toast.type === 'warning' ? 'text-yellow-500' :
              'text-gray-400'
            }`}>
              {toast.type === 'error' && <ShieldAlert size={20} />}
              {toast.type === 'success' && <CheckCircle size={20} />}
              {toast.type === 'warning' && <AlertCircle size={20} />}
              {toast.type === 'info' && <Info size={20} />}
            </div>
            
            <div className="flex-1">
              <h4 className={`text-sm font-bold uppercase tracking-wider mb-1 ${
                toast.type === 'error' ? 'text-red-400' : 
                toast.type === 'success' ? 'text-cyber-400' : 
                toast.type === 'warning' ? 'text-yellow-400' :
                'text-gray-300'
              }`}>
                {toast.type === 'error' ? 'System Error' : 
                 toast.type === 'success' ? 'Success' : 
                 toast.type === 'warning' ? 'Alert' : 'Info'}
              </h4>
              <p className="text-sm text-gray-300 leading-snug">{toast.message}</p>
            </div>
            
            <button 
              onClick={() => removeToast(toast.id)} 
              className="text-gray-500 hover:text-white transition p-1 hover:bg-white/10 rounded"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
