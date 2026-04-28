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

  const FALLBACK_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDI4MCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyODAiIGhlaWdodD0iMzAwIiBmaWxsPSIjZWVlIi8+Cjx0ZXh0IHg9IjE0MCIgeT0iMTUwIiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Tm8gSW1hZ2U8L3RleHQ+Cjwvc3ZnPg=='

  return (
    <section className="py-12 px-6 bg-[#F5F5FA]">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#F84464] to-[#FF6B81] rounded-2xl flex items-center justify-center shadow-lg shadow-[#F84464]/20 -rotate-3 transition-transform hover:rotate-0 duration-300">
            <span className="text-lg">🔥</span>
          </div>
          <h2 className="text-2xl font-black text-[#121212] uppercase italic tracking-tighter">
            Trending Now
          </h2>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => scrollCarousel('prev')}
            className="w-11 h-11 bg-white border border-black/5 rounded-2xl flex items-center justify-center text-[#121212] hover:bg-[#121212] hover:text-white transition-all shadow-xl"
          >
            ←
          </button>
          <button
            onClick={() => scrollCarousel('next')}
            className="w-11 h-11 bg-white border border-black/5 rounded-2xl flex items-center justify-center text-[#121212] hover:bg-[#121212] hover:text-white transition-all shadow-xl"
          >
            →
          </button>
        </div>
      </div>

      <div
        ref={carouselRef}
        className="flex gap-8 overflow-x-auto scrollbar-hide pb-10 px-2"
      >
        {movies.slice(0, 20).map((movie, index) => {
          const posterPath = movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : FALLBACK_IMAGE

          const movieGenres = (movie.genre_ids || [])
            .slice(0, 2)
            .map(id => genres[id])
            .filter(Boolean)
            .join(' • ')

          return (
            <div
              key={`${movie.id}-${index}`}
              className="flex-shrink-0 w-52 cursor-pointer poster-hover group"
              onClick={() => onMovieClick(movie.id)}
            >
              <div className="relative mb-4 overflow-hidden rounded-3xl shadow-2xl border border-black/5 bg-white">
                <img
                  src={posterPath}
                  alt={movie.title}
                  className="w-full h-80 object-cover transition-transform duration-700 group-hover:scale-110"
                  onError={(e) => {
                    e.target.src = FALLBACK_IMAGE
                  }}
                />
                {/* Lighter Gradient Overlay for Light Mode */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#ffffff]/40 via-transparent to-transparent opacity-80 group-hover:opacity-40 transition-opacity"></div>
                
                <div className="absolute top-4 left-4 bg-[#F84464] text-white text-[10px] font-black px-3 py-1 rounded-xl shadow-lg border border-white/10 italic z-10">
                  #{index + 1}
                </div>

                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md border border-black/5 rounded-xl px-2.5 py-1 flex items-center gap-1 z-10 shadow-sm">
                   <span className="text-[#121212] text-[10px] font-black">{movie.vote_average.toFixed(1)}</span>
                </div>

                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleLike(movie.id);
                  }}
                  className={`absolute bottom-4 left-4 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 shadow-xl z-10 ${
                    likedMovies.includes(movie.id.toString()) || likedMovies.includes(movie.id)
                      ? 'bg-[#F84464] text-white scale-110 opacity-100' 
                      : 'bg-white/90 text-[#121212] hover:bg-[#F84464] hover:text-white backdrop-blur-md'
                  }`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.5 3c1.263 0 2.426.465 3.317 1.235A5.95 5.95 0 0112 5.25a5.95 5.95 0 011.183-1.015A5.961 5.961 0 0116.5 3c2.786 0 5.25 2.322 5.25 5.25 0 3.924-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                  </svg>
                </button>
              </div>
              <div className="px-1">
                <h3 className="text-[#121212] font-black text-[11px] truncate group-hover:text-[#F84464] transition-colors uppercase tracking-widest leading-none mb-2 italic">{movie.title}</h3>
                <div className="flex items-center gap-3">
                   <span className="text-[#F84464] text-[8px] font-black uppercase tracking-widest">{movieGenres || 'Action'}</span>
                   <span className="text-black/10 text-[8px] font-bold">/</span>
                   <span className="text-[#666666] text-[8px] font-bold">{new Date(movie.release_date).getFullYear()}</span>
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
