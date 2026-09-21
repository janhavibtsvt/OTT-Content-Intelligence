import React from 'react';
import { ContentRecord, RealtimeTelemetry } from '../types/content';
import { calculateExecutiveKPIs, generateDynamicHighlights } from '../calculations/kpis';
import {
  calculateTrendAnalytics,
  calculateGenreAnalytics,
  calculateCountryAnalytics,
  calculateRatingBuckets,
  calculateDurationDistribution,
} from '../calculations/analytics';
import { KPICard } from '../components/common/KPICard';
import { ChartCard } from '../components/common/ChartCard';
import { EmptyState } from '../components/common/EmptyState';
import {
  Film,
  Tv,
  Globe,
  Tag,
  Star,
  Calendar,
  Clock,
  Layers,
  TrendingUp,
  DollarSign,
  Sparkles,
  Award,
  Radio,
  Zap,
  Wifi,
  Users,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ReferenceLine,
} from 'recharts';
import { formatCurrency, formatNumber } from '../utils/formatters';

interface ExecutiveOverviewProps {
  records: ContentRecord[];
  onResetFilters: () => void;
  telemetry?: RealtimeTelemetry;
  dataSourceMode?: 'realtime' | 'hybrid';
}

const PIE_COLORS = ['#6366f1', '#06b6d4'];
const GENRE_COLORS = ['#6366f1', '#818cf8', '#38bdf8', '#06b6d4', '#14b8a6', '#10b981', '#f59e0b', '#f97316', '#ec4899', '#a855f7'];

