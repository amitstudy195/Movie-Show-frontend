import { useState, useEffect, useCallback } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import Header from './components/Header'
import TrendingSection from './components/TrendingSection'
import MoviesGrid from './components/MoviesGrid'
import MovieDetailsModal from './components/MovieDetailsModal'
import FilterBar from './components/FilterBar'
import UserProfile from './components/UserProfile'
import AuthModal from './components/AuthModal'
import AdminDashboard from './components/AdminDashboard'
import ResetPassword from './pages/ResetPassword'
import BookingFlow from './components/BookingFlow'
import LocationModal from './components/LocationModal'
import NotificationSystem, { NotificationToast } from './components/NotificationSystem'
import { cinemaService } from './services/cinemaService'
import { authService } from './services/api'

const AdminRoute = ({ children, user, addNotification }) => {
  useEffect(() => {
    if (!user || !user.isAdmin) {
      addNotification({
        title: "Access Denied",
        message: "Administrative credentials required for security protocols.",
        type: "alert"
      });
    }
  }, [user, addNotification]);

  if (!user || !user.isAdmin) {
    return <Navigate to="/" replace />
  }
  return children
}

function App() {
  const navigate = useNavigate()
  const [trendingMovies, setTrendingMovies] = useState([])
  const [movies, setMovies] = useState([])
  const [genres, setGenres] = useState({})
  const [trailerMovieId, setTrailerMovieId] = useState(null)
  const [loading, setLoading] = useState(true)

  // Admin and State
  const [theaters, setTheaters] = useState([])
  const [schedules, setSchedules] = useState([])
  const [isSyncing, setIsSyncing] = useState(false)

  // Auth State
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('movie_user')
    return saved ? JSON.parse(saved) : null
  })
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [bookingMovie, setBookingMovie] = useState(null)
  
  // Engagement State
  const [likedMovies, setLikedMovies] = useState([])
  const [votedMovies, setVotedMovies] = useState([])

  const syncProfile = useCallback(async () => {
    if (localStorage.getItem('movie_user')) {
      try {
        const profile = await authService.getProfile();
        if (profile) {
            setLikedMovies(profile.likedMovies || []);
            setVotedMovies(profile.votedMovies || []);
            
            // Update user storage if name/email changed or etc
            const current = JSON.parse(localStorage.getItem('movie_user')) || {};
            const updated = { ...current, ...profile };
            localStorage.setItem('movie_user', JSON.stringify(updated));
            setUser(updated);
        }
      } catch (err) {
        console.error("Profile sync failed:", err);
      }
    }
  }, []);
  
  const [selectedCity, setSelectedCity] = useState(() => {
    return localStorage.getItem('movie_city') || 'Mumbai'
  })
  const [isLocationOpen, setIsLocationOpen] = useState(false)

  // Auto-detect location on mount
  useEffect(() => {
    const savedCity = localStorage.getItem('movie_city');
    if (!savedCity && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1&accept-language=en`);
          const data = await response.json();
          
          let detectedCity = data.address.city || data.address.town || data.address.suburb || data.address.state_district || data.address.state;
          
          if (detectedCity) {
            // Clean up name: Remove "District", "Jila", etc. to keep it simple
            detectedCity = detectedCity.replace(/ District| Jila| Division| Circle/gi, "").trim();
            
            setSelectedCity(detectedCity);
            localStorage.setItem('movie_city', detectedCity);
            addNotification({
              title: "Location Detected 📍",
              message: `We've detected you're in ${detectedCity}. Updating your cinema list!`,
              type: "info"
            });
          }
        } catch (error) {
          console.error("Auto-location error:", error);
        }
      }, (err) => console.log("Geolocation blocked or failed:", err));
    }
  }, []);

  // Filters and Search State
  const [selectedGenre, setSelectedGenre] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  const [selectedRating, setSelectedRating] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Notification State
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Welcome!", message: "Thanks for choosing Movie Show. Your journey starts here.", time: "1m ago", type: "info" }
  ])
  const [activeToast, setActiveToast] = useState(null)
  const [showNotifications, setShowNotifications] = useState(false)

  const addNotification = useCallback((notif) => {
    const newNotif = { ...notif, id: Date.now(), time: "Just now" }
    setNotifications(prev => [newNotif, ...prev])
    setActiveToast(newNotif)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
        addNotification({
            title: "Movie Reminder",
            message: "Your screening of 'Project Hail Mary' starts in 30 minutes! Don't forget your popcorn.",
            type: "alert",
            action: "View Ticket"
        })
    }, 15000)
    return () => clearTimeout(timer)
  }, [])

  const API_KEY = "ba7a7ab492ae117b59a47ab641ceee73"
  const BASE_URL = "https://api.themoviedb.org/3"

  useEffect(() => {
    const initializeApp = async () => {
      setIsSyncing(true)
      await Promise.all([
        loadGenres(),
        loadTrendingMovies(),
        cinemaService.fetchTheaters(selectedCity).then(setTheaters),
        cinemaService.fetchSchedules().then(setSchedules),
        syncProfile()
      ])
      setIsSyncing(false)
    }
    initializeApp()

    const interval = setInterval(async () => {
        setIsSyncing(true)
        const [t, s] = await Promise.all([
            cinemaService.fetchTheaters(),
            cinemaService.fetchSchedules()
        ])
        setTheaters(t)
        setSchedules(s)
        setIsSyncing(false)
        console.log("Cinema Database Synchronized.")
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const syncCity = async () => {
        setIsSyncing(true);
        const t = await cinemaService.fetchTheaters(selectedCity);
        setTheaters(t);
        setIsSyncing(false);
    };
    syncCity();
  }, [selectedCity]);

  const handleToggleLike = async (movieId) => {
    if (!user) {
        setIsAuthOpen(true);
        addNotification({ title: "Login Required", message: "Sign in to heart your favorites!", type: "info" });
        return;
    }
    try {
        const updatedLikes = await authService.toggleLike(movieId);
        setLikedMovies(updatedLikes);
        
        const isLiked = updatedLikes.includes(movieId.toString());
        addNotification({
            title: isLiked ? "Added to Favorites" : "Removed from Favorites",
            message: isLiked ? "Movie saved to your cinematic vault." : "Movie removed from your vault.",
            type: isLiked ? "success" : "info"
        });
    } catch (err) {
        addNotification({ title: "Action Failed", message: "Network interference detected.", type: "alert" });
    }
  };

  const handleRateMovie = async (movieId, rating) => {
    if (!user) {
        setIsAuthOpen(true);
        return;
    }
    try {
        const updatedVotes = await authService.submitRating(movieId, rating);
        setVotedMovies(updatedVotes);
        addNotification({
            title: "Rating Recorded",
            message: `You gave this movie ${rating} stars.`,
            type: "success"
        });
    } catch (err) {
        addNotification({ title: "Rating Failed", message: "Check your connection.", type: "alert" });
    }
  };

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedGenre, selectedYear, selectedRating, searchQuery])

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadMovies()
    }, 500)

    return () => clearTimeout(delayDebounceFn)
  }, [selectedGenre, selectedYear, selectedRating, searchQuery, currentPage])

  const loadGenres = async () => {
    try {
      const response = await fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}`)
      const data = await response.json()
      const genresMap = data.genres.reduce((acc, genre) => {
        acc[genre.id] = genre.name
        return acc
      }, {})
      setGenres(genresMap)
    } catch (error) {
      console.error("Error loading genres", error)
    }
  }

  const loadTrendingMovies = async () => {
    try {
      const response = await fetch(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}`)
      const data = await response.json()
      setTrendingMovies(data.results.slice(0, 20))
    } catch (error) {
      console.error("Error loading trending movies:", error)
    }
  }

  const loadMovies = async () => {
    setLoading(true)
    try {
      let url = ''
      if (searchQuery.trim() !== '') {
        url = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(searchQuery)}&page=${currentPage}`
      } else {
        url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&page=${currentPage}`
        if (selectedGenre) url += `&with_genres=${selectedGenre}`
        if (selectedYear) url += `&primary_release_year=${selectedYear}`
        if (selectedRating) url += `&vote_average.gte=${selectedRating}`
      }
      const response = await fetch(url)
      const data = await response.json()
      setMovies(data.results || [])
      setTotalPages(Math.min(data.total_pages || 1, 500)) 
    } catch (error) {
      console.error("Error loading movies", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = (userData) => {
    setUser(userData)
    localStorage.setItem('movie_user', JSON.stringify(userData))
    syncProfile()
    addNotification({
        title: "Signed In",
        message: `Welcome back, ${userData.name}!`,
        type: "info"
    })
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('movie_user')
    setIsProfileOpen(false)
    addNotification({
        title: "Signed Out",
        message: "You have been logged out successfully.",
        type: "info"
    })
    navigate('/')
  }

  const handleUpdateUser = (updatedUser) => {
    setUser(updatedUser)
    localStorage.setItem('movie_user', JSON.stringify(updatedUser))
  }

  const openTrailer = (movieId) => setTrailerMovieId(movieId)
  const closeTrailer = () => setTrailerMovieId(null)

  const handleClearAll = () => {
    setSelectedGenre('')
    setSelectedYear('')
    setSelectedRating('')
    setSearchQuery('')
    setCurrentPage(1)
  }

  let gridTitle = "Discover Movies"
  if (searchQuery) {
    gridTitle = `Search Results for "${searchQuery}"`
  } else if (selectedGenre || selectedYear || selectedRating) {
    gridTitle = "Filtered Movies"
  }

  return (
    <Routes>
      <Route path="/reset-password/:resettoken" element={<ResetPassword />} />
      <Route path="/admin" element={
        <AdminRoute user={user} addNotification={addNotification}>
          <AdminDashboard 
            allMovies={movies}
            allTheaters={theaters}
            allSchedules={schedules}
            setAllMovies={setMovies}
            setAllTheaters={setTheaters}
            setAllSchedules={setSchedules}
          />
        </AdminRoute>
      } />
      
      <Route path="/" element={
        <div className="min-h-screen bg-black">
          <Header 
            user={user}
            onShowLogin={() => setIsAuthOpen(true)}
            onShowProfile={() => setIsProfileOpen(true)}
            onLogout={handleLogout}
            onShowAdmin={() => navigate('/admin')}
            onToggleNotifications={() => setShowNotifications(!showNotifications)}
            notificationCount={notifications.length}
            isSyncing={isSyncing}
            currentCity={selectedCity}
            onLocationClick={() => setIsLocationOpen(true)}
          />

          {isLocationOpen && (
            <LocationModal 
                currentCity={selectedCity}
                onSelect={setSelectedCity}
                onClose={() => setIsLocationOpen(false)}
            />
          )}

          {showNotifications && (
            <NotificationSystem 
              notifications={notifications}
              onClose={() => setShowNotifications(false)}
              onClear={() => setNotifications([])}
            />
          )}
          
          {!searchQuery && (
            <TrendingSection
              movies={trendingMovies}
              genres={genres}
              onMovieClick={openTrailer}
              likedMovies={likedMovies}
              onToggleLike={handleToggleLike}
            />
          )}
          
          <FilterBar 
            genres={genres}
            selectedGenre={selectedGenre}
            setSelectedGenre={setSelectedGenre}
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
            selectedRating={selectedRating}
            setSelectedRating={setSelectedRating}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onClearAll={handleClearAll}
          />

          <MoviesGrid
            title={gridTitle}
            movies={movies}
            genres={genres}
            loading={loading}
            onMovieClick={openTrailer}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            likedMovies={likedMovies}
            onToggleLike={handleToggleLike}
          />
          
          <MovieDetailsModal
            movieId={trailerMovieId}
            apiKey={API_KEY}
            baseUrl={BASE_URL}
            user={user}
            onClose={closeTrailer}
            onSimilarMovieClick={openTrailer}
            onBookTickets={(movie) => {
              if (!user) {
                setIsAuthOpen(true);
                addNotification({
                  title: "Login Required",
                  message: "Please sign in to book your cinematic experience.",
                  type: "info"
                });
                return;
              }
              setBookingMovie(movie);
            }}
            allTheaters={theaters}
            allSchedules={schedules}
            addNotification={addNotification}
            likedMovies={likedMovies}
            votedMovies={votedMovies}
            onToggleLike={handleToggleLike}
            onRateMovie={handleRateMovie}
          />

          {bookingMovie && (
            <BookingFlow 
              movie={bookingMovie}
              user={user}
              allTheaters={theaters}
              allSchedules={schedules}
              selectedCity={selectedCity}
              onClose={() => setBookingMovie(null)}
              onBookingSuccess={() => {
                setBookingMovie(null);
                setTrailerMovieId(null);
                addNotification({
                  title: "Seats Reserved!",
                  message: "Check your profile for the E-tickets.",
                  type: "success"
                });
              }}
              addNotification={addNotification}
            />
          )}

          {isProfileOpen && (
            <UserProfile 
                user={user} 
                onUpdateUser={handleUpdateUser}
                onLogout={handleLogout}
                onClose={() => setIsProfileOpen(false)} 
            />
          )}

          {isAuthOpen && (
            <AuthModal 
                isOpen={isAuthOpen}
                onClose={() => setIsAuthOpen(false)}
                onLoginSuccess={handleLogin}
            />
          )}

          {activeToast && (
            <NotificationToast 
                notification={activeToast} 
                onDismiss={() => setActiveToast(null)} 
            />
          )}
        </div>
      } />
      
      {/* Fallback for unknown routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
