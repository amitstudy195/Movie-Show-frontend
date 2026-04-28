import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingService, authService } from '../services/api';
import api from '../services/api';
import { cinemaService } from '../services/cinemaService';

function InsightsPanel({ theaters, schedules, movies, bookings, totalUsers, fetchAnalytics }) {
    const bookingList = Array.isArray(bookings) ? bookings : [];
    const confirmedBookings = bookingList.filter(b => b?.status === 'confirmed' || b?.status === undefined);
    const pendingBookings = bookingList.filter(b => b?.status === 'pending');
    
    const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (parseFloat(b?.totalPrice) || 0), 0);
    const pendingRevenue = pendingBookings.reduce((sum, b) => sum + (parseFloat(b?.totalPrice) || 0), 0);
    const totalTickets = confirmedBookings.reduce((sum, b) => sum + (b?.seats?.length || 0), 0);

    const trends = confirmedBookings.reduce((acc, b) => {
        const timestamp = b?.createdAt || Date.now();
        const date = new Date(timestamp).toLocaleDateString();
        acc[date] = (acc[date] || 0) + 1;
        return acc;
    }, {});
    const trendData = Object.entries(trends).slice(-7);

    const moviePopularity = confirmedBookings.reduce((acc, b) => {
        const title = b?.movieTitle || 'Unknown Cinematic Asset';
        acc[title] = (acc[title] || 0) + 1;
        return acc;
    }, {});

    const sortedPopularity = Object.entries(moviePopularity)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    const downloadCSV = () => {
        const headers = ["BookingID", "User", "Movie", "Theater", "Seats", "TotalPaid", "Date"];
        const rows = bookingList.map(b => [
            b.bookingId || b._id,
            b.userName || b.userId?.name || 'Guest',
            b.movieTitle,
            b.theaterName,
            b.seats?.length || 0,
            b.totalPrice,
            new Date(b.createdAt).toLocaleDateString()
        ]);
        
        let csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");
            
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `HeroCore_Matrix_Report_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
    };

    return (
        <div className="space-y-12 animate-in fade-in duration-1000 w-full overflow-hidden pb-12">
            
            {/* Action Bar */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-[#121212] font-black uppercase text-2xl tracking-tighter flex items-center gap-4 italic leading-none">
                        VELOCITY ENGINE
                        <span className="flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-[#F84464] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#F84464]"></span>
                        </span>
                    </h2>
                    <p className="text-[#666666] text-[10px] font-black uppercase tracking-[0.4em] mt-3 italic">Autonomous Stream Integration Layer</p>
                </div>
                <div className="flex gap-6">
                    <button 
                        onClick={async () => {
                            if (!window.confirm("Initialize Neural Seeding? This generates synthetic flow data for visualization.")) return;
                            try {
                                const sampleBookings = [
                                    { movieTitle: "The Batman II", theaterName: "Elite Cineplex", seats: ["A1", "A2"], totalPrice: 300, showtime: "07:45 PM", showDate: "24 APR WED" },
                                    { movieTitle: "Joker: Folie à Deux", theaterName: "Starlight Hub", seats: ["B5"], totalPrice: 180, showtime: "05:45 PM", showDate: "24 APR WED" },
                                    { movieTitle: "Interstellar 4K", theaterName: "IMAX Prime", seats: ["C10", "C11", "C12"], totalPrice: 600, showtime: "10:30 PM", showDate: "25 APR THU" }
                                ];
                                for (const b of sampleBookings) {
                                    await bookingService.createBooking({ ...b, bookingId: `HW-${Math.random().toString(36).substr(2, 6).toUpperCase()}` });
                                }
                                alert("Neural Matrix Seeded. Initializing Sync...");
                                fetchAnalytics();
                            } catch (err) { alert("Matrix Collision: " + err.message); }
                        }}
                        className="px-8 py-4 bg-[#F84464]/10 text-[#F84464] border border-[#F84464]/20 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#F84464] hover:text-white transition-all flex items-center gap-3 italic"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        INITIATE SEED
                    </button>
                    <button 
                        onClick={downloadCSV}
                        className="px-8 py-4 bg-white text-[#121212] border border-black/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#F84464] hover:text-white transition-all shadow-lg flex items-center gap-3 italic"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        EXTRACT GLOBAL DATA
                    </button>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'GROSS FLUIDITY', value: totalRevenue, color: '#F84464', prefix: 'CR' },
                    { label: 'PIPELINE RESERVE', value: pendingRevenue, color: '#666666', prefix: 'CR' },
                    { label: 'TICKET THROUGHPUT', value: totalTickets, color: '#121212', prefix: '#' },
                    { label: 'IDENTIFIED NODES (USERS)', value: totalUsers, color: '#F84464', prefix: '#' }
                ].map(metric => (
                    <div key={metric.label} className="bg-white border border-black/5 rounded-[2rem] p-8 hover:border-[#F84464]/20 transition-all group shadow-sm">
                        <p className="text-[9px] font-black text-[#666666] uppercase tracking-[0.3em] mb-4 italic flex items-center gap-2">
                             <span className="w-1.5 h-1.5 rounded-full" style={{ background: metric.color }}></span>
                             {metric.label}
                        </p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-xs font-black opacity-20 italic">{metric.prefix}</span>
                            <h4 className="text-4xl font-black text-[#121212] tracking-tighter italic group-hover:scale-105 transition-transform">
                                {metric.value.toLocaleString()}
                            </h4>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                {/* Visual Trends */}
                <div className="xl:col-span-2 bg-white border border-black/5 rounded-[3rem] p-10 shadow-sm">
                    <div className="flex justify-between items-center mb-12">
                        <h3 className="text-[#121212] font-black uppercase text-[10px] tracking-[0.4em] italic">TRANSACTION DENSITY MATRIX</h3>
                        <div className="flex gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#F84464] animate-pulse"></span>
                            <span className="text-[8px] font-black text-[#F84464] uppercase tracking-widest italic">NEURAL LINK ACTIVE</span>
                        </div>
                    </div>
                    
                    <div className="h-56 w-full flex items-end justify-between gap-6 px-4">
                        {trendData.length > 0 ? trendData.map(([date, count], idx) => {
                            const max = Math.max(...trendData.map(d => d[1]));
                            const height = max > 0 ? (count / max) * 100 : 5;
                            return (
                                <div key={date} className="flex-1 flex flex-col items-center gap-6 group">
                                    <div className="relative w-full flex justify-center items-end h-full">
                                        <div 
                                            className="w-2 bg-gradient-to-t from-[#F84464] via-[#F84464]/50 to-transparent rounded-full transition-all duration-1000 group-hover:w-4 group-hover:from-black group-hover:to-[#F84464] shadow-lg"
                                            style={{ height: `${height}%` }}
                                        >
                                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-[9px] font-black px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 italic">
                                                {count} FLUX
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-[8px] font-black text-[#666666] uppercase italic tracking-[0.2em] transform -rotate-45 mt-4 opacity-40 group-hover:opacity-100 transition-opacity">{date}</span>
                                </div>
                            );
                        }) : (
                            <div className="w-full h-full flex items-center justify-center text-[#666666] text-[10px] font-black uppercase tracking-[0.5em] italic opacity-20">
                                AWAITING TEMPORAL DATA POINTS
                            </div>
                        )}
                    </div>
                </div>

                {/* Popularity Index */}
                <div className="bg-white border border-black/5 rounded-[3rem] p-10 shadow-sm">
                    <h3 className="text-[#121212] font-black uppercase text-[10px] tracking-[0.4em] mb-10 italic">POPULARITY QUOTIENT</h3>
                    <div className="space-y-8">
                        {sortedPopularity.length > 0 ? sortedPopularity.map(([title, count], idx) => (
                            <div key={title} className="space-y-3 group">
                                <div className="flex justify-between items-end">
                                    <span className="text-[10px] font-black text-[#666666] uppercase tracking-widest italic leading-none truncate pr-6 group-hover:text-[#121212] transition-colors">{title}</span>
                                    <span className="text-[10px] font-black text-[#121212] italic">{count} UNITS</span>
                                </div>
                                <div className="h-1.5 w-full bg-black/5 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full bg-gradient-to-r ${idx === 0 ? 'from-[#F84464] to-black' : 'from-black/10 to-black/20'} rounded-full transition-all duration-1000 group-hover:scale-x-105 origin-left`} 
                                        style={{ width: `${(count / (sortedPopularity[0][1] || 1)) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        )) : (
                            <div className="py-24 text-center text-[#666666] text-[9px] font-black uppercase tracking-[0.3em] italic opacity-20">PENDING MARKET ANALYSIS</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Smart Intelligence Integration */}
            <div className="p-10 bg-[#F84464]/5 border border-[#F84464]/10 rounded-[3rem] shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-12 text-9xl opacity-5 transform translate-x-10 translate-y-[-40px] select-none italic font-black text-[#F84464]">CORE</div>
                <div className="relative z-10 flex items-center gap-10">
                    <div className="w-16 h-16 rounded-3xl bg-[#F84464]/10 border border-[#F84464]/20 flex items-center justify-center text-3xl shadow-lg">🤖</div>
                    <div>
                        <p className="text-[9px] font-black text-[#F84464] uppercase tracking-[0.5em] mb-3 italic">AUTONOMOUS OPERATIONS SUMMARY</p>
                        <p className="text-[#121212] font-black uppercase text-sm leading-relaxed max-w-4xl italic tracking-tight">
                            VITAL SIGNS OPTIMAL. THE NETWORK IS OPERATING AT <span className="text-[#F84464]">100% EFFICIENCY</span>. 
                            PEAK ACCELERATION DETECTED. 
                            NEXT PREDICTIVE SCALE PHASE: <span className="text-black">PHASE 4 ENABLED</span>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

const AdminDashboard = ({ 
    allTheaters: theaters, 
    setAllTheaters: setTheaters, 
    allSchedules: schedules, 
    setAllSchedules: setSchedules, 
    allMovies: movies, 
    onClose 
}) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('schedules');
    const [newTheater, setNewTheater] = useState({ name: '', location: '', city: 'Mumbai', rows: 8, cols: 12, price: 150 });
    const [newSchedule, setNewSchedule] = useState({ movieId: '', theaterId: '', time: '' });
    const [editingTheater, setEditingTheater] = useState(null);
    const [editingSchedule, setEditingSchedule] = useState(null);
    const [loading, setLoading] = useState(false);
    const [allBookings, setAllBookings] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [syncStatus, setSyncStatus] = useState('syncing');
    const [lastSync, setLastSync] = useState(null);

    const fetchAnalytics = async () => {
        setSyncStatus('syncing');
        try {
            try {
                const usersData = await authService.getAllUsers();
                if (Array.isArray(usersData)) {
                    setAllUsers([...usersData].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)));
                }
            } catch (uErr) { /* Silently Handled */ }

            try {
                const bookingsData = await bookingService.getAllBookings();
                if (Array.isArray(bookingsData)) {
                    setAllBookings(bookingsData);
                }
            } catch (bErr) { /* Silently Handled */ }

            setLastSync(new Date().toLocaleTimeString());
            setSyncStatus('live');
        } catch (err) {
            setSyncStatus('error');
        }
    };

    useEffect(() => {
        fetchAnalytics();
        const heartbeat = setInterval(fetchAnalytics, 15000);
        return () => clearInterval(heartbeat);
    }, []);

    const handleAddTheater = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingTheater) {
                const targetId = editingTheater._id || editingTheater.id;
                const response = await api.put(`/theaters/${targetId}`, newTheater);
                
                setTheaters(prev => prev.map(t => {
                    const currentId = t._id || t.id;
                    return (targetId && currentId === targetId) ? response.data : t;
                }));
                setEditingTheater(null);
            } else {
                const response = await api.post('/theaters', { ...newTheater, formats: ['2D', '3D', 'IMAX'] });
                setTheaters(prev => [...prev, response.data]);
            }
            setNewTheater({ name: '', location: '', city: 'Mumbai', rows: 8, cols: 12, price: 150 });
        } catch (err) {
            alert("Administrative Protocol Denied.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTheater = async (id) => {
        if (!id || !window.confirm("ARE YOU SURE?")) return;
        try {
            await api.delete(`/theaters/${id}`);
            setTheaters(prev => prev.filter(t => (t._id !== id && t.id !== id)));
        } catch (err) { console.error(err); }
    };

    const handleAddSchedule = async (e) => {
        e.preventDefault();
        
        let targetId = editingSchedule?._id || editingSchedule?.id;
        
        if (editingSchedule) {
            setSchedules(prev => prev.map(s => {
                const currentId = s._id || s.id;
                return (targetId && currentId === targetId) ? { ...newSchedule, _id: targetId, id: targetId } : s;
            }));
            setEditingSchedule(null);
        } else {
            const tempId = Date.now().toString();
            setSchedules(prev => [...prev, { ...newSchedule, id: tempId, _id: tempId }]);
        }
        
        // Use functional state for sync to ensure latest data
        setSchedules(currentSchedules => {
            cinemaService.syncData(theaters, currentSchedules);
            return currentSchedules;
        });

        const latest = await cinemaService.fetchSchedules();
        setSchedules(latest);
        setNewSchedule({ movieId: '', theaterId: '', time: '' });
    };

    const handleRemoveSchedule = async (id) => {
        if (!id) return;
        if (id.toString().length > 15) await cinemaService.deleteSchedule(id);
        setSchedules(prev => prev.filter(s => (s._id || s.id) !== id));
        
        setSchedules(currentSchedules => {
            cinemaService.syncData(theaters, currentSchedules);
            return currentSchedules;
        });
    };

    const startEditing = (theater) => {
        setEditingTheater(theater);
        setNewTheater({
            name: theater.name,
            location: theater.location,
            city: theater.city,
            rows: theater.rows,
            cols: theater.cols,
            price: theater.price
        });
        setActiveTab('theaters');
    };

    return (
        <div className="fixed inset-0 z-[110] bg-white/95 backdrop-blur-3xl p-4 md:p-12 overflow-y-auto">
            <div className="max-w-6xl mx-auto bg-white border border-black/5 rounded-[2.5rem] shadow-2xl flex flex-col min-h-[80vh]">
                
                {/* Header Area */}
                <div className="p-8 border-b border-black/5 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-20">
                    <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-[#F84464] rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
                            <span className="text-2xl text-white">⚙️</span>
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-[#121212] uppercase tracking-tighter italic">MISSION CONTROL</h2>
                            <div className="flex items-center gap-3 mt-1">
                                <p className="text-[#666666] text-[9px] font-black uppercase tracking-[0.4em] italic">Infrastructure Matrix</p>
                                <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${syncStatus === 'live' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-[#F84464]/10 border-[#F84464]/20 text-[#F84464]'}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${syncStatus === 'live' ? 'bg-green-500' : 'bg-[#F84464] animate-pulse'}`}></span>
                                    <span className="text-[7px] font-black uppercase tracking-widest">{syncStatus === 'live' ? `SYNC LIVE • ${lastSync}` : 'Establishing Link...'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <button onClick={() => onClose ? onClose() : navigate('/')} className="w-12 h-12 flex items-center justify-center bg-black/5 hover:bg-[#F84464] text-[#121212] hover:text-white rounded-full transition-all">
                        <span className="text-xl">✕</span>
                    </button>
                </div>

                {/* Tabs System */}
                <div className="flex px-8 py-5 gap-6 border-b border-black/5 bg-[#F5F5FA]/30">
                    {[
                        { id: 'schedules', lbl: 'Program Manager' },
                        { id: 'theaters', lbl: 'Hub Config' },
                        { id: 'insights', lbl: 'Velocity Intel' },
                        { id: 'users', lbl: 'User Registry' }
                    ].map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest italic transition-all ${activeTab === tab.id ? 'bg-[#F84464] text-white shadow-xl shadow-[#F84464]/20' : 'text-[#666666] hover:text-[#121212] hover:bg-black/5'}`}
                        >
                            {tab.lbl}
                        </button>
                    ))}
                </div>

                <div className="flex-1 p-10 bg-[#F5F5FA]/50">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        
                        {(activeTab === 'schedules' || activeTab === 'theaters') && (
                            <div className="lg:col-span-4 space-y-8 animate-in slide-in-from-left duration-500">
                                {activeTab === 'schedules' ? (
                                    <div className="bg-white p-8 rounded-[2.5rem] border border-black/5 shadow-sm">
                                        <h3 className="text-[#121212] font-black uppercase tracking-widest text-[10px] mb-8 italic">Sync New Showtime</h3>
                                        <form onSubmit={handleAddSchedule} className="space-y-4">
                                            <select required className="w-full bg-[#F5F5FA] border border-black/5 rounded-2xl p-5 text-[#121212] font-black text-[10px] uppercase tracking-widest outline-none focus:border-[#F84464]" value={newSchedule.movieId} onChange={(e) => setNewSchedule({...newSchedule, movieId: e.target.value})}>
                                                <option value="">SELECT CINEMATIC ASSET</option>
                                                {movies.map((m, idx) => <option key={`${m.id}-${idx}`} value={m.id}>{m.title.toUpperCase()}</option>)}
                                            </select>
                                            <select required className="w-full bg-[#F5F5FA] border border-black/5 rounded-2xl p-5 text-[#121212] font-black text-[10px] uppercase tracking-widest outline-none focus:border-[#F84464]" value={newSchedule.theaterId} onChange={(e) => setNewSchedule({...newSchedule, theaterId: e.target.value})}>
                                                <option value="">SELECT THEATER HUB</option>
                                                {theaters.map((t, idx) => <option key={`${t._id || t.id}-${idx}`} value={t._id || t.id}>{t.name.toUpperCase()}</option>)}
                                            </select>
                                            <input type="text" required placeholder="HH:MM AM/PM" className="w-full bg-[#F5F5FA] border border-black/5 rounded-2xl p-5 text-[#121212] font-black text-[10px] uppercase tracking-widest outline-none focus:border-[#F84464]" value={newSchedule.time} onChange={(e) => setNewSchedule({...newSchedule, time: e.target.value})} />
                                            <button type="submit" className="w-full py-5 btn-hero text-white rounded-2xl text-[10px] italic shadow-2xl mt-4">
                                                {editingSchedule ? 'UPGRADE PROJECTION' : 'INITIATE ASSIGNMENT'}
                                            </button>
                                        </form>
                                    </div>
                                ) : (
                                    <div className="bg-white p-8 rounded-[2.5rem] border border-black/5 shadow-sm">
                                        <h3 className="text-[#121212] font-black uppercase tracking-widest text-[10px] mb-8 italic">{editingTheater ? 'SYSTEM OVERRIDE' : 'INITIALIZE HUB'}</h3>
                                        <form onSubmit={handleAddTheater} className="space-y-4">
                                            <input type="text" required placeholder="HUB NAME" className="w-full bg-[#F5F5FA] border border-black/5 rounded-2xl p-5 text-[#121212] font-black text-[10px] uppercase outline-none focus:border-[#F84464]" value={newTheater.name} onChange={(e) => setNewTheater({...newTheater, name: e.target.value})} />
                                            <input type="text" required placeholder="SECTOR (CITY)" className="w-full bg-[#F5F5FA] border border-black/5 rounded-2xl p-5 text-[#121212] font-black text-[10px] uppercase outline-none focus:border-[#F84464]" value={newTheater.city} onChange={(e) => setNewTheater({...newTheater, city: e.target.value})} />
                                            <input type="text" required placeholder="LOCATION" className="w-full bg-[#F5F5FA] border border-black/5 rounded-2xl p-5 text-[#121212] font-black text-[10px] uppercase outline-none focus:border-[#F84464]" value={newTheater.location} onChange={(e) => setNewTheater({...newTheater, location: e.target.value})} />
                                            <div className="grid grid-cols-2 gap-4">
                                                <input type="number" required placeholder="ROWS" className="w-full bg-[#F5F5FA] border border-black/5 rounded-2xl p-5 text-[#121212] font-black text-[10px]" value={newTheater.rows} onChange={(e) => setNewTheater({...newTheater, rows: parseInt(e.target.value)})} />
                                                <input type="number" required placeholder="COLS" className="w-full bg-[#F5F5FA] border border-black/5 rounded-2xl p-5 text-[#121212] font-black text-[10px]" value={newTheater.cols} onChange={(e) => setNewTheater({...newTheater, cols: parseInt(e.target.value)})} />
                                            </div>
                                            <input type="number" required placeholder="CREDITS" className="w-full bg-[#F5F5FA] border border-black/5 rounded-2xl p-5 text-[#121212] font-black text-[10px]" value={newTheater.price} onChange={(e) => setNewTheater({...newTheater, price: parseFloat(e.target.value)})} />
                                            <div className="flex gap-4">
                                                <button type="submit" className="flex-1 py-5 btn-hero text-white rounded-2xl text-[10px] italic">
                                                    {editingTheater ? 'SAVE OVERRIDE' : 'DEPLOY HUB'}
                                                </button>
                                                {editingTheater && <button type="button" onClick={() => { setEditingTheater(null); setNewTheater({ name: '', location: '', city: 'Mumbai', rows: 8, cols: 12, price: 150 }); }} className="px-6 py-5 bg-black/5 text-[#666666] rounded-2xl text-[10px] font-black italic">EXIT</button>}
                                            </div>
                                        </form>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className={(activeTab === 'insights' || activeTab === 'users') ? "lg:col-span-12" : "lg:col-span-8"}>
                            {activeTab === 'schedules' ? (
                                <div className="space-y-4">
                                    {schedules.map((s, idx) => {
                                        const m = movies.find(mv => mv?.id?.toString() === s?.movieId?.toString());
                                        const theaterRefId = s?.theaterId?._id || s?.theaterId;
                                        const t = theaters.find(th => (th?._id || th?.id)?.toString() === theaterRefId?.toString());
                                        return (
                                            <div key={`${s._id || s.id}-${idx}`} className="flex items-center justify-between bg-white border border-black/5 rounded-2xl p-6 hover:border-[#F84464]/30 transition-all cursor-pointer group shadow-sm" onClick={() => { setEditingSchedule(s); setNewSchedule({ ...s, theaterId: s.theaterId?._id || s.theaterId }); }}>
                                                <div className="flex items-center gap-6">
                                                    <div className="w-12 h-16 bg-[#F5F5FA] rounded-xl overflow-hidden border border-black/10 group-hover:scale-105 transition-transform">
                                                        {m?.poster_path && <img src={`https://image.tmdb.org/t/p/w200${m.poster_path}`} className="w-full h-full object-cover" alt="poster" />}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-[#121212] font-black text-xs uppercase italic tracking-widest">{m?.title || 'Unknown'}</h4>
                                                        <p className="text-[#F84464] text-[8px] font-black uppercase mt-2 tracking-widest">{t?.name || 'N/A'} • {s.time}</p>
                                                    </div>
                                                </div>
                                                <button onClick={(e) => { e.stopPropagation(); handleRemoveSchedule(s._id || s.id); }} className="w-10 h-10 flex items-center justify-center bg-black/5 text-[#666666] hover:bg-[#F84464] hover:text-white rounded-xl transition-all">✕</button>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : activeTab === 'insights' ? (
                                <InsightsPanel theaters={theaters} schedules={schedules} movies={movies} bookings={allBookings} totalUsers={allUsers.length} fetchAnalytics={fetchAnalytics} />
                            ) : activeTab === 'users' ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {allUsers.map((u, idx) => (
                                        <div key={`${u._id || idx}-${idx}`} className="bg-white border border-black/5 rounded-2xl p-6 shadow-sm group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-[#F5F5FA] rounded-xl flex items-center justify-center text-[#121212] font-black italic border border-black/5">{u.name?.charAt(0) || 'U'}</div>
                                                <div>
                                                    <h4 className="text-[#121212] text-[10px] font-black uppercase italic tracking-widest">{u.name}</h4>
                                                    <p className="text-[#666666] text-[8px] font-black mt-1 opacity-50 uppercase">{u.email}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {theaters.map((t, idx) => (
                                        <div key={`${t._id || t.id}-${idx}`} className="bg-white border border-black/5 rounded-[2.5rem] p-8 hover:border-[#F84464]/30 transition-all group shadow-sm relative overflow-hidden">
                                            <div className="absolute top-[-20%] right-[-10%] text-9xl opacity-5 transform rotate-12 select-none italic font-black text-black">HUB</div>
                                            <div className="flex justify-between items-start mb-6">
                                                <div>
                                                    <h4 className="text-[#121212] font-black text-xl italic tracking-tighter leading-none">{t.name}</h4>
                                                    <p className="text-[#F84464] text-[9px] font-black uppercase tracking-widest mt-2">{t.location} • {t.city}</p>
                                                </div>
                                                <span className="bg-[#F5F5FA] border border-black/5 px-4 py-2 rounded-xl text-[#121212] text-[10px] font-black italic tracking-widest">CR {t.price}</span>
                                            </div>
                                            <div className="flex gap-3 pt-6 border-t border-black/5">
                                                <button onClick={() => startEditing(t)} className="flex-1 py-4 bg-[#F5F5FA] border border-black/5 text-[#121212] font-black rounded-xl hover:bg-[#F84464] hover:border-[#F84464] hover:text-white transition-all text-[8px] uppercase tracking-widest italic">UPGRADE</button>
                                                <button onClick={() => handleDeleteTheater(t._id)} className="w-12 h-12 bg-black/5 border border-black/5 text-[#666666] hover:bg-black hover:text-white rounded-xl flex items-center justify-center transition-all">✕</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
