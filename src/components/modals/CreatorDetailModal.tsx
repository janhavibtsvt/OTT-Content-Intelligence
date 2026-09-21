import React from 'react';
import { DirectorStat, ContentRecord } from '../../types/content';
import { X, Star, Film, Globe, Calendar, Award } from 'lucide-react';
import { Badge } from '../common/Badge';

interface CreatorDetailModalProps {
  directorStat: DirectorStat | null;
  titles: ContentRecord[];
  onClose: () => void;
  onSelectTitle: (title: ContentRecord) => void;
}

export const CreatorDetailModal: React.FC<CreatorDetailModalProps> = ({
  directorStat,
  titles,
  onClose,
  onSelectTitle,
}) => {
  if (!directorStat) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 p-6 border-b border-slate-800">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-lg bg-slate-800/80 p-1.5 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="rounded bg-indigo-500/10 px-2 py-0.5 text-xs font-semibold text-indigo-400 border border-indigo-500/20">
              CREATOR DOSSIER
            </span>
          </div>

          <h2 className="text-2xl font-extrabold text-white tracking-tight">{directorStat.director}</h2>
          <p className="mt-1 text-xs text-slate-400">
            Active Catalog Span: {directorStat.firstYear} – {directorStat.latestYear} • {directorStat.titles} Managed Titles
          </p>
        </div>

        {/* Content */}
        <div className="max-h-[70vh] overflow-y-auto p-6 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-center">
              <div className="flex items-center justify-center text-amber-400 mb-1">
                <Star className="h-4 w-4 fill-amber-400" />
              </div>
              <div className="text-xl font-bold text-white">{directorStat.avgRating} / 10</div>
              <div className="text-[11px] text-slate-400">Average IMDb Rating</div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-center">
              <div className="flex items-center justify-center text-indigo-400 mb-1">
                <Film className="h-4 w-4" />
              </div>
              <div className="text-xl font-bold text-white">{directorStat.titles}</div>
              <div className="text-[11px] text-slate-400">Catalog Credits</div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-center">
              <div className="flex items-center justify-center text-cyan-400 mb-1">
                <Calendar className="h-4 w-4" />
              </div>
              <div className="text-xl font-bold text-white">
                {directorStat.latestYear - directorStat.firstYear + 1} yrs
              </div>
              <div className="text-[11px] text-slate-400">Career Coverage</div>
            </div>
          </div>

          {/* Genres & Regions */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
              <span className="font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Primary Genres
              </span>
              <div className="flex flex-wrap gap-1.5">
                {directorStat.genres.map((g) => (
                  <Badge key={g} variant="genre">{g}</Badge>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
              <span className="font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Production Territories
              </span>
              <div className="flex flex-wrap gap-1.5">
                {directorStat.countries.map((c) => (
                  <Badge key={c} variant="neutral">{c}</Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Titles List */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Catalog Titles Directed ({titles.length})
            </h4>
            <div className="space-y-2">
              {titles.map((t) => (
                <div
                  key={t.show_id}
                  onClick={() => onSelectTitle(t)}
                  className="flex items-center justify-between rounded-lg border border-slate-800/80 bg-slate-950/60 p-3 hover:border-indigo-500/50 hover:bg-slate-900 transition-all cursor-pointer"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{t.title}</span>
                      <Badge variant={t.type === 'Movie' ? 'movie' : 'tv'}>{t.type}</Badge>
                      <span className="text-xs text-slate-400">{t.release_year}</span>
                    </div>
                    <div className="text-xs text-slate-400 truncate max-w-md">
                      {t.genres.join(', ')} • {t.duration}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm font-bold text-amber-400">
                    <Star className="h-3.5 w-3.5 fill-amber-400" />
                    <span>{t.viewer_rating.toFixed(1)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-slate-800 bg-slate-950/60 px-6 py-3">
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
