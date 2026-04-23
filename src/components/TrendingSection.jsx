import React, { useRef } from 'react'

const TrendingSection = ({ movies = [], genres = {}, onMovieClick, likedMovies = [], onToggleLike }) => {
  const carouselRef = useRef(null)

  if (!Array.isArray(movies) || movies.length === 0) return null;

  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = 300
      if (direction === 'prev') {
        carouselRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
      } else {
        carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
      }
    }
  }

  const FALLBACK_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDI4MCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyODAiIGhlaWdodD0iMzAwIiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjE0MCIgeT0iMTUwIiBmaWxsPSIjNjY2IiB0ZXh0LWFuY2hvcj0ibwlkZGxlIiBkeT0iLjNlbSI+Tm8gSW1hZ2U8L3RleHQ+Cjwvc3ZnPg=='

  return (
    <section className="py-8 px-6 bg-gradient-to-b from-gray-900 to-black">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/20">
            <span className="text-lg">🔥</span>
          </div>
          <h2 className="text-3xl font-black bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent italic tracking-tighter">
            Trending Now
          </h2>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => scrollCarousel('prev')}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 p-3 rounded-full text-white transition-all duration-300 transform hover:scale-110 shadow-lg shadow-blue-500/25 border border-blue-400/30"
          >
            ◀️
          </button>
          <button
            onClick={() => scrollCarousel('next')}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 p-3 rounded-full text-white transition-all duration-300 transform hover:scale-110 shadow-lg shadow-blue-500/25 border border-blue-400/30"
          >
            ▶️
          </button>
        </div>
      </div>

      <div
        ref={carouselRef}
        className="flex gap-6 overflow-x-auto scrollbar-hide pb-6"
      >
        {movies.slice(0, 20).map((movie, index) => {
          const posterPath = movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : FALLBACK_IMAGE

          const movieGenres = (movie.genre_ids || [])
            .slice(0, 2)
            .map(id => genres[id])
            .filter(Boolean)
            .join(', ')

          return (
            <div
              key={movie.id}
              className="flex-shrink-0 w-48 cursor-pointer transform transition-all duration-500 hover:scale-[1.05] hover:-translate-y-2 group"
              onClick={() => onMovieClick(movie.id)}
            >
              <div className="relative mb-3 overflow-hidden rounded-2xl shadow-2xl border border-white/5 transition-all duration-300">
                <img
                  src={posterPath}
                  alt={movie.title}
                  className="w-full h-72 object-cover transition-transform duration-700 group-hover:scale-110"
                  onError={(e) => {
                    e.target.src = FALLBACK_IMAGE
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
                <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-[10px] font-black px-3 py-1 rounded-full shadow-lg border-2 border-yellow-300">
                  #{index + 1}
                </div>
                <div className="absolute top-3 right-3 bg-gradient-to-r from-green-400 to-blue-500 text-white text-[9px] font-black px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                   {movie.vote_average.toFixed(1)}
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleLike(movie.id);
                  }}
                  className={`absolute bottom-3 left-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl opacity-0 group-hover:opacity-100 ${
                    likedMovies.includes(movie.id.toString()) || likedMovies.includes(movie.id)
                      ? 'bg-red-500 text-white scale-110 opacity-100' 
                      : 'bg-black/60 text-white hover:bg-white hover:text-red-500'
                  }`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.5 3c1.263 0 2.426.465 3.317 1.235A5.95 5.95 0 0112 5.25a5.95 5.95 0 011.183-1.015A5.961 5.961 0 0116.5 3c2.786 0 5.25 2.322 5.25 5.25 0 3.924-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                  </svg>
                </button>
              </div>
              <div className="px-1 space-y-1">
                <h3 className="text-white font-bold text-sm truncate group-hover:text-yellow-400 transition-colors uppercase tracking-tight italic">{movie.title}</h3>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-gray-500 font-bold">{new Date(movie.release_date).getFullYear()}</span>
                  <span className="text-cyan-500/80 font-black tracking-widest uppercase">{movieGenres || 'Action'}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default TrendingSection
