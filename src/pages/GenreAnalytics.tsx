import React, { useState } from 'react';
import { ContentRecord, GenreStat } from '../types/content';
import { calculateGenreAnalytics } from '../calculations/analytics';
import { ChartCard } from '../components/common/ChartCard';
import { EmptyState } from '../components/common/EmptyState';
import { Badge } from '../components/common/Badge';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ScatterChart,
  Scatter,
  ZAxis,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { ArrowUpDown, Star, TrendingUp, Info, PieChart as PieIcon } from 'lucide-react';

interface GenreAnalyticsProps {
  records: ContentRecord[];
  onResetFilters: () => void;
}

type SortField = 'titles' | 'avgRating' | 'movies' | 'tvShows' | 'growthPct' | 'avgPopularity';

const PIE_COLORS = ['#6366f1', '#818cf8', '#38bdf8', '#06b6d4', '#14b8a6', '#10b981', '#f59e0b', '#f97316', '#ec4899', '#a855f7'];

export const GenreAnalytics: React.FC<GenreAnalyticsProps> = ({ records, onResetFilters }) => {
  const [sortField, setSortField] = useState<SortField>('titles');
  const [sortAsc, setSortAsc] = useState(false);

  const genreStats = calculateGenreAnalytics(records);

  if (records.length === 0) {
    return <EmptyState onReset={onResetFilters} />;
  }

  // Dynamic calculation for automated narrative insight
  const dramaGenre = genreStats.find((g) => g.genre.toLowerCase().includes('drama'));
  const highestRatedGenre = [...genreStats].sort((a, b) => b.avgRating - a.avgRating)[0];
  const fastestGrowingGenre = [...genreStats].sort((a, b) => b.growthPct - a.growthPct)[0];
  const overallAvgRating = (
    genreStats.reduce((acc, g) => acc + g.avgRating * g.titles, 0) /
    (genreStats.reduce((acc, g) => acc + g.titles, 0) || 1)
  ).toFixed(2);

  let dynamicGenreInsight = '';
  if (dramaGenre && highestRatedGenre && dramaGenre.genre !== highestRatedGenre.genre) {
    if (dramaGenre.avgRating < highestRatedGenre.avgRating) {
      dynamicGenreInsight = `${dramaGenre.genre} represents ${dramaGenre.sharePct}% of the catalog (${dramaGenre.titles.toLocaleString()} titles) with an average rating of ${dramaGenre.avgRating}★, whereas boutique genre "${highestRatedGenre.genre}" commands the highest critical reception at ${highestRatedGenre.avgRating}★ across ${highestRatedGenre.titles.toLocaleString()} titles.`;
    } else {
      dynamicGenreInsight = `${dramaGenre.genre} dominates volume with ${dramaGenre.titles.toLocaleString()} titles (${dramaGenre.sharePct}% share) while preserving strong audience satisfaction (${dramaGenre.avgRating}★).`;
    }
  } else if (highestRatedGenre) {
    dynamicGenreInsight = `"${highestRatedGenre.genre}" leads all tracked categories in viewer satisfaction at ${highestRatedGenre.avgRating}★ with ${highestRatedGenre.titles.toLocaleString()} catalog assets.`;
  }

  // Sorting table data
  const sortedTableData = [...genreStats].sort((a, b) => {
    const mult = sortAsc ? 1 : -1;
    return (a[sortField] - b[sortField]) * mult;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  // Scatter plot data: Genre vs Rating vs Popularity
  const scatterData = genreStats.map((g) => ({
    name: g.genre,
    titles: g.titles,
    avgRating: g.avgRating,
    popularity: g.avgPopularity,
    growth: g.growthPct,
  }));

  // Top 8 for pie chart
  const top8Genres = genreStats.slice(0, 8);

  return (
    <div className="space-y-6">
      {/* Automated Data Analyst Insight Banner */}
      <div className="rounded-xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-slate-900/60 to-slate-900/40 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400">
            <Info className="h-4 w-4" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 block mb-0.5">
              Automated Portfolio Diagnostic
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">{dynamicGenreInsight}</p>
          </div>
        </div>
      </div>

      {/* Row 1: Top Genres Volume & Genre Catalog Share */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Horizontal bar chart */}
        <div className="lg:col-span-2">
          <ChartCard
            title="Genre Volume & Format Breakdown"
            subtitle="Title count per genre with stacked Movies vs TV Shows proportions"
            badge="Top Genres"
          >
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={genreStats.slice(0, 10)}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 80, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis type="number" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis dataKey="genre" type="category" stroke="#94a3b8" fontSize={11} tickLine={false} width={90} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                <Bar dataKey="movies" name="Movies" stackId="a" fill="#6366f1" radius={[0, 0, 0, 0]} />
                <Bar dataKey="tvShows" name="TV Shows" stackId="a" fill="#06b6d4" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Donut Chart: Catalog Share */}
        <div className="lg:col-span-1">
          <ChartCard
            title="Genre Concentration Share"
            subtitle="Percentage distribution of titles across primary categories"
            badge="Portfolio Share"
          >
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={top8Genres}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="titles"
                  nameKey="genre"
                >
                  {top8Genres.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(val: any, name?: any) => [`${Number(val).toLocaleString()} titles`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-1.5 pt-2 text-[11px] text-slate-300 border-t border-slate-800">
              {top8Genres.slice(0, 4).map((g, idx) => (
                <div key={g.genre} className="flex items-center gap-1.5 truncate">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[idx] }}></span>
                  <span className="truncate">{g.genre}: {g.sharePct}%</span>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>
      </div>

      {/* Row 2: Genre vs Viewer Rating Scatter / Quadrant Chart */}
      <ChartCard
        title="Genre Positioning Matrix: Volume vs Critical Rating"
        subtitle="Identifying high-volume anchors versus high-reception boutique categories (Bubble size = Average Popularity Index)"
        badge="Quadrant Matrix"
      >
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              type="number"
              dataKey="titles"
              name="Catalog Titles"
              stroke="#64748b"
              fontSize={11}
              label={{ value: 'Catalog Title Volume →', position: 'bottom', fill: '#64748b', fontSize: 11 }}
            />
            <YAxis
              type="number"
              dataKey="avgRating"
              name="Average Rating"
              domain={[6.0, 7.6]}
              stroke="#64748b"
              fontSize={11}
              label={{ value: 'Average Rating (1-10) ↑', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }}
            />
            <ZAxis type="number" dataKey="popularity" range={[80, 450]} name="Popularity" />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
              formatter={(val: any, name?: any) => [
                name === 'Average Rating' ? `${Number(val).toFixed(2)} ★` : Number(val).toLocaleString(),
                name,
              ]}
            />
            <Scatter name="Genres" data={scatterData} fill="#6366f1">
              {scatterData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Row 3: Full Sortable Genre Intelligence Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Genre Performance Breakdown Table
            </h3>
            <p className="text-xs text-slate-400">
              Interactive dimensional scorecard with sorting and catalog penetration ratios
            </p>
          </div>
          <div className="text-xs text-slate-400 font-mono">
            {genreStats.length} Genres Analyzed
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-3 px-4">Genre</th>
                <th
                  onClick={() => handleSort('titles')}
                  className="py-3 px-4 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    Titles <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('avgRating')}
                  className="py-3 px-4 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    Avg Rating <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('movies')}
                  className="py-3 px-4 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    Movies <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('tvShows')}
                  className="py-3 px-4 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    TV Shows <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('avgPopularity')}
                  className="py-3 px-4 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    Popularity Index <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('growthPct')}
                  className="py-3 px-4 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    Velocity Growth % <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3 px-4">Catalog Penetration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {sortedTableData.map((g) => (
                <tr key={g.genre} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-semibold text-white">{g.genre}</td>
                  <td className="py-3 px-4 font-mono">{g.titles.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 font-bold text-amber-400">
                      <Star className="h-3 w-3 fill-amber-400" />
                      {g.avgRating.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400">{g.movies.toLocaleString()}</td>
                  <td className="py-3 px-4 font-mono text-slate-400">{g.tvShows.toLocaleString()}</td>
                  <td className="py-3 px-4 font-mono">{g.avgPopularity} / 100</td>
                  <td className="py-3 px-4">
                    <span
                      className={`font-semibold ${
                        g.growthPct >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {g.growthPct > 0 ? '+' : ''}
                      {g.growthPct}%
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full"
                          style={{ width: `${Math.min(100, g.sharePct * 2)}%` }}
                        ></div>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">{g.sharePct}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
