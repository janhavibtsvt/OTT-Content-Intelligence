import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  id?: string;
  title: string;
  value: string | number;
  subtitle?: string;
  change?: string;
  isPositive?: boolean;
  icon?: LucideIcon;
  syntheticTag?: boolean;
  accentColor?: 'indigo' | 'emerald' | 'amber' | 'cyan' | 'rose' | 'slate';
}

export const KPICard: React.FC<KPICardProps> = ({
  id,
  title,
  value,
  subtitle,
  change,
  isPositive,
  icon: Icon,
  syntheticTag,
  accentColor = 'indigo',
}) => {
  const accentStyles = {
    indigo: 'from-indigo-500/10 via-indigo-500/5 to-transparent border-indigo-500/20 text-indigo-400',
    emerald: 'from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-500/20 text-emerald-400',
    amber: 'from-amber-500/10 via-amber-500/5 to-transparent border-amber-500/20 text-amber-400',
    cyan: 'from-cyan-500/10 via-cyan-500/5 to-transparent border-cyan-500/20 text-cyan-400',
    rose: 'from-rose-500/10 via-rose-500/5 to-transparent border-rose-500/20 text-rose-400',
    slate: 'from-slate-500/10 via-slate-500/5 to-transparent border-slate-700/50 text-slate-400',
  };

  const iconBgStyles = {
    indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    slate: 'bg-slate-800 text-slate-300 border-slate-700',
  };

  return (
    <div
      id={id}
      className={`relative overflow-hidden rounded-xl border bg-gradient-to-br p-5 backdrop-blur-sm transition-all duration-200 hover:border-slate-700/80 bg-slate-900/60 shadow-lg ${accentStyles[accentColor]}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {title}
            </span>
            {syntheticTag && (
              <span
                title="Synthetic modeled demo metric for portfolio financial analysis"
                className="rounded px-1.5 py-0.5 text-[10px] font-medium tracking-tight bg-amber-500/10 text-amber-400 border border-amber-500/30"
              >
                SYNTHETIC
              </span>
            )}
          </div>
          <div className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {value}
          </div>
        </div>
        {Icon && (
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg border ${iconBgStyles[accentColor]}`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>

      {(subtitle || change) && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          {change && (
            <span
              className={`inline-flex items-center font-semibold ${
                isPositive !== undefined
                  ? isPositive
                    ? 'text-emerald-400'
                    : 'text-rose-400'
                  : 'text-slate-300'
              }`}
            >
              {change}
            </span>
          )}
          {subtitle && <span className="text-slate-400 truncate">{subtitle}</span>}
        </div>
      )}
    </div>
  );
};
