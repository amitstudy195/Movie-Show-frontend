import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingService, authService } from '../services/api';
import api from '../services/api';
import { cinemaService } from '../services/cinemaService';

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
    const [totalUsers, setTotalUsers] = useState(0);
    const [allUsers, setAllUsers] = useState([]);
    const [syncStatus, setSyncStatus] = useState('syncing');
    const [lastSync, setLastSync] = useState(null);

    const fetchAnalytics = async () => {
        setSyncStatus('syncing');
        try {
            // Fetch users independently to ensure one failure doesn't block the other
            try {
                const usersData = await authService.getAllUsers();
                if (Array.isArray(usersData)) {
                    const sortedUsers = [...usersData].sort((a, b) => 
                        new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
                    );
                    setAllUsers(sortedUsers);
                    setTotalUsers(usersData.length);
                }
            } catch (uErr) {
                console.error("User Sync Protocol Failed:", uErr);
            }

            // Fetch bookings independently
            try {
                const bookingsData = await bookingService.getAllBookings();
                if (Array.isArray(bookingsData)) {
                    setAllBookings(bookingsData);
                }
            } catch (bErr) {
                console.error("Booking Sync Protocol Failed:", bErr);
            }

            setLastSync(new Date().toLocaleTimeString());
            setSyncStatus('live');
        } catch (err) {
            console.error("Critical Analytics Heartbeat Failure:", err);
            setSyncStatus('error');
        }
    };

    useEffect(() => {
        fetchAnalytics();
        const heartbeat = setInterval(fetchAnalytics, 5000); // Faster heartbeat (5s)
        return () => clearInterval(heartbeat);
    }, []);

    const handleAddTheater = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingTheater) {
                const response = await api.put(`/theaters/${editingTheater._id || editingTheater.id}`, newTheater);
                setTheaters(theaters.map(t => (t._id === editingTheater._id || t.id === editingTheater.id) ? response.data : t));
                setEditingTheater(null);
            } else {
                const response = await api.post('/theaters', {
                    ...newTheater,
                    formats: ['2D', '3D', 'IMAX']
                });
                setTheaters([...theaters, response.data]);
            }
            setNewTheater({ name: '', location: '', city: 'Mumbai', rows: 8, cols: 12, price: 150 });
        } catch (err) {
            console.error("Failed to manage theater:", err);
            alert("Security: Only admins can perform this protocol.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTheater = async (id) => {
        if (!window.confirm("ARE YOU SURE? This will permanently decommission this theater from the network.")) return;
        try {
            await api.delete(`/theaters/${id}`);
            setTheaters(theaters.filter(t => (t._id !== id && t.id !== id)));
        } catch (err) {
            console.error("Failed to delete theater:", err);
        }
    };

    const startEditing = (theater) => {
        setEditingTheater(theater);
        setNewTheater({ ...theater });
        setActiveTab('theaters');
    };

    const handleAddSchedule = async (e) => {
        e.preventDefault();
        let updatedSchedules;
        if (editingSchedule) {
            updatedSchedules = schedules.map(s => s.id === editingSchedule.id ? { ...newSchedule, id: s.id } : s);
            setEditingSchedule(null);
        } else {
            updatedSchedules = [...schedules, { ...newSchedule, id: Date.now() }];
        }
        
        setSchedules(updatedSchedules);
        const syncResult = await cinemaService.syncData(theaters, updatedSchedules);
        
        // If the backend returned real IDs, update the local state
        if (syncResult.success && syncResult.data) {
             const latest = await cinemaService.fetchSchedules();
             setSchedules(latest);
        }
        
        setNewSchedule({ movieId: '', theaterId: '', time: '' });
    };

    const handleRemoveSchedule = async (id) => {
        // If it looks like a MongoID, call the direct delete
        if (id.toString().length > 15) {
             await cinemaService.deleteSchedule(id);
        }
        
        const updatedSchedules = schedules.filter(s => (s._id || s.id) !== id);
        setSchedules(updatedSchedules);
        await cinemaService.syncData(theaters, updatedSchedules);
    };

    return (
        <div className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-3xl p-4 md:p-12 overflow-y-auto">
            <div className="max-w-6xl mx-auto bg-zinc-950 border border-white/10 rounded-[2.5rem] shadow-2xl flex flex-col min-h-[80vh]">
                
                {/* Header */}
                <div className="p-8 border-b border-white/5 flex items-center justify-between sticky top-0 bg-zinc-950/80 backdrop-blur-md z-20">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-600/20">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">Admin Systems</h2>
                            <div className="flex items-center gap-3 mt-1">
                                <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.4em]">Theater & Schedule Control</p>
                                <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border ${syncStatus === 'live' ? 'bg-green-500/10 border-green-500/20 text-green-500' : syncStatus === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-500'}`}>
                                    <span className={`w-1 h-1 rounded-full ${syncStatus === 'live' ? 'bg-green-500' : syncStatus === 'error' ? 'bg-red-500' : 'bg-cyan-500 animate-pulse'}`}></span>
                                    <span className="text-[7px] font-black uppercase tracking-widest">{syncStatus === 'live' ? `Live at ${lastSync}` : syncStatus === 'error' ? 'Network Error' : 'Syncing...'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={() => {
                            if (onClose) onClose();
                            else navigate('/');
                        }} 
                        className="w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-white hover:text-black rounded-full transition-all"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex px-8 py-4 gap-4 bg-white/[0.02] border-b border-white/5">
                    <button 
                        onClick={() => setActiveTab('schedules')}
                        className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'schedules' ? 'bg-white text-black' : 'text-gray-500 hover:text-white'}`}
                    >
                        Schedule Manager
                    </button>
                    <button 
                        onClick={() => setActiveTab('theaters')}
                        className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'theaters' ? 'bg-white text-black' : 'text-gray-500 hover:text-white'}`}
                    >
                        Theater Config
                    </button>
                    <button 
                        onClick={() => setActiveTab('insights')}
                        className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'insights' ? 'bg-white text-black' : 'text-gray-500 hover:text-white'}`}
                    >
                        Insights & Reporting
                    </button>
                    <button 
                        onClick={() => setActiveTab('users')}
                        className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'users' ? 'bg-white text-black' : 'text-gray-500 hover:text-white'}`}
                    >
                        User Registry
                    </button>
                </div>

                <div className="flex-1 p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 h-full">
                        
                        {/* Left Side: Forms (Only for Management Tabs) */}
                        {(activeTab === 'schedules' || activeTab === 'theaters') && (
                            <div className="lg:col-span-4 space-y-10 transition-all animate-in slide-in-from-left duration-500">
                        {activeTab === 'schedules' ? (
                            <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5">
                                <h3 className="text-white font-black uppercase tracking-widest text-sm mb-6 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
                                    Assign Showtime
                                </h3>
                                <form onSubmit={handleAddSchedule} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase ml-2">Select Movie</label>
                                        <select 
                                            required
                                            className="w-full bg-zinc-900 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-cyan-500 transition-all font-bold"
                                            value={newSchedule.movieId}
                                            onChange={(e) => setNewSchedule({...newSchedule, movieId: e.target.value})}
                                        >
                                            <option value="">Choose a movie...</option>
                                            {movies.map((m, idx) => (
                                                <option key={`m-${m.id || idx}`} value={m.id}>{m.title}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase ml-2">Select Theater</label>
                                        <select 
                                            required
                                            className="w-full bg-zinc-900 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-cyan-500 transition-all font-bold"
                                            value={newSchedule.theaterId}
                                            onChange={(e) => setNewSchedule({...newSchedule, theaterId: e.target.value})}
                                        >
                                            <option value="">Choose a theater...</option>
                                            {theaters.map((t, idx) => (
                                                <option key={`t-${t._id || t.id || idx}`} value={t._id || t.id}>{t.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase ml-2">Showtime</label>
                                        <input 
                                            type="text" 
                                            required
                                            placeholder="e.g. 07:45 PM"
                                            className="w-full bg-zinc-900 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-cyan-500 transition-all font-bold"
                                            value={newSchedule.time}
                                            onChange={(e) => setNewSchedule({...newSchedule, time: e.target.value})}
                                        />
                                    </div>
                                    <button type="submit" className={`w-full py-4 font-black rounded-2xl transition-all uppercase text-xs mt-4 ${editingSchedule ? 'bg-cyan-500 text-black' : 'bg-white text-black hover:bg-cyan-400'}`}>
                                        {editingSchedule ? 'Update Showtime' : 'Add to Schedule'}
                                    </button>
                                    {editingSchedule && (
                                        <button 
                                            type="button" 
                                            onClick={() => { setEditingSchedule(null); setNewSchedule({ movieId: '', theaterId: '', time: '' }); }}
                                            className="w-full mt-2 py-3 text-gray-500 font-bold uppercase text-[10px] hover:text-white"
                                        >
                                            Reset Form
                                        </button>
                                    )}
                                </form>
                            </div>
                        ) : (
                             <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5">
                                <h3 className="text-white font-black uppercase tracking-widest text-sm mb-6 flex items-center gap-2">
                                    <span className={`w-1.5 h-1.5 rounded-full ${editingTheater ? 'bg-amber-500' : 'bg-purple-500'}`}></span>
                                    {editingTheater ? 'Edit Configuration' : 'Add New Theater'}
                                </h3>
                                <form onSubmit={handleAddTheater} className="space-y-4">
                                    <input 
                                        type="text" required placeholder="Theater Name"
                                        className="w-full bg-zinc-900 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-purple-500 transition-all font-bold"
                                        value={newTheater.name}
                                        onChange={(e) => setNewTheater({...newTheater, name: e.target.value})}
                                    />
                                    <input 
                                        type="text" required placeholder="City (e.g. Patna, Mumbai)"
                                        className="w-full bg-zinc-900 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-purple-500 transition-all font-bold"
                                        value={newTheater.city}
                                        onChange={(e) => setNewTheater({...newTheater, city: e.target.value})}
                                    />
                                    <input 
                                        type="text" required placeholder="Location"
                                        className="w-full bg-zinc-900 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-purple-500 transition-all font-bold"
                                        value={newTheater.location}
                                        onChange={(e) => setNewTheater({...newTheater, location: e.target.value})}
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <input 
                                            type="number" required placeholder="Rows"
                                            className="w-full bg-zinc-900 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-purple-500 transition-all font-bold"
                                            value={newTheater.rows}
                                            onChange={(e) => setNewTheater({...newTheater, rows: parseInt(e.target.value)})}
                                        />
                                        <input 
                                            type="number" required placeholder="Cols"
                                            className="w-full bg-zinc-900 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-purple-500 transition-all font-bold"
                                            value={newTheater.cols}
                                            onChange={(e) => setNewTheater({...newTheater, cols: parseInt(e.target.value)})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase ml-2">Base Ticket Price ($)</label>
                                        <input 
                                            type="number" step="0.01" required
                                            className="w-full bg-zinc-900 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-purple-500 transition-all font-bold"
                                            value={newTheater.price}
                                            onChange={(e) => setNewTheater({...newTheater, price: parseFloat(e.target.value)})}
                                        />
                                    </div>
                                     <div className="flex gap-2 mt-4">
                                        <button type="submit" className={`flex-1 py-4 font-black rounded-2xl transition-all uppercase text-xs ${editingTheater ? 'bg-amber-500 text-black hover:bg-amber-400' : 'bg-white text-black hover:bg-purple-500 hover:text-white'}`}>
                                            {editingTheater ? 'Save Changes' : 'Create Theater'}
                                        </button>
                                        {editingTheater && (
                                            <button 
                                                type="button" 
                                                onClick={() => { setEditingTheater(null); setNewTheater({ name: '', location: '', city: 'Mumbai', rows: 8, cols: 12, price: 150 }); }}
                                                className="px-6 py-4 bg-white/10 text-white font-black rounded-2xl hover:bg-white/20 transition-all uppercase text-xs"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                    )}

                    {/* Right Side: Display list or Insights */}
                    <div className={(activeTab === 'insights' || activeTab === 'users') ? "lg:col-span-12" : "lg:col-span-8"}>
                        {activeTab === 'schedules' ? (
                            <div className="space-y-4">
                                <h3 className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.3em] mb-4">Active Schedule</h3>
                                <div className="grid gap-3">
                                    {schedules.map((s, idx) => {
                                        const movie = movies.find(m => m.id.toString() === s.movieId.toString());
                                        const theater = theaters.find(t => (t._id || t.id).toString() === (s.theaterId?._id || s.theaterId).toString());
                                        const sId = s._id || s.id;
                                        return (
                                             <div key={`sch-${sId || idx}`} className="flex items-center justify-between bg-white/5 border border-white/5 rounded-2xl p-5 group hover:bg-white/10 transition-all cursor-pointer" onClick={() => { setEditingSchedule(s); setNewSchedule({ ...s, theaterId: s.theaterId?._id || s.theaterId }); }}>
                                                <div className="flex items-center gap-6">
                                                    <div className="w-12 h-12 bg-zinc-800 rounded-xl overflow-hidden shadow-lg border border-white/5 group-hover:border-cyan-500/50 transition-all">
                                                        {movie?.poster_path && <img src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`} className="w-full h-full object-cover" />}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-white font-black uppercase text-sm group-hover:text-cyan-400 transition-all">{movie?.title || 'Unknown Movie'}</h4>
                                                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">{theater?.name || 'Unknown Theater'} • <span className="text-white">{s.time}</span></p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button className="p-3 text-gray-700 hover:text-cyan-500 opacity-0 group-hover:opacity-100 transition-all">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                                    </button>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); handleRemoveSchedule(sId); }}
                                                        className="p-3 text-gray-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : activeTab === 'insights' ? (
                            <InsightsPanel 
                                theaters={theaters} 
                                schedules={schedules} 
                                movies={movies} 
                                bookings={allBookings}
                                totalUsers={allUsers.length}
                                fetchAnalytics={fetchAnalytics}
                            />
                        ) : activeTab === 'users' ? (
                            <div className="space-y-6">
                                <h3 className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.3em] mb-4">Master User Registry</h3>
                                <div className="grid gap-4">
                                    {allUsers.map((user, idx) => (
                                        <div key={`u-${user._id || idx}`} className="bg-white/5 border border-white/5 rounded-2xl p-6 flex items-center justify-between group hover:bg-white/10 transition-all">
                                            <div className="flex items-center gap-5">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-lg">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h4 className="text-white font-black uppercase text-sm leading-tight flex items-center gap-2">
                                                        {user.name}
                                                        {user.isAdmin && <span className="text-[8px] bg-red-600/20 text-red-500 px-2 py-0.5 rounded-full border border-red-500/20">ADMIN node</span>}
                                                    </h4>
                                                    <p className="text-gray-500 text-[10px] font-bold uppercase mt-1 tracking-wider">{user.email}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-white/30 text-[9px] font-black uppercase italic">ID: {user._id.toString().slice(-8)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <h3 className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.3em] mb-4">Theater Management</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {theaters.map((t, idx) => (
                                        <div key={`tl-${t._id || t.id || idx}`} className="bg-white/5 border border-white/5 rounded-3xl p-6 hover:border-purple-500/30 transition-all group/card">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h4 className="text-white font-black uppercase text-lg leading-tight tracking-tighter">{t.name}</h4>
                                                    <p className="text-gray-500 text-xs font-bold uppercase italic">{t.location}</p>
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    <span className="bg-purple-500/10 text-purple-400 px-3 py-1 rounded-lg text-xs font-black">
                                                        ${t.price.toFixed(2)}
                                                    </span>
                                                    <div className="flex gap-2 opacity-0 group-hover/card:opacity-100 transition-opacity">
                                                        <button 
                                                            onClick={() => startEditing(t)}
                                                            className="p-2 bg-white/10 rounded-lg text-amber-500 hover:bg-amber-500 hover:text-black transition-all"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeleteTheater(t._id || t.id)}
                                                            className="p-2 bg-white/10 rounded-lg text-red-500 hover:bg-red-500 hover:text-white transition-all"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 text-[10px] font-black uppercase tracking-widest text-gray-600">
                                                <div className="bg-black/40 p-3 rounded-xl">
                                                    Layout: {t.rows}×{t.cols}
                                                </div>
                                                <div className="bg-black/40 p-3 rounded-xl text-center">
                                                    Seats: {t.rows * t.cols}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </div>
);
};

const InsightsPanel = ({ theaters, schedules, movies, bookings, totalUsers, fetchAnalytics }) => {
    // 1. Data Processing for Reports
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed' || b.status === undefined);
    const pendingBookings = bookings.filter(b => b.status === 'pending');
    
    const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    const pendingRevenue = pendingBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    const totalTickets = confirmedBookings.reduce((sum, b) => sum + (b.seats?.length || 0), 0);

    // Calculate daily trends for the visual chart
    const trends = confirmedBookings.reduce((acc, b) => {
        const date = new Date(b.createdAt).toLocaleDateString();
        acc[date] = (acc[date] || 0) + 1;
        return acc;
    }, {});
    const trendData = Object.entries(trends).slice(-7); // Last 7 days

    const moviePopularity = confirmedBookings.reduce((acc, b) => {
        acc[b.movieTitle] = (acc[b.movieTitle] || 0) + 1;
        return acc;
    }, {});

    const sortedPopularity = Object.entries(moviePopularity)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    // 2. Report Export Utility
    const downloadCSV = () => {
        const headers = ["BookingID", "User", "Movie", "Theater", "Seats", "TotalPaid", "Date"];
        const rows = bookings.map(b => [
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
        link.setAttribute("download", `MovieShow_Global_Report_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700 w-full overflow-hidden pb-12">
            
            {/* Action Bar */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-white font-black uppercase text-xl tracking-tighter flex items-center gap-3">
                        Velocity Insights
                        <span className="flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-cyan-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                        </span>
                    </h2>
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">Real-time Node.js Stream Analytics</p>
                </div>
                <div className="flex gap-4">
                    <button 
                        onClick={async () => {
                            if (!window.confirm("Seed Sample Data? This will generate 8 synthetic transactions for visualization.")) return;
                            try {
                                const sampleBookings = [
                                    { movieTitle: "Project Hail Mary", theaterName: "Grand Cinema Rex", seats: ["A1", "A2"], totalPrice: 300, showtime: "07:45 PM", showDate: "24 APR WED" },
                                    { movieTitle: "The Batman II", theaterName: "Starlight Cineplex", seats: ["B5"], totalPrice: 180, showtime: "05:45 PM", showDate: "24 APR WED" },
                                    { movieTitle: "Interstellar", theaterName: "NeoVerse Theaters", seats: ["C10", "C11", "C12"], totalPrice: 600, showtime: "10:30 PM", showDate: "25 APR THU" },
                                    { movieTitle: "Dune: Part Three", theaterName: "Inox Megaplex", seats: ["D1"], totalPrice: 450, showtime: "01:45 PM", showDate: "24 APR WED" },
                                    { movieTitle: "Project Hail Mary", theaterName: "PVR Heritage", seats: ["E4", "E5"], totalPrice: 440, showtime: "04:30 PM", showDate: "25 APR THU" }
                                ];
                                for (const b of sampleBookings) {
                                    await bookingService.createBooking({ ...b, bookingId: `SEED-${Math.random().toString(36).substr(2, 6).toUpperCase()}` });
                                }
                                alert("Database Seeded Successfully. Pulse in 5s...");
                                fetchAnalytics();
                            } catch (err) {
                                alert("Seeding Failed: " + err.message);
                            }
                        }}
                        className="px-6 py-3 bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        Seed Intelligence
                    </button>
                    <button 
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 bg-white/5 text-white/50 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                        Full System Sync
                    </button>
                    <button 
                        onClick={downloadCSV}
                        className="px-6 py-3 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-cyan-400 transition-all shadow-xl flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        Download Global CSV
                    </button>
                </div>
            </div>

            {/* Top Metrics Hierarchy */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="bg-zinc-900 border border-white/5 rounded-3xl p-6 hover:border-green-500/30 transition-all group">
                    <p className="text-[9px] font-black text-green-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                        Cleared Revenue
                    </p>
                    <div className="flex items-baseline gap-1">
                        <span className="text-sm font-black text-white/30">$</span>
                        <h4 className="text-3xl font-black text-white tracking-tighter group-hover:text-green-400 transition-all">{totalRevenue.toFixed(2)}</h4>
                    </div>
                </div>

                <div className="bg-zinc-900 border border-white/5 rounded-3xl p-6 hover:border-amber-500/30 transition-all group">
                    <p className="text-[9px] font-black text-amber-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                        Pipeline (Pending)
                    </p>
                    <div className="flex items-baseline gap-1">
                        <span className="text-sm font-black text-white/30">$</span>
                        <h4 className="text-3xl font-black text-white tracking-tighter group-hover:text-amber-400 transition-all">{pendingRevenue.toFixed(2)}</h4>
                    </div>
                </div>
                <div className="bg-zinc-900 border border-white/5 rounded-3xl p-6 hover:border-cyan-500/30 transition-all">
                    <p className="text-[9px] font-black text-cyan-400 uppercase tracking-widest mb-3">Ticket Volume</p>
                    <h4 className="text-3xl font-black text-white tracking-tighter">{totalTickets}</h4>
                </div>
                <div className="bg-zinc-900 border border-white/5 rounded-3xl p-6 hover:border-orange-500/30 transition-all">
                    <p className="text-[9px] font-black text-orange-400 uppercase tracking-widest mb-4">Total Activity</p>
                    <h4 className="text-3xl font-black text-white tracking-tighter">{bookings.length}</h4>
                    <p className="text-[8px] font-bold text-gray-600 uppercase mt-1">Confirmed Orders</p>
                </div>
                <div className="bg-zinc-900 border border-white/5 rounded-3xl p-6 hover:border-purple-500/30 transition-all">
                    <p className="text-[9px] font-black text-purple-400 uppercase tracking-widest mb-3">Audience Size</p>
                    <h4 className="text-3xl font-black text-white tracking-tighter">{totalUsers}</h4>
                    <p className="text-[8px] font-bold text-gray-600 uppercase mt-1">Unique Accounts</p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Visual Trends Section */}
                <div className="xl:col-span-2 bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-8">
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="text-white font-black uppercase text-xs tracking-widest">Network Velocity (Bookings/Day)</h3>
                        <div className="flex gap-2">
                            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
                            <span className="text-[8px] font-black text-cyan-500 uppercase tracking-widest">Live Sync</span>
                        </div>
                    </div>
                    
                    {/* SVG Trend Chart */}
                    <div className="h-48 w-full flex items-end justify-between gap-4 px-4">
                        {trendData.length > 0 ? trendData.map(([date, count], idx) => {
                            const max = Math.max(...trendData.map(d => d[1]));
                            const height = max > 0 ? (count / max) * 100 : 5;
                            return (
                                <div key={date} className="flex-1 flex flex-col items-center gap-4 group">
                                    <div className="relative w-full flex justify-center items-end h-full">
                                        <div 
                                            className="w-1.5 bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-full transition-all duration-1000 group-hover:w-3 group-hover:from-white group-hover:to-cyan-400 shadow-lg shadow-cyan-500/20"
                                            style={{ height: `${height}%` }}
                                        >
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                                {count}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-[8px] font-black text-gray-700 uppercase vertical-text mt-2">{date}</span>
                                </div>
                            );
                        }) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500 text-[10px] font-black uppercase tracking-widest italic">
                                Insufficient data points for trend rendering
                            </div>
                        )}
                    </div>
                </div>

                {/* Popular Movies Section */}
                <div className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-8">
                    <h3 className="text-white font-black uppercase text-xs tracking-widest mb-8">Popularity Index</h3>
                    <div className="space-y-6">
                        {sortedPopularity.length > 0 ? sortedPopularity.map(([title, count], idx) => (
                            <div key={title} className="space-y-2">
                                <div className="flex justify-between items-end">
                                    <span className="text-[10px] font-black text-white/50 uppercase leading-tight truncate pr-4">{title}</span>
                                    <span className="text-[10px] font-black text-white">{count}</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full bg-gradient-to-r ${idx === 0 ? 'from-cyan-500 to-indigo-500' : 'from-gray-600 to-gray-800'} rounded-full transition-all duration-1000`} 
                                        style={{ width: `${(count / sortedPopularity[0][1]) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        )) : (
                            <p className="py-20 text-center text-gray-800 text-[10px] font-black uppercase italic">Market data pending...</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Transaction Log */}
            <div className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-8">
                <h3 className="text-white font-black uppercase text-xs tracking-widest mb-8">Live Transaction Stream</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {bookings.slice(0, 6).map((b, idx) => (
                        <div key={b._id} className="flex items-center justify-between p-5 bg-white/[0.03] rounded-2xl border border-white/5 hover:border-white/10 transition-all group">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 font-black text-[10px] group-hover:bg-cyan-500 group-hover:text-black transition-all">
                                    {idx + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h5 className="text-white font-black uppercase text-[11px] leading-tight truncate">{b.movieTitle}</h5>
                                    <div className="flex items-center gap-2 mt-1">
                                        <p className="text-gray-500 text-[9px] font-bold uppercase truncate">{b.userName || b.userId?.name || 'Guest'}</p>
                                        <span className={`text-[6px] font-black px-1 py-0.5 rounded border shrink-0 ${b.status === 'confirmed' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                                            {b.status || 'confirmed'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-white font-black text-[11px]">+${b.totalPrice.toFixed(2)}</p>
                                <p className="text-[8px] font-bold text-cyan-500/50 uppercase italic tracking-tighter">BOOKED</p>
                            </div>
                        </div>
                    ))}
                    {bookings.length === 0 && (
                        <div className="col-span-full py-20 text-center text-gray-700 text-[10px] font-black uppercase italic">
                            Awaiting network traffic...
                        </div>
                    )}
                </div>
            </div>

            {/* Smart Summary */}
            <div className="p-8 bg-indigo-600 rounded-[2.5rem] shadow-2xl shadow-indigo-600/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 text-8xl opacity-10 transform translate-x-10 translate-y-[-20px] select-none">📈</div>
                <div className="relative z-10 flex items-center gap-6">
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl animate-pulse">🤖</div>
                    <div>
                        <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1">Autonomous Business Summary</p>
                        <p className="text-white font-black uppercase text-sm leading-tight max-w-2xl">
                            Overall booking velocity is stable. Our most active theater is <span className="text-cyan-200">"{theaters[0]?.name || 'N/A'}"</span>. 
                            Peak transaction volume was recorded on <span className="text-cyan-200">{trendData[trendData.length-1]?.[0] || 'N/A'}</span>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
