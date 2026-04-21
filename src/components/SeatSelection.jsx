import React, { useState, useMemo } from 'react';

const SeatSelection = ({ showtime, theater, onBack, onConfirm }) => {
  const rows = Array.from({ length: theater?.rows || 8 }, (_, i) => String.fromCharCode(65 + i));
  const cols = Array.from({ length: theater?.cols || 12 }, (_, i) => i + 1);
  const PRICE_PER_SEAT = theater?.price || 150.00;

  const [selectedSeats, setSelectedSeats] = useState([]);

  // Simulate sold seats based on showtime and theater name (making it consistent)
  const soldSeats = useMemo(() => {
    const seed = `${showtime}-${theater.name}`;
    const seats = [];
    const totalSeats = rows.length * cols.length;
    // Generate ~15-20% random sold seats
    const numSold = Math.floor(totalSeats * 0.15);
    
    let current = 0;
    while (current < numSold) {
        const randomRow = rows[Math.floor(Math.random() * rows.length)];
        const randomCol = cols[Math.floor(Math.random() * cols.length)];
        const id = `${randomRow}-${randomCol}`;
        if (!seats.includes(id)) {
            seats.push(id);
            current++;
        }
    }
    return seats;
  }, [showtime, theater]);

  // Split rows into categories for UI segmentation
  const executiveRows = rows.slice(0, Math.floor(rows.length / 2));
  const royalRows = rows.slice(Math.floor(rows.length / 2));

  const toggleSeat = (seatId) => {
    if (soldSeats.includes(seatId)) return; // Prevent selecting sold seats
    setSelectedSeats(prev => 
      prev.includes(seatId) 
        ? prev.filter(s => s !== seatId) 
        : [...prev, seatId]
    );
  };

  const totalPrice = (selectedSeats.length * PRICE_PER_SEAT).toFixed(2);

  const Seat = ({ id, col }) => {
    const isSelected = selectedSeats.includes(id);
    const isSold = soldSeats.includes(id);

    return (
        <button
            key={col}
            disabled={isSold}
            onClick={() => toggleSeat(id)}
            className={`w-7 h-7 rounded-md text-[9px] font-black transition-all border flex items-center justify-center ${
                isSold 
                ? 'bg-zinc-800/50 border-white/5 text-zinc-600 cursor-not-allowed' 
                : isSelected 
                ? 'bg-[#f84464] border-[#f84464] text-white scale-110 shadow-lg' 
                : 'bg-transparent border-emerald-500/30 text-emerald-500 hover:border-emerald-500 hover:bg-emerald-500/10'
            }`}
        >
            {isSold ? '✕' : col}
        </button>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#1a1a1a] animate-in fade-in slide-in-from-bottom duration-500">
      {/* Header */}
      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/20">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
          </button>
          <h3 className="text-sm font-black text-white uppercase tracking-widest">{theater.name} | {showtime}</h3>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8 custom-scrollbar">
        {/* Screen Indicator */}
        <div className="flex flex-col items-center mb-16">
            <div className="w-full max-w-xs h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50 shadow-[0_0_15px_rgba(6,182,212,0.5)]"></div>
            <p className="text-[8px] font-bold text-gray-600 uppercase tracking-[0.5em] mt-2 italic shadow-cyan-500/20">All eyes this way</p>
        </div>

        {/* Categories & Seats */}
        <div className="space-y-12 flex flex-col items-center">
            {/* Royal Section */}
            <div className="w-full">
                <div className="flex items-center gap-3 mb-6">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Royal - Rs. {PRICE_PER_SEAT + 50}</p>
                    <div className="flex-1 h-px bg-white/5"></div>
                </div>
                <div className="grid gap-3 justify-center">
                    {royalRows.map(row => (
                        <div key={row} className="flex gap-3 items-center">
                            <span className="w-4 text-[10px] font-bold text-gray-700">{row}</span>
                            <div className="flex gap-2">
                                {cols.map(col => <Seat key={col} id={`${row}-${col}`} col={col} />)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Executive Section */}
            <div className="w-full">
                <div className="flex items-center gap-3 mb-6">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Executive - Rs. {PRICE_PER_SEAT}</p>
                    <div className="flex-1 h-px bg-white/5"></div>
                </div>
                <div className="grid gap-3 justify-center">
                    {executiveRows.map(row => (
                        <div key={row} className="flex gap-3 items-center">
                            <span className="w-4 text-[10px] font-bold text-gray-700">{row}</span>
                            <div className="flex gap-2">
                                {cols.map(col => <Seat key={col} id={`${row}-${col}`} col={col} />)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Legend */}
        <div className="mt-16 flex justify-center gap-10 border-t border-white/5 pt-10 mb-8">
            <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-md border border-emerald-500/30 text-emerald-500 flex items-center justify-center text-[8px] font-bold">1</div>
                <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Available</span>
            </div>
            <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-md bg-[#f84464] flex items-center justify-center text-[8px] font-bold text-white">1</div>
                <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Selected</span>
            </div>
            <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-md bg-zinc-800/50 text-zinc-600 flex items-center justify-center text-[10px] font-bold border border-white/5">✕</div>
                <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Sold</span>
            </div>
        </div>
      </div>

      {/* Checkout Footer */}
      <div className="p-6 bg-black border-t border-white/5">
        <button
            disabled={selectedSeats.length === 0}
            onClick={() => onConfirm(selectedSeats)}
            className="w-full py-5 bg-[#f84464] text-white font-black rounded-xl text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-[#e03a58] transition-all disabled:opacity-30 disabled:grayscale"
        >
            {selectedSeats.length > 0 ? `Pay Rs. ${totalPrice}` : 'Select Seats'}
        </button>
      </div>
    </div>
  );
};

export default SeatSelection;
