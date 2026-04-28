import React, { useState, useEffect } from 'react';
import { bookingService } from '../services/api';

const MyBookings = ({ onClose, user }) => {
  const [bookings, setBookings] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
        try {
            const data = await bookingService.getMyBookings();
            setBookings(data);
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
        alert("Critial Protocol Error: Ticket data not localized.");
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
                background: #F5F5FA; 
                display: flex;
                justify-content: center;
            }
            .printable-ticket {
                width: 130mm;
                background: #ffffff !important;
                color: #121212 !important;
                padding: 50px;
                border: 1px solid rgba(0,0,0,0.05);
                border-radius: 50px;
                box-shadow: 0 30px 60px rgba(0,0,0,0.1);
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
            .text-[#121212] { color: #121212 !important; }
            .text-\\[\\#F84464\\] { color: #F84464 !important; }
            .text-green-600 { color: #16a34a !important; }
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
            .bg-black\/5 { background: rgba(0,0,0,0.05) !important; }
            .bg-zinc-100 { background: #f4f4f5 !important; }
            .bg-gradient-to-br { background: linear-gradient(to bottom right, #F84464, #FF6B81) !important; }
            .bg-gradient-to-r { background: linear-gradient(to right, #F84464, #FF6B81) !important; }
            .border { border: 1px solid rgba(0,0,0,0.1) !important; }
            .border-black\/5 { border-color: rgba(0,0,0,0.05) !important; }
            .border-gray-100 { border-color: #f1f5f9 !important; }
            .rounded-full { border-radius: 9999px !important; }
            .rounded-3xl { border-radius: 24px !important; }
            .rounded-xl { border-radius: 12px !important; }
            .opacity-80 { opacity: 0.8 !important; }
            .h-\\[2px\\] { height: 2px !important; }
            .print-text-dark { color: #121212 !important; }
            .print-text-muted { color: #666666 !important; }
            
            /* Image specific */
            img { object-fit: cover !important; }
            .qr-pattern {
                background-image: repeating-conic-gradient(#000 0% 25%, #fff 0% 50%) !important;
                background-size: 10px 10px !important;
                display: block !important;
                width: 100% !important;
                height: 100% !important;
                opacity: 0.9 !important;
            }

            @media print {
                body { background: white; padding: 0; }
                .printable-ticket { 
                    margin: 0; 
                    box-shadow: none; 
                    width: 100%;
                    height: 100%;
                    border-radius: 0;
                    border: none;
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
    <div className="fixed inset-0 z-[110] bg-black/40 backdrop-blur-3xl overflow-y-auto flex justify-center p-4 animate-in fade-in duration-700">
      <div className="w-full max-w-4xl min-h-screen md:min-h-0 md:my-12 bg-white border border-black/5 rounded-[3.5rem] flex flex-col shadow-2xl overflow-hidden glass-effect">
        
        {/* Header */}
        <div className="p-10 border-b border-black/5 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
          <div>
            <h2 className="text-3xl font-black text-[#121212] uppercase tracking-tighter italic">MY BOOKINGS</h2>
            <p className="text-[#666666] text-[9px] font-black uppercase tracking-[0.4em] mt-1 italic">Identify and manage your cinematic access keys</p>
          </div>
          <button onClick={onClose} className="w-14 h-14 flex items-center justify-center bg-black/5 hover:bg-[#F84464] text-[#121212] hover:text-white rounded-full transition-all duration-500 hover:rotate-90">
             <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="flex-1 p-8 md:p-14">
          {loading ? (
            <div className="h-96 flex items-center justify-center">
                 <div className="w-12 h-12 border-4 border-[#F84464]/20 border-t-[#F84464] rounded-full animate-spin"></div>
            </div>
          ) : bookings.length === 0 ? (
            <div className="h-96 flex flex-col items-center justify-center text-center opacity-30 filter grayscale">
              <div className="text-7xl mb-6">🎟️</div>
              <p className="text-2xl font-black text-[#121212] uppercase italic tracking-widest">Awaiting Reservations</p>
              <p className="text-[#666666] text-[10px] font-black uppercase tracking-[0.2em] mt-3">Explore the cinematography and secure your first seat</p>
            </div>
          ) : (
            <div className="grid gap-8">
              {bookings.map((booking) => (
                <div key={booking._id} className="group relative bg-[#F5F5FA] border border-black/5 rounded-[2.5rem] overflow-hidden hover:border-[#F84464]/30 transition-all duration-500 shadow-xl">
                  <div className="flex flex-col md:flex-row">
                    {/* Movie Info */}
                    <div className="flex-1 p-8 md:p-10 flex gap-8">
                        <div className="w-28 h-40 bg-gray-200 rounded-2xl overflow-hidden flex-shrink-0 shadow-lg border border-black/5 transform transition-transform duration-700 group-hover:scale-105 group-hover:-rotate-2">
                            <img src={booking.posterPath} className="w-full h-full object-cover" alt={booking.movieTitle} />
                        </div>
                        <div className="flex flex-col justify-center">
                            <div className="flex items-center gap-4 mb-3">
                                <h3 className="text-3xl font-black text-[#121212] uppercase tracking-tighter group-hover:text-[#F84464] transition-colors leading-none italic">{booking.movieTitle}</h3>
                                <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${booking.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-[#F84464]/10 text-[#F84464] border border-[#F84464]/20 animate-pulse'}`}>
                                    {booking.status === 'confirmed' ? 'CONFIRMED' : 'PENDING'}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-[#666666] text-xs font-black uppercase tracking-widest flex items-center gap-3">
                                    <span className="text-[#F84464] italic">@</span> {booking.theaterName}
                                </p>
                                <p className="text-[#666666] text-xs font-black uppercase tracking-widest flex items-center gap-3">
                                     <span className="text-[#F84464] italic">#</span> {booking.showDate} • {booking.showtime}
                                 </p>
                                <p className="text-[9px] font-black text-black/20 uppercase tracking-[0.4em] mt-4 italic">
                                    REGISTERED ON: {new Date(booking.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                                </p>
                                <div className="flex flex-wrap gap-2 mt-5">
                                    {booking.seats.map(s => (
                                        <span key={s} className="px-3 py-1.5 bg-white rounded-lg text-[10px] font-black text-[#121212] uppercase border border-black/5 tracking-widest shadow-sm">{s}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="bg-black/5 border-t md:border-t-0 md:border-l border-black/5 p-8 md:w-56 flex flex-row md:flex-col gap-4 justify-center items-center">
                        <button 
                            onClick={() => setSelectedTicket(booking)}
                            className="w-full h-14 bg-[#121212] text-white font-black text-[10px] rounded-2xl hover:bg-[#F84464] transition-all uppercase tracking-widest shadow-xl active:scale-95"
                        >
                            View Ticket
                        </button>
                        <button 
                            onClick={() => handleCancel(booking._id)}
                            className="w-full h-14 bg-transparent text-[#F84464]/50 border border-[#F84464]/10 font-black text-[10px] rounded-2xl hover:bg-red-600 hover:text-white hover:border-red-600 transition-all uppercase tracking-widest active:scale-95"
                        >
                            Decommission
                        </button>
                    </div>
                  </div>
                  
                  {/* Glass Background effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#F84464]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ticket Modal */}
        {selectedTicket && (
            <div 
                className="fixed inset-0 z-[120] bg-black/40 backdrop-blur-3xl flex items-center justify-center p-6 min-h-screen overflow-y-auto animate-in fade-in duration-500"
                onClick={() => setSelectedTicket(null)}
            >
                <div 
                    className="w-full max-w-lg bg-white rounded-[3.5rem] border border-black/10 shadow-2xl overflow-hidden animate-in zoom-in duration-500 relative printable-ticket"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Minimal Close Button */}
                    <button 
                        onClick={() => setSelectedTicket(null)} 
                        className="absolute top-8 right-8 z-20 w-12 h-12 flex items-center justify-center bg-black/5 hover:bg-red-600 text-[#121212] hover:text-white rounded-full transition-all print-hide"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>

                    <div className="relative p-12 print:p-0 bg-white">
                        {/* Cutout visuals (Hidden on print) */}
                        <div className="absolute top-1/2 -left-6 w-12 h-12 bg-[#F5F5FA] rounded-full shadow-inner print-hide border border-black/5"></div>
                        <div className="absolute top-1/2 -right-6 w-12 h-12 bg-[#F5F5FA] rounded-full shadow-inner print-hide border border-black/5"></div>
                        <div className="absolute top-1/2 left-10 right-10 h-[2px] border-b border-dashed border-black/10 print-hide"></div>

                        <div className="text-center mb-12">
                            <div className="w-24 h-24 bg-gradient-to-br from-[#F84464] to-[#FF6B81] rounded-[2.5rem] mx-auto flex items-center justify-center mb-6 border-4 border-white shadow-2xl transform -rotate-3">
                                <span className="text-4xl tracking-tighter font-black text-white italic">MS</span>
                            </div>
                            <h4 className="text-[#121212] font-black text-3xl uppercase tracking-tighter italic">OFFICIAL E-TICKET</h4>
                            <p className="text-[#666666] text-[10px] font-black uppercase tracking-[0.5em] mt-2 italic opacity-60">Verified Cinema Experience</p>
                        </div>

                        <div className="space-y-8 mb-14">
                            <div className="flex justify-between items-center bg-black/5 rounded-[2.5rem] p-8 border border-black/5">
                                <div>
                                    <p className="text-[10px] font-black text-[#666666] uppercase tracking-widest mb-2 italic">Cinematic Asset</p>
                                    <p className="text-2xl font-black text-[#121212] uppercase italic tracking-tighter leading-none">{selectedTicket.movieTitle}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-[#666666] uppercase tracking-widest mb-2 italic">Sector Selection</p>
                                    <p className="text-2xl font-black text-[#F84464] tracking-tighter leading-none italic">{selectedTicket.seats.join(', ')}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-10 px-4">
                                <div>
                                    <p className="text-[10px] font-black text-[#666666] uppercase tracking-widest mb-2 italic">Authorized User</p>
                                    <p className="text-sm font-black text-[#F84464] uppercase leading-tight ticket-user italic">{selectedTicket.userName || user?.name || 'Guest Participant'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-[#666666] uppercase tracking-widest mb-2 italic">Venue Hub</p>
                                    <p className="text-sm font-black text-[#121212] uppercase leading-tight italic">{selectedTicket.theaterName}</p>
                                </div>
                                <div className="col-span-2 border-t border-black/5 pt-8">
                                    <p className="text-[10px] font-black text-[#F84464] uppercase tracking-widest mb-2 italic">Verified Schedule Transmission</p>
                                    <p className="text-2xl font-black text-[#121212] uppercase leading-tight ticket-date italic tracking-tighter">{selectedTicket.showDate} @ {selectedTicket.showtime}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-[#666666] uppercase tracking-widest mb-2 italic">Registry ID</p>
                                    <p className="text-sm font-black text-[#121212] uppercase leading-tight opacity-40">#{selectedTicket.bookingId || selectedTicket._id?.slice(-8)}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-[#666666] uppercase tracking-widest mb-2 italic">Payment Receipt</p>
                                    <p className="text-sm font-black text-emerald-600 uppercase leading-tight ticket-bill italic">
                                        ₹{selectedTicket.totalPrice?.toFixed(2)} SETTLED
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-center gap-6">
                            <div className="w-44 h-44 bg-white p-5 rounded-[2.5rem] shadow-xl mb-2 border border-black/10 transform transition-transform hover:scale-105 active:scale-95 cursor-none">
                                <div className="w-full h-full bg-[repeating-conic-gradient(#000_0%_25%,#fff_0%_50%)] bg-[length:12px_12px] opacity-90 qr-pattern rounded-2xl"></div>
                            </div>
                            <p className="text-[11px] font-black text-[#666666] uppercase tracking-[0.4em] mb-4 italic">Scan at entrance protocols</p>
                            
                            <button 
                                onClick={handlePrint}
                                className="w-full py-6 bg-[#121212] text-white text-[12px] font-black uppercase rounded-[2rem] hover:bg-[#F84464] transition-all shadow-xl print-hide tracking-widest active:scale-95"
                            >
                                📥 DOWNLOAD OFFICIAL TICKET
                            </button>
                            <button 
                                onClick={() => setSelectedTicket(null)}
                                className="w-full py-4 bg-black/5 text-[#666666] text-[10px] font-black uppercase rounded-[2rem] hover:bg-black hover:text-white transition-all print-hide tracking-widest"
                            >
                                ← RETURN TO VAULT
                            </button>
                        </div>
                    </div>

                    <div className="bg-[#F84464] h-3 w-full mt-auto"></div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
