export type ContentType = 'Movie' | 'TV Show';

export type PlatformType = 'All' | 'StreamScope Plus' | 'StreamScope Global' | 'Studio Vault' | 'CineMax Prime' | 'Pulse Originals';

export interface ContentRecord {
  show_id: string;
  type: ContentType;
  title: string;
  director: string;
  cast: string;
  country: string;
  date_added: string; // ISO date string YYYY-MM-DD
  year_added: number;
  release_year: number;
  rating: string; // e.g. TV-MA, TV-14, R, PG-13, TV-PG, PG, etc.
  duration: string; // "104 min" or "2 Seasons"
  duration_num: number; // minutes for movies, season count for TV shows
  duration_unit: 'min' | 'Season';
  listed_in: string; // comma separated genres
  genres: string[]; // parsed array
  description: string;
  language: string;
  platform: string;
  popularity_score: number; // 0-100 score
  viewer_rating: number; // 1.0 - 10.0 scale
  votes: number; // count of audience votes
  budget: number; // synthetic USD
  revenue: number; // synthetic USD
  roi_percentage: number; // synthetic ROI %
  content_status: 'Active Catalog' | 'Archived' | 'Flagship Exclusive' | 'Acquisition';
  isLiveDrop?: boolean;
  liveIngestTime?: string;
  activeStreamers?: number;
  poster_url?: string;
  network?: string;
  official_site?: string;
  source?: 'realtime_api' | 'synthetic_archive';
}

export type RealtimeSourceMode = 'all' | 'live-only' | 'catalog-only';

export interface RealtimeTelemetry {
  status: 'connected' | 'polling' | 'paused' | 'error';
  lastUpdated: string;
  activeConcurrentViewers: number;
  viewerDelta: number;
  streamingThroughputTbps: number;
  eventsPerMinute: number;
  totalLiveDropsIngested: number;
  sourceMode: RealtimeSourceMode;
  lastEventDescription: string;
  updateFrequencySec: number;
  apiSourceName?: string;
  totalRealtimeTitles?: number;
}

export interface RealtimeEventItem {
  id: string;
  timestamp: string;
  type: 'NEW_TITLE_INGESTED' | 'VIEWER_SPIKE' | 'RATING_UPDATE' | 'SCHEDULE_DROP';
  title?: string;
  platform?: string;
  message: string;
  category?: string;
}

export interface FilterState {
  search: string;
  type: 'All' | ContentType;
  yearRange: [number, number];
  genre: string;
  rating: string;
  country: string;
  platform: string;
}

export interface ExecutiveKPIs {
  totalTitles: number;
  totalMovies: number;
  totalTVShows: number;
  movieRatio: number;
  tvRatio: number;
  uniqueCountries: number;
  uniqueGenres: number;
  uniqueDirectors: number;
  avgViewerRating: number;
  avgReleaseYear: number;
  avgMovieDuration: number;
  avgTVSeasons: number;
  // Synthetic Financials
  totalSyntheticBudget: number;
  totalSyntheticRevenue: number;
  avgSyntheticRevenue: number;
  syntheticROI: number;
}

export interface GenreStat {
  genre: string;
  titles: number;
  movies: number;
  tvShows: number;
  avgRating: number;
  avgPopularity: number;
  growthPct: number;
  sharePct: number;
  totalVotes: number;
}

export interface CountryStat {
  country: string;
  titles: number;
  movies: number;
  tvShows: number;
  avgRating: number;
  sharePct: number;
}

export interface DirectorStat {
  director: string;
  titles: number;
  avgRating: number;
  genres: string[];
  countries: string[];
  topTitles: string[];
  latestYear: number;
  firstYear: number;
}

export interface TrendDataPoint {
  year: number;
  totalAdded: number;
  moviesAdded: number;
  tvAdded: number;
  avgRating: number;
  yoyGrowthPct: number | null;
  avgMovieDuration: number;
}

export interface DataQualitySummary {
  totalRecords: number;
  duplicateIds: number;
  duplicateTitles: number;
  uniqueTitles: number;
  missingDirectors: number;
  missingCountries: number;
  missingRatings: number;
  missingDates: number;
  invalidDurations: number;
  completenessScore: number;
}
