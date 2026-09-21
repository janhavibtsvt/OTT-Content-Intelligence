import React from 'react';

interface ChartCardProps {
  id?: string;
  title: string;
  subtitle?: string;
  badge?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  id,
  title,
  subtitle,
  badge,
  children,
  actions,
  footer,
  className = '',
}) => {
  return (
    <div
      id={id}
      className={`flex flex-col rounded-xl border border-slate-800/80 bg-slate-900/60 p-5 shadow-xl backdrop-blur-sm ${className}`}
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-white tracking-tight">{title}</h3>
            {badge && (
              <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-300 border border-slate-700">
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="mt-0.5 text-xs text-slate-400 max-w-xl">{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      <div className="relative min-h-[260px] w-full flex-1">
        {children}
      </div>

      {footer && (
        <div className="mt-4 border-t border-slate-800/80 pt-3 text-xs text-slate-400">
          {footer}
        </div>
      )}
    </div>
  );
};
