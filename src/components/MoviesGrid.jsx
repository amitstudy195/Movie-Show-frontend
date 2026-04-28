import React from 'react'

const MoviesGrid = ({ 
  title,
  movies, 
  genres, 
  loading, 
  onMovieClick,
  currentPage,
  totalPages,
  onPageChange,
  likedMovies = [],
  onToggleLike
}) => {
  const FALLBACK_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDI4MCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyODAiIGhlaWdodD0iMzAwIiBmaWxsPSIjZWVlIi8+Cjx0ZXh0IHg9IjE0MCIgeT0iMTUwIiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Tm8gSW1hZ2U8L3RleHQ+Cjwvc3ZnPg=='

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-32 bg-[#F5F5FA]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-[#F84464]/10 border-t-[#F84464] rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-[#F84464]/5 border-t-[#F84464] rounded-full animate-spin animation-delay-300"></div>
        </div>
        <div className="mt-6 text-[#121212] text-xs font-black uppercase tracking-[0.4em] italic opacity-50 animate-pulse">
            Projecting Greatness...
        </div>
      </div>
    )
  }

  if (movies.length === 0) {
    return (
      <div className="text-center py-24 bg-[#F5F5FA]">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl border border-black/5">
          <span className="text-4xl opacity-50">🔍</span>
        </div>
        <h2 className="text-2xl font-black text-[#121212] uppercase italic tracking-tighter mb-4">
          Identity Not Found
        </h2>
        <p className="text-[#666666] text-[10px] font-bold uppercase tracking-widest">Adjust your cinematic criteria</p>
      </div>
    )
  }

  return (
    <section className="py-20 px-6 bg-[#F5F5FA]">
      <div className="flex items-center gap-3 mb-12">
        <div className="w-10 h-10 bg-gradient-to-br from-[#F84464] to-[#FF6B81] rounded-2xl flex items-center justify-center shadow-lg shadow-[#F84464]/20 rotate-3">
          <span className="text-lg">🎬</span>
        </div>
        <div>
            <h2 className="text-2xl font-black text-[#121212] uppercase italic tracking-tighter leading-none">
                {title}
            </h2>
            <div className="w-12 h-1 bg-[#F84464] mt-2 rounded-full shadow-[0_0_10px_rgba(248,68,100,0.3)]"></div>
        </div>
      </div>

      <div className="grid grid-cols-4 md:grid-cols-2 lg:grid-cols-5 xl:grid-cols-4 gap-10">
        {movies.map((movie, index) => {
          const posterPath = movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : FALLBACK_IMAGE

          const movieGenres = movie.genre_ids
            .slice(0, 2)
            .map(id => genres[id])
            .filter(Boolean)
            .join(' • ')

          return (
            <div
              key={movie.id}
              className="bg-white rounded-3xl overflow-hidden poster-hover group border border-black/5 shadow-xl hover:shadow-2xl transition-all duration-500"
              onClick={() => onMovieClick(movie.id)}
            >
              <div className="relative overflow-hidden aspect-[2/3]">
                <img
                  src={posterPath}
                  alt={movie.title}
                  className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110"
                  onError={(e) => {
                    e.target.src = FALLBACK_IMAGE
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity"></div>
                
                <div className="absolute top-4 right-4 flex flex-col gap-3">
                   <div className="bg-white/90 backdrop-blur-md border border-black/5 rounded-xl px-2.5 py-1.5 flex items-center gap-2 shadow-lg">
                      <span className="text-[#F84464] text-[10px]">★</span>
                      <span className="text-[#121212] text-[10px] font-black">{movie.vote_average.toFixed(1)}</span>
                   </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleLike(movie.id);
                    }}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 shadow-xl ${
                      likedMovies.includes(movie.id.toString()) || likedMovies.includes(movie.id)
                        ? 'bg-[#F84464] text-white scale-110' 
                        : 'bg-white/90 text-[#121212] hover:bg-[#F84464] hover:text-white backdrop-blur-md border border-black/5'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.5 3c1.263 0 2.426.465 3.317 1.235A5.95 5.95 0 0112 5.25a5.95 5.95 0 011.183-1.015A5.961 5.961 0 0116.5 3c2.786 0 5.25 2.322 5.25 5.25 0 3.924-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                    </svg>
                  </button>
                </div>

                <div className="absolute bottom-5 left-5 right-5 z-10 transition-transform group-hover:-translate-y-1">
                    <p className="text-white text-[11px] font-black uppercase tracking-widest truncate mb-1 italic leading-none">{movie.title}</p>
                    <p className="text-[8px] font-bold text-[#F84464] uppercase tracking-[0.2em]">{movieGenres}</p>
                </div>
              </div>
              
              <div className="p-6 border-t border-black/5">
                <div className="w-full bg-black/5 rounded-full h-1 mb-5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#F84464] to-[#FF6B81] h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(248,68,100,0.4)]"
                    style={{ width: `${(movie.vote_average / 10) * 100}%` }}
                  ></div>
                </div>
                <p className="text-[#666666] text-[10px] font-bold line-clamp-2 leading-relaxed uppercase tracking-wider italic mb-2">{movie.overview || 'No synopsis broadcasted for this cinematic asset.'}</p>
              </div>
            </div>
          )
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-10 mt-24">
          <button
            onClick={() => {
              onPageChange(currentPage - 1)
              window.scrollTo({ top: 500, behavior: 'smooth' })
            }}
            disabled={currentPage === 1}
            className="w-13 h-13 border border-black/5 bg-white rounded-2xl flex items-center justify-center text-[#121212] disabled:opacity-20 transition-all hover:bg-[#121212] hover:text-white shadow-xl"
          >
            ←
          </button>
          
          <div className="flex flex-col items-center">
             <span className="text-[9px] font-black text-black/20 uppercase tracking-[0.5em] mb-1.5">CINEMATIC PAGE</span>
             <span className="text-2xl font-black text-[#121212] italic">{currentPage} <span className="text-black/10 font-light mx-2">/</span> {totalPages}</span>
          </div>
          
          <button
            onClick={() => {
              onPageChange(currentPage + 1)
              window.scrollTo({ top: 500, behavior: 'smooth' })
            }}
            disabled={currentPage === totalPages}
            className="w-13 h-13 border border-black/5 bg-white rounded-2xl flex items-center justify-center text-[#121212] disabled:opacity-20 transition-all hover:bg-[#121212] hover:text-white shadow-xl"
          >
            →
          </button>
        </div>
      )}
    </section>
  )
}

export default MoviesGrid
