import React, { useState } from 'react';
import { ContentRecord } from '../types/content';
import { calculateTrendAnalytics } from '../calculations/analytics';
import { ChartCard } from '../components/common/ChartCard';
import { EmptyState } from '../components/common/EmptyState';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { TrendingUp, Calendar, Filter, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface ContentTrendsProps {
  records: ContentRecord[];
  onResetFilters: () => void;
}

type MetricMode = 'titles' | 'movies' | 'tv' | 'rating';

export const ContentTrends: React.FC<ContentTrendsProps> = ({ records, onResetFilters }) => {
  const [metricMode, setMetricMode] = useState<MetricMode>('titles');
  const [yearWindow, setYearWindow] = useState<'all' | 'recent5' | 'recent8'>('all');

  const allTrends = calculateTrendAnalytics(records);

  const filteredTrends = allTrends.filter((d) => {
    if (yearWindow === 'recent5') return d.year >= 2020;
    if (yearWindow === 'recent8') return d.year >= 2017;
    return true;
  });

  if (records.length === 0) {
    return <EmptyState onReset={onResetFilters} />;
  }

  // Yearly genre trend breakdown for stacked/multi-line
  const majorGenres = ['Drama', 'Comedy', 'Action & Adventure', 'Documentary', 'Sci-Fi & Fantasy'];
  const yearlyGenreBreakdown: Record<number, Record<string, number>> = {};

  for (const r of records) {
    const y = r.year_added || r.release_year;
    if (y >= 2016 && y <= 2024) {
      if (!yearlyGenreBreakdown[y]) {
        yearlyGenreBreakdown[y] = { Drama: 0, Comedy: 0, 'Action & Adventure': 0, Documentary: 0, 'Sci-Fi & Fantasy': 0 };
      }
      for (const g of r.genres) {
        if (yearlyGenreBreakdown[y][g] !== undefined) {
          yearlyGenreBreakdown[y][g]++;
        }
      }
    }
  }

  const genreTrendData = Object.entries(yearlyGenreBreakdown)
    .map(([yearStr, counts]) => ({
      year: Number(yearStr),
      ...counts,
    }))
    .sort((a, b) => a.year - b.year);

  // Growth rate summary calculation
  const latestPoint = filteredTrends[filteredTrends.length - 1];
  const earliestPoint = filteredTrends[0];
  const netGrowth = latestPoint && earliestPoint && earliestPoint.totalAdded > 0
    ? (((latestPoint.totalAdded - earliestPoint.totalAdded) / earliestPoint.totalAdded) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      {/* Metric Mode & Range Selector Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1">
            Focus Metric:
          </span>
          {(
            [
              { id: 'titles', label: 'Number of Titles' },
              { id: 'movies', label: 'Movies Added' },
              { id: 'tv', label: 'TV Shows Added' },
              { id: 'rating', label: 'Average Rating' },
            ] as const
          ).map((m) => (
            <button
              key={m.id}
              onClick={() => setMetricMode(m.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                metricMode === m.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Timeline Window:</span>
          {(
            [
              { id: 'all', label: 'Full 10-Yr' },
              { id: 'recent8', label: '2017 – 2024' },
              { id: 'recent5', label: '2020 – 2024' },
            ] as const
          ).map((w) => (
            <button
              key={w.id}
              onClick={() => setYearWindow(w.id)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium cursor-pointer ${
                yearWindow === w.id
                  ? 'bg-slate-800 text-indigo-400 border border-indigo-500/30'
                  : 'bg-slate-950 text-slate-400 border border-slate-800/80 hover:text-white'
              }`}
            >
              {w.label}
            </button>
          ))}
        </div>
      </div>

      {/* Primary Dynamic Metric Trend Chart */}
      <ChartCard
        title={`Longitudinal Catalog Velocity (${
          metricMode === 'titles'
            ? 'Total Title Volume'
            : metricMode === 'movies'
            ? 'Movie Additions'
            : metricMode === 'tv'
            ? 'TV Series Additions'
            : 'Audience Quality Rating'
        })`}
        subtitle="Annual additions into the streaming catalog with trajectory modeling"
        badge={yearWindow === 'all' ? '2015–2024' : 'Filtered Window'}
      >
        <ResponsiveContainer width="100%" height={320}>
          {metricMode === 'rating' ? (
            <LineChart data={filteredTrends} margin={{ top: 15, right: 20, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="year" stroke="#64748b" fontSize={12} tickLine={false} />
              <YAxis domain={[5.0, 8.5]} stroke="#64748b" fontSize={12} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                formatter={(val: any) => [`${Number(val).toFixed(2)} ★`, 'Average Rating']}
              />
              <Line type="monotone" dataKey="avgRating" name="Average Viewer Rating" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#f59e0b' }} />
            </LineChart>
          ) : (
            <AreaChart data={filteredTrends} margin={{ top: 15, right: 20, left: -15, bottom: 5 }}>
              <defs>
                <linearGradient id="metricGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="year" stroke="#64748b" fontSize={12} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                formatter={(val: any) => [Number(val).toLocaleString(), 'Count']}
              />
              <Area
                type="monotone"
                dataKey={metricMode === 'titles' ? 'totalAdded' : metricMode === 'movies' ? 'moviesAdded' : 'tvAdded'}
                name={metricMode === 'titles' ? 'Total Titles' : metricMode === 'movies' ? 'Movies Added' : 'TV Shows Added'}
                stroke="#6366f1"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#metricGrad)"
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </ChartCard>

      {/* Secondary Row: Stacked Movies vs TV & YoY Growth Rate */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Stacked Movies vs TV Shows by Year */}
        <ChartCard
          title="Format Expansion Mix (Movies vs TV Shows)"
          subtitle="Stacked breakdown illustrating the evolving ratio of episodic to feature content"
          badge="Stacked Bar"
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={filteredTrends} margin={{ top: 15, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="year" stroke="#64748b" fontSize={12} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '6px' }} />
              <Bar dataKey="moviesAdded" name="Movies" stackId="a" fill="#6366f1" radius={[0, 0, 0, 0]} />
              <Bar dataKey="tvAdded" name="TV Shows" stackId="a" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Year-over-Year Growth Rate (%) */}
        <ChartCard
          title="Year-over-Year (YoY) Velocity Growth %"
          subtitle="Percentage change in annual content ingestion compared to preceding year"
          badge="YoY % Change"
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={filteredTrends.filter((d) => d.yoyGrowthPct !== null)}
              margin={{ top: 15, right: 10, left: -20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="year" stroke="#64748b" fontSize={12} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                formatter={(val: any) => [`${Number(val) > 0 ? '+' : ''}${val}%`, 'YoY Growth Rate']}
              />
              <Bar dataKey="yoyGrowthPct" name="YoY Growth %" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Tertiary Row: Genre Evolution Over Time & Feature Duration by Year */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Genre Evolution Lines */}
        <div className="lg:col-span-2">
          <ChartCard
            title="Genre Trajectory Over Time"
            subtitle="Annual production cadence across the top 5 strategic genres"
            badge="Top 5 Genres"
          >
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={genreTrendData} margin={{ top: 15, right: 15, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="year" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                <Line type="monotone" dataKey="Drama" stroke="#6366f1" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Comedy" stroke="#06b6d4" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Action & Adventure" stroke="#f59e0b" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Documentary" stroke="#10b981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Sci-Fi & Fantasy" stroke="#ec4899" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Feature Duration by Year */}
        <div className="lg:col-span-1">
          <ChartCard
            title="Movie Runtime by Year"
            subtitle="Average feature film duration in minutes"
            badge="Minutes"
          >
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={filteredTrends} margin={{ top: 15, right: 10, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="year" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis domain={[80, 130]} stroke="#64748b" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(val: any) => [`${val} min`, 'Avg Runtime']}
                />
                <Line type="monotone" dataKey="avgMovieDuration" name="Avg Runtime (min)" stroke="#ec4899" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>
    </div>
  );
};
