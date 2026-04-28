import React from 'react'

const Header = ({ 
    user, 
    onShowLogin, 
    onShowProfile, 
    onShowBookings,
    onLogout,
    onShowAdmin, 
    onToggleNotifications, 
    notificationCount, 
    isSyncing,
    currentCity,
    onLocationClick
}) => {
  return (
    <header className="bg-white/80 text-[#121212] py-5 px-4 sm:px-8 border-b border-black/5 sticky top-0 z-50 backdrop-blur-3xl glass-effect">
      <div className="max-w-7xl mx-auto flex items-center justify-between w-full">
        
        <div className="flex items-center gap-8">
            <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.location.reload()}>
                <div className="w-11 h-11 bg-gradient-to-br from-[#F84464] to-[#FF6B81] rounded-2xl flex items-center justify-center shadow-lg shadow-[#F84464]/20 transform transition-all duration-500 group-hover:rotate-6 group-hover:scale-105">
                    <span className="text-xl">🎬</span>
                </div>
                <h1 className="text-2xl font-black tracking-tighter bg-gradient-to-r from-[#121212] via-[#121212] to-[#666666] bg-clip-text text-transparent uppercase italic">
                    MOVIE SHOW
                </h1>
            </div>

            <div className="hidden lg:flex items-center h-12 px-5 bg-black/5 border border-black/5 rounded-2xl hover:border-[#F84464]/30 transition-all cursor-pointer group" onClick={onLocationClick}>
                <span className="text-sm mr-2 group-hover:scale-110 transition-transform">📍</span>
                <span className="text-[10px] font-black text-[#121212] uppercase tracking-[0.25em] mr-4">{currentCity || 'Select City'}</span>
                <span className="text-[8px] text-[#666666] group-hover:text-[#121212] transition-colors">▼</span>
            </div>

            {isSyncing && (
                <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-[#F84464]/5 border border-[#F84464]/10 rounded-full animate-pulse">
                    <span className="w-1.5 h-1.5 bg-[#F84464] rounded-full animate-ping"></span>
                    <span className="text-[9px] font-black uppercase text-[#F84464] tracking-[0.2em] italic">Projection Sync...</span>
                </div>
            )}
        </div>

        <div className="flex items-center gap-5">
            <button 
                onClick={onToggleNotifications}
                className="relative w-12 h-12 flex items-center justify-center rounded-2xl bg-black/5 border border-black/5 hover:bg-black/10 hover:border-black/10 transition-all group"
            >
                <svg className="w-5 h-5 text-[#666666] group-hover:text-[#121212] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#F84464] border-2 border-white rounded-full text-[9px] font-black text-white flex items-center justify-center animate-pulse shadow-md">
                        {notificationCount}
                    </span>
                )}
            </button>

            {user && user.isAdmin && (
                <button 
                    onClick={onShowAdmin}
                    className="w-12 h-12 flex items-center justify-center rounded-2xl bg-black/5 border border-black/5 hover:bg-[#F84464]/10 hover:border-[#F84464]/30 hover:text-[#F84464] transition-all text-[#666666]"
                    title="Control Center"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
                </button>
            )}

            {user ? (
                <div className="flex items-center gap-4">
                    <button 
                        onClick={onShowBookings}
                        className="w-12 h-12 flex items-center justify-center rounded-2xl bg-black/5 border border-black/10 hover:border-[#F84464]/30 transition-all group"
                        title="My Tickets"
                    >
                        <span className="text-xl group-hover:scale-110 transition-transform block italic">🎟️</span>
                    </button>
                    <button 
                        onClick={onShowProfile}
                        className="flex items-center gap-4 group p-1.5 pr-5 rounded-2xl bg-black/5 border border-black/10 hover:border-black/20 transition-all"
                    >
                        <div className="w-9 h-9 bg-[#121212] text-white rounded-xl flex items-center justify-center text-xs font-black shadow-md group-hover:scale-95 transition-transform">
                            {user.name.charAt(0)}
                        </div>
                        <span className="text-[10px] font-black uppercase text-[#121212] tracking-widest hidden sm:block italic opacity-70 group-hover:opacity-100 transition-opacity">{user.name.split(' ')[0]}</span>
                    </button>
                    <button 
                        onClick={() => {
                            if(window.confirm('Securely terminate session?')) onLogout(); 
                        }}
                        className="w-12 h-12 flex items-center justify-center rounded-2xl bg-[#F84464]/5 border border-[#F84464]/10 text-[#F84464] hover:bg-[#F84464] hover:text-white transition-all"
                        title="Sign Out"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                    </button>
                </div>
            ) : (
                <button 
                    onClick={onShowLogin}
                    className="flex items-center gap-4 btn-hero px-6 py-3 rounded-2xl shadow-lg shadow-[#F84464]/10 group"
                >
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">SIGN IN</span>
                    <span className="text-lg group-hover:translate-x-1 transition-transform">→</span>
                </button>
            )}
        </div>
        
      </div>
    </header>
  )
}

export default Header
