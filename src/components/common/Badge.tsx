import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'movie' | 'tv' | 'rating' | 'status' | 'genre' | 'neutral' | 'positive' | 'warning';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  className = '',
}) => {
  const variantStyles = {
    movie: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    tv: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    rating: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    status: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    genre: 'bg-slate-800 text-slate-300 border-slate-700',
    neutral: 'bg-slate-800/80 text-slate-400 border-slate-700/50',
    positive: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    warning: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
