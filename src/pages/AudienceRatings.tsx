import React, { useState } from 'react';
import { ContentRecord } from '../types/content';
import { calculateRatingBuckets, sampleScatterData, calculateGenreAnalytics } from '../calculations/analytics';
import { ChartCard } from '../components/common/ChartCard';
import { EmptyState } from '../components/common/EmptyState';
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
  LineChart,
  Line,
} from 'recharts';
import { Star, Award, TrendingUp, Users, Info } from 'lucide-react';
import { formatNumber } from '../utils/formatters';

interface AudienceRatingsProps {
  records: ContentRecord[];
  onResetFilters: () => void;
  onSelectTitle: (record: ContentRecord) => void;
}

export const AudienceRatings: React.FC<AudienceRatingsProps> = ({
  records,
  onResetFilters,
  onSelectTitle,
}) => {
  const [scatterFilter, setScatterFilter] = useState<'All' | 'Movie' | 'TV Show'>('All');

  const ratingBuckets = calculateRatingBuckets(records);
  const genreStats = calculateGenreAnalytics(records).slice(0, 8);
  const scatterPoints = sampleScatterData(
    records.filter((r) => (scatterFilter === 'All' ? true : r.type === scatterFilter)),
    200
  );

  if (records.length === 0) {
    return <EmptyState onReset={onResetFilters} />;
  }

  // Calculate average rating by content type
  let movieRatingSum = 0;
  let movieCount = 0;
  let tvRatingSum = 0;
  let tvCount = 0;
  for (const r of records) {
    if (r.type === 'Movie') {
      movieRatingSum += r.viewer_rating;
      movieCount++;
    } else {
      tvRatingSum += r.viewer_rating;
      tvCount++;
    }
  }

  const typeRatingComparison = [
    {
      type: 'Movies',
      avgRating: movieCount > 0 ? Number((movieRatingSum / movieCount).toFixed(2)) : 0,
      count: movieCount,
    },
    {
      type: 'TV Shows',
      avgRating: tvCount > 0 ? Number((tvRatingSum / tvCount).toFixed(2)) : 0,
      count: tvCount,
    },
  ];

  // Ratings by release year (grouped)
  const yearRatingMap: Record<number, { sum: number; count: number }> = {};
  for (const r of records) {
    if (r.release_year >= 2014 && r.release_year <= 2024) {
      if (!yearRatingMap[r.release_year]) {
        yearRatingMap[r.release_year] = { sum: 0, count: 0 };
      }
      yearRatingMap[r.release_year].sum += r.viewer_rating;
      yearRatingMap[r.release_year].count++;
    }
  }

  const ratingsByYear = Object.entries(yearRatingMap)
    .map(([year, d]) => ({
      year: Number(year),
      avgRating: Number((d.sum / d.count).toFixed(2)),
      count: d.count,
    }))
    .sort((a, b) => a.year - b.year);

  // Top 5 Highest Rated Titles for display table
  const topRatedTitles = [...records]
    .filter((r) => r.votes >= 5000)
    .sort((a, b) => b.viewer_rating - a.viewer_rating)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center gap-2 text-amber-400 mb-1">
            <Star className="h-4 w-4 fill-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Movie Score Benchmark
            </span>
          </div>
          <div className="text-2xl font-bold text-white">
            {typeRatingComparison[0].avgRating} / 10
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Across {typeRatingComparison[0].count.toLocaleString()} feature films
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center gap-2 text-cyan-400 mb-1">
            <Star className="h-4 w-4 fill-cyan-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              TV Series Score Benchmark
            </span>
          </div>
          <div className="text-2xl font-bold text-white">
            {typeRatingComparison[1].avgRating} / 10
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Across {typeRatingComparison[1].count.toLocaleString()} episodic shows
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center gap-2 text-emerald-400 mb-1">
            <Award className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              High Quality Tier (≥ 7.5★)
            </span>
          </div>
          <div className="text-2xl font-bold text-emerald-400">
            {(
              (records.filter((r) => r.viewer_rating >= 7.5).length / (records.length || 1)) *
              100
            ).toFixed(1)}
            %
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {records.filter((r) => r.viewer_rating >= 7.5).length.toLocaleString()} critically acclaimed assets
          </p>
        </div>
      </div>

      {/* Row 1: The Requested 3-Axis Scatter Plot (Votes vs Viewer Rating vs Popularity) */}
      <ChartCard
        title="Audience Engagement Matrix: Total Votes vs Critical Rating"
        subtitle="Evaluating organic traction: X = Logarithmic Audience Votes, Y = Viewer Rating, Bubble Size = Popularity Index"
        badge="Engagement Scatter"
        actions={
          <div className="flex items-center rounded-lg border border-slate-800 bg-slate-950 p-1">
            {(['All', 'Movie', 'TV Show'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setScatterFilter(t)}
                className={`rounded px-2.5 py-1 text-xs font-medium cursor-pointer ${
                  scatterFilter === t
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        }
      >
        <ResponsiveContainer width="100%" height={340}>
          <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              type="number"
              dataKey="votes"
              name="Audience Votes"
              stroke="#64748b"
              fontSize={11}
              tickFormatter={(val) => formatNumber(val)}
              label={{ value: 'Audience Votes Count →', position: 'bottom', fill: '#64748b', fontSize: 11 }}
            />
            <YAxis
              type="number"
              dataKey="viewer_rating"
              name="Viewer Rating"
              domain={[4.0, 9.5]}
              stroke="#64748b"
              fontSize={11}
              label={{ value: 'IMDb Rating (1-10) ↑', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }}
            />
            <ZAxis type="number" dataKey="popularity" range={[40, 320]} name="Popularity" />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
              formatter={(val: any, name?: any) => [
                name === 'Viewer Rating' ? `${Number(val).toFixed(1)} ★` : Number(val).toLocaleString(),
                name,
              ]}
            />
            <Scatter name="Catalog Titles" data={scatterPoints} fill="#6366f1">
              {scatterPoints.map((entry, index) => (
                <Cell
                  key={`scatter-${index}`}
                  fill={entry.type === 'Movie' ? '#6366f1' : '#06b6d4'}
                  fillOpacity={0.7}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Row 2: Rating Histogram & Rating Evolution by Year */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Rating Histogram */}
        <ChartCard
          title="Viewer Rating Distribution Histogram"
          subtitle="Frequency distribution of viewer scores grouped into score intervals"
          badge="Score Buckets"
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={ratingBuckets} margin={{ top: 15, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="range" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                formatter={(val: any) => [`${Number(val).toLocaleString()} titles`, 'Titles']}
              />
              <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Rating Trend by Release Year */}
        <ChartCard
          title="Average Viewer Rating by Release Year"
          subtitle="Long-term historical stability of critical reception (2014–2024)"
          badge="Historical Stability"
        >
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={ratingsByYear} margin={{ top: 15, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="year" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis domain={[6.0, 7.5]} stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                formatter={(val: any) => [`${Number(val).toFixed(2)} ★`, 'Avg Rating']}
              />
              <Line type="monotone" dataKey="avgRating" stroke="#06b6d4" strokeWidth={3} dot={{ r: 4, fill: '#06b6d4' }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row 3: Audience Votes by Genre & Top Rated Titles Showcase */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Total Votes by Genre */}
        <ChartCard
          title="Aggregate Audience Votes by Genre"
          subtitle="Cumulative user engagement and critical volume across major genres"
          badge="Vote Volume"
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={genreStats}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 80, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
              <XAxis
                type="number"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                tickFormatter={(v) => formatNumber(v)}
              />
              <YAxis dataKey="genre" type="category" stroke="#94a3b8" fontSize={11} tickLine={false} width={85} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                formatter={(val: any) => [`${Number(val).toLocaleString()} votes`, 'Total Votes']}
              />
              <Bar dataKey="totalVotes" fill="#818cf8" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Top-Rated Catalog Assets Spotlight */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Benchmark Prestige Titles (≥ 5,000 Votes)
              </h3>
              <p className="text-xs text-slate-400">
                Top rated catalog assets demonstrating exceptional audience satisfaction
              </p>
            </div>
            <Award className="h-5 w-5 text-amber-400" />
          </div>

          <div className="space-y-2 mt-4">
            {topRatedTitles.map((t, idx) => (
              <div
                key={t.show_id}
                onClick={() => onSelectTitle(t)}
                className="flex items-center justify-between rounded-lg border border-slate-800/80 bg-slate-950/60 p-3 hover:border-indigo-500/50 hover:bg-slate-900 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/10 text-amber-400 font-mono text-xs font-bold">
                    #{idx + 1}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{t.title}</div>
                    <div className="text-xs text-slate-400">
                      {t.release_year} • {t.type} • {t.genres[0]}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 font-bold text-amber-400 text-sm">
                    <Star className="h-3.5 w-3.5 fill-amber-400" />
                    {t.viewer_rating.toFixed(1)}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    {formatNumber(t.votes)} votes
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
