import React, { useState, useMemo } from 'react';
import { ContentRecord } from '../types/content';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { exportToCSV } from '../utils/csvExport';
import { formatNumber } from '../utils/formatters';
import {
  Search,
  Download,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Star,
  Eye,
  Check,
  LayoutGrid,
  Table as TableIcon,
  Film,
} from 'lucide-react';

interface ContentExplorerProps {
  records: ContentRecord[];
  onResetFilters: () => void;
  onSelectTitle: (record: ContentRecord) => void;
}

type SortColumn =
  | 'title'
  | 'type'
  | 'release_year'
  | 'director'
  | 'country'
  | 'rating'
  | 'duration_num'
  | 'viewer_rating'
  | 'votes'
  | 'popularity_score';

export const ContentExplorer: React.FC<ContentExplorerProps> = ({
  records,
  onResetFilters,
  onSelectTitle,
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [localSearch, setLocalSearch] = useState('');
  const [sortCol, setSortCol] = useState<SortColumn>('viewer_rating');
  const [sortAsc, setSortAsc] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [showColMenu, setShowColMenu] = useState(false);
  const [liveOnlyFilter, setLiveOnlyFilter] = useState(false);

  // Column visibility toggles
  const [visibleCols, setVisibleCols] = useState({
    type: true,
    release_year: true,
    director: true,
    country: true,
    genre: true,
    rating: true,
    duration: true,
    viewer_rating: true,
    votes: true,
    popularity: true,
  });

  // Count live drops
  const liveDropCount = useMemo(() => {
    return records.filter((r) => r.isLiveDrop).length;
  }, [records]);

  // Client-side table search & sort
  const filteredRows = useMemo(() => {
    let base = records;
    if (liveOnlyFilter) {
      base = base.filter((r) => r.isLiveDrop);
    }
    if (!localSearch.trim()) return base;
    const q = localSearch.toLowerCase();
    return base.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.director.toLowerCase().includes(q) ||
        r.cast.toLowerCase().includes(q) ||
        r.country.toLowerCase().includes(q) ||
        r.genres.some((g) => g.toLowerCase().includes(q))
    );
  }, [records, localSearch, liveOnlyFilter]);

  const sortedRows = useMemo(() => {
    return [...filteredRows].sort((a, b) => {
      let vA: any = a[sortCol];
      let vB: any = b[sortCol];
      if (typeof vA === 'string') {
        return sortAsc ? vA.localeCompare(vB) : vB.localeCompare(vA);
      }
      return sortAsc ? vA - vB : vB - vA;
    });
  }, [filteredRows, sortCol, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const paginatedRows = sortedRows.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (col: SortColumn) => {
    if (sortCol === col) {
      setSortAsc(!sortAsc);
    } else {
      setSortCol(col);
      setSortAsc(false);
    }
  };

  if (records.length === 0) {
    return <EmptyState onReset={onResetFilters} />;
  }

  return (
    <div className="space-y-4">
      {/* Table Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg backdrop-blur-sm">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Table Search */}
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, director, cast, country..."
              value={localSearch}
              onChange={(e) => {
                setLocalSearch(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 py-1.5 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
            {localSearch && (
              <button
                onClick={() => setLocalSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                ×
              </button>
            )}
          </div>

          <div className="text-xs text-slate-400 font-mono">
            Showing <span className="font-bold text-white">{sortedRows.length.toLocaleString()}</span> matching records
          </div>
        </div>

        {/* Column selection & Export Actions */}
        <div className="flex items-center gap-2">
          {/* View Mode Switcher (Table vs Poster Cards Grid) */}
          <div className="flex items-center rounded-lg border border-slate-800 bg-slate-950 p-0.5">
            <button
              onClick={() => setViewMode('table')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Tabular Data Grid View"
            >
              <TableIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Table</span>
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Visual Poster Grid View"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Poster Grid</span>
            </button>
          </div>

          {/* Live Drops Filter Toggle */}
          <button
            onClick={() => {
              setLiveOnlyFilter(!liveOnlyFilter);
              setPage(1);
            }}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors cursor-pointer ${
              liveOnlyFilter
                ? 'border-emerald-500 bg-emerald-950/80 text-emerald-300 font-bold shadow-sm'
                : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <span className="relative flex h-2 w-2">
              {liveOnlyFilter && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${liveOnlyFilter ? 'bg-emerald-400' : 'bg-slate-600'}`}></span>
            </span>
            <span>Live Drops Only</span>
            <span className="rounded-full bg-slate-800 px-1.5 py-0.2 text-[10px] font-mono text-slate-300">
              {liveDropCount}
            </span>
          </button>

          {/* Column Visibility Dropdown (only relevant in table view) */}
          {viewMode === 'table' && (
            <div className="relative">
              <button
                onClick={() => setShowColMenu(!showColMenu)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-900 cursor-pointer"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Columns</span>
              </button>
              {showColMenu && (
                <div className="absolute right-0 mt-2 z-20 w-48 rounded-xl border border-slate-800 bg-slate-900 p-2 shadow-2xl space-y-1">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Toggle Columns
                  </div>
                  {Object.entries(visibleCols).map(([colKey, isVisible]) => (
                    <button
                      key={colKey}
                      onClick={() =>
                        setVisibleCols((prev) => ({
                          ...prev,
                          [colKey]: !prev[colKey as keyof typeof visibleCols],
                        }))
                      }
                      className="flex w-full items-center justify-between rounded-md px-2 py-1 text-xs text-slate-300 hover:bg-slate-800 cursor-pointer"
                    >
                      <span className="capitalize">{colKey.replace('_', ' ')}</span>
                      {isVisible && <Check className="h-3.5 w-3.5 text-indigo-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Export CSV button */}
          <button
            onClick={() => exportToCSV(sortedRows)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/20 cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Main Content: Poster Cards Grid vs Tabular Data Table */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {paginatedRows.map((r) => (
            <div
              key={r.show_id}
              onClick={() => onSelectTitle(r)}
              className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-900/80 shadow-lg hover:border-indigo-500/60 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-950">
                {r.poster_url ? (
                  <img
                    src={r.poster_url}
                    alt={r.title}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-900 to-indigo-950/40 text-slate-600">
                    <Film className="h-10 w-10 text-slate-600" />
                  </div>
                )}

                {/* Top badges on poster */}
                <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-1 pointer-events-none">
                  {r.isLiveDrop ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/60 bg-emerald-950/90 px-2 py-0.5 text-[9px] font-extrabold text-emerald-300 backdrop-blur-sm shadow">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      LIVE
                    </span>
                  ) : (
                    <span className="rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold text-slate-300 backdrop-blur-sm">
                      {r.type}
                    </span>
                  )}
                  <span className="rounded bg-black/75 px-1.5 py-0.5 text-[10px] font-bold text-amber-400 backdrop-blur-sm flex items-center gap-0.5 shadow">
                    ⭐ {r.viewer_rating.toFixed(1)}
                  </span>
                </div>

                {/* Bottom platform and year banner */}
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] font-mono pointer-events-none">
                  <span className="rounded bg-slate-950/85 border border-slate-700/80 px-1.5 py-0.5 text-indigo-300 font-semibold backdrop-blur-sm truncate max-w-[110px]">
                    {r.platform}
                  </span>
                  <span className="rounded bg-slate-950/85 px-1.5 py-0.5 text-slate-300 backdrop-blur-sm">
                    {r.release_year}
                  </span>
                </div>
              </div>

              <div className="flex flex-1 flex-col p-3">
                <h4 className="font-semibold text-white text-xs line-clamp-1 group-hover:text-indigo-400 transition-colors">
                  {r.title}
                </h4>
                <p className="mt-0.5 text-[11px] text-slate-400 line-clamp-1">
                  {r.genres.slice(0, 2).join(', ')}
                </p>
                <div className="mt-auto pt-2 flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-800/80">
                  <span>{r.duration}</span>
                  <span className="text-indigo-400 group-hover:underline">Inspect →</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Main Data Table */
        <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 shadow-xl backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-slate-800 bg-slate-950/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th
                  onClick={() => handleSort('title')}
                  className="py-3 px-4 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    Title <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                {visibleCols.type && (
                  <th
                    onClick={() => handleSort('type')}
                    className="py-3 px-3 cursor-pointer hover:text-white"
                  >
                    <div className="flex items-center gap-1">
                      Type <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                )}
                {visibleCols.release_year && (
                  <th
                    onClick={() => handleSort('release_year')}
                    className="py-3 px-3 cursor-pointer hover:text-white"
                  >
                    <div className="flex items-center gap-1">
                      Year <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                )}
                {visibleCols.director && (
                  <th
                    onClick={() => handleSort('director')}
                    className="py-3 px-3 cursor-pointer hover:text-white"
                  >
                    <div className="flex items-center gap-1">
                      Director <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                )}
                {visibleCols.country && (
                  <th
                    onClick={() => handleSort('country')}
                    className="py-3 px-3 cursor-pointer hover:text-white"
                  >
                    <div className="flex items-center gap-1">
                      Country <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                )}
                {visibleCols.genre && <th className="py-3 px-3">Genres</th>}
                {visibleCols.rating && (
                  <th
                    onClick={() => handleSort('rating')}
                    className="py-3 px-3 cursor-pointer hover:text-white"
                  >
                    <div className="flex items-center gap-1">
                      Rating <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                )}
                {visibleCols.duration && (
                  <th
                    onClick={() => handleSort('duration_num')}
                    className="py-3 px-3 cursor-pointer hover:text-white"
                  >
                    <div className="flex items-center gap-1">
                      Duration <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                )}
                {visibleCols.viewer_rating && (
                  <th
                    onClick={() => handleSort('viewer_rating')}
                    className="py-3 px-3 cursor-pointer hover:text-white"
                  >
                    <div className="flex items-center gap-1">
                      Score <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                )}
                {visibleCols.votes && (
                  <th
                    onClick={() => handleSort('votes')}
                    className="py-3 px-3 cursor-pointer hover:text-white"
                  >
                    <div className="flex items-center gap-1">
                      Votes <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                )}
                {visibleCols.popularity && (
                  <th
                    onClick={() => handleSort('popularity_score')}
                    className="py-3 px-3 cursor-pointer hover:text-white"
                  >
                    <div className="flex items-center gap-1">
                      Popularity <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                )}
                <th className="py-3 px-3 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {paginatedRows.map((r) => (
                <tr
                  key={r.show_id}
                  onClick={() => onSelectTitle(r)}
                  className="hover:bg-slate-800/50 transition-colors cursor-pointer group"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {r.poster_url ? (
                        <img
                          src={r.poster_url}
                          alt={r.title}
                          referrerPolicy="no-referrer"
                          className="h-10 w-7 rounded object-cover shadow border border-slate-700 shrink-0"
                          loading="lazy"
                        />
                      ) : (
                        <div className="h-10 w-7 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 shrink-0">
                          <Film className="h-3 w-3" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="font-semibold text-white group-hover:text-indigo-400 transition-colors truncate max-w-xs">
                            {r.title}
                          </div>
                          {r.isLiveDrop && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-950/80 px-1.5 py-0.5 text-[10px] font-bold text-emerald-300 animate-pulse">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                              LIVE
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                          <span>{r.show_id}</span>
                          {r.platform && <span>• {r.platform}</span>}
                          {r.liveIngestTime && <span className="text-emerald-400/80">• Ingested {r.liveIngestTime}</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  {visibleCols.type && (
                    <td className="py-3 px-3">
                      <Badge variant={r.type === 'Movie' ? 'movie' : 'tv'}>{r.type}</Badge>
                    </td>
                  )}
                  {visibleCols.release_year && (
                    <td className="py-3 px-3 font-mono text-slate-300">{r.release_year}</td>
                  )}
                  {visibleCols.director && (
                    <td className="py-3 px-3 text-slate-300 truncate max-w-[130px]">
                      {r.director || <span className="text-slate-500 italic">Uncredited</span>}
                    </td>
                  )}
                  {visibleCols.country && (
                    <td className="py-3 px-3 text-slate-400 truncate max-w-[110px]">
                      {r.country || 'Global'}
                    </td>
                  )}
                  {visibleCols.genre && (
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1 max-w-[170px]">
                        {r.genres.slice(0, 2).map((g) => (
                          <Badge key={g} variant="genre">{g}</Badge>
                        ))}
                      </div>
                    </td>
                  )}
                  {visibleCols.rating && (
                    <td className="py-3 px-3">
                      <Badge variant="rating">{r.rating}</Badge>
                    </td>
                  )}
                  {visibleCols.duration && (
                    <td className="py-3 px-3 text-slate-300 font-mono">{r.duration}</td>
                  )}
                  {visibleCols.viewer_rating && (
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 font-bold text-amber-400">
                        <Star className="h-3 w-3 fill-amber-400" />
                        {r.viewer_rating.toFixed(1)}
                      </span>
                    </td>
                  )}
                  {visibleCols.votes && (
                    <td className="py-3 px-3 font-mono text-slate-400">
                      {formatNumber(r.votes)}
                    </td>
                  )}
                  {visibleCols.popularity && (
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-12 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-cyan-400 rounded-full"
                            style={{ width: `${r.popularity_score}%` }}
                          ></div>
                        </div>
                        <span className="font-mono text-[11px] text-slate-300">
                          {r.popularity_score}
                        </span>
                      </div>
                    </td>
                  )}
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTitle(r);
                      }}
                      className="rounded bg-slate-800 p-1 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors cursor-pointer"
                      title="Inspect Profile"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )}

      {/* Pagination Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-4 shadow-md">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="rounded border border-slate-800 bg-slate-900 px-2 py-1 text-xs text-white"
          >
            <option value={24}>24</option>
            <option value={48}>48</option>
            <option value={96}>96</option>
          </select>
          <span>
            Page <span className="text-white font-bold">{page}</span> of{' '}
            <span className="text-white font-bold">{totalPages}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 cursor-pointer"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Previous
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 cursor-pointer"
          >
            Next
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
