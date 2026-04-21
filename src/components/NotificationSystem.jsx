import React, { useState, useEffect } from 'react';

const NotificationSystem = ({ notifications, onClear, onClose }) => {
  return (
    <div className="fixed top-20 right-4 sm:right-8 z-[110] w-full max-w-sm animate-in slide-in-from-top duration-500">
      <div className="bg-zinc-950 border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[70vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <span className="text-xl">🔔</span>
            <h3 className="text-white font-black uppercase text-xs tracking-widest">Inbox</h3>
          </div>
          <div className="flex gap-2">
            <button 
                onClick={onClear}
                className="text-[10px] font-bold text-gray-500 hover:text-white uppercase tracking-tighter"
            >
                Clear All
            </button>
            <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="py-12 text-center opacity-30">
                <p className="text-[10px] font-black uppercase tracking-widest text-white">No new alerts</p>
            </div>
          ) : (
            notifications.map(n => (
              <div key={n.id} className={`p-4 rounded-2xl border transition-all duration-300 ${n.type === 'alert' ? 'bg-red-500/5 border-red-500/20' : 'bg-white/5 border-white/5 hover:border-white/20'}`}>
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-[9px] font-black uppercase tracking-tighter ${n.type === 'alert' ? 'text-red-500' : 'text-cyan-500'}`}>
                    {n.title}
                  </span>
                  <span className="text-[8px] font-bold text-gray-600 uppercase italic">{n.time}</span>
                </div>
                <p className="text-gray-300 text-xs leading-relaxed">{n.message}</p>
                {n.action && (
                    <button className="mt-2 text-[9px] font-black text-white hover:text-cyan-400 uppercase tracking-widest flex items-center gap-1 transition-all">
                        {n.action} <span>→</span>
                    </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-black/40 text-center">
            <p className="text-[9px] font-bold text-gray-600 uppercase tracking-[0.2em]">End of Notifications</p>
        </div>
      </div>
    </div>
  );
};

export const NotificationToast = ({ notification, onDismiss }) => {
    useEffect(() => {
        const timer = setTimeout(onDismiss, 5000);
        return () => clearTimeout(timer);
    }, [onDismiss]);

    return (
        <div className="fixed bottom-8 right-8 z-[200] animate-in slide-in-from-right duration-500">
            <div className="flex items-center gap-4 bg-white text-black p-5 rounded-[2rem] shadow-[0_0_50px_rgba(255,255,255,0.2)] border border-white/20">
                <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-xl shrink-0">
                    {notification.type === 'email' ? '📧' : notification.type === 'sms' ? '📱' : '🚀'}
                </div>
                <div>
                    <h4 className="font-black uppercase text-xs tracking-tighter leading-none mb-1">{notification.title}</h4>
                    <p className="text-[10px] font-bold opacity-60 leading-tight pr-8">{notification.message}</p>
                </div>
                <button onClick={onDismiss} className="absolute top-4 right-4 text-black/20 hover:text-black">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
        </div>
    );
};

export default NotificationSystem;
