import React, { useState } from 'react';
import { RealtimeEventItem, RealtimeTelemetry, ContentRecord } from '../../types/content';
import { X, Zap, Radio, Users, Activity, Sparkles, Send } from 'lucide-react';

interface LiveEventModalProps {
  events: RealtimeEventItem[];
  telemetry: RealtimeTelemetry;
  onClose: () => void;
  onInjectCustomTitle: (record: Partial<ContentRecord>) => void;
}

export const LiveEventModal: React.FC<LiveEventModalProps> = ({
  events,
  telemetry,
  onClose,
  onInjectCustomTitle,
}) => {
  const [customTitle, setCustomTitle] = useState('');
  const [customPlatform, setCustomPlatform] = useState('Netflix');
  const [customRating, setCustomRating] = useState('8.8');
  const [customGenre, setCustomGenre] = useState('Drama');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) return;
    onInjectCustomTitle({
      title: customTitle.trim(),
      platform: customPlatform,
      viewer_rating: parseFloat(customRating) || 8.5,
      genres: [customGenre],
    });
    setCustomTitle('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="flex flex-col w-full max-w-2xl max-h-[85vh] rounded-xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-emerald-400 animate-pulse" />
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Live Real-Time Stream Event Log
              </h2>
              <p className="text-xs text-slate-400">
                Audit stream showing real-time title ingestions, viewer spikes, and telemetry ticks
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Telemetry Summary Bar */}
        <div className="grid grid-cols-3 gap-3 border-b border-slate-800 bg-slate-950/40 p-4 font-mono text-xs">
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-2.5">
            <span className="text-slate-400 block text-[11px]">Active Concurrency</span>
            <span className="text-base font-bold text-white">
              {telemetry.activeConcurrentViewers.toLocaleString()}
            </span>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-2.5">
            <span className="text-slate-400 block text-[11px]">Stream Speed</span>
            <span className="text-base font-bold text-indigo-400">
              Every {telemetry.updateFrequencySec}s
            </span>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-2.5">
            <span className="text-slate-400 block text-[11px]">Live Ingested</span>
            <span className="text-base font-bold text-emerald-400">
              {telemetry.totalLiveDropsIngested} Titles
            </span>
          </div>
        </div>

        {/* Custom Ingestion Form */}
        <form onSubmit={handleSubmit} className="border-b border-slate-800 bg-slate-900/90 p-4">
          <span className="text-xs font-semibold text-slate-300 block mb-2">
            Inject Custom Live Title Event
          </span>
          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              placeholder="e.g. Breaking Bad: Special Premiere"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              className="flex-1 min-w-[180px] rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
            <select
              value={customPlatform}
              onChange={(e) => setCustomPlatform(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-white focus:outline-none"
            >
              <option value="Netflix">Netflix</option>
              <option value="Max">Max</option>
              <option value="Apple TV+">Apple TV+</option>
              <option value="Disney+">Disney+</option>
              <option value="Hulu">Hulu</option>
              <option value="Amazon Prime Video">Amazon Prime Video</option>
            </select>
            <select
              value={customGenre}
              onChange={(e) => setCustomGenre(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-white focus:outline-none"
            >
              <option value="Drama">Drama</option>
              <option value="Sci-Fi">Sci-Fi</option>
              <option value="Comedy">Comedy</option>
              <option value="Action">Action</option>
              <option value="Thriller">Thriller</option>
            </select>
            <input
              type="number"
              step="0.1"
              min="1"
              max="10"
              value={customRating}
              onChange={(e) => setCustomRating(e.target.value)}
              placeholder="8.8"
              className="w-16 rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-white focus:outline-none"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors cursor-pointer"
            >
              <Send className="h-3 w-3" />
              <span>Inject</span>
            </button>
          </div>
        </form>

        {/* Scrollable Event Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-xs">
          {events.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No stream events logged yet. Stream will emit in real time...
            </div>
          ) : (
            events.map((evt) => (
              <div
                key={evt.id}
                className="flex items-start gap-3 rounded-lg border border-slate-800 bg-slate-950/60 p-2.5 transition-colors hover:border-slate-700"
              >
                <div className="mt-0.5">
                  {evt.type === 'NEW_TITLE_INGESTED' ? (
                    <Sparkles className="h-4 w-4 text-purple-400" />
                  ) : evt.type === 'VIEWER_SPIKE' ? (
                    <Users className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Activity className="h-4 w-4 text-cyan-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                        evt.type === 'NEW_TITLE_INGESTED'
                          ? 'bg-purple-950/80 text-purple-300 border border-purple-800/40'
                          : evt.type === 'VIEWER_SPIKE'
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/40'
                          : 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/40'
                      }`}
                    >
                      {evt.type.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[11px] text-slate-500">{evt.timestamp}</span>
                  </div>
                  <p className="mt-1 text-slate-200 text-xs font-sans">{evt.message}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 bg-slate-950 px-6 py-3 flex justify-between items-center text-xs text-slate-400">
          <span>Source: Live OTT Web Channels + TVMaze Streaming API</span>
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-800 px-3 py-1 text-xs text-slate-200 hover:bg-slate-700 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
