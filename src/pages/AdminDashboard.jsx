import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = ({ allMovies = [], allTheaters = [], allSchedules = [], setAllMovies, setAllTheaters, setAllSchedules }) => {
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('bookings'); // 'movies', 'theaters', 'bookings', 'users'
    
    // Stats State
    const [bookings, setBookings] = useState(() => JSON.parse(localStorage.getItem('movie_bookings') || '[]'));
    const [users, setUsers] = useState(() => JSON.parse(localStorage.getItem('movie_users_db') || '[{"id": 1, "name": "Amit Kumar", "email": "amitstudy195@gmail.com", "role": "admin", "status": "active"}]'));

    // Calculating Stats
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    const ticketsSold = bookings.reduce((sum, b) => sum + (b.seats?.length || 0), 0);

    const menuItems = [
        { id: 'bookings', label: 'Dashboard', icon: '📊' },
        { id: 'movies', label: 'Movies', icon: '🎬' },
        { id: 'theaters', label: 'Theaters', icon: '🏢' },
        { id: 'users', label: 'Users', icon: '👥' },
    ];

    return (
        <div className="flex h-screen bg-[#05070a] text-white">
            {/* Sidebar */}
            <div className="w-72 bg-[#0a0c10] border-r border-white/5 flex flex-col p-8">
                <div className="flex items-center gap-4 mb-12">
                    <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/20">
                        <span className="text-xl">🛡️</span>
                    </div>
                    <div>
                        <h1 className="text-xl font-black uppercase tracking-tighter">Nexus Admin</h1>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Control Center</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-2">
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveSection(item.id)}
                            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${activeSection === item.id ? 'bg-white text-black shadow-xl shadow-white/10' : 'text-gray-500 hover:bg-white/5 hover:text-white'}`}
                        >
                            <span>{item.icon}</span>
                            {item.label}
                        </button>
                    ))}
                </nav>

                <button 
                    onClick={() => navigate('/')}
                    className="mt-8 flex items-center gap-4 px-6 py-4 rounded-2xl text-xs font-black text-red-500 hover:bg-red-500/10 uppercase tracking-widest transition-all"
                >
                    <span>🚪</span> Exit Admin
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-12">
                <header className="flex justify-between items-center mb-12">
                    <div>
                        <h2 className="text-4xl font-black uppercase italic tracking-tighter">
                            {menuItems.find(i => i.id === activeSection)?.label}
                        </h2>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.4em] mt-2">Managing core application assets</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-[10px] font-black text-gray-500 uppercase">Current Session</p>
                            <p className="text-teal-400 text-xs font-black">Live & Synchronized</p>
                        </div>
                        <div className="w-12 h-12 bg-white/5 rounded-full border border-white/10"></div>
                    </div>
                </header>

                {/* Section Rendering */}
                {activeSection === 'bookings' && <BookingOverview bookings={bookings} revenue={totalRevenue} sold={ticketsSold} />}
                {activeSection === 'movies' && <MovieManager movies={allMovies} setMovies={setAllMovies} />}
                {activeSection === 'theaters' && <TheaterSetup theaters={allTheaters} movies={allMovies} schedules={allSchedules} setSchedules={setAllSchedules} />}
                {activeSection === 'users' && <UserManager users={users} setUsers={setUsers} />}
            </div>
        </div>
    );
};

// --- SUB-COMPONENTS ---

const BookingOverview = ({ bookings, revenue, sold }) => (
    <div className="space-y-12 animate-in fade-in duration-700">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <StatCard label="Total Revenue" value={`$${revenue.toFixed(2)}`} color="teal" />
            <StatCard label="Tickets Sold" value={sold} color="indigo" />
            <StatCard label="Total Transactions" value={bookings.length} color="purple" />
            <StatCard label="System Integrity" value="100%" color="green" />
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-10">
            <h3 className="text-xl font-black uppercase tracking-widest mb-8 italic">Recent Transactions</h3>
            <div className="space-y-4">
                {bookings.slice(-5).reverse().map((b, i) => (
                    <div key={i} className="flex items-center justify-between p-6 bg-black/40 border border-white/5 rounded-2xl hover:bg-white/5 transition-all">
                        <div className="flex items-center gap-6">
                            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-xl">💸</div>
                            <div>
                                <h4 className="font-black uppercase text-sm">{b.movieTitle}</h4>
                                <p className="text-[10px] text-gray-500 font-bold uppercase">{b.theaterName} • {b.showtime}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-black text-white">${b.totalPrice?.toFixed(2)}</p>
                            <p className="text-[9px] text-teal-500 font-black uppercase tracking-widest">Successful</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const MovieManager = ({ movies, setMovies }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [editMovie, setEditMovie] = useState(null);
    const [formData, setFormData] = useState({ title: '', genre: '', poster: '', duration: '' });

    const handleSave = (e) => {
        e.preventDefault();
        if (editMovie) {
            setMovies(movies.map(m => m.id === editMovie.id ? { ...m, ...formData } : m));
            setEditMovie(null);
        } else {
            setMovies([...movies, { ...formData, id: Date.now() }]);
        }
        setFormData({ title: '', genre: '', poster: '', duration: '' });
        setIsAdding(false);
    };

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom duration-700">
            <div className="flex justify-between items-center">
                <h3 className="text-gray-500 font-black uppercase text-[10px] tracking-[0.4em]">Library Management</h3>
                <button 
                    onClick={() => setIsAdding(true)}
                    className="bg-white text-black px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-cyan-400 transition-all"
                >
                    Add New Movie
                </button>
            </div>

            {(isAdding || editMovie) && (
                <div className="bg-white/5 p-10 rounded-[2.5rem] border border-white/10 animate-in zoom-in duration-300">
                    <form onSubmit={handleSave} className="grid grid-cols-2 gap-8">
                        <Input label="Movie Title" value={formData.title} onChange={v => setFormData({...formData, title: v})} />
                        <Input label="Genre" value={formData.genre} onChange={v => setFormData({...formData, genre: v})} />
                        <Input label="Poster URL" value={formData.poster} onChange={v => setFormData({...formData, poster: v})} />
                        <Input label="Duration" value={formData.duration} onChange={v => setFormData({...formData, duration: v})} />
                        <div className="col-span-2 flex gap-4 mt-4">
                            <button type="submit" className="flex-1 bg-cyan-500 text-black py-4 rounded-2xl font-black uppercase text-xs tracking-widest">Save Cinematic Asset</button>
                            <button onClick={() => { setIsAdding(false); setEditMovie(null); }} className="px-10 bg-white/5 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest">Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid gap-4">
                {movies.map(m => (
                    <div key={m.id} className="group flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 rounded-3xl hover:bg-white/[0.05] transition-all">
                        <div className="flex items-center gap-8">
                            <img src={m.poster_path ? `https://image.tmdb.org/t/p/w200${m.poster_path}` : m.poster} className="w-16 h-24 object-cover rounded-xl shadow-2xl" alt="" />
                            <div>
                                <h4 className="text-xl font-black uppercase italic tracking-tighter">{m.title}</h4>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{m.genre_ids ? 'Global Release' : m.genre} • {m.runtime || m.duration} mins</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setEditMovie(m)} className="p-4 bg-white/5 rounded-2xl hover:bg-white hover:text-black transition-all">✍️</button>
                            <button onClick={() => setMovies(movies.filter(x => x.id !== m.id))} className="p-4 bg-white/5 rounded-2xl hover:bg-red-600 transition-all">🗑️</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const TheaterSetup = ({ theaters, movies, schedules, setSchedules }) => {
    const [form, setForm] = useState({ movieId: '', theaterId: '', time: '' });

    return (
        <div className="space-y-12 animate-in fade-in">
            <div className="grid lg:grid-cols-12 gap-12">
                <div className="lg:col-span-4 bg-white/5 p-10 rounded-[2.5rem] border border-white/5">
                    <h3 className="text-sm font-black uppercase tracking-widest mb-8 italic">Add Screen Schedule</h3>
                    <form className="space-y-6" onSubmit={(e) => {
                        e.preventDefault();
                        setSchedules([...schedules, { ...form, id: Date.now() }]);
                        setForm({ movieId: '', theaterId: '', time: '' });
                    }}>
                        <Select label="Select Movie" options={movies.map(m => ({ value: m.id, label: m.title }))} value={form.movieId} onChange={v => setForm({...form, movieId: v})} />
                        <Select label="Select Theater" options={theaters.map(t => ({ value: t.id, label: t.name }))} value={form.theaterId} onChange={v => setForm({...form, theaterId: v})} />
                        <Input label="Time Slot (e.g. 10:00 PM)" value={form.time} onChange={v => setForm({...form, time: v})} />
                        <button className="w-full h-16 bg-white text-black font-black rounded-2xl hover:bg-teal-400 transition-all uppercase text-xs mt-4">Generate Map</button>
                    </form>
                </div>

                <div className="lg:col-span-8 space-y-4">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Live Screens</p>
                    {schedules.map(s => {
                        const m = movies.find(x => String(x.id) === String(s.movieId));
                        const t = theaters.find(x => String(x.id) === String(s.theaterId));
                        return (
                            <div key={s.id} className="flex justify-between items-center p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                                <div>
                                    <h4 className="font-black uppercase text-sm">{m?.title}</h4>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{t?.name} • {s.time}</p>
                                </div>
                                <button onClick={() => setSchedules(schedules.filter(x => x.id !== s.id))} className="text-red-500 text-xs font-black uppercase tracking-widest">Delete</button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

const UserManager = ({ users, setUsers }) => {
    const handleStatus = (id, status) => {
        setUsers(users.map(u => u.id === id ? { ...u, status } : u));
    };

    const handleRole = (id, role) => {
        setUsers(users.map(u => u.id === id ? { ...u, role } : u));
    };

    return (
        <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-10 animate-in fade-in">
            <table className="w-full">
                <thead>
                    <tr className="text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-white/5">
                        <th className="text-left pb-6">User Identity</th>
                        <th className="text-left pb-6">Protocol Role</th>
                        <th className="text-left pb-6">Security Status</th>
                        <th className="text-right pb-6">Management</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {users.map(u => (
                        <tr key={u.id} className="group hover:bg-white/[0.01]">
                            <td className="py-6">
                                <p className="font-black uppercase text-sm italic">{u.name}</p>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">{u.email}</p>
                            </td>
                            <td className="py-6">
                                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${u.role === 'admin' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-white/5 text-gray-400'}`}>
                                    {u.role}
                                </span>
                            </td>
                            <td className="py-6">
                                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${u.status === 'active' ? 'bg-teal-500/10 text-teal-500 border border-teal-500/20' : 'bg-gray-500/10 text-gray-500 border border-gray-500/20'}`}>
                                    {u.status}
                                </span>
                            </td>
                            <td className="py-6 text-right space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleRole(u.id, u.role === 'admin' ? 'user' : 'admin')} className="text-[9px] font-black uppercase tracking-widest text-cyan-500 hover:text-white">Toggle Admin</button>
                                <button onClick={() => handleStatus(u.id, u.status === 'active' ? 'blocked' : 'active')} className="text-[9px] font-black uppercase tracking-widest text-red-500 hover:text-white">Block</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// --- UTILS ---

const StatCard = ({ label, value, color }) => (
    <div className={`p-8 bg-white/5 border border-white/5 rounded-[2rem] hover:border-${color}-500/30 transition-all`}>
        <p className={`text-[10px] font-black text-${color}-500 uppercase tracking-widest mb-4`}>{label}</p>
        <h4 className="text-3xl font-black text-white tracking-tighter italic uppercase">{value}</h4>
    </div>
);

const Input = ({ label, value, onChange }) => (
    <div className="space-y-2">
        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-2">{label}</label>
        <input 
            type="text" 
            className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-sm text-white font-bold outline-none focus:border-cyan-500 transition-all"
            value={value} 
            onChange={(e) => onChange(e.target.value)} 
        />
    </div>
);

const Select = ({ label, options, value, onChange }) => (
    <div className="space-y-2">
        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-2">{label}</label>
        <select 
            className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-sm text-white font-bold outline-none focus:border-cyan-500 transition-all appearance-none"
            value={value} 
            onChange={(e) => onChange(e.target.value)}
        >
            <option value="">Select...</option>
            {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
    </div>
);

export default AdminDashboard;
