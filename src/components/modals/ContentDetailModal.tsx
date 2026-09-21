import React from 'react';
import { ContentRecord } from '../../types/content';
import { X, Calendar, Clock, Star, Users, Globe, Film, Award, TrendingUp, DollarSign, ExternalLink, Radio } from 'lucide-react';
import { Badge } from '../common/Badge';
import { formatCurrency, formatNumber } from '../../utils/formatters';

interface ContentDetailModalProps {
  content: ContentRecord | null;
  onClose: () => void;
}

export const ContentDetailModal: React.FC<ContentDetailModalProps> = ({ content, onClose }) => {
  if (!content) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
        {/* Header banner */}
        <div className="relative bg-gradient-to-r from-indigo-950/90 via-slate-900 to-slate-900 p-6 border-b border-slate-800">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-lg bg-slate-800/80 p-1.5 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer z-10"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex gap-4">
            {/* Real-time Poster thumbnail if available */}
            {content.poster_url && (
              <img
                src={content.poster_url}
                alt={content.title}
                referrerPolicy="no-referrer"
                className="h-28 w-20 rounded-lg object-cover shadow-lg border border-slate-700 shrink-0 hidden sm:block"
                loading="lazy"
              />
            )}

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge variant={content.type === 'Movie' ? 'movie' : 'tv'}>
                  {content.type}
                </Badge>
                <Badge variant="rating">{content.rating}</Badge>
                <Badge variant="status">{content.content_status}</Badge>
                {content.isLiveDrop && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-950/80 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    LIVE REAL-TIME DROP
                  </span>
                )}
                <span className="text-xs text-slate-400 font-mono">ID: {content.show_id}</span>
              </div>

              <h2 className="text-2xl font-extrabold text-white tracking-tight">{content.title}</h2>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs">
                <span className="text-indigo-300 font-medium">
                  Platform: {content.platform}
                </span>
                {content.activeStreamers && (
                  <span className="text-emerald-400 font-mono flex items-center gap-1">
                    <Radio className="h-3 w-3 animate-pulse" />
                    {content.activeStreamers.toLocaleString()} active live streamers
                  </span>
                )}
                {content.official_site && (
                  <a
                    href={content.official_site}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 underline font-mono"
                  >
                    Official Site <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content details body */}
        <div className="max-h-[75vh] overflow-y-auto p-6 space-y-6">
          {/* Key metrics grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-center">
              <div className="flex items-center justify-center text-amber-400 mb-1">
                <Star className="h-4 w-4 fill-amber-400" />
              </div>
              <div className="text-lg font-bold text-white">{content.viewer_rating.toFixed(1)} / 10</div>
              <div className="text-[11px] text-slate-400">IMDb Score</div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-center">
              <div className="flex items-center justify-center text-indigo-400 mb-1">
                <Users className="h-4 w-4" />
              </div>
              <div className="text-lg font-bold text-white">{formatNumber(content.votes)}</div>
              <div className="text-[11px] text-slate-400">Audience Votes</div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-center">
              <div className="flex items-center justify-center text-cyan-400 mb-1">
                <TrendingUp className="h-4 w-4" />
              </div>
              <div className="text-lg font-bold text-white">{content.popularity_score}</div>
              <div className="text-[11px] text-slate-400">Popularity Index</div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-center">
              <div className="flex items-center justify-center text-emerald-400 mb-1">
                <Clock className="h-4 w-4" />
              </div>
              <div className="text-lg font-bold text-white">{content.duration}</div>
              <div className="text-[11px] text-slate-400">Runtime</div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Synopsis & Narrative Outline
            </h4>
            <p className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-4 text-sm text-slate-300 leading-relaxed">
              {content.description}
            </p>
          </div>

          {/* Metadata details */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm">
            <div className="space-y-3 rounded-xl border border-slate-800/80 bg-slate-950/40 p-4">
              <div>
                <span className="text-xs text-slate-400 block font-medium">Director</span>
                <span className="text-white font-semibold">{content.director || 'Uncredited / Production Guild'}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">Cast Ensemble</span>
                <span className="text-slate-300">{content.cast || 'N/A'}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">Production Country</span>
                <span className="text-slate-300">{content.country || 'International Co-production'}</span>
              </div>
            </div>

            <div className="space-y-3 rounded-xl border border-slate-800/80 bg-slate-950/40 p-4">
              <div>
                <span className="text-xs text-slate-400 block font-medium">Release Year & Added Date</span>
                <span className="text-white font-semibold">
                  {content.release_year} (Added to catalog: {content.date_added})
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">Genres</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {content.genres.map((g) => (
                    <Badge key={g} variant="genre">{g}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">Primary Language</span>
                <span className="text-slate-300">{content.language}</span>
              </div>
            </div>
          </div>

          {/* Synthetic Financial Performance Section (clearly labeled) */}
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5" />
                Portfolio Financial Metrics (Synthetic Demo Model)
              </span>
              <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-400 border border-amber-500/30">
                PORTFOLIO SIMULATION
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center pt-2">
              <div>
                <div className="text-xs text-slate-400">Production Budget</div>
                <div className="text-base font-bold text-white">{formatCurrency(content.budget)}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Gross Attribution</div>
                <div className="text-base font-bold text-emerald-400">{formatCurrency(content.revenue)}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Estimated ROI</div>
                <div className={`text-base font-bold ${content.roi_percentage >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {content.roi_percentage > 0 ? '+' : ''}{content.roi_percentage}%
                </div>
              </div>
            </div>
            <p className="mt-2 text-[11px] text-slate-400 text-center">
              Financial metrics are synthetically generated for business analytics modeling and demonstration purposes.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-slate-800 bg-slate-950/60 px-6 py-3">
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
};
