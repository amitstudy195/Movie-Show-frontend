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
  const FALLBACK_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDI4MCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyODAiIGhlaWdodD0iMzAwIiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjE0MCIgeT0iMTUwIiBmaWxsPSIjNjY2IiB0ZXh0LWFuY2hvcj0ibwlkZGxlIiBkeT0iLjNlbSI+Tm8gSW1hZ2U8L3RleHQ+Cjwvc3ZnPg=='

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin animation-delay-300"></div>
        </div>
        <div className="ml-4 text-white text-xl font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Loading amazing movies...
        </div>
      </div>
    )
  }

  if (movies.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-24 h-24 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <span className="text-4xl">🔍</span>
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-400 to-gray-600 bg-clip-text text-transparent mb-4">
          No movies found
        </h2>
        <p className="text-gray-500 text-lg">Try adjusting your search criteria</p>
      </div>
    )
  }

  return (
    <section className="py-8 px-6 bg-gradient-to-b from-black to-gray-900">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
          <span className="text-lg">🎦</span>
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          {title}
        </h2>
      </div>

      {/* Restored the original 4-column grid layout from the reference website */}
      <div className="grid grid-cols-4 md:grid-cols-2 lg:grid-cols-5 xl:grid-cols-4 gap-6">
        {movies.map((movie) => {
          const posterPath = movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : FALLBACK_IMAGE

          const movieGenres = movie.genre_ids
            .slice(0, 2)
            .map(id => genres[id])
            .filter(Boolean)
            .join(', ')

          return (
            <div
              key={movie.id}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden cursor-pointer transform transition-all duration-500 hover:scale-105 hover:-translate-y-3 group shadow-xl shadow-purple-500/10 hover:shadow-2xl hover:shadow-purple-500/30 border border-gray-700 hover:border-purple-500/50"
              onClick={() => onMovieClick(movie.id)}
            >
              <div className="relative overflow-hidden">
                {/* Restored the original tall h-64 poster design */}
                <img
                  src={posterPath}
                  alt={movie.title}
                  className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-110"
                  onError={(e) => {
                    e.target.src = FALLBACK_IMAGE
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-sm font-bold px-3 py-1 rounded-full shadow-lg text-center">
                    ⭐ {movie.vote_average.toFixed(1)}
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleLike(movie.id);
                    }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl ${
                      likedMovies.includes(movie.id.toString()) || likedMovies.includes(movie.id)
                        ? 'bg-red-500 text-white scale-110' 
                        : 'bg-black/60 text-white hover:bg-white hover:text-red-500'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.5 3c1.263 0 2.426.465 3.317 1.235A5.95 5.95 0 0112 5.25a5.95 5.95 0 011.183-1.015A5.961 5.961 0 0116.5 3c2.786 0 5.25 2.322 5.25 5.25 0 3.924-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                    </svg>
                  </button>
                </div>
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-white text-xs line-clamp-2">{movie.overview}</p>
                  </div>
                </div>
              </div>
              
              {/* Restored the rich card footer with the progress bar and summary */}
              <div className="p-5">
                <h3 className="text-white font-bold text-lg mb-3 line-clamp-2 group-hover:text-cyan-400 transition-colors duration-300">{movie.title}</h3>
                <div className="flex items-center justify-between text-sm mb-3">
                  <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full font-semibold shadow-md">
                    {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
                  </span>
                  <span className="bg-gradient-to-r from-green-500 to-teal-600 text-white px-3 py-1 rounded-full font-semibold shadow-md">
                    {movieGenres}
                  </span>
                </div>
                
                {/* Rating Progress Bar */}
                <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
                  <div
                    className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(movie.vote_average / 10) * 100}%` }}
                  ></div>
                </div>
                
                {/* Overview Summary */}
                <p className="text-gray-300 text-sm line-clamp-3 leading-relaxed">{movie.overview}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Pagination Controls kept exactly as we added them */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-6 mt-12 mb-4">
          <button
            onClick={() => {
              onPageChange(currentPage - 1)
              window.scrollTo({ top: 500, behavior: 'smooth' })
            }}
            disabled={currentPage === 1}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-500 hover:to-blue-500 transition-all shadow-lg"
          >
            ← Previous
          </button>
          
          <span className="text-gray-300 font-medium">
            Page <span className="text-white font-bold">{currentPage}</span> of {totalPages}
          </span>
          
          <button
            onClick={() => {
              onPageChange(currentPage + 1)
              window.scrollTo({ top: 500, behavior: 'smooth' })
            }}
            disabled={currentPage === totalPages}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-500 hover:to-cyan-500 transition-all shadow-lg"
          >
            Next →
          </button>
        </div>
      )}
    </section>
  )
}

export default MoviesGrid
