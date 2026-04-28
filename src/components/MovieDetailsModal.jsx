import React, { useState, useEffect } from 'react'
import { bookingService } from '../services/api';
import Showtimes from './Showtimes'
import SeatSelection from './SeatSelection'
import PaymentGateway from './PaymentGateway'

const MovieDetailsModal = ({
  movieId,
  apiKey,
  baseUrl,
  user,
  onClose,
  onSimilarMovieClick,
  onBookTickets,
  allTheaters,
  allSchedules,
  addNotification,
  likedMovies = [],
  votedMovies = [],
  onToggleLike,
  onRateMovie
}) => {
  const [movie, setMovie] = useState(null)
  const [trailerUrl, setTrailerUrl] = useState(null)
  const [loading, setLoading] = useState(false)

  const [reviews, setReviews] = useState([])
  const [newReviewText, setNewReviewText] = useState('')
  const [newReviewRating, setNewReviewRating] = useState(5)

  const FALLBACK_AVATAR = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI0VFRSIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEyMCIgcj0iNDAiIGZpbGw9IiNDQ0MiLz48cGF0aCBkPSJNMzAgMjgwIEMgMzAgMjAwIDE3MCAyMDAgMTcwIDI4MCIgZmlsbD0iI0NDQyIvPjwvc3ZnPg=='
  const FALLBACK_POSTER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDI4MCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyODAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRUVFIi8+Cjx0ZXh0IHg9IjE0MCIgeT0iMTUwIiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Tm8gSW1hZ2U8L3RleHQ+Cjwvc3ZnPg=='

  useEffect(() => {
    if (movieId) {
      document.body.style.overflow = 'hidden' // Disable body scroll
      loadMovieDetails(movieId)
      loadReviews(movieId)
    } else {
      document.body.style.overflow = 'unset' // Enable body scroll
      setMovie(null)
      setTrailerUrl(null)
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [movieId])

  const loadMovieDetails = async (id) => {
    setLoading(true)
    try {
      // Appended 'similar' to our API call!
      const response = await fetch(`${baseUrl}/movie/${id}?api_key=${apiKey}&append_to_response=videos,credits,similar`)
      const data = await response.json()

      setMovie(data)

      if (data.videos && data.videos.results) {
        const trailer = data.videos.results.find((vid) => vid.site === 'YouTube' && vid.type === 'Trailer')
          || data.videos.results.find((vid) => vid.site === 'YouTube')

        if (trailer) setTrailerUrl(`https://www.youtube.com/embed/${trailer.key}`)
      }
    } catch (err) {
      console.error("Error fetching details:", err)
    } finally {
      setLoading(false)
    }
  }

  // --- Reviews Logic ---
  const loadReviews = (id) => {
    const savedReviews = localStorage.getItem(`movie_reviews_${id}`)
    if (savedReviews) {
      setReviews(JSON.parse(savedReviews))
    } else {
      setReviews([
        { id: '1', user: 'MovieBuff99', rating: 5, text: 'Absolutely incredible! The acting was top-notch.', date: new Date().toLocaleDateString() }
      ])
    }
  }

  const handleReviewSubmit = (e) => {
    e.preventDefault()
    if (!newReviewText.trim()) return

    const newReview = {
      id: Date.now().toString(),
      user: 'Guest User',
      rating: newReviewRating,
      text: newReviewText,
      date: new Date().toLocaleDateString()
    }

    const updatedReviews = [newReview, ...reviews]
    setReviews(updatedReviews)
    localStorage.setItem(`movie_reviews_${movieId}`, JSON.stringify(updatedReviews))

    setNewReviewText('')
    setNewReviewRating(5)
  }

  if (!movieId) return null

  const handleSelectShowtime = (time, theater) => {
    setSelectedShowtime(time)
    setSelectedTheater(theater)
  }

  const handleConfirmBooking = (seats) => {
    setSelectedSeats(seats)
    setIsPaying(true)
  }

  const handlePaymentSuccess = async () => {
    const bookingData = {
      movieTitle: movie.title,
      posterPath: `https://image.tmdb.org/t/p/w200${movie.poster_path}`,
      theaterName: selectedTheater.name,
      showtime: selectedShowtime,
      seats: selectedSeats,
      totalPrice: Number((selectedSeats.length * selectedTheater.price).toFixed(2)),
      bookingId: `BK-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    }

    try {
        const result = await bookingService.createBooking(bookingData);
        setIsPaying(false);
        setBookingConfirmed(true);

        addNotification({
            title: "Ticket Confirmed! 📧",
            message: `An email receipt for ${movie.title} has been sent to your inbox.`,
            type: "email"
        });

        setTimeout(() => {
            addNotification({
                title: "SMS Ready! 📱",
                message: `Booking ID: ${result.bookingId}. Showtime: ${selectedShowtime}. Enjoy!`,
                type: "sms"
            });
        }, 1500);
    } catch (err) {
        alert(err.response?.data?.message || 'Failed to create booking. Please try again.');
    }
  }

  if (!movieId) return null

  const director = movie?.credits?.crew.find(person => person.job === 'Director')

  return (
    <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-3xl flex items-center justify-center p-4 transition-all duration-300">
      <div className="relative w-full max-w-9xl h-[97vh] rounded-[1rem] shadow-2xl overflow-hidden bg-white/95">
        
        {/* Absolute Close Button */}
        <button onClick={onClose} className="absolute top-6 right-8 z-50 w-12 h-12 flex items-center justify-center bg-black/5 hover:bg-[#F84464] text-[#121212] hover:text-white rounded-2xl transition-all duration-300 backdrop-blur-md border border-black/10 shadow-xl">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>

        {loading || !movie ? (
          <div className="flex-1 flex items-center justify-center text-[#121212]">
            <div className="animate-pulse flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-[#F84464]/20 border-t-[#F84464] rounded-full animate-spin"></div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-50">Acquiring Metadata</p>
            </div>
          </div>
        ) : (
            <div className="flex flex-col h-full overflow-y-auto custom-scrollbar bg-white">
                {/* Hero Section (BookMyShow Style) */}
                <div className="relative w-full h-[400px] shrink-0 overflow-hidden border-b border-black/5">
                    {/* Blurred Backdrop */}
                    <div className="absolute inset-0">
                        <img 
                            src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`} 
                            className="w-full h-full object-cover blur-[2px] opacity-20 scale-105" 
                            alt="" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-transparent"></div>
                    </div>

                    {/* Content Header */}
                    <div className="relative z-10 h-full max-w-6xl mx-auto px-8 flex items-end pb-8 gap-8">
                        {/* Poster */}
                        <div className="w-[200px] h-[300px] rounded-xl overflow-hidden shadow-2xl border border-black/10 self-center poster-hover">
                            <img 
                                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
                                className="w-full h-full object-cover" 
                                alt={movie.title} 
                            />
                        </div>

                        {/* Info area */}
                        <div className="flex-1 space-y-3 pb-2">
                            <h1 className="text-3xl font-black text-[#121212] leading-tight italic uppercase tracking-tighter">{movie.title}</h1>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 bg-black/5 px-3 py-1.5 rounded-lg border border-black/5">
                                    <span className={`text-lg transition-transform duration-300 ${likedMovies.includes(movie.id.toString()) || likedMovies.includes(movie.id) ? 'scale-125 text-[#F84464]' : 'text-yellow-600'}`}>❤️</span>
                                    <span className="text-[#121212] font-black text-xl">
                                        {Math.round(movie.vote_average * 10) + (likedMovies.includes(movie.id.toString()) || likedMovies.includes(movie.id) ? 1 : 0)}%
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 bg-black/5 px-4 py-1.5 rounded-xl border border-black/5 ml-2">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onToggleLike(movie.id); }}
                                        className={`flex items-center gap-2 group transition-all duration-300 ${
                                            likedMovies.includes(movie.id.toString()) || likedMovies.includes(movie.id)
                                                ? 'text-[#F84464]' : 'text-[#666666] hover:text-[#121212]'
                                        }`}
                                    >
                                        <svg className={`w-5 h-5 ${likedMovies.includes(movie.id.toString()) || likedMovies.includes(movie.id) ? 'fill-current' : 'fill-none stroke-current'}`} strokeWidth="2" viewBox="0 0 24 24">
                                            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.5 3c1.263 0 2.426.465 3.317 1.235A5.95 5.95 0 0112 5.25a5.95 5.95 0 011.183-1.015A5.961 5.961 0 0116.5 3c2.786 0 5.25 2.322 5.25 5.25 0 3.924-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                                        </svg>
                                        <span className="text-[10px] font-black uppercase tracking-widest">{likedMovies.includes(movie.id.toString()) || likedMovies.includes(movie.id) ? 'Hearted' : 'Heart'}</span>
                                    </button>
                                </div>
                                <p className="text-[10px] font-bold text-[#666666] uppercase tracking-widest pl-2">
                                    Votes • {movie.vote_count + (likedMovies.includes(movie.id.toString()) || likedMovies.includes(movie.id) ? 1 : 0)}
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-2 py-2">
                                {movie.genres?.map(g => (
                                    <span key={g.id} className="px-3 py-1 bg-black/5 border border-black/5 rounded-md text-[10px] font-bold text-[#121212] uppercase">{g.name}</span>
                                ))}
                            </div>

                            <div className="flex items-center gap-4 text-[#666666] text-xs font-bold uppercase tracking-widest">
                                <span>{movie.runtime}m</span>
                                <span className="w-1 h-1 bg-black/10 rounded-full"></span>
                                <span>{movie.release_date}</span>
                                <span className="w-1 h-1 bg-black/10 rounded-full"></span>
                                <span className="px-2 py-0.5 border border-black/20 rounded uppercase text-[8px]">UA</span>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button 
                                    onClick={() => onBookTickets(movie)}
                                    className="px-12 py-5 btn-hero text-white rounded-2xl text-sm italic"
                                >
                                    Book Tickets
                                </button>
                                {trailerUrl && (
                                    <button 
                                        onClick={() => document.getElementById('trailer-section')?.scrollIntoView({ behavior: 'smooth' })}
                                        className="px-8 py-5 bg-black/5 hover:bg-black/10 text-[#121212] font-black rounded-2xl text-sm uppercase tracking-widest border border-black/5 transition-all flex items-center gap-3"
                                    >
                                        <span className="text-[#F84464]">▶</span> Watch Trailer
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Sections */}
                <div className="w-full max-w-6xl mx-auto px-8 py-16 flex flex-col lg:flex-row gap-16">
                    {/* Left Column (Details) */}
                    <div className="flex-1 space-y-16">
                        {/* Trailer Section */}
                        {trailerUrl && (
                            <section id="trailer-section" className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                                <h3 className="text-lg font-black text-[#121212] uppercase mb-6 flex items-center gap-3">
                                    <span className="w-1.5 h-6 bg-[#F84464] rounded-full"></span>
                                    Trailer & Clips
                                </h3>
                                <div className="relative aspect-video rounded-xl overflow-hidden border border-black/10 shadow-2xl bg-[#F5F5FA]">
                                    <iframe 
                                        src={trailerUrl}
                                        className="absolute inset-0 w-full h-full"
                                        title="Movie Trailer"
                                        frameBorder="1"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            </section>
                        )}

                        {/* About */}
                        <section>
                            <h3 className="text-lg font-black text-[#121212] uppercase mb-4 flex items-center gap-3">
                                <span className="w-1.5 h-6 bg-[#F84464] rounded-full"></span>
                                About the movie
                            </h3>
                            <p className="text-[#666666] text-sm leading-relaxed max-w-3xl">
                                {movie.overview}
                            </p>
                        </section>

                        {/* Cast */}
                        <section>
                            <h3 className="text-lg font-black text-[#121212] uppercase mb-6 flex items-center gap-3">
                                <span className="w-1.5 h-6 bg-[#F84464] rounded-full"></span>
                                Cast
                            </h3>
                            <div className="flex gap-8 overflow-x-auto pb-6 custom-scrollbar scroll-smooth">
                                {movie.credits?.cast.slice(0, 10).map(person => (
                                    <div key={person.id} className="w-24 shrink-0 text-center space-y-3">
                                        <div className="aspect-square rounded-full overflow-hidden border-2 border-transparent hover:border-[#F84464] transition-all filter grayscale hover:grayscale-0 shadow-sm bg-[#F5F5FA]">
                                            <img 
                                                src={person.profile_path ? `https://image.tmdb.org/t/p/w200${person.profile_path}` : FALLBACK_AVATAR} 
                                                className="w-full h-full object-cover" 
                                            />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-[#121212] uppercase truncate">{person.name}</p>
                                            <p className="text-[8px] font-bold text-[#666666] uppercase truncate mt-0.5 italic">{person.character}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Crew */}
                        <section>
                            <h3 className="text-lg font-black text-[#121212] uppercase mb-6 flex items-center gap-3">
                                <span className="w-1.5 h-6 bg-[#F84464] rounded-full"></span>
                                Crew
                            </h3>
                            <div className="flex gap-8 overflow-x-auto pb-6 custom-scrollbar scroll-smooth">
                                {movie.credits?.crew.filter(c => ['Director', 'Writer', 'Producer'].includes(c.job)).slice(0, 8).map(person => (
                                    <div key={person.id + person.job} className="w-24 shrink-0 text-center space-y-3">
                                        <div className="aspect-square rounded-full overflow-hidden border-2 border-transparent bg-black/5 flex items-center justify-center hover:border-[#F84464]/50 transition-all shadow-sm">
                                            {person.profile_path ? (
                                                <img src={`https://image.tmdb.org/t/p/w200${person.profile_path}`} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-2xl opacity-20">👤</span>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-[#121212] uppercase truncate">{person.name}</p>
                                            <p className="text-[8px] font-bold text-[#666666] uppercase truncate mt-0.5 italic">{person.job}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Similar Movies */}
                        <section>
                            <h3 className="text-lg font-black text-[#121212] uppercase mb-6 flex items-center gap-3">
                                <span className="w-1.5 h-6 bg-[#F84464] rounded-full"></span>
                                You might also like
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                                {movie.similar?.results.slice(0, 4).map(m => (
                                    <div 
                                        key={m.id} 
                                        onClick={() => onSimilarMovieClick(m.id)}
                                        className="cursor-pointer group poster-hover"
                                    >
                                        <div className="aspect-[2/3] rounded-xl overflow-hidden mb-3 relative border border-black/5 shadow-md bg-[#F5F5FA]">
                                            <img src={`https://image.tmdb.org/t/p/w300${m.poster_path}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            <div className="absolute inset-0 bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                                <button className="px-4 py-2 bg-white/80 text-[#121212] text-[10px] font-black uppercase rounded-lg shadow-xl border border-white">View Details</button>
                                            </div>
                                        </div>
                                        <p className="text-[10px] font-black text-[#121212] uppercase truncate mb-1">{m.title}</p>
                                        <p className="text-[8px] font-bold text-[#F84464] uppercase tracking-widest">{m.release_date?.split('-')[0]}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  )
}

export default MovieDetailsModal
