import React, { useState, useEffect } from 'react';
import { bookingService } from '../services/api';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const MyBookings = ({ onClose, user }) => {
  const [bookings, setBookings] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
        try {
            const data = await bookingService.getMyBookings();
            setBookings(data.filter(b => b.status === 'confirmed'));
        } catch (err) {
            console.error('Failed to fetch bookings:', err);
        } finally {
            setLoading(false);
        }
    };
    fetchBookings();
  }, []);

  const handleCancel = async (id) => {
    try {
        await bookingService.cancelBooking(id);
        setBookings(bookings.filter(b => b._id !== id));
    } catch (err) {
        console.error('Cancellation failed:', err);
    }
  };

  const handlePrint = () => {
    const element = document.querySelector('.printable-ticket');
    if (!element) {
        alert("Critial: Ticket not found");
        return;
    }

    const printWindow = window.open('', '_blank');
    const movieTitle = selectedTicket.movieTitle;
    const ticketHtml = element.innerHTML;

    printWindow.document.write(`
      <html>
        <head>
          <title>Movie Show - ${movieTitle}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;900&display=swap');
            * { 
                box-sizing: border-box; 
                -webkit-print-color-adjust: exact !important; 
                print-color-adjust: exact !important; 
            }
            body { 
                font-family: 'Outfit', sans-serif; 
                margin: 0; 
                padding: 40px; 
                background: #f8fafc; 
                display: flex;
                justify-content: center;
            }
            .printable-ticket {
                width: 130mm;
                background: #09090b !important;
                color: white !important;
                padding: 50px;
                border-radius: 50px;
                box-shadow: 0 30px 60px rgba(0,0,0,0.5);
                position: relative;
                overflow: hidden;
            }
            .print-hide { display: none !important; }
            
            /* Structural Utilities */
            .flex { display: flex !important; }
            .flex-col { flex-direction: column !important; }
            .flex-1 { flex: 1 1 0% !important; }
            .flex-shrink-0 { flex-shrink: 0 !important; }
            .justify-between { justify-content: space-between !important; }
            .justify-center { justify-content: center !important; }
            .items-center { align-items: center !important; }
            .grid { display: grid !important; }
            .grid-cols-2 { grid-template-columns: 1fr 1fr !important; }
            .gap-2 { gap: 8px !important; }
            .gap-4 { gap: 16px !important; }
            .gap-6 { gap: 24px !important; }
            .gap-8 { gap: 32px !important; }
            .relative { position: relative !important; }
            .absolute { position: absolute !important; }
            
            /* Sizing & Spacing */
            .w-full { width: 100% !important; }
            .h-full { height: 100% !important; }
            .w-20 { width: 80px !important; }
            .h-20 { height: 80px !important; }
            .w-40 { width: 160px !important; }
            .h-40 { height: 160px !important; }
            .p-4 { padding: 16px !important; }
            .p-6 { padding: 24px !important; }
            .p-10 { padding: 40px !important; }
            .px-2 { padding-left: 8px !important; padding-right: 8px !important; }
            .mb-1 { margin-bottom: 4px !important; }
            .mb-4 { margin-bottom: 16px !important; }
            .mb-6 { margin-bottom: 24px !important; }
            .mb-10 { margin-bottom: 40px !important; }
            .mb-12 { margin-bottom: 48px !important; }
            .mt-1 { margin-top: 4px !important; }
            .mx-auto { margin-left: auto !important; margin-right: auto !important; }

            /* Typography */
            .text-white { color: #ffffff !important; }
            .text-cyan-400 { color: #22d3ee !important; }
            .text-cyan-500 { color: #06b6d4 !important; }
            .text-green-400 { color: #4ade80 !important; }
            .text-gray-400 { color: #94a3b8 !important; }
            .text-gray-500 { color: #64748b !important; }
            .text-gray-600 { color: #475569 !important; }
            .font-black { font-weight: 900 !important; }
            .font-bold { font-weight: 700 !important; }
            .uppercase { text-transform: uppercase !important; }
            .tracking-widest { letter-spacing: 0.1em !important; }
            .tracking-tighter { letter-spacing: -0.05em !important; }
            .text-2xl { font-size: 24px !important; }
            .text-lg { font-size: 18px !important; }
            .text-sm { font-size: 14px !important; }
            .text-xs { font-size: 12px !important; }
            .text-center { text-align: center !important; }
            .text-right { text-align: right !important; }

            /* Aesthetics */
            .bg-white { background: #ffffff !important; }
            .bg-white\\/2 { background: rgba(255,255,255,0.02) !important; }
            .bg-zinc-800 { background: #27272a !important; }
            .bg-gradient-to-br { background: linear-gradient(to bottom right, #06b6d4, #2563eb) !important; }
            .bg-gradient-to-r { background: linear-gradient(to right, #06b6d4, #9333ea) !important; }
            .border { border: 1px solid rgba(255,255,255,0.1) !important; }
            .border-white\\/5 { border-color: rgba(255,255,255,0.05) !important; }
            .border-gray-100 { border-color: #f1f5f9 !important; }
            .rounded-full { border-radius: 9999px !important; }
            .rounded-3xl { border-radius: 24px !important; }
            .rounded-xl { border-radius: 12px !important; }
            .opacity-80 { opacity: 0.8 !important; }
            .h-\\[2px\\] { height: 2px !important; }
            
            /* Image specific */
            img { object-fit: cover !important; }
            [class*="bg-[repeating-conic-gradient"], .qr-pattern {
                background-image: repeating-conic-gradient(#000 0% 25%, #fff 0% 50%) !important;
                background-size: 10px 10px !important;
                display: block !important;
                width: 100% !important;
                height: 100% !important;
                opacity: 1 !important;
            }

            @media print {
                body { background: white; padding: 0; }
                .printable-ticket { 
                    margin: 0; 
                    box-shadow: none; 
                    width: 100%;
                    height: 100%;
                    border-radius: 0;
                }
            }
          </style>
        </head>
        <body>
          <div class="printable-ticket">
            ${ticketHtml}
          </div>
          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print();
                window.close();
              }, 800);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-2xl overflow-y-auto flex justify-center p-4">
      <div className="w-full max-w-4xl min-h-screen md:min-h-0 md:my-12 bg-zinc-950 border border-white/5 rounded-3xl flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.8)]">
        
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex items-center justify-between sticky top-0 bg-zinc-950/80 backdrop-blur-md z-10">
          <div>
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">My Bookings</h2>
            <p className="text-gray-500 text-xs uppercase tracking-[0.3em] mt-1 font-bold">Manage your tickets & reservations</p>
          </div>
          <button onClick={onClose} className="w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-red-600 rounded-full transition-all duration-300">
             <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="flex-1 p-6 md:p-10">
          {bookings.length === 0 ? (
            <div className="h-96 flex flex-col items-center justify-center text-center opacity-40">
              <div className="text-6xl mb-4">🎟️</div>
              <p className="text-xl font-bold text-white uppercase italic">No active bookings found</p>
              <p className="text-gray-400 mt-2">Explore movies and book your first show!</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {bookings.map((booking) => (
                <div key={booking._id} className="group relative bg-white/5 border border-white/5 rounded-3xl overflow-hidden hover:border-white/20 transition-all duration-500">
                  <div className="flex flex-col md:flex-row">
                    {/* Movie Info */}
                    <div className="flex-1 p-6 md:p-8 flex gap-6">
                        <div className="w-24 h-36 bg-zinc-800 rounded-xl overflow-hidden flex-shrink-0 shadow-xl border border-white/10">
                            <img src={booking.posterPath} className="w-full h-full object-cover" alt={booking.movieTitle} />
                        </div>
                        <div className="flex flex-col justify-center">
                            <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2 group-hover:text-cyan-400 transition-colors">{booking.movieTitle}</h3>
                            <div className="space-y-1">
                                <p className="text-gray-400 text-sm flex items-center gap-2">
                                    <span className="text-cyan-500 font-black">@</span> {booking.theaterName}
                                </p>
                                <p className="text-gray-400 text-sm flex items-center gap-2">
                                     <span className="text-purple-500 font-black">#</span> {booking.showDate} • {booking.showtime}
                                 </p>
                                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mt-2 italic">
                                    🗓️ Booked on: {new Date(booking.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                                </p>
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {booking.seats.map(s => (
                                        <span key={s} className="px-2 py-1 bg-white/10 rounded text-[10px] font-black text-white uppercase border border-white/10">{s}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="bg-white/[0.02] border-t md:border-t-0 md:border-l border-white/5 p-6 md:w-48 flex flex-row md:flex-col gap-3 justify-center items-center">
                        <button 
                            onClick={() => setSelectedTicket(booking)}
                            className="w-full py-3 bg-white text-black font-black text-xs rounded-xl hover:bg-cyan-400 transition-all uppercase"
                        >
                            View Ticket
                        </button>
                        <button 
                            onClick={() => handleCancel(booking._id)}
                            className="w-full py-3 bg-zinc-900 text-red-500 border border-red-500/20 font-black text-xs rounded-xl hover:bg-red-600 hover:text-white transition-all uppercase"
                        >
                            Cancel
                        </button>
                    </div>
                  </div>
                  
                  {/* Glass Background effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ticket Modal */}
        {selectedTicket && (
            <div 
                className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 min-h-screen overflow-y-auto"
                onClick={() => setSelectedTicket(null)}
            >
                <div 
                    className="w-full max-w-lg bg-zinc-950 rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in duration-300 relative printable-ticket"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Minimal Close Button */}
                    <button 
                        onClick={() => setSelectedTicket(null)} 
                        className="absolute top-6 right-6 z-20 w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-red-600 text-white rounded-full transition-all print-hide"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>

                    <div className="relative p-10 print:p-0">
                        {/* Cutout visuals (Hidden on print) */}
                        <div className="absolute top-1/2 -left-4 w-8 h-8 bg-black rounded-full shadow-inner print-hide"></div>
                        <div className="absolute top-1/2 -right-4 w-8 h-8 bg-black rounded-full shadow-inner print-hide"></div>
                        <div className="absolute top-1/2 left-8 right-8 h-[2px] border-b border-dashed border-white/10 print-hide"></div>

                        <div className="text-center mb-10">
                            <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full mx-auto flex items-center justify-center mb-4 border-4 border-zinc-800 shadow-2xl">
                                <span className="text-3xl tracking-tighter font-black text-white">MS</span>
                            </div>
                            <h4 className="text-white font-black text-2xl uppercase tracking-tighter">Official E-Ticket</h4>
                            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.4em] mt-1">Movie Show Experience</p>
                        </div>

                        <div className="space-y-8 mb-12">
                            <div className="flex justify-between items-center bg-white/2 rounded-3xl p-6 border border-white/5">
                                <div>
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Movie</p>
                                    <p className="text-lg font-black text-white uppercase">{selectedTicket.movieTitle}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Seats</p>
                                    <p className="text-lg font-black text-cyan-400">{selectedTicket.seats.join(', ')}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8 px-2 text-wrap">
                                <div>
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Ticket Holder</p>
                                    <p className="text-sm font-black text-cyan-500 uppercase leading-tight ticket-user">{selectedTicket.userName || user?.name || 'Guest User'}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Theater</p>
                                    <p className="text-sm font-bold text-white uppercase leading-tight">{selectedTicket.theaterName}</p>
                                </div>
                                <div className="col-span-2 border-t border-white/5 pt-6">
                                    <p className="text-[9px] font-black text-cyan-500 uppercase tracking-widest mb-1">Official Show Schedule</p>
                                    <p className="text-lg font-black text-white uppercase leading-tight ticket-date">{selectedTicket.showDate} @ {selectedTicket.showtime}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Booking ID</p>
                                    <p className="text-sm font-bold text-white font-mono uppercase leading-tight">#{selectedTicket.bookingId || selectedTicket._id.slice(-8)}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Payment Receipt</p>
                                    <p className="text-sm font-black text-green-400 uppercase leading-tight ticket-bill">
                                        ₹{selectedTicket.totalPrice?.toFixed(2)} PAID
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-center gap-4">
                            <div className="w-40 h-40 bg-white p-4 rounded-3xl shadow-xl mb-2 border border-gray-100">
                                <div className="w-full h-full bg-[repeating-conic-gradient(#000_0%_25%,#fff_0%_50%)] bg-[length:10px_10px] opacity-80"></div>
                            </div>
                            <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mb-2">Scan at entrance</p>
                            
                            <button 
                                onClick={handlePrint}
                                className="w-full py-4 bg-white text-black text-[10px] font-black uppercase rounded-2xl hover:bg-cyan-500 hover:text-white transition-all shadow-2xl print-hide"
                            >
                                🖨️ Download PDF Ticket
                            </button>
                            <button 
                                onClick={() => setSelectedTicket(null)}
                                className="w-full py-3 bg-white/5 text-gray-400 text-[10px] font-black uppercase rounded-2xl hover:bg-red-600 hover:text-white transition-all print-hide"
                            >
                                ← Close & Go Back
                            </button>
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-cyan-500 to-purple-600 h-2 w-full mt-auto"></div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
