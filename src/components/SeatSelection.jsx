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
                ? 'bg-[#E5E7EB] border-black/5 text-gray-400 cursor-not-allowed italic' 
                : isSelected 
                ? 'bg-[#F84464] border-[#F84464] text-white scale-110 shadow-lg shadow-[#F84464]/30' 
                : 'bg-white border-black/10 text-[#666666] hover:border-[#F84464] hover:bg-[#F84464]/10 hover:text-[#F84464]'
            }`}
        >
            {isSold ? '✕' : col}
        </button>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#F5F5FA] animate-in fade-in slide-in-from-bottom duration-500">
      {/* Header */}
      <div className="p-6 border-b border-black/5 flex items-center justify-between bg-white/80 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-xl bg-black/5 hover:bg-black/10 text-[#121212] transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
          </button>
          <div>
              <h3 className="text-xs font-black text-[#121212] uppercase tracking-widest italic leading-none">{theater.name}</h3>
              <p className="text-[8px] font-bold text-[#F84464] uppercase tracking-[0.3em] mt-1.5">{showtime}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8 custom-scrollbar bg-white shadow-inner">
        {/* Screen Indicator */}
        <div className="flex flex-col items-center mb-20 opacity-80">
            <div className="w-full max-w-sm h-1 bg-gradient-to-r from-transparent via-[#F84464]/40 to-transparent shadow-[0_0_20px_rgba(248,68,100,0.2)]"></div>
            <p className="text-[7px] font-black text-[#666666] uppercase tracking-[0.6em] mt-3 italic">CINEMATIC FOCUS THIS WAY</p>
        </div>

        {/* Categories & Seats */}
        <div className="space-y-16 flex flex-col items-center">
            {/* Royal Section */}
            <div className="w-full max-w-2xl">
                <div className="flex items-center gap-4 mb-8">
                    <p className="text-[9px] font-black text-[#121212] uppercase tracking-[0.2em] italic">ROYAL • Rs. {PRICE_PER_SEAT + 50}</p>
                    <div className="flex-1 h-[1px] bg-black/5"></div>
                </div>
                <div className="grid gap-4 justify-center">
                    {royalRows.map(row => (
                        <div key={row} className="flex gap-4 items-center">
                            <span className="w-4 text-[9px] font-black text-[#666666] opacity-30">{row}</span>
                            <div className="flex gap-2.5">
                                {cols.map(col => <Seat key={col} id={`${row}-${col}`} col={col} />)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Executive Section */}
            <div className="w-full max-w-2xl">
                <div className="flex items-center gap-4 mb-8">
                    <p className="text-[9px] font-black text-[#121212] uppercase tracking-[0.2em] italic">EXECUTIVE • Rs. {PRICE_PER_SEAT}</p>
                    <div className="flex-1 h-[1px] bg-black/5"></div>
                </div>
                <div className="grid gap-4 justify-center">
                    {executiveRows.map(row => (
                        <div key={row} className="flex gap-4 items-center">
                            <span className="w-4 text-[9px] font-black text-[#666666] opacity-30">{row}</span>
                            <div className="flex gap-2.5">
                                {cols.map(col => <Seat key={col} id={`${row}-${col}`} col={col} />)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Legend */}
        <div className="mt-20 flex justify-center gap-12 pt-10 mb-8 max-w-xl mx-auto border-t border-black/5">
            <div className="flex items-center gap-4">
                <div className="w-6 h-6 rounded-lg border border-black/10 text-[#666666] flex items-center justify-center text-[8px] font-black">1</div>
                <span className="text-[8px] font-black text-[#666666] uppercase tracking-widest italic">Available</span>
            </div>
            <div className="flex items-center gap-4">
                <div className="w-6 h-6 rounded-lg bg-[#F84464] flex items-center justify-center text-[8px] font-black text-white shadow-lg shadow-[#F84464]/20">1</div>
                <span className="text-[8px] font-black text-[#666666] uppercase tracking-widest">Selected</span>
            </div>
            <div className="flex items-center gap-4">
                <div className="w-6 h-6 rounded-lg bg-gray-100 text-gray-300 flex items-center justify-center text-[10px] font-black border border-black/5">✕</div>
                <span className="text-[8px] font-black text-[#666666] uppercase tracking-widest italic">Sold Out</span>
            </div>
        </div>
      </div>

      {/* Checkout Footer */}
      <div className="p-8 bg-white border-t border-black/5 shadow-2xl z-10">
        <button
            disabled={selectedSeats.length === 0}
            onClick={() => onConfirm(selectedSeats)}
            className="w-full py-5 btn-hero text-white !rounded-2xl text-[10px] italic shadow-2xl"
        >
            {selectedSeats.length > 0 ? `PROCEED WITH THE TRANSACTION • Rs. ${totalPrice}` : 'SELECT YOUR SEATS'}
        </button>
      </div>
    </div>
  );
};

export default SeatSelection;
