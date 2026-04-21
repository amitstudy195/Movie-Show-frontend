import React, { useState } from 'react';
import Showtimes from './Showtimes';
import SeatSelection from './SeatSelection';
import PaymentGateway from './PaymentGateway';

const BookingFlow = ({ movie, user, allTheaters, allSchedules, selectedCity, onClose, onBookingSuccess, addNotification }) => {
    const [step, setStep] = useState(1); // 1: Showtimes, 2: Seats, 3: Payment
    const [selectedShowtime, setSelectedShowtime] = useState(null);
    const [selectedTheater, setSelectedTheater] = useState(null);
    const [selectedShowDate, setSelectedShowDate] = useState(null);
    const [selectedSeats, setSelectedSeats] = useState([]);

    const handleSelectShowtime = (time, theater, date) => {
        setSelectedShowtime(time);
        setSelectedTheater(theater);
        setSelectedShowDate(date);
        setStep(2);
    };

    const handleConfirmSeats = (seats) => {
        setSelectedSeats(seats);
        setStep(3);
    };

    const handlePaymentSuccess = (bookingData) => {
        onBookingSuccess();
    };

    return (
        <div className="fixed inset-0 z-[200] bg-[#1a1a1a] flex flex-col animate-in slide-in-from-right duration-500">
            {/* Header Area (BMS Style) */}
            <header className="px-8 py-6 bg-[#212121] border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                    </button>
                    <div>
                        <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none">{movie.title}</h2>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">
                            {movie.genres?.map(g => g.name).join(' | ')} • {movie.runtime}m
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                        <span className={`w-2 h-2 rounded-full ${step >= 1 ? 'bg-[#f84464]' : 'bg-gray-600'}`}></span>
                        <span className={`w-2 h-2 rounded-full ${step >= 2 ? 'bg-[#f84464]' : 'bg-gray-600'}`}></span>
                        <span className={`w-2 h-2 rounded-full ${step >= 3 ? 'bg-[#f84464]' : 'bg-gray-600'}`}></span>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-red-600 text-white rounded-full transition-all">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
            </header>

            {/* Content Area */}
            <main className="flex-1 overflow-hidden">
                {step === 1 && (
                    <Showtimes 
                        movieId={movie.id} 
                        movieTitle={movie.title} 
                        selectedCity={selectedCity}
                        onSelectShowtime={handleSelectShowtime}
                        allTheaters={allTheaters}
                        allSchedules={allSchedules}
                    />
                )}
                {step === 2 && (
                    <SeatSelection 
                        showtime={selectedShowtime}
                        theater={selectedTheater}
                        onBack={() => setStep(1)}
                        onConfirm={handleConfirmSeats}
                    />
                )}
                {step === 3 && (
                    <PaymentGateway 
                        amount={(selectedSeats.length * (selectedTheater.price || 150)).toFixed(2)}
                        bookingDetails={{
                            movieTitle: movie.title,
                            theaterName: selectedTheater.name,
                            showtime: selectedShowtime,
                            showDate: selectedShowDate,
                            seats: selectedSeats,
                            posterPath: `https://image.tmdb.org/t/p/w200${movie.poster_path}`
                        }}
                        onBack={() => setStep(2)}
                        onPaymentSuccess={handlePaymentSuccess}
                    />
                )}
            </main>
        </div>
    );
};

export default BookingFlow;
