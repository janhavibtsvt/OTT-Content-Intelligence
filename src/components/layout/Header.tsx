import React from 'react';
import { PageId } from './Sidebar';
import { Menu, Download, Database, ShieldCheck, Sparkles } from 'lucide-react';
import { ContentRecord } from '../../types/content';
import { exportToCSV } from '../../utils/csvExport';

interface HeaderProps {
  activePage: PageId;
  onOpenMobileMenu: () => void;
  filteredRecords: ContentRecord[];
  totalCatalogCount: number;
  dataSourceMode?: 'realtime' | 'hybrid';
}

const PAGE_TITLES: Record<PageId, { title: string; subtitle: string }> = {
  'executive-overview': {
    title: 'OTT Content Intelligence',
    subtitle: 'Understanding content trends, audience preferences and portfolio composition',
  },
  'content-trends': {
    title: 'Content Evolution & Velocity Trends',
    subtitle: 'Longitudinal analysis of catalog expansion, release timelines, and YoY cadence',
  },
  'genre-analytics': {
    title: 'Genre Performance & Saturation Matrix',
    subtitle: 'Deep-dive segmentation of content categories, critical reception, and growth rates',
  },
  'audience-ratings': {
    title: 'Audience Sentiment & Ratings Distribution',
    subtitle: 'Critical reception distributions, maturity demographics, and popularity engagement',
  },
  'geography': {
    title: 'Global Footprint & Regional Sourcing',
    subtitle: 'Territorial content concentration, domestic vs international production ratios',
  },
  'directors-creators': {
    title: 'Creator Intelligence & Director Dossiers',
    subtitle: 'Prolific content creators, directorial track records, and talent distribution',
  },
  'content-explorer': {
    title: 'Interactive Catalog Explorer',
    subtitle: 'Filterable, searchable data grid with multi-column sorting and full dossier inspection',
  },
  'business-insights': {
    title: 'Strategic Business Recommendations',
    subtitle: 'Data-driven findings, portfolio impact evaluations, and executive action points',
  },
  'analyst-toolkit': {
    title: 'Data Analyst Toolkit & Architecture',
    subtitle: 'Data quality audits, Star Schema dimensional model, SQL questions, and Python EDA pipeline',
  },
};

export const Header: React.FC<HeaderProps> = ({
  activePage,
  onOpenMobileMenu,
  filteredRecords,
  totalCatalogCount,
  dataSourceMode = 'realtime',
}) => {
  const current = PAGE_TITLES[activePage];

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-4 py-3 sm:px-6">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile menu button + Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-900 hover:text-white lg:hidden cursor-pointer"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight sm:text-xl">
              {current.title}
            </h1>
            <p className="text-xs text-slate-400 hidden sm:block">
              {current.subtitle}
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Status Indicator */}
          <div className="hidden md:flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs text-slate-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-mono font-medium">
              {dataSourceMode === 'realtime' ? '⚡ Real-Time Live Feed' : 'Live BI Engine'} ({filteredRecords.length.toLocaleString()} Active)
            </span>
          </div>

          {/* Export CSV button */}
          <button
            onClick={() => exportToCSV(filteredRecords)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-700 transition-colors cursor-pointer"
            title="Download currently filtered records as CSV"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>
    </header>
  );
};
