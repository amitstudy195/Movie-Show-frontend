import React, { useState, useEffect } from 'react';
import { bookingService } from '../services/api';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const UserProfile = ({ user, onUpdateUser, onLogout, onClose }) => {
    const [activeTab, setActiveTab] = useState('profile');
    const [bookings, setBookings] = useState([]);
    const [selectedTicket, setSelectedTicket] = useState(null);
    // ... logic ...

    const handlePrint = () => {
        const element = document.querySelector('.printable-ticket');
        if (!element) {
            alert("Critial: Ticket not found");
            return;
        }

        const printWindow = window.open('', '_blank');
        const movieTitle = selectedTicket.movieTitle;
        const ticketHtml = element.innerHTML;

        printWindow.document.write(`
          <html>
            <head>
              <title>Movie Show - ${movieTitle}</title>
              <style>
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;900&display=swap');
                * { 
                    box-sizing: border-box; 
                    -webkit-print-color-adjust: exact !important; 
                    print-color-adjust: exact !important; 
                }
                body { 
                    font-family: 'Outfit', sans-serif; 
                    margin: 0; 
                    padding: 40px; 
                    background: #f8fafc; 
                    display: flex;
                    justify-content: center;
                }
                .printable-ticket {
                    width: 130mm;
                    background: #09090b !important;
                    color: white !important;
                    padding: 40px;
                    border-radius: 50px;
                    box-shadow: 0 30px 60px rgba(0,0,0,0.5);
                    position: relative;
                    overflow: hidden;
                }
                .print-hide { display: none !important; }
                
                /* Structural Utilities */
                .flex { display: flex !important; }
                .flex-col { flex-direction: column !important; }
                .flex-1 { flex: 1 1 0% !important; }
                .flex-shrink-0 { flex-shrink: 0 !important; }
                .justify-between { justify-content: space-between !important; }
                .justify-center { justify-content: center !important; }
                .items-center { align-items: center !important; }
                .grid { display: grid !important; }
                .grid-cols-2 { grid-template-columns: 1fr 1fr !important; }
                .gap-4 { gap: 16px !important; }
                .gap-6 { gap: 24px !important; }
                .gap-8 { gap: 32px !important; }
                .gap-10 { gap: 40px !important; }
                .relative { position: relative !important; }
                .absolute { position: absolute !important; }
                
                /* Sizing & Spacing */
                .w-full { width: 100% !important; }
                .h-full { height: 100% !important; }
                .w-16 { width: 64px !important; }
                .h-16 { height: 64px !important; }
                .w-20 { width: 80px !important; }
                .h-28 { height: 112px !important; }
                .w-32 { width: 128px !important; }
                .h-32 { height: 128px !important; }
                .p-10 { padding: 40px !important; }
                .p-6 { padding: 24px !important; }
                .p-3 { padding: 12px !important; }
                .mb-2 { margin-bottom: 8px !important; }
                .mb-4 { margin-bottom: 16px !important; }
                .mb-5 { margin-bottom: 20px !important; }
                .mb-10 { margin-bottom: 40px !important; }
                .mt-2 { margin-top: 8px !important; }
                .mx-auto { margin-left: auto !important; margin-right: auto !important; }
                
                /* Typography */
                .text-white { color: #ffffff !important; }
                .text-red-600 { color: #dc2626 !important; }
                .text-\\[\\#f84464\\] { color: #f84464 !important; }
                .text-gray-500 { color: #64748b !important; }
                .text-gray-600 { color: #475569 !important; }
                .font-black { font-weight: 900 !important; }
                .font-bold { font-weight: 700 !important; }
                .uppercase { text-transform: uppercase !important; }
                .italic { font-style: italic !important; }
                .tracking-tight { letter-spacing: -0.025em !important; }
                .tracking-tighter { letter-spacing: -0.05em !important; }
                .tracking-widest { letter-spacing: 0.1em !important; }
                .text-2xl { font-size: 24px !important; }
                .text-xl { font-size: 20px !important; }
                .text-xs { font-size: 12px !important; }
                .text-center { text-align: center !important; }
                .truncate { overflow: hidden !important; text-overflow: ellipsis !important; white-space: nowrap !important; }

                /* Aesthetics */
                .bg-white { background: #ffffff !important; }
                .bg-\\[\\#f84464\\] { background: #f84464 !important; }
                .bg-zinc-800 { background: #27272a !important; }
                .bg-white\\/5 { background: rgba(255,255,255,0.05) !important; }
                .bg-white\\/0\\.02 { background: rgba(255,255,255,0.02) !important; }
                .border { border: 1px solid rgba(255,255,255,0.1) !important; }
                .border-white\\/10 { border-color: rgba(255,255,255,0.1) !important; }
                .border-white\\/5 { border-color: rgba(255,255,255,0.05) !important; }
                .rounded-2xl { border-radius: 16px !important; }
                .rounded-3xl { border-radius: 24px !important; }
                .rounded-\\[3\\.5rem\\] { border-radius: 56px !important; }
                .rounded-xl { border-radius: 12px !important; }
                .opacity-90 { opacity: 0.9 !important; }
                .h-2 { height: 8px !important; }

                /* Image/QR */
                img { object-fit: cover !important; }
                [class*="bg-[repeating-conic-gradient"], .qr-pattern {
                    background-image: repeating-conic-gradient(#000 0% 25%, #fff 0% 50%) !important;
                    background-size: 10px 10px !important;
                    display: block !important;
                    width: 100% !important;
                    height: 100% !important;
                    opacity: 1 !important;
                }

                @media print {
                    body { background: white; padding: 0; }
                    .printable-ticket { 
                        margin: 0; 
                        box-shadow: none; 
                        width: 100%;
                        height: 100%;
                        border-radius: 0;
                    }
                }
              </style>
            </head>
            <body>
              <div class="printable-ticket">
                ${ticketHtml}
              </div>
              <script>
                window.onload = () => {
                  setTimeout(() => {
                    window.print();
                    window.close();
                  }, 800);
                };
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
    };
    const [profileData, setProfileData] = useState({
        firstName: user?.name?.split(' ')[0] || '',
        lastName: user?.name?.split(' ').slice(1).join(' ') || '',
        email: user?.email || '',
        mobile: user?.mobile || '+91 98765 43210',
        birthday: '1995-08-15',
        gender: 'Male',
        pincode: '400001',
        city: 'Mumbai',
        state: 'Maharashtra',
        favoriteGenres: user?.favoriteGenres || ['Action', 'Sci-Fi'],
        preferredLanguages: user?.preferredLanguages || ['English', 'Hindi'],
        ...user
    });
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    
    // Data-Driven Membership & Wallet States
    const membershipTier = user?.membershipTier || 'Superstar';
    const loyaltyPoints = user?.loyaltyPoints || 1500;
    const tierProgress = Math.min((loyaltyPoints / 2000) * 100, 100);
    const walletBalance = user?.walletBalance || 0;

    useEffect(() => {
        if (activeTab === 'bookings') {
            fetchBookings();
        }
    }, [activeTab]);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const data = await bookingService.getMyBookings();
            setBookings(data);
        } catch (err) {
            console.error('Failed to fetch bookings', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = (e) => {
        e.preventDefault();
        onUpdateUser({ ...profileData, name: `${profileData.firstName} ${profileData.lastName}`.trim() });
        setIsEditing(false);
    };

    return (
        <div className="fixed inset-0 z-[110] bg-black/98 backdrop-blur-[80px] overflow-y-auto flex justify-center items-start md:items-center p-4">
            <div className="w-full max-w-6xl h-auto min-h-[90vh] md:h-[92vh] bg-[#05070a] border border-white/5 rounded-[3.5rem] flex flex-col shadow-[0_0_150px_rgba(0,0,0,0.9)] overflow-hidden animate-in fade-in zoom-in duration-700 relative mt-10 md:mt-0">
                
                {/* Elite Background Aura */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[150px] -mr-60 -mt-60 pointer-events-none opacity-40"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[150px] -ml-60 -mb-60 pointer-events-none opacity-30"></div>

                {/* Professional Header Bar */}
                <div className="relative px-12 py-8 border-b border-white/[0.03] flex items-center justify-between bg-black/40 backdrop-blur-md">
                    <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-gradient-to-br from-[#f84464] to-[#ff1f4b] rounded-2xl flex items-center justify-center shadow-lg">
                            <span className="text-xl font-black text-white italic">MS</span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Account Settings</h2>
                            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">Edit Profile • Preferences • Security</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={onClose} className="w-12 h-12 flex items-center justify-center bg-white/5 border border-white/10 hover:bg-white hover:text-black rounded-full transition-all group active:scale-90">
                            <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* BMS Style Side Navigation */}
                    <nav className="w-72 p-10 space-y-2 border-r border-white/[0.02] bg-black/20">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] transition-all ${activeTab === 'profile' ? 'bg-[#f84464] text-white shadow-xl shadow-red-600/10' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                        >
                            <span className="text-lg">👤</span> Personal Info
                        </button>
                        <button
                            onClick={() => setActiveTab('bookings')}
                            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] transition-all ${activeTab === 'bookings' ? 'bg-[#f84464] text-white' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                        >
                            <span className="text-lg">🎟️</span> Your Orders
                        </button>
                        <button onClick={onLogout} className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[11px] font-black text-red-500 uppercase tracking-[0.15em] hover:bg-red-500/10 transition-all">
                            <span className="text-lg">🚪</span> Sign Out
                        </button>
                    </nav>

                    {/* Main Scrollable Area */}
                    <main className="flex-1 p-14 overflow-y-auto custom-scrollbar bg-[#080a0f]/50">
                        {activeTab === 'profile' && (
                            <form onSubmit={handleUpdateProfile} className="max-w-4xl space-y-12 animate-in fade-in slide-in-from-bottom duration-700">
                                
                                {/* Personal Details Section */}
                                <section>
                                    <div className="flex items-center justify-between mb-8">
                                        <div>
                                            <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Personal Details</h3>
                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Manage your basic cinematic identity</p>
                                        </div>
                                        {!isEditing && (
                                            <button type="button" onClick={() => setIsEditing(true)} className="px-6 py-2 border border-red-500/30 text-red-500 text-[10px] font-black uppercase rounded-lg hover:bg-red-500 hover:text-white transition-all">Edit Details</button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-8 p-10 bg-white/[0.02] border border-white/5 rounded-[2.5rem]">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">First Name</label>
                                            <input
                                                type="text"
                                                className={`w-full bg-black/40 border border-white/10 rounded-xl p-5 text-sm text-white focus:border-[#f84464] outline-none transition-all font-bold ${!isEditing && 'opacity-60 cursor-not-allowed'}`}
                                                value={profileData.firstName}
                                                onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                                                disabled={!isEditing}
                                                placeholder="Enter First Name"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Last Name</label>
                                            <input
                                                type="text"
                                                className={`w-full bg-black/40 border border-white/10 rounded-xl p-5 text-sm text-white focus:border-[#f84464] outline-none transition-all font-bold ${!isEditing && 'opacity-60 cursor-not-allowed'}`}
                                                value={profileData.lastName}
                                                onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                                                disabled={!isEditing}
                                                placeholder="Enter Last Name"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Birthday</label>
                                            <input
                                                type="date"
                                                className={`w-full bg-black/40 border border-white/10 rounded-xl p-5 text-sm text-white focus:border-[#f84464] outline-none transition-all font-bold ${!isEditing && 'opacity-60 cursor-not-allowed'}`}
                                                value={profileData.birthday}
                                                onChange={(e) => setProfileData({ ...profileData, birthday: e.target.value })}
                                                disabled={!isEditing}
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Gender</label>
                                            <div className="flex gap-4">
                                                {['Male', 'Female'].map(g => (
                                                    <button
                                                        key={g}
                                                        type="button"
                                                        onClick={() => isEditing && setProfileData({...profileData, gender: g})}
                                                        className={`flex-1 p-4 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${profileData.gender === g ? 'bg-white text-black border-white' : 'bg-black/40 text-gray-500 border-white/10 hover:border-white/20'}`}
                                                        disabled={!isEditing}
                                                    >
                                                        {g}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* Contact Information Section */}
                                <section>
                                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-8">Contact Information</h3>
                                    <div className="space-y-6 p-10 bg-white/[0.02] border border-white/5 rounded-[2.5rem]">
                                        <div className="flex items-center justify-between p-6 bg-black/20 rounded-2xl border border-white/5">
                                            <div className="flex items-center gap-6">
                                                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-xl shadow-inner italic font-black text-white">@</div>
                                                <div>
                                                    <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">Email Address</p>
                                                    <p className="text-sm font-bold text-white italic">{profileData.email}</p>
                                                </div>
                                            </div>
                                            <span className="text-[8px] px-3 py-1 bg-green-500/20 text-green-500 border border-green-500/30 rounded-full font-black uppercase tracking-tighter">Verified</span>
                                        </div>
                                        <div className="flex flex-col gap-3 p-6 bg-black/20 rounded-2xl border border-white/5">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-xl shadow-inner font-black text-white">#</div>
                                                    <div>
                                                        <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">Mobile Number</p>
                                                        {!isEditing ? (
                                                            <p className="text-sm font-bold text-white">{profileData.mobile}</p>
                                                        ) : (
                                                            <input 
                                                                type="text" 
                                                                className="bg-transparent border-b border-red-500/50 text-sm font-bold text-white outline-none focus:border-red-500 transition-all uppercase"
                                                                value={profileData.mobile}
                                                                onChange={(e) => setProfileData({...profileData, mobile: e.target.value})}
                                                                autoFocus
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                                {!isEditing && <button type="button" onClick={() => setIsEditing(true)} className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline">Edit</button>}
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* Address Details Section */}
                                <section>
                                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-8">Address Details</h3>
                                    <div className="grid grid-cols-2 gap-8 p-10 bg-white/[0.02] border border-white/5 rounded-[2.5rem]">
                                        <div className="col-span-2 space-y-3">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Pincode</label>
                                            <input
                                                type="text"
                                                className={`w-full bg-black/40 border border-white/10 rounded-xl p-5 text-sm text-white focus:border-[#f84464] outline-none transition-all font-bold ${!isEditing && 'opacity-60 cursor-not-allowed'}`}
                                                value={profileData.pincode}
                                                onChange={(e) => setProfileData({ ...profileData, pincode: e.target.value })}
                                                disabled={!isEditing}
                                                placeholder="Enter Pincode"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">City</label>
                                            <input
                                                type="text"
                                                className={`w-full bg-black/40 border border-white/10 rounded-xl p-5 text-sm text-white focus:border-[#f84464] outline-none transition-all font-bold ${!isEditing && 'opacity-60 cursor-not-allowed'}`}
                                                value={profileData.city}
                                                onChange={(e) => setProfileData({...profileData, city: e.target.value})}
                                                disabled={!isEditing}
                                                placeholder="City"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">State</label>
                                            <input
                                                type="text"
                                                className={`w-full bg-black/40 border border-white/10 rounded-xl p-5 text-sm text-white focus:border-[#f84464] outline-none transition-all font-bold ${!isEditing && 'opacity-60 cursor-not-allowed'}`}
                                                value={profileData.state}
                                                onChange={(e) => setProfileData({...profileData, state: e.target.value})}
                                                disabled={!isEditing}
                                                placeholder="State"
                                            />
                                        </div>
                                    </div>
                                </section>

                                {/* Cinematic Preferences Section (BMS Signature) */}
                                <section>
                                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-8">Cinematic Interests</h3>
                                    <div className="p-10 bg-white/[0.02] border border-white/5 rounded-[2.5rem] space-y-10">
                                        <div>
                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6 ml-2">Favorite Genres</p>
                                            <div className="flex flex-wrap gap-3">
                                                {['Action', 'Comedy', 'Horror', 'Sci-Fi', 'Drama', 'Thriller', 'Romance', 'Fantasy'].map(genre => {
                                                    const isSelected = profileData.favoriteGenres.includes(genre);
                                                    return (
                                                        <button 
                                                            key={genre} 
                                                            type="button" 
                                                            onClick={() => {
                                                                const newGenres = isSelected 
                                                                    ? profileData.favoriteGenres.filter(g => g !== genre)
                                                                    : [...profileData.favoriteGenres, genre];
                                                                setProfileData({...profileData, favoriteGenres: newGenres});
                                                            }}
                                                            className={`px-5 py-3 rounded-full border text-[9px] font-black uppercase tracking-widest transition-all ${isSelected ? 'bg-[#f84464] border-[#f84464] text-white' : 'border-white/10 bg-black/40 text-white hover:border-[#f84464]/50'}`}
                                                        >
                                                            {genre}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6 ml-2">Preferred Languages</p>
                                            <div className="flex flex-wrap gap-3">
                                                {['Hindi', 'English', 'Tamil', 'Telugu', 'Kannada', 'Malayalam'].map(lang => {
                                                    const isSelected = profileData.preferredLanguages.includes(lang);
                                                    return (
                                                        <button 
                                                            key={lang} 
                                                            type="button" 
                                                            onClick={() => {
                                                                const newLangs = isSelected 
                                                                    ? profileData.preferredLanguages.filter(l => l !== lang)
                                                                    : [...profileData.preferredLanguages, lang];
                                                                setProfileData({...profileData, preferredLanguages: newLangs});
                                                            }}
                                                            className={`px-5 py-3 rounded-full border text-[9px] font-black uppercase tracking-widest transition-all ${isSelected ? 'bg-[#f84464] border-[#f84464] text-white' : 'border-white/10 bg-black/40 text-white hover:border-[#f84464]/50'}`}
                                                        >
                                                            {lang}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* Actions Bar */}
                                {isEditing && (
                                    <div className="flex gap-4 pt-10 border-t border-white/[0.03]">
                                        <button type="submit" className="flex-1 py-6 bg-[#f84464] text-white font-black rounded-2xl hover:bg-red-500 transition-all shadow-[0_15px_40px_rgba(248,68,100,0.2)] uppercase text-[11px] tracking-widest active:scale-95">Save Changes</button>
                                        <button type="button" onClick={() => setIsEditing(false)} className="px-12 py-6 bg-white/5 text-gray-500 font-black rounded-2xl border border-white/10 transition-all uppercase text-[11px] tracking-widest hover:text-white">Discard</button>
                                    </div>
                                )}
                            </form>
                        )}

                        {activeTab === 'bookings' && (
                            <div className="space-y-10 animate-in fade-in slide-in-from-right duration-700">
                                <div className="flex items-center justify-between pb-6 border-b border-white/5">
                                    <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">Your Orders</h3>
                                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{bookings.length} reservations found</p>
                                </div>
                                {/* Bookings Grid as implemented before */}
                                <div className="grid gap-8">
                                    {bookings.map((b, idx) => (
                                        <div key={b._id} className="group bg-[#0d0f14] border border-white/[0.03] rounded-[2.5rem] p-8 flex items-center gap-10 hover:border-[#f84464]/30 transition-all duration-500 shadow-2xl">
                                            <div className="w-24 h-36 bg-zinc-800 rounded-2xl overflow-hidden shrink-0 border border-white/10 group-hover:scale-105 transition-transform duration-700">
                                                <img src={b.posterPath} className="w-full h-full object-cover" alt={b.movieTitle} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <h4 className="text-2xl font-black text-white uppercase tracking-tighter italic group-hover:text-[#f84464] transition-colors leading-none">{b.movieTitle}</h4>
                                                    <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${b.status === 'confirmed' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-orange-500/10 text-orange-500 border border-orange-500/20 animate-pulse'}`}>
                                                        {b.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Venue</p>
                                                        <p className="text-[11px] font-bold text-white uppercase">{b.theaterName}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Schedule</p>
                                                        <p className="text-[11px] font-bold text-white uppercase">{b.showDate} • {b.showtime}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <button onClick={() => setSelectedTicket(b)} className="px-8 py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase hover:bg-[#f84464] hover:text-white transition-all active:scale-95 shadow-2xl">View Ticket</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </main>
                </div>

                {/* Secure Status Bar */}
                <div className="px-12 py-5 bg-black/60 border-t border-white/[0.03] flex items-center justify-between">
                    <div className="flex items-center gap-10">
                        <div className="flex items-center gap-3">
                            <span className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                            <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">System Operational</span>
                        </div>
                        <p className="text-[9px] font-black text-gray-700 uppercase tracking-[0.4em]">Movie Show Official Member Zone © {new Date().getFullYear()}</p>
                    </div>
                </div>

                {/* Ticket Portal Overlay */}
                {selectedTicket && (
                    <div 
                        className="fixed inset-0 z-[150] bg-black/98 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in duration-500 overflow-y-auto"
                        onClick={() => setSelectedTicket(null)}
                    >
                         <div 
                            className="w-full max-w-sm bg-[#0d0f14] rounded-[3.5rem] border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden relative animate-in zoom-in duration-300 printable-ticket"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button onClick={() => setSelectedTicket(null)} className="absolute top-6 right-6 z-20 w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-red-600 text-white rounded-full transition-all print-hide">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                            <div className="p-10">
                                <div className="text-center mb-10">
                                    <div className="w-16 h-16 bg-[#f84464] rounded-2xl mx-auto flex items-center justify-center mb-5 shadow-lg shadow-red-600/20">
                                        <span className="text-2xl font-black text-white italic">MS</span>
                                    </div>
                                    <h4 className="text-white font-black uppercase tracking-tight text-xl italic">Digital Entry Pass</h4>
                                    <p className="text-gray-600 text-[8px] font-black uppercase tracking-[0.4em] mt-2">Verified Cinema Confirmation</p>
                                </div>
                                <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 mb-10 flex gap-6">
                                    <div className="w-20 h-28 bg-zinc-800 rounded-xl overflow-hidden shrink-0">
                                        <img src={selectedTicket.posterPath} className="w-full h-full object-cover" alt="movie" />
                                    </div>
                                    <div className="flex-1 flex flex-col justify-center">
                                        <p className="text-white font-black uppercase text-xs mb-1 truncate italic tracking-tighter">{selectedTicket.movieTitle}</p>
                                        <p className="text-[#f84464] text-[9px] font-black uppercase tracking-[0.1em] mb-2">{selectedTicket.userName || 'Superstar User'}</p>
                                        <p className="text-gray-500 text-[8px] font-bold uppercase tracking-widest">{selectedTicket.theaterName}</p>
                                        <p className="text-white font-black uppercase text-[10px] mt-2 italic">{selectedTicket.showDate} • {selectedTicket.showtime}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-center mb-8 gap-4">
                                    <div className="w-32 h-32 bg-white p-3 rounded-[2.2rem]">
                                         <div className="w-full h-full bg-[repeating-conic-gradient(#000_0%_25%,#fff_0%_50%)] bg-[length:10px_10px] opacity-90 rounded-2xl"></div>
                                    </div>
                                    <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Order ID: {selectedTicket.bookingId || selectedTicket._id.slice(-8)}</p>
                                </div>
                                <div className="space-y-3">
                                    <button onClick={handlePrint} className="w-full py-5 bg-white text-black text-[11px] font-black uppercase rounded-[2rem] hover:bg-[#f84464] hover:text-white transition-all shadow-2xl print-hide">📥 Download Official Ticket</button>
                                    <button onClick={() => setSelectedTicket(null)} className="w-full py-4 bg-white/5 text-gray-500 text-[10px] font-black uppercase rounded-[2rem] hover:bg-white hover:text-black transition-all print-hide">← Close & Return</button>
                                </div>
                            </div>
                            <div className="bg-[#f84464] h-2 w-full"></div>
                        </div>
                    </div>
                )}

                {/* Final Accent Bar */}
                <div className="bg-[#f84464] h-2 w-full"></div>
            </div>
        </div>
    );
};

export default UserProfile;
