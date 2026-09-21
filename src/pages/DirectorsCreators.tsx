import React, { useState, useMemo } from 'react';
import { ContentRecord, DirectorStat } from '../types/content';
import { calculateDirectorAnalytics } from '../calculations/analytics';
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
  CartesianGrid,
} from 'recharts';
import { Search, Star, Film, ArrowUpDown, UserCheck, ChevronRight } from 'lucide-react';

interface DirectorsCreatorsProps {
  records: ContentRecord[];
  onResetFilters: () => void;
  onSelectDirector: (directorStat: DirectorStat) => void;
}

type SortField = 'titles' | 'avgRating';

export const DirectorsCreators: React.FC<DirectorsCreatorsProps> = ({
  records,
  onResetFilters,
  onSelectDirector,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('titles');
  const [sortAsc, setSortAsc] = useState(false);

  const directorStats = useMemo(() => calculateDirectorAnalytics(records), [records]);

  if (records.length === 0) {
    return <EmptyState onReset={onResetFilters} />;
  }

  // Filter and sort table data
  const filteredDirectors = directorStats.filter((d) =>
    d.director.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.genres.some((g) => g.toLowerCase().includes(searchQuery.toLowerCase())) ||
    d.countries.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const sortedDirectors = [...filteredDirectors].sort((a, b) => {
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

  // Top 8 Prolific Directors for Bar Chart
  const top8Directors = directorStats.slice(0, 8);

  return (
    <div className="space-y-6">
      {/* Top Prolific Directors Chart */}
      <ChartCard
        title="Most Prolific Directorial Talent"
        subtitle="Catalog title volume attributed to leading filmmakers and series showrunners"
        badge="Top Creators"
      >
        <ResponsiveContainer width="100%" height={260}>
          <BarChart
            data={top8Directors}
            layout="vertical"
            margin={{ top: 5, right: 20, left: 100, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
            <XAxis type="number" stroke="#64748b" fontSize={11} tickLine={false} />
            <YAxis
              dataKey="director"
              type="category"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              width={110}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
              formatter={(val: any) => [`${val} titles`, 'Catalog Credits']}
            />
            <Bar dataKey="titles" fill="#6366f1" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Creator Directory Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Director Directory & Performance Index
            </h3>
            <p className="text-xs text-slate-400">
              Select any director row to view their complete dossier and filmography
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search director, genre, country..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 py-1.5 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="text-xs text-slate-400 font-mono hidden sm:block">
              {filteredDirectors.length} Creators
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-3 px-4">Director Name</th>
                <th
                  onClick={() => handleSort('titles')}
                  className="py-3 px-4 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    Catalog Titles <ArrowUpDown className="h-3 w-3" />
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
                <th className="py-3 px-4">Primary Genres</th>
                <th className="py-3 px-4">Origin Territories</th>
                <th className="py-3 px-4">Career Span</th>
                <th className="py-3 px-4 text-right">Dossier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {sortedDirectors.map((d) => (
                <tr
                  key={d.director}
                  onClick={() => onSelectDirector(d)}
                  className="hover:bg-slate-800/50 transition-colors cursor-pointer group"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-slate-300 font-bold text-xs border border-slate-700">
                        {d.director.charAt(0)}
                      </div>
                      <span className="font-semibold text-white group-hover:text-indigo-400 transition-colors">
                        {d.director}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-white">
                    {d.titles}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 font-bold text-amber-400">
                      <Star className="h-3.5 w-3.5 fill-amber-400" />
                      {d.avgRating.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {d.genres.map((g) => (
                        <Badge key={g} variant="genre">{g}</Badge>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    {d.countries.join(', ') || 'Various'}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400">
                    {d.firstYear} – {d.latestYear}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="inline-flex items-center gap-1 rounded bg-slate-800 px-2 py-1 text-[11px] font-medium text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      View Dossier <ChevronRight className="h-3 w-3" />
                    </span>
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
