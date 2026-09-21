import React, { useState } from 'react';
import { RealtimeTelemetry, RealtimeEventItem, ContentRecord } from '../../types/content';
import {
  Radio,
  Play,
  Pause,
  RefreshCw,
  Zap,
  Activity,
  Users,
  Wifi,
  Sparkles,
  ChevronDown,
  List,
  PlusCircle,
  Database,
} from 'lucide-react';

interface RealtimeControlBarProps {
  telemetry: RealtimeTelemetry;
  recentEvents: RealtimeEventItem[];
  isPaused: boolean;
  onTogglePause: () => void;
  onRefreshLiveApi: () => Promise<void>;
  onChangeFrequency: (sec: number) => void;
  onInjectLiveTitle: (title: Partial<ContentRecord>) => void;
  onOpenEventLog: () => void;
  isFetchingApi: boolean;
  dataSourceMode: 'realtime' | 'hybrid';
  onToggleDataSourceMode: (mode: 'realtime' | 'hybrid') => void;
  realtimeCount: number;
  totalCount: number;
}

export const RealtimeControlBar: React.FC<RealtimeControlBarProps> = ({
  telemetry,
  recentEvents,
  isPaused,
  onTogglePause,
  onRefreshLiveApi,
  onChangeFrequency,
  onInjectLiveTitle,
  onOpenEventLog,
  isFetchingApi,
  dataSourceMode,
  onToggleDataSourceMode,
  realtimeCount,
  totalCount,
}) => {
  const [showInjectMenu, setShowInjectMenu] = useState(false);

  const PRESET_INJECTIONS: Partial<ContentRecord>[] = [
    {
      title: 'Stranger Things: The Upside Down Finale',
      type: 'TV Show',
      genres: ['Sci-Fi', 'Horror', 'Drama'],
      platform: 'Netflix',
      country: 'United States',
      viewer_rating: 9.2,
      duration: '5 Seasons',
      duration_num: 5,
      duration_unit: 'Season',
      rating: 'TV-14',
      description: 'Hawkins falls into complete chaos as the final confrontation with Vecna begins in an explosive, emotional multi-episode event.',
      poster_url: 'https://static.tvmaze.com/uploads/images/medium_portrait/397/994025.jpg',
    },
    {
      title: 'The Mandalorian: Mandalore Reborn',
      type: 'TV Show',
      genres: ['Action', 'Sci-Fi', 'Adventure'],
      platform: 'Disney+',
      country: 'United States',
      viewer_rating: 8.8,
      duration: '4 Seasons',
      duration_num: 4,
      duration_unit: 'Season',
      rating: 'TV-14',
      description: 'Din Djarin and Grogu navigate the fractured remnants of the galaxy as new imperial warlords emerge from the shadows.',
      poster_url: 'https://static.tvmaze.com/uploads/images/medium_portrait/447/1118776.jpg',
    },
    {
      title: 'Parasite: The Genesis Blueprint',
      type: 'Movie',
      genres: ['Thriller', 'Drama'],
      platform: 'Max',
      country: 'South Korea',
      viewer_rating: 9.0,
      duration: '132 min',
      duration_num: 132,
      duration_unit: 'min',
      rating: 'R',
      description: 'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.',
      poster_url: 'https://static.tvmaze.com/uploads/images/medium_portrait/372/931249.jpg',
    },
    {
      title: 'Severance: Cold Harbor Protocol',
      type: 'TV Show',
      genres: ['Sci-Fi', 'Thriller'],
      platform: 'Apple TV+',
      country: 'United States',
      viewer_rating: 9.3,
      duration: '2 Seasons',
      duration_num: 2,
      duration_unit: 'Season',
      rating: 'TV-MA',
      description: 'An unscheduled reboot of the Lumon Macrodata Refinement floor triggers an unprecedented memory crossover during live operations.',
      poster_url: 'https://static.tvmaze.com/uploads/images/medium_portrait/499/1248467.jpg',
    },
  ];

  return (
    <div className="border-b border-slate-800 bg-slate-950 px-4 py-2 text-xs">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Stream Mode Toggle & Status Indicator */}
        <div className="flex items-center gap-3">
          {/* Real-time vs Full Archive Toggle */}
          <div className="flex items-center rounded-lg bg-slate-900 border border-slate-800 p-0.5">
            <button
              onClick={() => onToggleDataSourceMode('realtime')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                dataSourceMode === 'realtime'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Display 100% authentic real-world streaming records fetched from live OTT APIs"
            >
              <Zap className="h-3 w-3 text-amber-400" />
              <span>Real-Time Stream ({realtimeCount.toLocaleString()})</span>
            </button>
            <button
              onClick={() => onToggleDataSourceMode('hybrid')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                dataSourceMode === 'hybrid'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Display merged dataset of real-time stream + complete historical archive"
            >
              <Database className="h-3 w-3 text-cyan-400" />
              <span className="hidden sm:inline">Full Archive ({totalCount.toLocaleString()})</span>
              <span className="sm:hidden">Archive</span>
            </button>
          </div>

          {/* Connection Status Indicator */}
          <div className="hidden xl:flex items-center gap-2 rounded-lg bg-slate-900/60 border border-slate-800/80 px-2.5 py-1">
            <span className="relative flex h-2 w-2">
              {isPaused ? (
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              ) : (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </>
              )}
            </span>
            <span className="font-mono font-medium text-slate-300">
              {isPaused ? 'STREAM PAUSED' : 'LIVE OTT STREAM'}
            </span>
            <span className="text-[10px] text-slate-500 border-l border-slate-700 pl-2">
              {telemetry.apiSourceName || 'TVMaze Live OTT API'}
            </span>
          </div>
        </div>

        {/* Center: Live Telemetry KPIs */}
        <div className="flex items-center gap-4 text-slate-300 font-mono">
          {/* Active Concurrent Viewers */}
          <div className="flex items-center gap-1.5" title="Live real-time active OTT streaming viewers">
            <Users className="h-3.5 w-3.5 text-indigo-400" />
            <span className="text-slate-400 hidden sm:inline">Active Viewers:</span>
            <span className="font-bold text-white">
              {telemetry.activeConcurrentViewers.toLocaleString()}
            </span>
            <span
              className={`text-[10px] font-semibold px-1 rounded ${
                telemetry.viewerDelta >= 0
                  ? 'text-emerald-400 bg-emerald-950/60'
                  : 'text-rose-400 bg-rose-950/60'
              }`}
            >
              {telemetry.viewerDelta >= 0 ? '▲' : '▼'} {Math.abs(telemetry.viewerDelta).toLocaleString()}
            </span>
          </div>

          {/* Streaming Throughput */}
          <div className="hidden md:flex items-center gap-1.5" title="Live platform streaming CDN throughput">
            <Wifi className="h-3.5 w-3.5 text-cyan-400" />
            <span className="text-slate-400">CDN:</span>
            <span className="font-bold text-cyan-300">
              {telemetry.streamingThroughputTbps} Tbps
            </span>
          </div>

          {/* Total Live Ingest Drops */}
          <div className="hidden lg:flex items-center gap-1.5" title="Titles ingested during this live session">
            <Sparkles className="h-3.5 w-3.5 text-purple-400" />
            <span className="text-slate-400">Live Drops:</span>
            <span className="font-bold text-purple-300">
              +{telemetry.totalLiveDropsIngested}
            </span>
          </div>
        </div>

        {/* Right: Interactive Streaming Controls */}
        <div className="flex items-center gap-2">
          {/* Play/Pause Stream Toggle */}
          <button
            onClick={onTogglePause}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold border transition-colors cursor-pointer ${
              isPaused
                ? 'border-emerald-600 bg-emerald-900/60 text-emerald-200 hover:bg-emerald-800/80'
                : 'border-slate-700 bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
            title={isPaused ? 'Resume live real-time ingestion' : 'Pause real-time stream'}
          >
            {isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
            <span>{isPaused ? 'Resume' : 'Pause'}</span>
          </button>

          {/* Update Frequency Dropdown */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-md px-1.5 py-0.5">
            <span className="text-[10px] text-slate-500 font-mono">Speed:</span>
            {[1, 3, 5].map((sec) => (
              <button
                key={sec}
                onClick={() => onChangeFrequency(sec)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                  telemetry.updateFrequencySec === sec
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {sec}s
              </button>
            ))}
          </div>

          {/* Fetch Live OTT API Now */}
          <button
            onClick={onRefreshLiveApi}
            disabled={isFetchingApi}
            className="inline-flex items-center gap-1.5 rounded-md border border-cyan-800/60 bg-cyan-950/40 px-2.5 py-1 text-xs font-semibold text-cyan-300 hover:bg-cyan-900/60 disabled:opacity-50 transition-colors cursor-pointer"
            title="Fetch real-world live schedule drops and latest shows from TVMaze Web Schedule & OTT Streaming APIs"
          >
            <RefreshCw className={`h-3 w-3 ${isFetchingApi ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">Sync Live API</span>
          </button>

          {/* Inject Test Live Event Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowInjectMenu(!showInjectMenu)}
              className="inline-flex items-center gap-1 rounded-md border border-indigo-700/60 bg-indigo-950/60 px-2.5 py-1 text-xs font-semibold text-indigo-300 hover:bg-indigo-900/80 transition-colors cursor-pointer"
              title="Simulate a live webhook drop or breaking premiere into catalog"
            >
              <PlusCircle className="h-3 w-3" />
              <span className="hidden sm:inline">Simulate Drop</span>
              <ChevronDown className="h-3 w-3" />
            </button>

            {showInjectMenu && (
              <div className="absolute right-0 mt-1.5 w-64 rounded-lg border border-slate-700 bg-slate-900 p-2 shadow-xl z-50">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 border-b border-slate-800 mb-1">
                  Inject Live Premiere Drop
                </div>
                {PRESET_INJECTIONS.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      onInjectLiveTitle(item);
                      setShowInjectMenu(false);
                    }}
                    className="w-full text-left rounded p-2 hover:bg-slate-800 transition-colors text-xs text-white group cursor-pointer"
                  >
                    <div className="font-semibold text-indigo-300 group-hover:text-indigo-200">
                      {item.title}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {item.platform} • {item.genres?.join(', ')} • {item.viewer_rating}★
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Live Ingestion Audit Log Button */}
          <button
            onClick={onOpenEventLog}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors cursor-pointer"
            title="Open real-time streaming event audit trail"
          >
            <List className="h-3 w-3 text-indigo-400" />
            <span className="hidden sm:inline">Event Log</span>
            <span className="rounded-full bg-indigo-500/20 px-1.5 py-0.2 text-[10px] font-bold text-indigo-300">
              {recentEvents.length}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