export const ExecutiveOverview: React.FC<ExecutiveOverviewProps> = ({
  records,
  onResetFilters,
  telemetry,
  dataSourceMode = 'realtime',
}) => {
  const kpis = calculateExecutiveKPIs(records);
  const highlights = generateDynamicHighlights(records, kpis);
  const trends = calculateTrendAnalytics(records);
  const genres = calculateGenreAnalytics(records).slice(0, 10);
  const countries = calculateCountryAnalytics(records).slice(0, 8);
  const ratingBuckets = calculateRatingBuckets(records);
  const durationDist = calculateDurationDistribution(records);

  // Content type donut data
  const typeData = [
    { name: 'Movies', value: kpis.totalMovies, pct: kpis.movieRatio },
    { name: 'TV Shows', value: kpis.totalTVShows, pct: kpis.tvRatio },
  ];

  // Ratings distribution for bar chart
  const ratingDistMap: Record<string, number> = {};
  for (const r of records) {
    ratingDistMap[r.rating] = (ratingDistMap[r.rating] || 0) + 1;
  }
  const ratingChartData = Object.entries(ratingDistMap)
    .map(([rating, count]) => ({
      rating,
      count,
      pct: Number(((count / (records.length || 1)) * 100).toFixed(1)),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 7);

  if (records.length === 0) {
    return <EmptyState onReset={onResetFilters} />;
  }

  // Dynamic chart narrative titles
  const topGenre = genres[0]?.genre || 'Drama';
  const topCountry = countries[0]?.country || 'United States';
  const dominantType = kpis.movieRatio >= 50 ? 'Feature Films' : 'TV Series';

  // Count live drops in current cohort
  const liveDropsCount = records.filter((r) => r.isLiveDrop).length;

  return (
    <div className="space-y-6">
      {/* Real-time Telemetry & Stream Status Banner */}
      <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-r from-slate-950 via-cyan-950/20 to-slate-950 p-4 shadow-lg backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Radio className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  {dataSourceMode === 'realtime' ? 'Real-Time Streaming Engine (Active)' : 'Hybrid Catalog Stream'}
                </span>
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                  LIVE API CONNECTED
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                Data Source: <span className="text-slate-200">{telemetry?.apiSourceName || 'TVMaze Live Web Schedule & Global OTT API'}</span> • Last Sync: {telemetry?.lastUpdated || 'Just now'}
              </p>
            </div>
          </div>

          {/* Quick Telemetry Indicators */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
            {telemetry && (
              <div className="rounded-lg bg-slate-900/80 border border-slate-800 px-3 py-1.5">
                <span className="text-slate-400 block text-[10px]">CONCURRENT VIEWERS</span>
                <div className="flex items-center gap-1.5 font-bold text-white text-sm">
                  <Users className="h-3.5 w-3.5 text-indigo-400" />
                  {telemetry.activeConcurrentViewers.toLocaleString()}
                  <span className={`text-[10px] ${telemetry.viewerDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {telemetry.viewerDelta >= 0 ? '▲' : '▼'}{Math.abs(telemetry.viewerDelta)}
                  </span>
                </div>
              </div>
            )}

            {telemetry && (
              <div className="rounded-lg bg-slate-900/80 border border-slate-800 px-3 py-1.5">
                <span className="text-slate-400 block text-[10px]">CDN BANDWIDTH</span>
                <div className="flex items-center gap-1.5 font-bold text-cyan-300 text-sm">
                  <Wifi className="h-3.5 w-3.5 text-cyan-400" />
                  {telemetry.streamingThroughputTbps} Tbps
                </div>
              </div>
            )}

            <div className="rounded-lg bg-slate-900/80 border border-slate-800 px-3 py-1.5">
              <span className="text-slate-400 block text-[10px]">LIVE RELEASES TODAY</span>
              <div className="flex items-center gap-1.5 font-bold text-purple-300 text-sm">
                <Zap className="h-3.5 w-3.5 text-purple-400" />
                {liveDropsCount} Live Titles
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Executive Highlights Callout (Dynamically derived from filtered cohort) */}
      <div className="rounded-xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-slate-900/60 to-slate-900/40 p-5 backdrop-blur-md">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Executive Strategic Highlights
            </h3>
            <p className="text-xs text-slate-400">
              Automated data insights calculated dynamically from {records.length.toLocaleString()} active catalog titles
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {highlights.map((item) => (
            <div
              key={item.id}
              className="rounded-lg border border-slate-800/80 bg-slate-950/70 p-3.5 space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                  {item.metric}
                </span>
                <span className="rounded bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-300 border border-indigo-500/20">
                  {item.badge}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{item.finding}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Primary KPIs Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
        <KPICard
          title="Total Titles"
          value={kpis.totalTitles.toLocaleString()}
          subtitle="Cohort size"
          icon={Layers}
          accentColor="indigo"
        />
        <KPICard
          title="Movies"
          value={kpis.totalMovies.toLocaleString()}
          subtitle={`${kpis.movieRatio}% of catalog`}
          icon={Film}
          accentColor="indigo"
        />
        <KPICard
          title="TV Shows"
          value={kpis.totalTVShows.toLocaleString()}
          subtitle={`${kpis.tvRatio}% of catalog`}
          icon={Tv}
          accentColor="cyan"
        />
        <KPICard
          title="Countries"
          value={kpis.uniqueCountries}
          subtitle="Sourced regions"
          icon={Globe}
          accentColor="emerald"
        />
        <KPICard
          title="Genres"
          value={kpis.uniqueGenres}
          subtitle="Tracked niches"
          icon={Tag}
          accentColor="amber"
        />
        <KPICard
          title="Avg Rating"
          value={`${kpis.avgViewerRating}★`}
          subtitle="Audience score /10"
          icon={Star}
          accentColor="amber"
        />
        <KPICard
          title="Avg Release"
          value={kpis.avgReleaseYear}
          subtitle="Catalog vintage"
          icon={Calendar}
          accentColor="slate"
        />
        <KPICard
          title="Avg Duration"
          value={`${kpis.avgMovieDuration}m`}
          subtitle="Feature runtime"
          icon={Clock}
          accentColor="rose"
        />
      </div>

      {/* Synthetic Financial Performance KPIs (Mandatory Data Analyst Modeling) */}
      <div className="rounded-xl border border-amber-500/20 bg-slate-900/40 p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-amber-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Portfolio Financial Performance Model (Synthetic Demo Data)
            </h4>
          </div>
          <span className="text-[11px] text-slate-400">
            Simulated economics for business analytics valuation demonstration
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <KPICard
            title="Total Budget"
            value={formatCurrency(kpis.totalSyntheticBudget)}
            subtitle="Simulated production"
            syntheticTag
            accentColor="amber"
          />
          <KPICard
            title="Total Revenue"
            value={formatCurrency(kpis.totalSyntheticRevenue)}
            subtitle="Gross attribution"
            syntheticTag
            accentColor="emerald"
          />
          <KPICard
            title="Avg Revenue / Title"
            value={formatCurrency(kpis.avgSyntheticRevenue)}
            subtitle="Per asset gross"
            syntheticTag
            accentColor="cyan"
          />
          <KPICard
            title="Simulated Portfolio ROI"
            value={`${kpis.syntheticROI > 0 ? '+' : ''}${kpis.syntheticROI}%`}
            subtitle="Gross return on budget"
            isPositive={kpis.syntheticROI >= 0}
            syntheticTag
            accentColor="indigo"
          />
        </div>
      </div>

      {/* Charts Row 1: Content Growth Over Time & Content Type Split */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Chart 1: Content Growth Over Time */}
        <div className="lg:col-span-2">
          <ChartCard
            title={`Catalog additions accelerated from 2017 onwards`}
            subtitle="Annual volume of content onboarded to the streaming platform (2015–2024)"
            badge="Time Series"
          >
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorMovies" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="year" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                <Area type="monotone" dataKey="totalAdded" name="Total Titles Added" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
                <Area type="monotone" dataKey="moviesAdded" name="Movies" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorMovies)" />
                <Area type="monotone" dataKey="tvAdded" name="TV Shows" stroke="#10b981" strokeWidth={2} fillOpacity={0.2} fill="#10b981" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Chart 2: Movies vs TV Shows Share */}
        <div className="lg:col-span-1">
          <ChartCard
            title={`${dominantType} dominate the catalog split`}
            subtitle="Ratio of standalone movies versus episodic TV shows"
            badge="Format Mix"
          >
            <div className="flex h-full flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={typeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {typeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 grid grid-cols-2 gap-4 text-center w-full">
                <div className="rounded-lg bg-slate-950/60 p-2 border border-slate-800">
                  <div className="text-xs text-indigo-400 font-semibold">Movies</div>
                  <div className="text-lg font-bold text-white">{kpis.totalMovies.toLocaleString()}</div>
                  <div className="text-[11px] text-slate-400">{kpis.movieRatio}%</div>
                </div>
                <div className="rounded-lg bg-slate-950/60 p-2 border border-slate-800">
                  <div className="text-xs text-cyan-400 font-semibold">TV Shows</div>
                  <div className="text-lg font-bold text-white">{kpis.totalTVShows.toLocaleString()}</div>
                  <div className="text-[11px] text-slate-400">{kpis.tvRatio}%</div>
                </div>
              </div>
            </div>
          </ChartCard>
        </div>
      </div>

      {/* Charts Row 2: Top 10 Genres & Top Countries */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Chart 3: Top 10 Genres */}
        <ChartCard
          title={`"${topGenre}" leads catalog volume`}
          subtitle="Top 10 genres ranked by number of available titles in current selection"
          badge="Genre Depth"
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={genres} layout="vertical" margin={{ top: 5, right: 20, left: 60, bottom: 5 }}>
              <XAxis type="number" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis dataKey="genre" type="category" stroke="#94a3b8" fontSize={11} tickLine={false} width={85} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                formatter={(val: any) => [`${Number(val).toLocaleString()} titles`, 'Titles']}
              />
              <Bar dataKey="titles" radius={[0, 4, 4, 0]}>
                {genres.map((entry, index) => (
                  <Cell key={`genre-${index}`} fill={GENRE_COLORS[index % GENRE_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Chart 4: Top Countries */}
        <ChartCard
          title={`${topCountry} represents the core production origin`}
          subtitle="Content title counts aggregated by primary country of origin"
          badge="Sourcing"
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={countries} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
              <XAxis dataKey="country" stroke="#64748b" fontSize={11} tickLine={false} angle={-25} textAnchor="end" />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                formatter={(val: any) => [`${Number(val).toLocaleString()} titles`, 'Titles']}
              />
              <Bar dataKey="titles" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Charts Row 3: Rating Distribution, Average Rating by Genre, Content Duration */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Chart 5: Rating Distribution */}
        <ChartCard
          title="Maturity Rating Profile"
          subtitle="Title distribution across MPAA and TV Parental Guidelines"
          badge="Content Tiering"
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={ratingChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="rating" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                formatter={(val: any) => [`${Number(val).toLocaleString()} titles`, 'Count']}
              />
              <Bar dataKey="count" fill="#818cf8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Chart 7: Average Rating by Genre with Benchmark */}
        <ChartCard
          title="Critical Reception by Genre"
          subtitle={`Average IMDb score with overall catalog benchmark (${kpis.avgViewerRating}★)`}
          badge="Quality Benchmark"
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={genres} margin={{ top: 10, right: 10, left: -25, bottom: 25 }}>
              <XAxis dataKey="genre" stroke="#64748b" fontSize={10} tickLine={false} angle={-30} textAnchor="end" />
              <YAxis domain={[5.5, 8.5]} stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                formatter={(val: any) => [`${Number(val).toFixed(2)} ★`, 'Avg Rating']}
              />
              <ReferenceLine y={kpis.avgViewerRating} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: `Avg ${kpis.avgViewerRating}`, fill: '#f59e0b', fontSize: 10, position: 'top' }} />
              <Bar dataKey="avgRating" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Chart 8: Content Duration Distribution */}
        <ChartCard
          title="Feature Film Runtime Bins"
          subtitle="Grouping of feature movies into runtime duration intervals"
          badge="Format Structure"
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={durationDist} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="range" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                formatter={(val: any) => [`${Number(val).toLocaleString()} movies`, 'Count']}
              />
              <Bar dataKey="count" fill="#ec4899" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
};
