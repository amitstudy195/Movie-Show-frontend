import React from 'react'

const FilterBar = ({
  genres,
  selectedGenre,
  setSelectedGenre,
  selectedYear,
  setSelectedYear,
  selectedRating,
  setSelectedRating,
  searchQuery,
  setSearchQuery,
  onClearAll
}) => {
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: currentYear - 1980 + 1 }, (_, i) => currentYear - i)

  // Check if any filter or search is active to enable/disable the button
  const hasActiveFilters = !!(searchQuery || selectedGenre || selectedYear || selectedRating)

  return (
    <div className="sticky top-[86px] z-40 px-4 sm:px-12 py-4 bg-white/80 backdrop-blur-3xl border-b border-black/5 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col xl:flex-row gap-6 items-center justify-between">
        
        {/* Search Bar: Hero Design */}
        <div className="w-full xl:w-[450px] relative group px-2">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#F84464] to-[#FF6B81] rounded-2xl opacity-0 group-hover:opacity-10 transition duration-500 blur-lg"></div>
          <div className="relative flex items-center bg-[#F5F5FA] rounded-2xl border border-black/5 focus-within:border-[#F84464]/30 hover:border-black/10 transition-all overflow-hidden shadow-inner">
            <span className="pl-5 text-lg opacity-40">🔍</span>
            <input
              type="text"
              placeholder="SEARCH MOVIES, EXPERIENCES, CINEMAS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-[#121212] text-[10px] font-black tracking-widest placeholder-[#666666]/40 h-14 pl-4 pr-6 outline-none"
            />
          </div>
        </div>

        {/* Filters: Hero Minimalist */}
        <div className="flex flex-wrap items-center justify-center xl:justify-end gap-4 w-full xl:w-auto">
          <div className="flex bg-[#F5F5FA] p-1.5 rounded-2xl border border-black/5 shadow-sm">
            <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                disabled={!!searchQuery}
                className="bg-transparent text-[10px] font-black uppercase tracking-widest text-[#666666] px-4 py-2 hover:text-[#121212] outline-none cursor-pointer disabled:opacity-30 appearance-none transition-colors"
            >
                <option value="">ALL GENRES</option>
                {Object.entries(genres).map(([id, name]) => (
                    <option key={id} value={id}>{name.toUpperCase()}</option>
                ))}
            </select>
            
            <div className="w-[1px] bg-black/5 my-2 mx-1"></div>

            <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                disabled={!!searchQuery}
                className="bg-transparent text-[10px] font-black uppercase tracking-widest text-[#666666] px-4 py-2 hover:text-[#121212] outline-none cursor-pointer disabled:opacity-30 appearance-none transition-colors"
            >
                <option value="">RELEASE YEAR</option>
                {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                ))}
            </select>

            <div className="w-[1px] bg-black/5 my-2 mx-1"></div>

            <select
                value={selectedRating}
                onChange={(e) => setSelectedRating(e.target.value)}
                disabled={!!searchQuery}
                className="bg-transparent text-[10px] font-black uppercase tracking-widest text-[#666666] px-4 py-2 hover:text-[#121212] outline-none cursor-pointer disabled:opacity-30 appearance-none transition-colors"
            >
                <option value="">RATINGS</option>
                <option value="8">8.0+ RATING</option>
                <option value="7">7.0+ RATING</option>
                <option value="6">6.0+ RATING</option>
            </select>
          </div>

          <button
            onClick={onClearAll}
            disabled={!hasActiveFilters}
            className="flex items-center gap-3 bg-black/5 hover:bg-[#F84464] text-[#666666] hover:text-white px-8 py-4 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] transition-all border border-black/5 disabled:opacity-20 active:scale-95 shadow-sm"
          >
            Reset <span>✖</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default FilterBar
