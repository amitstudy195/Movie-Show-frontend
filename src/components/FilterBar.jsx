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
    <div className="sticky top-[89px] z-40 px-4 sm:px-12 py-3 bg-black/60 backdrop-blur-3xl border-b border-white/5 shadow-2xl">
      <div className="max-w-7xl mx-auto flex flex-col xl:flex-row gap-6 items-center justify-between">
        
        {/* Search Bar: Premium Design */}
        <div className="w-full xl:w-[450px] relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl opacity-20 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 blur"></div>
          <div className="relative flex items-center bg-black rounded-2xl border border-white/10 group-hover:border-white/20 transition-all overflow-hidden shadow-2xl">
            <span className="pl-5 text-xl">🔍</span>
            <input
              type="text"
              placeholder="Search cinematic universe..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-white text-sm font-bold placeholder-gray-500 h-10 pl-4 pr-6 outline-none"
            />
          </div>
        </div>

        {/* Filters: Streamlined & Minimalist */}
        <div className="flex flex-wrap items-center justify-center xl:justify-end gap-3 w-full xl:w-auto">
          <div className="flex bg-white/5 p-1 rounded-[1.5rem] border border-white/5 shadow-inner">
            <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                disabled={!!searchQuery}
                className="bg-transparent text-[10px] font-black uppercase tracking-widest text-white/70 px-4 py-2 hover:text-white outline-none cursor-pointer disabled:opacity-30 appearance-none"
            >
                <option value="" className="bg-zinc-900">All Genres</option>
                {Object.entries(genres).map(([id, name]) => (
                    <option key={id} value={id} className="bg-zinc-900">{name}</option>
                ))}
            </select>
            
            <div className="w-[1px] bg-white/10 my-2 mx-1"></div>

            <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                disabled={!!searchQuery}
                className="bg-transparent text-[11px] font-black uppercase tracking-widest text-white/70 px-4 py-2 hover:text-white outline-none cursor-pointer disabled:opacity-30 appearance-none"
            >
                <option value="" className="bg-zinc-900">All Years</option>
                {years.map(year => (
                    <option key={year} value={year} className="bg-zinc-900">{year}</option>
                ))}
            </select>

            <div className="w-[1px] bg-white/10 my-2 mx-1"></div>

            <select
                value={selectedRating}
                onChange={(e) => setSelectedRating(e.target.value)}
                disabled={!!searchQuery}
                className="bg-transparent text-[11px] font-black uppercase tracking-widest text-white/70 px-4 py-2 hover:text-white outline-none cursor-pointer disabled:opacity-30 appearance-none"
            >
                <option value="" className="bg-zinc-900">Rating</option>
                <option value="8" className="bg-zinc-900">8+ ⭐</option>
                <option value="7" className="bg-zinc-900">7+ ⭐</option>
                <option value="6" className="bg-zinc-900">6+ ⭐</option>
            </select>
          </div>

          <button
            onClick={onClearAll}
            disabled={!hasActiveFilters}
            className="flex items-center gap-2 bg-white text-black hover:bg-red-500 hover:text-white px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 shadow-xl disabled:opacity-20 disabled:grayscale"
          >
            Clear <span>✖</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default FilterBar
