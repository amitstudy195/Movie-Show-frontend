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
            alert("Security: Geolocation protocols not supported by this terminal.");
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
                alert("Protocol Warning: Could not resolve exact coordinates. Fallback to Primary Hub (Mumbai).");
                onSelect("Mumbai");
                onClose();
            } finally {
                setIsDetecting(false);
            }
        }, (error) => {
            console.error("Geolocation error:", error);
            alert("Security Error: Access denied to terminal coordinates.");
            setIsDetecting(false);
        });
    };

    const filteredCities = cities.filter(c => 
        c.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-[300] bg-[#1A1A1A]/95 backdrop-blur-3xl flex items-center justify-center p-4 animate-in fade-in zoom-in duration-500">
            <div className="w-full max-w-2xl bg-[#1A1A1A] border border-white/5 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] glass-effect">
                {/* Header */}
                <div className="p-10 border-b border-white/5 bg-white/[0.01]">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">WHERE ARE YOU?</h2>
                            <p className="text-[#999999] text-[8px] font-black uppercase tracking-[0.4em] mt-1 italic">Identify your geospatial hub to discover cinematography</p>
                        </div>
                        <button onClick={onClose} className="w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-[#F84464] text-white rounded-full transition-all duration-500 hover:rotate-90">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>
                    
                    <div className="relative group">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xl group-focus-within:scale-125 transition-transform">🔍</span>
                        <input 
                            type="text" 
                            placeholder="SEARCH FOR YOUR SECTOR (E.G. PATNA, MUMBAI, DELHI)..."
                            className="w-full bg-[#212121] border border-white/5 rounded-2xl p-5 pl-14 text-[10px] text-white outline-none focus:border-[#F84464] transition-all font-black tracking-widest placeholder:text-[#999999]/30 uppercase italic"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Cities Grid */}
                <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                    <div className="flex items-center justify-between mb-10">
                        <h3 className="text-[10px] font-black text-[#999999] uppercase tracking-[0.3em] italic leading-none">PRIMARY TARGET HUBS</h3>
                        <button 
                            onClick={detectLocation}
                            disabled={isDetecting}
                            className="flex items-center gap-3 text-[9px] font-black text-[#F84464] hover:text-white uppercase tracking-widest transition-all disabled:opacity-50 italic group"
                        >
                            {isDetecting ? (
                                <div className="w-3 h-3 border-2 border-[#F84464]/30 border-t-[#F84464] rounded-full animate-spin"></div>
                            ) : (
                                <span className="text-base group-hover:animate-pulse">📍</span>
                            )}
                            {isDetecting ? "CALIBRATING..." : "IDENTIFY CURRENT SECTOR"}
                        </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                        {filteredCities.map(city => (
                            <button
                                key={city.name}
                                onClick={() => { onSelect(city.name); onClose(); }}
                                className={`flex flex-col items-center gap-6 p-8 rounded-[2.5rem] border transition-all duration-500 group relative overflow-hidden ${
                                    currentCity === city.name 
                                    ? 'bg-[#F84464] border-[#F84464] text-white shadow-[0_0_30px_rgba(248,68,100,0.3)]' 
                                    : 'bg-[#212121] border-white/5 text-[#999999] hover:bg-white hover:text-black hover:scale-[1.08] hover:-rotate-2'
                                }`}
                            >
                                <span className={`text-4xl filter group-hover:grayscale-0 transition-all duration-700 ${currentCity === city.name ? 'grayscale-0' : 'grayscale'}`}>{city.icon}</span>
                                <span className="text-[9px] font-black uppercase tracking-widest italic">{city.name}</span>
                                {currentCity === city.name && (
                                    <div className="absolute top-0 right-0 p-3">
                                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></div>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LocationModal;
