import React, { useState } from 'react';
import { FilterState } from '../../types/content';
import { Filter, RotateCcw, Search, ChevronDown, ChevronUp, SlidersHorizontal } from 'lucide-react';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  onReset: () => void;
  availableGenres: string[];
  availableRatings: string[];
  availableCountries: string[];
  availablePlatforms: string[];
  totalFilteredCount: number;
  totalCatalogCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onReset,
  availableGenres,
  availableRatings,
  availableCountries,
  availablePlatforms,
  totalFilteredCount,
  totalCatalogCount,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const activeFilterCount =
    (filters.type !== 'All' ? 1 : 0) +
    (filters.genre !== 'All' ? 1 : 0) +
    (filters.rating !== 'All' ? 1 : 0) +
    (filters.country !== 'All' ? 1 : 0) +
    (filters.platform !== 'All' ? 1 : 0) +
    (filters.yearRange[0] !== 1985 || filters.yearRange[1] !== 2024 ? 1 : 0) +
    (filters.search.trim() !== '' ? 1 : 0);

  const handleTypeChange = (type: FilterState['type']) => {
    onFilterChange({ ...filters, type });
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg backdrop-blur-md">
      {/* Primary Row: Search & Quick Type Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative min-w-[240px] flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, director, or cast..."
            value={filters.search}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange({ ...filters, search: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              ×
            </button>
          )}
        </div>

        {/* Content Type Quick Toggle */}
        <div className="flex items-center rounded-lg border border-slate-800 bg-slate-950 p-1">
          {(['All', 'Movie', 'TV Show'] as const).map((t) => (
            <button
              key={t}
              onClick={() => handleTypeChange(t)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                filters.type === t
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              {t === 'All' ? 'All Types' : t === 'Movie' ? 'Movies' : 'TV Shows'}
            </button>
          ))}
        </div>

        {/* Filter Toggle Button & Reset */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors cursor-pointer ${
              activeFilterCount > 0 || isExpanded
                ? 'border-indigo-500/50 bg-indigo-500/10 text-indigo-300'
                : 'border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-900'
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
                {activeFilterCount}
              </span>
            )}
            {isExpanded ? (
              <ChevronUp className="h-3.5 w-3.5 ml-0.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 ml-0.5" />
            )}
          </button>

          {activeFilterCount > 0 && (
            <button
              onClick={onReset}
              title="Reset all filters to default"
              className="inline-flex items-center gap-1 rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-2 text-xs font-medium text-rose-300 hover:bg-rose-500/20 transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}

          {/* Records Counter */}
          <div className="hidden lg:flex items-center rounded-lg bg-slate-950/80 px-3 py-2 text-xs border border-slate-800/80 font-mono">
            <span className="text-slate-400 mr-1.5">Cohort:</span>
            <span className="font-bold text-indigo-400">
              {totalFilteredCount.toLocaleString()}
            </span>
            <span className="text-slate-500 mx-1">/</span>
            <span className="text-slate-400">{totalCatalogCount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Expanded Dimensional Filter Controls */}
      {isExpanded && (
        <div className="mt-4 grid grid-cols-1 gap-3 border-t border-slate-800 pt-4 sm:grid-cols-2 lg:grid-cols-5">
          {/* Genre Filter */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Genre
            </label>
            <select
              value={filters.genre}
              onChange={(e) => onFilterChange({ ...filters, genre: e.target.value })}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
            >
              <option value="All">All Genres</option>
              {availableGenres.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Rating / Maturity Filter */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Maturity Rating
            </label>
            <select
              value={filters.rating}
              onChange={(e) => onFilterChange({ ...filters, rating: e.target.value })}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
            >
              <option value="All">All Ratings</option>
              {availableRatings.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Country Filter */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Country of Origin
            </label>
            <select
              value={filters.country}
              onChange={(e) => onFilterChange({ ...filters, country: e.target.value })}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
            >
              <option value="All">All Countries</option>
              {availableCountries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Platform Filter */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Platform Distribution
            </label>
            <select
              value={filters.platform}
              onChange={(e) => onFilterChange({ ...filters, platform: e.target.value })}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
            >
              <option value="All">All Platforms</option>
              {availablePlatforms.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Year Range Filter */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Release Year: {filters.yearRange[0]} – {filters.yearRange[1]}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="1985"
                max="2024"
                value={filters.yearRange[0]}
                onChange={(e) =>
                  onFilterChange({
                    ...filters,
                    yearRange: [Math.min(Number(e.target.value), filters.yearRange[1] - 1), filters.yearRange[1]],
                  })
                }
                className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <button
                onClick={() => onFilterChange({ ...filters, yearRange: [1985, 2024] })}
                className="text-[10px] text-slate-400 hover:text-white underline whitespace-nowrap"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
