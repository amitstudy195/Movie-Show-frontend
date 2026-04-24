import React, { useState } from 'react';

const cities = [
    { name: "Mumbai", icon: "🏙️", popular: true },
    { name: "Delhi", icon: "🏛️", popular: true },
    { name: "Bengaluru", icon: "🌳", popular: true },
    { name: "Hyderabad", icon: "🕌", popular: true },
    { name: "Ahmedabad", icon: "🏭", popular: true },
    { name: "Chennai", icon: "🌊", popular: true },
    { name: "Kolkata", icon: "🎨", popular: true },
    { name: "Pune", icon: "📚", popular: true },
    { name: "Kochi", icon: "🚢" },
    { name: "Jaipur", icon: "🏰" },
    { name: "Lucknow", icon: "🥘" },
    { name: "Chandigarh", icon: "🏔️" },
    { name: "Indore", icon: "🍛" },
    { name: "Surat", icon: "💎" },
    { name: "Nagpur", icon: "🍊" },
    { name: "Patna", icon: "🛶" },
    { name: "Bhopal", icon: "🌄" },
    { name: "Visakhapatnam", icon: "⚓" },
    { name: "Kanpur", icon: "🏭" },
    { name: "Thiruvananthapuram", icon: "🏖️" },
    { name: "Coimbatore", icon: "⚙️" },
    { name: "Guwahati", icon: "🦏" },
    { name: "Raipur", icon: "⛏️" },
    { name: "Bhubaneswar", icon: "🛕" },
    { name: "Madurai", icon: "🛕" },
    { name: "Varanasi", icon: "🕯️" },
    { name: "Amritsar", icon: "🛕" },
    { name: "Ranchi", icon: "🌲" },
    { name: "Dehradun", icon: "⛰️" },
    { name: "Jammu", icon: "❄️" },
    { name: "Srinagar", icon: "🛶" },
    { name: "Shimla", icon: "🏘️" },
    { name: "Jodhpur", icon: "☀️" },
    { name: "Udaipur", icon: "🏛️" },
    { name: "Agra", icon: "🕌" },
    { name: "Vikasnagar", icon: "🏡" },
    { name: "Vijayawada", icon: "🌉" },
    { name: "Nashik", icon: "🍇" },
    { name: "Rajkot", icon: "🏏" },
    { name: "Vadodara", icon: "🎨" },
    { name: "Mangaluru", icon: "🌴" }
];

const LocationModal = ({ currentCity, onSelect, onClose }) => {
    const [search, setSearch] = useState('');
    const [isDetecting, setIsDetecting] = useState(false);

    const detectLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        setIsDetecting(true);
        navigator.geolocation.getCurrentPosition(async (position) => {
            try {
                const { latitude, longitude } = position.coords;
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`);
                const data = await response.json();
                
                const detectedCity = data.address.city || data.address.town || data.address.state_district || "Mumbai";
                onSelect(detectedCity);
                onClose();
            } catch (error) {
                console.error("Location detection failed:", error);
                alert("Could not detect your exact city. Defaulting to Mumbai.");
                onSelect("Mumbai");
                onClose();
            } finally {
                setIsDetecting(false);
            }
        }, (error) => {
            console.error("Geolocation error:", error);
            alert("Permission denied or location unavailable.");
            setIsDetecting(false);
        });
    };

    const filteredCities = cities.filter(c => 
        c.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 animate-in fade-in zoom-in duration-300">
            <div className="w-full max-w-2xl bg-[#0a0a0a] border border-white/5 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-10 border-b border-white/5 bg-white/[0.01]">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">Where are you?</h2>
                            <p className="text-gray-500 text-[8px] font-bold uppercase tracking-[0.4em] mt-1">Discover cinematic experiences near you</p>
                        </div>
                        <button onClick={onClose} className="w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-red-600 text-white rounded-full transition-all">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>
                    
                    <div className="relative group">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xl group-focus-within:scale-110 transition-transform">🔍</span>
                        <input 
                            type="text" 
                            placeholder="Search for your city (e.g. Patna, Mumbai, Delhi)..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 pl-14 text-sm text-white outline-none focus:border-cyan-500 transition-all font-bold placeholder:text-gray-600"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Cities Grid */}
                <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Popular Hubs</h3>
                        <button 
                            onClick={detectLocation}
                            disabled={isDetecting}
                            className="flex items-center gap-2 text-[10px] font-black text-cyan-500 hover:text-white uppercase tracking-widest transition-all disabled:opacity-50"
                        >
                            {isDetecting ? (
                                <div className="w-3 h-3 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
                            ) : (
                                <span className="text-base">📍</span>
                            )}
                            {isDetecting ? "Locating..." : "Auto detect my city"}
                        </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {filteredCities.map(city => (
                            <button
                                key={city.name}
                                onClick={() => { onSelect(city.name); onClose(); }}
                                className={`flex flex-col items-center gap-4 p-6 rounded-[2rem] border transition-all duration-300 group ${
                                    currentCity === city.name 
                                    ? 'bg-gradient-to-br from-cyan-500 to-blue-600 border-white/20 text-white shadow-2xl shadow-cyan-500/20' 
                                    : 'bg-white/5 border-white/5 text-gray-500 hover:bg-white hover:text-black hover:scale-[1.05]'
                                }`}
                            >
                                <span className="text-3xl filter grayscale group-hover:grayscale-0 transition-all">{city.icon}</span>
                                <span className="text-[9px] font-black uppercase tracking-widest">{city.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LocationModal;
