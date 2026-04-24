import React, { useState, useMemo } from 'react';

const Showtimes = ({ movieId, movieTitle, selectedCity, onSelectShowtime, allTheaters, allSchedules }) => {
  const [selectedDay, setSelectedDay] = useState(0);

  // If data is still loading
  if (!allTheaters || (allTheaters.length === 0 && !selectedCity)) {
      return (
          <div className="h-full flex flex-col items-center justify-center bg-[#1e1e1e]">
              <div className="w-12 h-12 border-4 border-[#f84464]/20 border-t-[#f84464] rounded-full animate-spin mb-4"></div>
              <p className="text-[10px] font-black text-white uppercase tracking-widest animate-pulse">Syncing Cinemas...</p>
          </div>
      );
  }

  // Generate 7 days of dates
  const days = useMemo(() => {
    const arr = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        arr.push({
            day: d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
            date: d.getDate(),
            month: d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
        });
    }
    return arr;
  }, []);

  const [sortByNearby, setSortByNearby] = useState(false);

  // Filter schedules for the current movie AND selected city
  const theatersWithTimes = useMemo(() => {
    if (!allTheaters) return [];
    
    const currentMovieSchedules = (allSchedules || []).filter(s => s.movieId?.toString() === movieId?.toString());
    
    let processed = allTheaters
        .filter(t => t.city?.toLowerCase() === selectedCity?.toLowerCase()) 
        .map(t => {
            const tId = (t._id || t.id)?.toString();
            const theaterTimes = currentMovieSchedules
                .filter(s => (s.theaterId?._id || s.theaterId)?.toString() === tId)
                .map(s => s.time);
            
            // If this specific theater has no manual schedules, use our premium fallback set
            const finalTimes = theaterTimes.length > 0 
                ? theaterTimes 
                : ["10:30 AM", "01:45 PM", "04:30 PM", "07:15 PM", "10:00 PM"];
            
            return { ...t, times: finalTimes };
        });

    if (sortByNearby) {
        processed.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    }

    return processed;
  }, [allTheaters, allSchedules, movieId, sortByNearby, selectedCity]);

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] rounded-3xl overflow-hidden border border-white/5">
      {/* BMS Date Strip */}
      <div className="flex gap-4 p-4 border-b border-white/5 bg-black/40 overflow-x-auto custom-scrollbar scroll-smooth shrink-0">
        {days.map((day, idx) => (
          <button
            key={`day-${idx}`}
            onClick={() => setSelectedDay(idx)}
            className={`flex flex-col items-center min-w-[55px] h-[75px] justify-center rounded-xl transition-all ${
                selectedDay === idx ? 'bg-[#f84464] text-white' : 'hover:text-[#f84464] text-gray-400'
            }`}
          >
            <span className="text-[10px] font-bold mb-1">{day.day}</span>
            <span className="text-lg font-black leading-none mb-1">{day.date}</span>
            <span className="text-[10px] font-bold">{day.month}</span>
          </button>
        ))}
      </div>

      <div className="px-4 pt-4 flex justify-between items-center">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Available Cinemas</h4>
            <button 
                onClick={() => setSortByNearby(!sortByNearby)}
                className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all flex items-center gap-2 border ${
                    sortByNearby ? 'bg-cyan-500 border-cyan-400 text-white' : 'bg-white/5 border-white/10 text-gray-500 hover:bg-white/10'
                }`}
            >
                📍 {sortByNearby ? 'Sorted by Proximity' : 'Near Me'}
            </button>
      </div>

      {/* Theater List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {theatersWithTimes.length > 0 ? (
          theatersWithTimes.map((theater) => (
            <div key={theater._id || theater.id} className="bg-[#2a2a2a] border border-white/5 rounded-2xl p-4 hover:border-white/10 transition-all">
              <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                      <span className="text-lg">🎬</span>
                      <div>
                          <h3 className="text-white font-black uppercase text-[11px] leading-tight flex items-center gap-2">
                              {theater.name}
                              {theater.distance < 2.0 && (
                                  <span className="text-[7px] bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-500/20">NEARBY</span>
                              )}
                          </h3>
                          <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-0.5 italic">
                              {theater.location} • {theater.distance} km away
                          </p>
                      </div>
                  </div>
                  <div className="text-right">
                      <span className="text-[8px] font-black text-gray-600 uppercase block">Distance</span>
                      <span className="text-[10px] font-black text-white">{theater.distance} KM</span>
                  </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {theater.times.map((time, idx) => {
                    const isFillingFast = idx % 3 === 0;
                    return (
                      <div className="group relative" key={`time-${theater._id || theater.id || theater.name}-${idx}`}>
                          <button 
                              onClick={() => {
                                  const d = days[selectedDay];
                                  onSelectShowtime(time, theater, `${d.date} ${d.month} ${d.day}`);
                              }}
                              className={`px-4 py-2.5 rounded-lg text-[10px] font-black uppercase transition-all border ${
                                  isFillingFast ? 'border-orange-500 text-orange-500' : 'border-green-500 text-green-500'
                              } hover:bg-white/5`}
                          >
                              {time}
                          </button>
                      </div>
                    )
                })}
              </div>

              <div className="flex gap-4 mt-6 text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">
                  <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Available</span>
                  <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span> Filling Fast</span>
              </div>
            </div>
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 animate-in fade-in zoom-in duration-500">
            <div className="text-6xl mb-6">🗺️</div>
            <h3 className="text-xl font-black text-white uppercase mb-2 leading-tight">No Cinemas in {selectedCity}</h3>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-relaxed mb-8 max-w-xs">
                We haven't launched our cinema network in this region yet. Please try switching to a popular city like 
                <span className="text-[#f84464]"> Mumbai, Delhi, or Bengaluru.</span>
            </p>
            <button 
                onClick={() => alert("Please use the location selector in the top header to switch cities.")}
                className="px-8 py-3 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#f84464] hover:text-white transition-all shadow-xl"
            >
                Switch Location
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Showtimes;
