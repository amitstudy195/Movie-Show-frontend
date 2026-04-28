import React, { useState, useMemo } from 'react';

const Showtimes = ({ movieId, movieTitle, selectedCity, onSelectShowtime, allTheaters, allSchedules }) => {
  const [selectedDay, setSelectedDay] = useState(0);

  // If data is still loading
  if (!allTheaters || (allTheaters.length === 0 && !selectedCity)) {
      return (
          <div className="h-full flex flex-col items-center justify-center bg-[#F5F5FA]">
              <div className="w-12 h-12 border-4 border-[#F84464]/20 border-t-[#F84464] rounded-full animate-spin mb-4"></div>
              <p className="text-[10px] font-black text-[#121212] uppercase tracking-widest animate-pulse italic">Syncing Cinematic Hubs...</p>
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

  const isPastShowtime = (timeStr, isToday) => {
    if (!isToday) return false;
    
    // Parse time like "10:30 AM" or "01:45 PM"
    const now = new Date();
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':');
    
    let hoursNum = parseInt(hours, 10);
    const minutesNum = parseInt(minutes, 10);
    
    if (modifier === 'PM' && hoursNum !== 12) {
        hoursNum += 12;
    }
    if (modifier === 'AM' && hoursNum === 12) {
        hoursNum = 0;
    }
    
    const showDate = new Date();
    showDate.setHours(hoursNum, minutesNum, 0, 0);
    
    return now > showDate;
  };

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
    <div className="flex flex-col h-full bg-white rounded-[2.5rem] overflow-hidden border border-black/5">
      {/* BMS Date Strip */}
      <div className="flex gap-4 p-5 border-b border-black/5 bg-white/95 overflow-x-auto scrollbar-hide scroll-smooth shrink-0">
        {days.map((day, idx) => (
          <button
            key={`day-${idx}`}
            onClick={() => setSelectedDay(idx)}
            className={`flex flex-col items-center min-w-[65px] h-[85px] justify-center rounded-2xl transition-all duration-300 border ${
                selectedDay === idx 
                  ? 'bg-[#F84464] border-[#F84464] shadow-lg shadow-[#F84464]/30 text-white' 
                  : 'bg-black/5 border-black/5 text-[#666666] hover:bg-black/10 hover:text-[#121212]'
            }`}
          >
            <span className="text-[9px] font-black mb-1 opacity-70 tracking-widest">{day.day}</span>
            <span className="text-xl font-black leading-none mb-1 italic">{day.date}</span>
            <span className="text-[9px] font-black opacity-70 tracking-widest">{day.month}</span>
          </button>
        ))}
      </div>

      <div className="px-6 pt-5 flex justify-between items-center bg-white">
            <h4 className="text-[10px] font-black text-[#666666] uppercase tracking-[0.3em]">Cinematic Hubs</h4>
            <button 
                onClick={() => setSortByNearby(!sortByNearby)}
                className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border ${
                    sortByNearby 
                      ? 'bg-[#F84464]/10 border-[#F84464]/30 text-[#F84464]' 
                      : 'bg-white border-black/5 text-[#666666] hover:text-[#121212] hover:border-black/10'
                }`}
            >
                📍 {sortByNearby ? 'PROXIMITY SYNC' : 'LOCATE NEARBY'}
            </button>
      </div>

      {/* Theater List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-white">
        {theatersWithTimes.length > 0 ? (
          theatersWithTimes.map((theater) => (
            <div key={theater._id || theater.id} className="bg-white border border-black/10 rounded-3xl p-6 hover:border-[#F84464]/30 transition-all group shadow-sm">
              <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-black/5 rounded-2xl flex items-center justify-center text-xl group-hover:bg-[#F84464]/10 transition-colors">🎬</div>
                      <div>
                          <h3 className="text-[#121212] font-black uppercase text-xs leading-none tracking-widest flex items-center gap-3">
                              {theater.name}
                              {theater.distance < 2.0 && (
                                  <span className="text-[7px] bg-[#F84464]/10 text-[#F84464] px-2 py-0.5 rounded-lg border border-[#F84464]/20 italic">PREMIUM</span>
                              )}
                          </h3>
                          <p className="text-[9px] text-[#666666] font-bold uppercase tracking-widest mt-2 italic opacity-60">
                              {theater.location} • {theater.distance} km away
                          </p>
                      </div>
                  </div>
                  <div className="text-right">
                      <span className="text-[7px] font-black text-[#666666] uppercase block tracking-widest mb-1">DISTANCE</span>
                      <span className="text-sm font-black text-[#121212] italic">{theater.distance} KM</span>
                  </div>
              </div>

              <div className="flex flex-wrap gap-4">
                {theater.times.map((time, idx) => {
                    const isPast = isPastShowtime(time, selectedDay === 0);
                    const isFillingFast = idx % 3 === 0;

                    return (
                      <div className="group relative" key={`time-${theater._id || theater.id || theater.name}-${idx}`}>
                          <button 
                              onClick={() => {
                                  if (isPast) return;
                                  const d = days[selectedDay];
                                  onSelectShowtime(time, theater, `${d.date} ${d.month} ${d.day}`);
                              }}
                              disabled={isPast}
                              className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                                  isPast 
                                    ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed italic' 
                                    : isFillingFast 
                                        ? 'border-[#F84464] text-[#F84464] hover:bg-[#F84464] hover:text-white shadow-md shadow-[#F84464]/10' 
                                        : 'border-black/10 text-[#121212] hover:bg-black hover:text-white'
                              }`}
                          >
                              {time}
                              {isPast && <span className="block text-[6px] opacity-40 mt-0.5">EXPIRED</span>}
                          </button>
                      </div>
                    )
                })}
              </div>

              <div className="flex gap-6 mt-8 text-[8px] font-black text-[#666666] uppercase tracking-[0.3em] opacity-40 italic">
                  <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-black/20"></span> Available</span>
                  <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#F84464]"></span> Filling Fast</span>
              </div>
            </div>
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 animate-in fade-in zoom-in duration-500 bg-white">
            <div className="w-24 h-24 bg-[#F5F5FA] rounded-full flex items-center justify-center text-4xl mb-8 shadow-xl border border-black/5">🗺️</div>
            <h3 className="text-xl font-black text-[#121212] uppercase mb-4 italic tracking-tighter leading-tight">No Cinemas in {selectedCity}</h3>
            <p className="text-[10px] font-bold text-[#666666] uppercase tracking-widest leading-relaxed mb-10 max-w-sm">
                We haven't launched our cinema network in this region yet. Try switching to a flagship hub like 
                <span className="text-[#F84464] italic"> MUMBAI, DELHI, OR BENGALURU.</span>
            </p>
            <button 
                onClick={() => alert("Please use the location selector in the top header to switch cities.")}
                className="px-12 py-5 btn-hero text-white rounded-2xl text-[10px] italic shadow-2xl"
            >
                SWITCH LOCATION
            </button>
          </div>
        )}
      </div>
      </div>
    
  );
};

export default Showtimes;
