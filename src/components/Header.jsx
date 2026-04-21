import React from 'react'

const Header = ({ 
    user, 
    onShowLogin, 
    onShowProfile, 
    onLogout,
    onShowAdmin, 
    onToggleNotifications, 
    notificationCount, 
    isSyncing,
    currentCity,
    onLocationClick
}) => {
  return (
    <header className="bg-gradient-to-r from-gray-900 via-black to-gray-900 text-white py-6 px-4 sm:px-8 border-b border-white/5 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between w-full">
        
        <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.location.reload()}>
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg transform transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110">
                    <span className="text-xl">🎬</span>
                </div>
                <h1 className="text-2xl font-black tracking-tighter bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent uppercase">
                    Movie Show
                </h1>
            </div>

            <div className="hidden lg:flex items-center h-10 px-4 bg-white/5 border border-white/5 rounded-2xl hover:border-red-500/30 transition-all cursor-pointer group" onClick={onLocationClick}>
                <span className="text-sm mr-2 group-hover:scale-110 transition-transform">📍</span>
                <span className="text-[10px] font-black text-white uppercase tracking-widest mr-3">{currentCity || 'Select City'}</span>
                <span className="text-[8px] text-gray-500 group-hover:text-white">▼</span>
            </div>

            {isSyncing && (
                <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/5 rounded-full animate-pulse">
                    <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce"></span>
                    <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Database Syncing...</span>
                </div>
            )}
        </div>

        <div className="flex items-center gap-4">
            <button 
                onClick={onToggleNotifications}
                className="relative p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all duration-300"
            >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] font-black flex items-center justify-center animate-pulse">
                        {notificationCount}
                    </span>
                )}
            </button>
            {user && user.isAdmin && (
                <button 
                    onClick={onShowAdmin}
                    className="p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-black hover:border-red-500/50 hover:text-red-500 transition-all duration-300"
                    title="Admin Dashboard"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
                </button>
            )}

            {user ? (
                <div className="flex items-center gap-3">
                    <button 
                        onClick={onShowProfile}
                        className="flex items-center gap-3 group px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-indigo-500/50 transition-all duration-300 shadow-xl"
                    >
                        <div className="w-7 h-7 bg-indigo-500 rounded-lg flex items-center justify-center text-xs font-black text-white group-hover:scale-110 transition-transform">
                            {user.name.charAt(0)}
                        </div>
                        <span className="text-sm font-black uppercase tracking-tight hidden sm:block">{user.name.split(' ')[0]}</span>
                    </button>
                    <button 
                        onClick={() => {
                            if(window.confirm('Securely sign out?')) onLogout(); 
                        }}
                        className="p-2.5 rounded-xl bg-red-600/10 border border-red-600/20 text-red-500 hover:bg-red-600 hover:text-white transition-all duration-300"
                        title="Sign Out"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                    </button>
                </div>
            ) : (
                <button 
                    onClick={onShowLogin}
                    className="flex items-center gap-3 group px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition-all duration-300 shadow-xl shadow-indigo-500/20"
                >
                    <span className="text-sm font-black uppercase tracking-widest">Sign In</span>
                    <span className="text-lg">✨</span>
                </button>
            )}
        </div>
        
      </div>
    </header>
  )
}

export default Header
