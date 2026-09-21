import React from 'react';
import { Lightbulb, TrendingUp, AlertTriangle, Compass, CheckCircle2 } from 'lucide-react';

export interface BusinessInsightItem {
  id: string;
  category: 'Content Strategy' | 'Genre Strategy' | 'Geographic Strategy' | 'Audience Insights' | 'Portfolio Insights';
  title: string;
  tag: string;
  finding: string;
  impact: string;
  recommendation: string;
  confidence?: 'High (P < 0.01)' | 'Medium (P < 0.05)' | 'Observational';
}

interface InsightCardProps {
  insight: BusinessInsightItem;
}

export const InsightCard: React.FC<InsightCardProps> = ({ insight }) => {
  const categoryIcons = {
    'Content Strategy': TrendingUp,
    'Genre Strategy': Compass,
    'Geographic Strategy': AlertTriangle,
    'Audience Insights': CheckCircle2,
    'Portfolio Insights': Lightbulb,
  };

  const categoryAccents = {
    'Content Strategy': 'border-indigo-500/30 bg-indigo-500/5 text-indigo-400',
    'Genre Strategy': 'border-cyan-500/30 bg-cyan-500/5 text-cyan-400',
    'Geographic Strategy': 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400',
    'Audience Insights': 'border-amber-500/30 bg-amber-500/5 text-amber-400',
    'Portfolio Insights': 'border-violet-500/30 bg-violet-500/5 text-violet-400',
  };

  const Icon = categoryIcons[insight.category] || Lightbulb;

  return (
    <div className="flex flex-col rounded-xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl backdrop-blur-sm transition-all hover:border-slate-700">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold border ${categoryAccents[insight.category]}`}>
          <Icon className="h-3.5 w-3.5" />
          {insight.category}
        </span>
        {insight.confidence && (
          <span className="text-[11px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60">
            {insight.confidence}
          </span>
        )}
      </div>

      <h4 className="text-lg font-bold text-white tracking-tight mb-4">
        {insight.title}
      </h4>

      <div className="space-y-4 text-sm">
        <div className="rounded-lg bg-slate-950/60 p-3.5 border border-slate-800/80">
          <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 mb-1 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400"></span>
            Finding (Observed Data)
          </div>
          <p className="text-slate-300 leading-relaxed">{insight.finding}</p>
        </div>

        <div className="rounded-lg bg-slate-950/60 p-3.5 border border-slate-800/80">
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-1 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400"></span>
            Business Impact
          </div>
          <p className="text-slate-300 leading-relaxed">{insight.impact}</p>
        </div>

        <div className="rounded-lg bg-indigo-950/20 p-3.5 border border-indigo-500/30">
          <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 mb-1 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400"></span>
            Strategic Recommendation
          </div>
          <p className="text-indigo-100/90 leading-relaxed">{insight.recommendation}</p>
        </div>
      </div>
    </div>
  );
};
