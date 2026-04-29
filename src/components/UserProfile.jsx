import React, { useState, useEffect } from 'react';
import { bookingService } from '../services/api';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const UserProfile = ({ user, onUpdateUser, onLogout, onClose, initialTab = 'profile' }) => {
    const [activeTab, setActiveTab] = useState(initialTab);

    useEffect(() => {
        setActiveTab(initialTab);
    }, [initialTab]);
    const [bookings, setBookings] = useState([]);
    const [selectedTicket, setSelectedTicket] = useState(null);

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
                    background: #F5F5FA; 
                    display: flex;
                    justify-content: center;
                }
                .printable-ticket {
                    width: 130mm;
                    background: #ffffff !important;
                    color: #121212 !important;
                    padding: 40px;
                    border-radius: 50px;
                    box-shadow: 0 30px 60px rgba(0,0,0,0.1);
                    position: relative;
                    overflow: hidden;
                    border: 1px solid rgba(0,0,0,0.05);
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
                .text-\\[\\#121212\\] { color: #121212 !important; }
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
                .bg-zinc-100 { background: #f4f4f5 !important; }
                .bg-black\\/5 { background: rgba(0,0,0,0.05) !important; }
                .bg-white\\/0\\.02 { background: rgba(255,255,255,0.02) !important; }
                .border { border: 1px solid rgba(0,0,0,0.1) !important; }
                .border-black\\/10 { border-color: rgba(0,0,0,0.1) !important; }
                .border-black\\/5 { border-color: rgba(0,0,0,0.05) !important; }
                .rounded-2xl { border-radius: 16px !important; }
                .rounded-3xl { border-radius: 24px !important; }
                .rounded-\\[3\\.5rem\\] { border-radius: 56px !important; }
                .rounded-xl { border-radius: 12px !important; }
                .opacity-90 { opacity: 0.9 !important; }
                .h-2 { height: 8px !important; }

                /* Image/QR */
                img { object-fit: cover !important; }
                .qr-pattern {
                    background-image: repeating-conic-gradient(#000 0% 25%, #fff 0% 50%) !important;
                    background-size: 10px 10px !important;
                    display: block !important;
                    width: 100% !important;
                    height: 100% !important;
                    opacity: 0.9 !important;
                }

                @media print {
                    body { background: white; padding: 0; }
                    .printable-ticket { 
                        margin: 0; 
                        box-shadow: none; 
                        width: 100%;
                        height: 100%;
                        border-radius: 0;
                        border: none;
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
        const updatePayload = {
            name: `${profileData.firstName} ${profileData.lastName}`.trim(),
            mobile: profileData.mobile,
            birthday: profileData.birthday,
            gender: profileData.gender,
            pincode: profileData.pincode,
            city: profileData.city,
            state: profileData.state,
            favoriteGenres: profileData.favoriteGenres,
            preferredLanguages: profileData.preferredLanguages
        };
        onUpdateUser(updatePayload);
        setIsEditing(false);
    };

    return (
        <div className="fixed inset-0 z-[110] bg-black/40 backdrop-blur-[40px] overflow-y-auto flex justify-center items-start md:items-center p-4">
            <div className="w-full max-w-6xl h-auto min-h-[98vh] md:h-[98vh] bg-white border border-black/5 rounded-[10px] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-700 relative mt-10 md:mt-0">
                
                {/* Elite Background Aura */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#f84464]/5 rounded-full blur-[120px] -mr-60 -mt-60 pointer-events-none"></div>

                {/* Professional Header Bar */}
                <div className="relative px-12 py-8 border-b border-black/5 flex items-center justify-between bg-white/80 backdrop-blur-md">
                    <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-gradient-to-br from-[#f84464] to-[#ff1f4b] rounded-2xl flex items-center justify-center shadow-lg shadow-[#f84464]/20">
                            <span className="text-xl font-black text-white italic">MS</span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-[#121212] uppercase italic tracking-tighter">Account Settings</h2>
                            <p className="text-[9px] font-bold text-[#666666] uppercase tracking-widest mt-0.5">Edit Profile • Preferences • Security</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={onClose} className="w-12 h-12 flex items-center justify-center bg-black/5 border border-black/5 hover:bg-[#121212] hover:text-white rounded-full transition-all group active:scale-90 shadow-sm">
                            <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* BMS Style Side Navigation */}
                    <nav className="w-72 p-10 space-y-2 border-r border-black/5 bg-[#F5F5FA]">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] transition-all ${activeTab === 'profile' ? 'bg-[#f84464] text-white shadow-lg shadow-[#f84464]/20' : 'text-[#666666] hover:text-[#121212] hover:bg-black/5'}`}
                        >
                            <span className="text-lg">👤</span> Personal Info
                        </button>
                        <button
                            onClick={() => setActiveTab('bookings')}
                            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] transition-all ${activeTab === 'bookings' ? 'bg-[#f84464] text-white' : 'text-[#666666] hover:text-[#121212] hover:bg-black/5'}`}
                        >
                            <span className="text-lg">🎟️</span> Your Orders
                        </button>
                        <button onClick={onLogout} className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[11px] font-black text-red-500 uppercase tracking-[0.15em] hover:bg-red-500/5 transition-all">
                            <span className="text-lg">🚪</span> Sign Out
                        </button>
                    </nav>

                    {/* Main Scrollable Area */}
                    <main className="flex-1 p-14 overflow-y-auto custom-scrollbar bg-white">
                        {activeTab === 'profile' && (
                            <form onSubmit={handleUpdateProfile} className="max-w-4xl space-y-12 animate-in fade-in slide-in-from-bottom duration-700">
                                
                                {/* Personal Details Section */}
                                <section>
                                    <div className="flex items-center justify-between mb-8">
                                        <div>
                                            <h3 className="text-2xl font-black text-[#121212] uppercase italic tracking-tighter">Personal Details</h3>
                                            <p className="text-[10px] font-bold text-[#666666] uppercase tracking-widest mt-1">Manage your basic cinematic identity</p>
                                        </div>
                                        {!isEditing && (
                                            <button type="button" onClick={() => setIsEditing(true)} className="px-6 py-2 border border-[#f84464]/30 text-[#f84464] text-[10px] font-black uppercase rounded-lg hover:bg-[#f84464] hover:text-white transition-all shadow-sm">Edit Details</button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-8 p-10 bg-[#F5F5FA] border border-black/5 rounded-[1rem]">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-[#666666] uppercase tracking-widest ml-2">First Name</label>
                                            <input
                                                type="text"
                                                className={`w-full bg-white border border-black/10 rounded-xl p-5 text-sm text-[#121212] focus:border-[#f84464] outline-none transition-all font-bold shadow-sm ${!isEditing && 'opacity-60 cursor-not-allowed text-gray-500'}`}
                                                value={profileData.firstName}
                                                onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                                                disabled={!isEditing}
                                                placeholder="Enter First Name"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-[#666666] uppercase tracking-widest ml-2">Last Name</label>
                                            <input
                                                type="text"
                                                className={`w-full bg-white border border-black/10 rounded-xl p-5 text-sm text-[#121212] focus:border-[#f84464] outline-none transition-all font-bold shadow-sm ${!isEditing && 'opacity-60 cursor-not-allowed text-gray-500'}`}
                                                value={profileData.lastName}
                                                onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                                                disabled={!isEditing}
                                                placeholder="Enter Last Name"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-[#666666] uppercase tracking-widest ml-2">Birthday</label>
                                            <input
                                                type="date"
                                                className={`w-full bg-white border border-black/10 rounded-xl p-5 text-sm text-[#121212] focus:border-[#f84464] outline-none transition-all font-bold shadow-sm ${!isEditing && 'opacity-60 cursor-not-allowed text-gray-500'}`}
                                                value={profileData.birthday}
                                                onChange={(e) => setProfileData({ ...profileData, birthday: e.target.value })}
                                                disabled={!isEditing}
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-[#666666] uppercase tracking-widest ml-2">Gender</label>
                                            <div className="flex gap-4">
                                                {['Male', 'Female'].map(g => (
                                                    <button
                                                        key={g}
                                                        type="button"
                                                        onClick={() => isEditing && setProfileData({...profileData, gender: g})}
                                                        className={`flex-1 p-4 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${profileData.gender === g ? 'bg-[#121212] text-white border-[#121212]' : 'bg-white text-[#666666] border-black/10 hover:border-black/20'}`}
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
                                    <h3 className="text-2xl font-black text-[#121212] uppercase italic tracking-tighter mb-8">Contact Information</h3>
                                    <div className="space-y-6 p-10 bg-[#F5F5FA] border border-black/5 rounded-[1rem]">
                                        <div className="flex items-center justify-between p-6 bg-white rounded-2xl border border-black/5 shadow-sm">
                                            <div className="flex items-center gap-6">
                                                <div className="w-12 h-12 bg-black/5 rounded-full flex items-center justify-center text-xl shadow-inner italic font-black text-[#121212]">@</div>
                                                <div>
                                                    <p className="text-[9px] font-black text-[#666666] uppercase tracking-widest mb-1">Email Address</p>
                                                    <p className="text-sm font-bold text-[#121212] italic">{profileData.email}</p>
                                                </div>
                                            </div>
                                            <span className="text-[8px] px-3 py-1 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-full font-black uppercase tracking-tighter">Verified</span>
                                        </div>
                                        <div className="flex flex-col gap-3 p-6 bg-white rounded-2xl border border-black/5 shadow-sm">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-12 h-12 bg-black/5 rounded-full flex items-center justify-center text-xl shadow-inner font-black text-[#121212]">#</div>
                                                    <div>
                                                        <p className="text-[9px] font-black text-[#666666] uppercase tracking-widest mb-1">Mobile Number</p>
                                                        {!isEditing ? (
                                                            <p className="text-sm font-bold text-[#121212]">{profileData.mobile}</p>
                                                        ) : (
                                                            <input 
                                                                type="text" 
                                                                className="bg-transparent border-b border-[#f84464]/50 text-sm font-bold text-[#121212] outline-none focus:border-[#f84464] transition-all uppercase"
                                                                value={profileData.mobile}
                                                                onChange={(e) => setProfileData({...profileData, mobile: e.target.value})}
                                                                autoFocus
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                                {!isEditing && <button type="button" onClick={() => setIsEditing(true)} className="text-[10px] font-black text-[#f84464] uppercase tracking-widest hover:underline">Edit</button>}
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* Address Details Section */}
                                <section>
                                    <h3 className="text-2xl font-black text-[#121212] uppercase italic tracking-tighter mb-8">Address Details</h3>
                                    <div className="grid grid-cols-2 gap-8 p-10 bg-[#F5F5FA] border border-black/5 rounded-[1rem]">
                                        <div className="col-span-2 space-y-3">
                                            <label className="text-[10px] font-black text-[#666666] uppercase tracking-widest ml-2">Pincode</label>
                                            <input
                                                type="text"
                                                className={`w-full bg-white border border-black/10 rounded-xl p-5 text-sm text-[#121212] focus:border-[#f84464] outline-none transition-all font-bold shadow-sm ${!isEditing && 'opacity-60 cursor-not-allowed text-gray-500'}`}
                                                value={profileData.pincode}
                                                onChange={(e) => setProfileData({ ...profileData, pincode: e.target.value })}
                                                disabled={!isEditing}
                                                placeholder="Enter Pincode"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-[#666666] uppercase tracking-widest ml-2">City</label>
                                            <input
                                                type="text"
                                                className={`w-full bg-white border border-black/10 rounded-xl p-5 text-sm text-[#121212] focus:border-[#f84464] outline-none transition-all font-bold shadow-sm ${!isEditing && 'opacity-60 cursor-not-allowed text-gray-500'}`}
                                                value={profileData.city}
                                                onChange={(e) => setProfileData({...profileData, city: e.target.value})}
                                                disabled={!isEditing}
                                                placeholder="City"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-[#666666] uppercase tracking-widest ml-2">State</label>
                                            <input
                                                type="text"
                                                className={`w-full bg-white border border-black/10 rounded-xl p-5 text-sm text-[#121212] focus:border-[#f84464] outline-none transition-all font-bold shadow-sm ${!isEditing && 'opacity-60 cursor-not-allowed text-gray-500'}`}
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
                                    <h3 className="text-2xl font-black text-[#121212] uppercase italic tracking-tighter mb-8">Cinematic Interests</h3>
                                    <div className="p-10 bg-[#F5F5FA] border border-black/5 rounded-[1rem] space-y-10">
                                        <div>
                                            <p className="text-[10px] font-black text-[#666666] uppercase tracking-widest mb-6 ml-2">Favorite Genres</p>
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
                                                            className={`px-5 py-3 rounded-full border text-[9px] font-black uppercase tracking-widest transition-all shadow-sm ${isSelected ? 'bg-[#f84464] border-[#f84464] text-white' : 'border-black/10 bg-white text-[#121212] hover:border-[#f84464]/50'}`}
                                                        >
                                                            {genre}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-[#666666] uppercase tracking-widest mb-6 ml-2">Preferred Languages</p>
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
                                                            className={`px-5 py-3 rounded-full border text-[9px] font-black uppercase tracking-widest transition-all shadow-sm ${isSelected ? 'bg-[#f84464] border-[#f84464] text-white' : 'border-black/10 bg-white text-[#121212] hover:border-[#f84464]/50'}`}
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
                                    <div className="flex gap-4 pt-10 border-t border-black/5">
                                        <button type="submit" className="flex-1 py-6 bg-[#f84464] text-white font-black rounded-2xl hover:bg-[#ff1f4b] transition-all shadow-lg shadow-[#f84464]/20 uppercase text-[11px] tracking-widest active:scale-95">Save Changes</button>
                                        <button type="button" onClick={() => setIsEditing(false)} className="px-12 py-6 bg-white text-[#666666] font-black rounded-2xl border border-black/10 transition-all uppercase text-[11px] tracking-widest hover:text-[#121212] hover:bg-black/5">Discard</button>
                                    </div>
                                )}
                            </form>
                        )}

                        {activeTab === 'bookings' && (
                            <div className="space-y-10 animate-in fade-in slide-in-from-right duration-700">
                                <div className="flex items-center justify-between pb-6 border-b border-black/5">
                                    <h3 className="text-3xl font-black text-[#121212] uppercase italic tracking-tighter">Your Orders</h3>
                                    <p className="text-[10px] font-black text-[#666666] uppercase tracking-widest">{bookings.length} reservations found</p>
                                </div>
                                <div className="grid gap-8">
                                    {bookings.map((b, idx) => (
                                        <div key={b._id} className="group bg-[#F5F5FA] border border-black/5 rounded-[.7rem] p-8 flex items-center gap-10 hover:border-[#f84464]/30 transition-all duration-500 shadow-xl">
                                            <div className="w-24 h-36 bg-gray-200 rounded-xl overflow-hidden shrink-0 border border-black/5 group-hover:scale-105 transition-transform duration-700 shadow-md">
                                                <img src={b.posterPath} className="w-full h-full object-cover" alt={b.movieTitle} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <h4 className="text-2xl font-black text-[#121212] uppercase tracking-tighter italic group-hover:text-[#f84464] transition-colors leading-none">{b.movieTitle}</h4>
                                                    <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${b.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-orange-500/10 text-orange-600 border border-orange-500/20 animate-pulse'}`}>
                                                        {b.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-[8px] font-black text-[#666666] uppercase tracking-widest">Venue</p>
                                                        <p className="text-[11px] font-bold text-[#121212] uppercase">{b.theaterName}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[8px] font-black text-[#666666] uppercase tracking-widest">Schedule</p>
                                                        <p className="text-[11px] font-bold text-[#121212] uppercase">{b.showDate} • {b.showtime}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[8px] font-black text-[#666666] uppercase tracking-widest">Seats</p>
                                                        <p className="text-[11px] font-bold text-[#f84464] uppercase tracking-tighter italic">{b.seats?.join(', ')}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <button onClick={() => setSelectedTicket(b)} className="px-8 py-4 bg-[#121212] text-white rounded-2xl text-[10px] font-black uppercase hover:bg-[#f84464] transition-all active:scale-95 shadow-lg">View Ticket</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </main>
                </div>

                {/* Secure Status Bar */}
                <div className="px-12 py-5 bg-[#F5F5FA] border-t border-black/5 flex items-center justify-between">
                    <div className="flex items-center gap-10">
                        <div className="flex items-center gap-3">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.4)]"></span>
                            <span className="text-[9px] font-black text-[#666666] uppercase tracking-widest">System Operational</span>
                        </div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.4em]">Movie Show Official Member Zone © {new Date().getFullYear()}</p>
                    </div>
                </div>

                {/* Ticket Portal Overlay */}
                {selectedTicket && (
                    <div 
                        className="fixed inset-0 z-[150] bg-black/40 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in duration-500 overflow-y-auto"
                        onClick={() => setSelectedTicket(null)}
                    >
                         <div 
                            className="w-full h-[98vh] max-w-sm bg-white rounded-[.7rem] border border-black/10 shadow-2xl overflow-hidden relative animate-in zoom-in duration-300 printable-ticket overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button onClick={() => setSelectedTicket(null)} className="absolute top-6 right-6 z-20 w-10 h-10 flex items-center justify-center bg-black/5 hover:bg-red-600 text-[#121212] hover:text-white rounded-full transition-all print-hide">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                            <div className="p-10 bg-white">
                                <div className="text-center mb-10">
                                    <div className="w-16 h-16 bg-[#f84464] rounded-[.7rem] mx-auto flex items-center justify-center mb-5 shadow-lg shadow-red-600/20">
                                        <span className="text-2xl font-black text-white italic">MS</span>
                                    </div>
                                    <h4 className="text-[#121212] font-black uppercase tracking-tight text-xl italic">Digital Entry Pass</h4>
                                    <p className="text-[#666666] text-[8px] font-black uppercase tracking-[0.4em] mt-2 italic opacity-60">Verified Cinema Confirmation</p>
                                </div>
                                <div className="bg-[#F5F5FA] border border-black/5 rounded-xl p-6 mb-10 flex gap-6 shadow-sm">
                                    <div className="w-20 h-28 bg-gray-200 rounded-xl overflow-hidden shrink-0 shadow-md">
                                        <img src={selectedTicket.posterPath} className="w-full h-full object-cover" alt="movie" />
                                    </div>
                                    <div className="flex-1 flex flex-col justify-center">
                                        <p className="text-[#121212] font-black uppercase text-xs mb-1 truncate italic tracking-tighter leading-tight">{selectedTicket.movieTitle}</p>
                                        <p className="text-[#f84464] text-[9px] font-black uppercase tracking-[0.1em] mb-2 italic">{selectedTicket.userName || 'Superstar User'}</p>
                                        <p className="text-[#666666] text-[8px] font-bold uppercase tracking-widest">{selectedTicket.theaterName}</p>
                                        <p className="text-[#121212] font-black uppercase text-[10px] mt-2 italic">{selectedTicket.showDate} • {selectedTicket.showtime}</p>
                                        
                                        <div className="mt-4 pt-3 border-t border-black/5">
                                            <p className="text-[8px] font-black text-[#666666] uppercase tracking-widest mb-1">Booked Seats</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {selectedTicket.seats?.map(seat => (
                                                    <span key={seat} className="px-2 py-0.5 bg-[#f84464]/10 text-[#f84464] text-[9px] font-black rounded border border-[#f84464]/20 italic">
                                                        {seat}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-center mb-8 gap-4">
                                    <div className="w-32 h-32 bg-white p-3 rounded-[2.2rem] border border-black/10 shadow-lg">
                                         <div className="w-full h-full bg-[repeating-conic-gradient(#000_0%_25%,#fff_0%_50%)] bg-[length:10px_10px] opacity-90 rounded-2xl qr-pattern"></div>
                                    </div>
                                    <p className="text-[9px] font-black text-[#666666] uppercase tracking-widest italic opacity-60">Order ID: {selectedTicket.bookingId || selectedTicket._id?.slice(-8)}</p>
                                </div>
                                <div className="space-y-3">
                                    <button onClick={handlePrint} className="w-full py-5 bg-black/5 text-[#666666] text-[11px] font-black uppercase rounded-[2rem] hover:bg-blue-500 transition-all shadow-xl print-hide active:scale-95">📥 Download Official Ticket</button>
                                    <button onClick={() => setSelectedTicket(null)} className="w-full py-4 bg-black/5 text-[#666666] text-[10px] font-black uppercase rounded-[2rem] hover:bg-[#f84464] hover:text-white transition-all print-hide">← Close & Return</button>
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
