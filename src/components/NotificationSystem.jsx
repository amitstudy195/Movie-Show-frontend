import React, { useState, useEffect } from 'react';

const NotificationSystem = ({ notifications, onClear, onClose }) => {
  return (
    <div className="fixed top-24 right-4 sm:right-12 z-[110] w-full max-w-sm animate-in slide-in-from-right duration-700">
      <div className="bg-white border border-black/5 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[70vh] glass-effect">
        
        {/* Header */}
        <div className="p-8 border-b border-black/5 flex items-center justify-between bg-[#F5F5FA] backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#F84464]/10 rounded-xl flex items-center justify-center text-[#F84464] border border-[#F84464]/20">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
            </div>
            <div>
                <h3 className="text-[#121212] font-black uppercase text-[10px] tracking-[0.4em] italic leading-none">INBOX</h3>
                <p className="text-[#666666] text-[7px] font-black uppercase tracking-widest mt-1.5 italic">Handshake Protocols</p>
            </div>
          </div>
          <div className="flex gap-4">
            <button 
                onClick={onClear}
                className="text-[8px] font-black text-[#666666] hover:text-[#F84464] uppercase tracking-widest transition-all italic underline underline-offset-4"
            >
                Close ALL
            </button>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-black/5 hover:bg-[#121212] hover:text-white rounded-lg text-[#666666] transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-white">
          {notifications.length === 0 ? (
            <div className="py-20 text-center opacity-20 filter grayscale">
                <span className="text-4xl mb-4 block">🛰️</span>
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#121212] italic">Awaiting Signals</p>
            </div>
          ) : (
            notifications.map(n => (
              <div key={n.id} className={`p-6 rounded-2xl border transition-all duration-500 group ${n.type === 'alert' ? 'bg-[#F84464]/5 border-[#F84464]/20' : 'bg-[#F5F5FA] border-black/5 hover:border-black/20'}`}>
                <div className="flex justify-between items-start mb-3">
                  <span className={`text-[9px] font-black uppercase tracking-[0.2em] italic ${n.type === 'alert' ? 'text-[#F84464]' : 'text-[#121212]'}`}>
                    {n.title}
                  </span>
                  <span className="text-[7px] font-black text-[#666666] uppercase italic opacity-40">{n.time}</span>
                </div>
                <p className="text-[#666666] text-[10px] leading-relaxed italic group-hover:text-[#121212] transition-colors">{n.message}</p>
                {n.action && (
                    <button className="mt-4 text-[9px] font-black text-[#F84464] hover:text-[#121212] uppercase tracking-widest flex items-center gap-2 transition-all italic border-b border-transparent hover:border-[#121212] pb-1">
                        {n.action} <span className="translate-x-0 group-hover:translate-x-1 transition-transform">→</span>
                    </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-5 bg-[#F5F5FA] text-center border-t border-black/5">
            <p className="text-[8px] font-black text-[#666666] uppercase tracking-[0.5em] italic">SECURE TRANSMISSION END</p>
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
        <div className="fixed bottom-12 right-12 z-[220] animate-in slide-in-from-bottom duration-700">
            <div className="relative flex items-center gap-6 bg-white text-[#121212] p-8 rounded-[2.5rem] shadow-2xl border border-black/5 glass-effect group overflow-hidden">
                <div className="absolute top-0 right-0 p-4 text-4xl opacity-5 transform translate-x-4 translate-y-[-20px] select-none italic font-black group-hover:opacity-10 transition-opacity">
                    INTEL
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-[#F84464] to-[#FF6B81] rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-lg shadow-[#F84464]/20 transform -rotate-3 group-hover:rotate-0 transition-transform">
                    {notification.type === 'email' ? '📧' : notification.type === 'sms' ? '📱' : '🛰️'}
                </div>
                <div className="pr-10">
                    <h4 className="font-black uppercase text-xs tracking-widest leading-none mb-2 italic flex items-center gap-3 text-[#121212]">
                        <span className="w-1.5 h-1.5 bg-[#F84464] rounded-full animate-ping"></span>
                        {notification.title}
                    </h4>
                    <p className="text-[10px] font-black text-[#666666] uppercase italic tracking-tight leading-tight pr-6">{notification.message}</p>
                </div>
                <button onClick={onDismiss} className="absolute top-6 right-6 text-[#666666] hover:text-[#F84464] transition-all">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
                <div className="absolute bottom-0 left-0 h-1 bg-[#F84464] animate-[progress_5s_linear]" style={{ width: '100%' }}></div>
            </div>
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes progress {
                    from { width: 100%; }
                    to { width: 0%; }
                }
            `}} />
        </div>
    );
};

export default NotificationSystem;
