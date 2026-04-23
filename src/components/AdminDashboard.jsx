import React, { useState, useEffect } from 'react';
import { bookingService } from '../services/api';
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
    const [activeTab, setActiveTab] = useState('schedules');
    const [newTheater, setNewTheater] = useState({ name: '', location: '', city: 'Mumbai', rows: 8, cols: 12, price: 150 });
    const [newSchedule, setNewSchedule] = useState({ movieId: '', theaterId: '', time: '' });
    const [loading, setLoading] = useState(false);
    const [allBookings, setAllBookings] = useState([]);
    const [totalUsers, setTotalUsers] = useState(0);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const data = await bookingService.getAllBookings();
                setAllBookings(data);
                
                // Estimate users from bookings or fetch users if we had an admin/users route
                // For now, let's keep it simple
                setTotalUsers(new Set(data.map(b => b.userId?._id)).size);
            } catch (err) {
                console.error("Failed to fetch analytics:", err);
            }
        };
        fetchAnalytics();
    }, []);

    const handleAddTheater = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.post('/theaters', {
                ...newTheater,
                formats: ['2D', '3D', 'IMAX']
            });
            setTheaters([...theaters, response.data]);
            setNewTheater({ name: '', location: '', city: 'Mumbai', rows: 8, cols: 12, price: 150 });
        } catch (err) {
            console.error("Failed to add theater:", err);
            alert("Security: Only admins can perform this protocol.");
        } finally {
            setLoading(false);
        }
    };

    const handleAddSchedule = async (e) => {
        e.preventDefault();
        const updatedSchedules = [...schedules, { ...newSchedule, id: Date.now() }];
        setSchedules(updatedSchedules);
        
        // Persist schedules to local storage (since backend model doesn't exist yet)
        await cinemaService.syncData(theaters, updatedSchedules);
        
        setNewSchedule({ movieId: '', theaterId: '', time: '' });
    };

    const handleRemoveSchedule = async (id) => {
        const updatedSchedules = schedules.filter(s => s.id !== id);
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
                            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.4em] mt-1">Theater & Schedule Control</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-white hover:text-black rounded-full transition-all">
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
                </div>

                <div className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-12 gap-12">
                    
                    {/* Left Side: Forms */}
                    <div className="lg:col-span-4 space-y-10">
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
                                            {movies.map(m => (
                                                <option key={m.id} value={m.id}>{m.title}</option>
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
                                            {theaters.map(t => (
                                                <option key={t.id} value={t.id}>{t.name}</option>
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
                                    <button type="submit" className="w-full py-4 bg-white text-black font-black rounded-2xl hover:bg-cyan-400 transition-all uppercase text-xs mt-4">
                                        Add to Schedule
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5">
                                <h3 className="text-white font-black uppercase tracking-widest text-sm mb-6 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                                    Add New Theater
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
                                    <button type="submit" className="w-full py-4 bg-white text-black font-black rounded-2xl hover:bg-purple-500 hover:text-white transition-all uppercase text-xs mt-4">
                                        Create Theater
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>

                    {/* Right Side: Display list or Insights */}
                    <div className="lg:col-span-8">
                        {activeTab === 'schedules' ? (
                            <div className="space-y-4">
                                <h3 className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.3em] mb-4">Active Schedule</h3>
                                <div className="grid gap-3">
                                    {schedules.map(s => {
                                        const movie = movies.find(m => m.id.toString() === s.movieId.toString());
                                        const theater = theaters.find(t => t.id.toString() === s.theaterId.toString());
                                        return (
                                            <div key={s.id} className="flex items-center justify-between bg-white/5 border border-white/5 rounded-2xl p-5 group hover:bg-white/10 transition-all">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-12 h-12 bg-zinc-800 rounded-xl overflow-hidden shadow-lg">
                                                        {movie?.poster_path && <img src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`} className="w-full h-full object-cover" />}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-white font-black uppercase text-sm">{movie?.title || 'Unknown Movie'}</h4>
                                                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">{theater?.name} • {s.time}</p>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => handleRemoveSchedule(s.id)}
                                                    className="p-3 text-gray-500 hover:text-red-500 transition-colors"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                </button>
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
                                totalUsers={totalUsers}
                            />
                        ) : (
                            <div className="space-y-4">
                                <h3 className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.3em] mb-4">Theater Management</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {theaters.map(t => (
                                        <div key={t.id} className="bg-white/5 border border-white/5 rounded-3xl p-6 hover:border-purple-500/30 transition-all">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h4 className="text-white font-black uppercase text-lg leading-tight tracking-tighter">{t.name}</h4>
                                                    <p className="text-gray-500 text-xs font-bold uppercase italic">{t.location}</p>
                                                </div>
                                                <span className="bg-purple-500/10 text-purple-400 px-3 py-1 rounded-lg text-xs font-black">
                                                    ${t.price.toFixed(2)}
                                                </span>
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
    );
};

const InsightsPanel = ({ theaters, schedules, movies, bookings, totalUsers }) => {
    // 1. Sales Metrics
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    const totalTickets = bookings.reduce((sum, b) => sum + (b.seats?.length || 0), 0);

    const moviePopularity = bookings.reduce((acc, b) => {
        acc[b.movieTitle] = (acc[b.movieTitle] || 0) + 1;
        return acc;
    }, {});

    const sortedPopularity = Object.entries(moviePopularity)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    // 2. Occupancy Metrics
    const occupancyData = theaters.map(t => {
        const theaterBookings = bookings.filter(b => b.theaterName === t.name);
        const bookedSeatsCount = theaterBookings.reduce((sum, b) => sum + (b.seats?.length || 0), 0);
        const totalCapacity = t.rows * t.cols * (schedules.filter(s => s.theaterId.toString() === t.id.toString()).length || 5);
        const percentage = totalCapacity > 0 ? Math.min((bookedSeatsCount / totalCapacity) * 100, 100).toFixed(1) : 0;
        return { name: t.name, percentage, booked: bookedSeatsCount, capacity: totalCapacity };
    });

    return (
        <div className="space-y-10 animate-in fade-in duration-500 w-full overflow-hidden">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-500/20 rounded-3xl p-6 shadow-xl">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">Gross Revenue</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-sm font-black text-indigo-500">$</span>
                        <h4 className="text-3xl font-black text-white tracking-tighter">{totalRevenue.toFixed(2)}</h4>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/20 rounded-3xl p-6 shadow-xl">
                    <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-4">Tickets Sold</p>
                    <h4 className="text-3xl font-black text-white tracking-tighter">{totalTickets}</h4>
                </div>
                <div className="bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/20 rounded-3xl p-6 shadow-xl">
                    <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-4">Transactions</p>
                    <h4 className="text-3xl font-black text-white tracking-tighter">{bookings.length}</h4>
                </div>
                <div className="bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 rounded-3xl p-6 shadow-xl">
                    <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-4">Active Users</p>
                    <h4 className="text-3xl font-black text-white tracking-tighter">{totalUsers}</h4>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                {/* Recent Transactions */}
                <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 overflow-hidden h-fit">
                    <h3 className="text-white font-black uppercase text-xs tracking-widest mb-8">Recent Transactions</h3>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-4">
                        {bookings.length === 0 ? (
                            <p className="py-20 text-center text-gray-700 text-[10px] font-black uppercase italic">Scanning for live traffic...</p>
                        ) : bookings.map((b, idx) => (
                            <div key={b._id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-black text-[10px]">
                                        {b.userId?.name?.charAt(0) || 'U'}
                                    </div>
                                    <div>
                                        <h5 className="text-white font-black uppercase text-[11px] leading-tight">{b.movieTitle}</h5>
                                        <p className="text-gray-500 text-[9px] font-bold uppercase">{b.userId?.name || 'Guest'} • {b.seats.length} Seats</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-white font-black text-[11px]">+${b.totalPrice.toFixed(2)}</p>
                                    <p className="text-[8px] font-bold text-gray-600 uppercase italic">SUCCESS</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Popular Movies Chart & Occupancy */}
                <div className="space-y-10">
                    <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8">
                        <h3 className="text-white font-black uppercase text-xs tracking-widest mb-8">Popularity Index</h3>
                        <div className="space-y-6">
                            {sortedPopularity.length === 0 ? (
                                <p className="py-10 text-center text-gray-700 text-[10px] font-black uppercase italic">Market data pending</p>
                            ) : sortedPopularity.map(([title, count], idx) => (
                                <div key={title} className="space-y-2">
                                    <div className="flex justify-between items-end">
                                        <span className="text-[10px] font-black text-white/50 uppercase">{title}</span>
                                        <span className="text-[10px] font-black text-white">{count} Vol.</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full bg-gradient-to-r ${idx === 0 ? 'from-indigo-500 to-cyan-500' : 'from-gray-600 to-gray-800'} rounded-full transition-all duration-1000`} 
                                            style={{ width: `${(count / sortedPopularity[0][1]) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Stats Bar */}
                    <div className="bg-indigo-600 p-6 rounded-3xl shadow-2xl shadow-indigo-600/20">
                        <div className="flex items-center gap-4">
                            <span className="text-2xl animate-pulse">⚡</span>
                            <div>
                                <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">Network Pulse</p>
                                <p className="text-white font-black uppercase text-xs leading-tight">Live transactions synchronization active. Latency: 24ms</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
