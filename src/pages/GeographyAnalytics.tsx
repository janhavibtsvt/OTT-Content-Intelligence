import React, { useState } from 'react';
import { ContentRecord } from '../types/content';
import {
  calculateCountryAnalytics,
  calculateRegionalDistribution,
} from '../calculations/analytics';
import { ChartCard } from '../components/common/ChartCard';
import { KPICard } from '../components/common/KPICard';
import { EmptyState } from '../components/common/EmptyState';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Globe2, MapPin, Compass, Building, ArrowUpDown, Star } from 'lucide-react';

interface GeographyAnalyticsProps {
  records: ContentRecord[];
  onResetFilters: () => void;
}

const REGION_COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

export const GeographyAnalytics: React.FC<GeographyAnalyticsProps> = ({ records, onResetFilters }) => {
  const [selectedCountry, setSelectedCountry] = useState<string>('United States');

  const countryStats = calculateCountryAnalytics(records);
  const regionalData = calculateRegionalDistribution(records);

  if (records.length === 0) {
    return <EmptyState onReset={onResetFilters} />;
  }

  // Domestic (US) vs International breakdown
  const domesticCount = records.filter((r) => r.country === 'United States').length;
  const internationalCount = records.length - domesticCount;
  const domesticShare = ((domesticCount / records.length) * 100).toFixed(1);
  const internationalShare = ((internationalCount / records.length) * 100).toFixed(1);

  const domVsIntData = [
    { name: 'Domestic (United States)', value: domesticCount, pct: domesticShare },
    { name: 'International (Rest of World)', value: internationalCount, pct: internationalShare },
  ];

  // Country vs Genre affinity for top 5 countries
  const top5Countries = countryStats.slice(0, 5).map((c) => c.country);
  const countryGenreData: Record<string, Record<string, number>> = {};
  for (const c of top5Countries) {
    countryGenreData[c] = { Drama: 0, Comedy: 0, 'Action & Adventure': 0, Documentary: 0 };
  }

  for (const r of records) {
    if (top5Countries.includes(r.country)) {
      for (const g of r.genres) {
        if (countryGenreData[r.country][g] !== undefined) {
          countryGenreData[r.country][g]++;
        }
      }
    }
  }

  const countryGenreChartData = top5Countries.map((c) => ({
    country: c,
    ...countryGenreData[c],
  }));

  // Country vs Average Rating for top 10 countries
  const top10CountriesWithRating = countryStats
    .filter((c) => c.titles >= 15)
    .slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Geography KPIs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KPICard
          title="Countries Represented"
          value={countryStats.length}
          subtitle="Sovereign production hubs"
          icon={Globe2}
          accentColor="indigo"
        />
        <KPICard
          title="Primary Territory"
          value={countryStats[0]?.country || 'N/A'}
          subtitle={`${countryStats[0]?.sharePct || 0}% of global catalog`}
          icon={MapPin}
          accentColor="cyan"
        />
        <KPICard
          title="International Share"
          value={`${internationalShare}%`}
          subtitle={`${internationalCount.toLocaleString()} overseas titles`}
          icon={Compass}
          accentColor="emerald"
        />
        <KPICard
          title="Domestic Core"
          value={`${domesticShare}%`}
          subtitle={`${domesticCount.toLocaleString()} US assets`}
          icon={Building}
          accentColor="amber"
        />
      </div>

      {/* Row 1: Top Countries Bar & Domestic vs International Split */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Top Countries Ranked Bar Chart */}
        <div className="lg:col-span-2">
          <ChartCard
            title="Top Sourcing Territories"
            subtitle="Ranked catalog volume by content origin country"
            badge="Top 10 Territories"
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={countryStats.slice(0, 10)}
                margin={{ top: 15, right: 10, left: -20, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="country" stroke="#64748b" fontSize={11} tickLine={false} angle={-30} textAnchor="end" />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(val: any) => [`${Number(val).toLocaleString()} titles`, 'Titles']}
                />
                <Bar dataKey="titles" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Domestic vs International Pie */}
        <div className="lg:col-span-1">
          <ChartCard
            title="Domestic vs International Ratio"
            subtitle="Catalog sourcing split: US Domestic vs Global Productions"
            badge="Globalization"
          >
            <ResponsiveContainer width="100%" height={210}>
              <PieChart>
                <Pie
                  data={domVsIntData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  <Cell fill="#6366f1" />
                  <Cell fill="#10b981" />
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
                  US Domestic
                </span>
                <span className="font-mono text-indigo-400 font-bold">{domesticShare}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  International
                </span>
                <span className="font-mono text-emerald-400 font-bold">{internationalShare}%</span>
              </div>
            </div>
          </ChartCard>
        </div>
      </div>

      {/* Row 2: Regional Distribution Matrix & Country vs Genre Affinity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Regional Clustering Table */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl backdrop-blur-sm">
          <h3 className="text-base font-bold text-white tracking-tight">
            Continental & Regional Hub Breakdown
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Aggregated content footprint across geographic economic regions
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-2.5 px-3">Geographic Hub</th>
                  <th className="py-2.5 px-3">Titles</th>
                  <th className="py-2.5 px-3">Share</th>
                  <th className="py-2.5 px-3">Avg Rating</th>
                  <th className="py-2.5 px-3">Leading Markets</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {regionalData.map((reg) => (
                  <tr key={reg.region} className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 font-semibold text-white">{reg.region}</td>
                    <td className="py-2.5 px-3 font-mono">{reg.titles.toLocaleString()}</td>
                    <td className="py-2.5 px-3 font-mono text-indigo-400">{reg.sharePct}%</td>
                    <td className="py-2.5 px-3">
                      <span className="flex items-center gap-1 font-bold text-amber-400">
                        <Star className="h-3 w-3 fill-amber-400" />
                        {reg.avgRating.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 truncate max-w-[160px]">
                      {reg.topCountries}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Country vs Genre Stacked Bar */}
        <ChartCard
          title="Genre Affinity Across Top Producing Countries"
          subtitle="How key production markets allocate resources across core genres"
          badge="Market Specialization"
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={countryGenreChartData} margin={{ top: 15, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="country" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
              <Bar dataKey="Drama" fill="#6366f1" stackId="g" />
              <Bar dataKey="Comedy" fill="#06b6d4" stackId="g" />
              <Bar dataKey="Action & Adventure" fill="#f59e0b" stackId="g" />
              <Bar dataKey="Documentary" fill="#10b981" stackId="g" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row 3: Country vs Average Critical Rating */}
      <ChartCard
        title="Territorial Quality Benchmark: Average Rating by Country"
        subtitle="Comparing average IMDb score across major producing nations (min. 15 catalog titles)"
        badge="Quality vs Sourcing"
      >
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={top10CountriesWithRating} margin={{ top: 15, right: 10, left: -20, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="country" stroke="#64748b" fontSize={11} tickLine={false} angle={-25} textAnchor="end" />
            <YAxis domain={[5.5, 8.0]} stroke="#64748b" fontSize={11} tickLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
              formatter={(val: any) => [`${Number(val).toFixed(2)} ★`, 'Average Rating']}
            />
            <Bar dataKey="avgRating" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
};
