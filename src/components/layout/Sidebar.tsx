import React from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  PieChart,
  Star,
  Globe2,
  Users2,
  Table,
  Lightbulb,
  Wrench,
  Clapperboard,
  Menu,
  X,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export type PageId =
  | 'executive-overview'
  | 'content-trends'
  | 'genre-analytics'
  | 'audience-ratings'
  | 'geography'
  | 'directors-creators'
  | 'content-explorer'
  | 'business-insights'
  | 'analyst-toolkit';

interface SidebarProps {
  activePage: PageId;
  onSelectPage: (page: PageId) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

interface NavItem {
  id: PageId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'executive-overview', label: 'Executive Overview', icon: LayoutDashboard },
  { id: 'content-trends', label: 'Content Trends', icon: TrendingUp },
  { id: 'genre-analytics', label: 'Genre Analytics', icon: PieChart },
  { id: 'audience-ratings', label: 'Audience & Ratings', icon: Star },
  { id: 'geography', label: 'Geography', icon: Globe2 },
  { id: 'directors-creators', label: 'Directors & Creators', icon: Users2 },
  { id: 'content-explorer', label: 'Content Explorer', icon: Table },
  { id: 'business-insights', label: 'Business Insights', icon: Lightbulb, badge: '5 Strat' },
  { id: 'analyst-toolkit', label: 'Analyst Toolkit', icon: Wrench, badge: 'SQL/Python' },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onSelectPage,
  mobileOpen,
  setMobileOpen,
}) => {
  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex w-72 flex-col border-r border-slate-800 bg-slate-950/95 backdrop-blur-md transition-transform duration-300 lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white shadow-lg shadow-indigo-500/20">
              <Clapperboard className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black tracking-tight text-white">StreamScope</span>
                <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[9px] font-bold text-indigo-300 border border-indigo-500/30">
                  BI v2.4
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                OTT Content Intelligence
              </p>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tagline Banner */}
        <div className="px-5 py-2.5 bg-slate-900/40 border-b border-slate-800/60">
          <p className="text-[11px] text-slate-400 italic">
            "Turning OTT Content Data Into Business Insights"
          </p>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Intelligence Modules
          </div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectPage(item.id);
                  setMobileOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                      isActive
                        ? 'bg-indigo-800 text-indigo-100'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Analyst Portfolio Footer Card */}
        <div className="border-t border-slate-800/80 p-4 bg-slate-900/40">
          <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                Data Analyst Portfolio
              </span>
              <span className="text-[10px] font-mono text-emerald-400">8,650 Rows</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Fictional OTT BI showcase demonstrating EDA, Star Schema modeling, SQL CTEs, & Pandas workflows.
            </p>
            <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-800/60">
              <span>Client-Side Fast Engine</span>
              <span>100% Free Hosting Ready</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
