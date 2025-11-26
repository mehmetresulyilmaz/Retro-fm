
import React from 'react';

// Modern Glassmorphism Buttons
export const Button: React.FC<{
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}> = ({ onClick, children, className = "", variant = 'primary', disabled = false }) => {
  
  let baseStyle = "h-11 px-6 rounded-xl font-medium text-sm transition-all active:scale-95 shadow-lg flex items-center justify-center backdrop-blur-sm";
  let colorStyle = "";

  if (variant === 'primary') {
    colorStyle = "bg-blue-600/90 hover:bg-blue-500 text-white shadow-blue-900/20";
  } else if (variant === 'secondary') {
    colorStyle = "bg-slate-700/50 hover:bg-slate-600/50 text-white border border-white/10";
  } else if (variant === 'danger') {
    colorStyle = "bg-red-600/90 hover:bg-red-500 text-white shadow-red-900/20";
  }
  
  if (disabled) {
    colorStyle = "bg-slate-800 text-slate-500 cursor-not-allowed opacity-50 shadow-none";
  }

  return (
    <button
      onClick={disabled ? undefined : onClick}
      className={`${baseStyle} ${colorStyle} ${className}`}
    >
      {children}
    </button>
  );
};

export const Panel: React.FC<{ 
  children: React.ReactNode; 
  className?: string; 
  title?: string;
  action?: React.ReactNode;
}> = ({ children, className = "", title, action }) => {
  return (
    <div className={`flex flex-col rounded-2xl overflow-hidden glass-panel shadow-xl ${className}`}>
      {title && (
        <div className="bg-slate-900/40 px-4 py-3 border-b border-white/5 flex justify-between items-center shrink-0">
          <span className="font-bold text-sm tracking-wide text-blue-100/90">{title}</span>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="flex-1 flex flex-col relative">
         {children}
      </div>
    </div>
  );
};

export const BottomNav: React.FC<{
  activeTab: string;
  onTabChange: (tab: any) => void;
}> = ({ activeTab, onTabChange }) => {
  const NavItem = ({ id, label, icon }: { id: string, label: string, icon: React.ReactNode }) => {
    const isActive = activeTab === id;
    return (
      <button 
        onClick={() => onTabChange(id)}
        className={`flex-1 flex flex-col items-center justify-center py-2 transition-all duration-300
          ${isActive ? 'text-blue-400 scale-105' : 'text-slate-400'}
        `}
      >
        <div className={`p-1.5 rounded-xl ${isActive ? 'bg-blue-500/20' : 'bg-transparent'}`}>
            {icon}
        </div>
        <span className={`text-[10px] mt-1 font-medium ${isActive ? 'opacity-100' : 'opacity-70'}`}>{label}</span>
      </button>
    );
  };

  return (
    <div className="h-[70px] bg-slate-900/95 backdrop-blur-lg border-t border-white/5 flex items-stretch shrink-0 z-50 pb-[env(safe-area-inset-bottom)] rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
      <NavItem id="DASHBOARD" label="Ana Sayfa" icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>} />
      <NavItem id="SQUAD" label="Kadro" icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>} />
      <NavItem id="FIXTURE" label="Fikstür" icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>} />
      <NavItem id="TRANSFER" label="Transfer" icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 2 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>} />
    </div>
  );
}

export const LoadingScreen: React.FC<{ message: string }> = ({ message }) => (
  <div className="fixed inset-0 bg-[#0f172a] z-50 flex flex-col items-center justify-center p-6">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <div className="absolute inset-0 flex items-center justify-center text-xl">⚽</div>
    </div>
    <p className="text-blue-200/80 font-medium text-sm mt-6 animate-pulse uppercase tracking-widest">{message}</p>
  </div>
);
