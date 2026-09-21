import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { generateSyntheticOTTDataset } from './data/dataset';
import { ContentRecord, FilterState, DirectorStat, RealtimeTelemetry, RealtimeEventItem } from './types/content';
import { liveDataService } from './services/liveDataService';
import { Sidebar, PageId } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { RealtimeControlBar } from './components/common/RealtimeControlBar';
import { FilterBar } from './components/common/FilterBar';
import { ContentDetailModal } from './components/modals/ContentDetailModal';
import { CreatorDetailModal } from './components/modals/CreatorDetailModal';
import { LiveEventModal } from './components/modals/LiveEventModal';

// Pages
import { ExecutiveOverview } from './pages/ExecutiveOverview';
import { ContentTrends } from './pages/ContentTrends';
import { GenreAnalytics } from './pages/GenreAnalytics';
import { AudienceRatings } from './pages/AudienceRatings';
import { GeographyAnalytics } from './pages/GeographyAnalytics';
import { DirectorsCreators } from './pages/DirectorsCreators';
import { ContentExplorer } from './pages/ContentExplorer';
import { BusinessInsights } from './pages/BusinessInsights';
import { AnalystToolkit } from './pages/AnalystToolkit';

const INITIAL_FILTERS: FilterState = {
  search: '',
  type: 'All',
  genre: 'All',
  country: 'All',
  rating: 'All',
  platform: 'All',
  yearRange: [1970, 2026],
};

export default function App() {
  // 1. In-memory OTT catalog state initialized with base records
  const [catalog, setCatalog] = useState<ContentRecord[]>(() => generateSyntheticOTTDataset());

  // 2. Real-time telemetry and streaming events state
  const [telemetry, setTelemetry] = useState<RealtimeTelemetry>(() => liveDataService.getTelemetry());
  const [recentEvents, setRecentEvents] = useState<RealtimeEventItem[]>([]);
  const [isLivePaused, setIsLivePaused] = useState(false);
  const [isFetchingApi, setIsFetchingApi] = useState(false);
  const [showEventLogModal, setShowEventLogModal] = useState(false);
  const [dataSourceMode, setDataSourceMode] = useState<'realtime' | 'hybrid'>('realtime');

  // 3. Navigation and Filter State
  const [activePage, setActivePage] = useState<PageId>('executive-overview');
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [selectedTitle, setSelectedTitle] = useState<ContentRecord | null>(null);
  const [selectedDirector, setSelectedDirector] = useState<DirectorStat | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // 4. Initialize Live Data Service and Web Stream on Mount
  useEffect(() => {
    let mounted = true;

    // A. Fetch initial live schedule from TVMaze OTT Web API
    setIsFetchingApi(true);
    liveDataService.fetchLiveShowsFromApi()
      .then((liveShows) => {
        if (!mounted) return;
        setIsFetchingApi(false);
        if (liveShows.length > 0) {
          // Prepend latest live premiering web drops
          setCatalog((prev) => [...liveShows.slice(0, 15), ...prev]);
          setRecentEvents((prev) => [
            {
              id: `evt-init-${Date.now()}`,
              timestamp: new Date().toLocaleTimeString(),
              type: 'SCHEDULE_DROP',
              message: `Ingested ${liveShows.length} live streaming titles from TVMaze Web Schedule API`,
            },
            ...prev,
          ]);
        }
      })
      .catch(() => {
        if (mounted) setIsFetchingApi(false);
      });

    // B. Start Real-time Stream Heartbeat (updates every 3s)
    liveDataService.start(
      {
        onEvent: (event) => {
          if (!mounted) return;
          setRecentEvents((prev) => [event, ...prev.slice(0, 49)]);
        },
        onTitleIngest: (newTitle, event) => {
          if (!mounted) return;
          // Reactively inject newly dropped title into catalog state
          setCatalog((prev) => [newTitle, ...prev]);
        },
        onTelemetry: (newTelemetry) => {
          if (!mounted) return;
          setTelemetry(newTelemetry);
        },
      },
      3
    );

    return () => {
      mounted = false;
      liveDataService.pause();
    };
  }, []);

  // 5. Extract unique filter options dynamically from catalog
  const availableGenres = useMemo(() => {
    const set = new Set<string>();
    for (const r of catalog) {
      for (const g of r.genres) set.add(g);
    }
    return Array.from(set).sort();
  }, [catalog]);

  const availableCountries = useMemo(() => {
    const set = new Set<string>();
    for (const r of catalog) {
      if (r.country) set.add(r.country);
    }
    return Array.from(set).sort();
  }, [catalog]);

  const availableRatings = useMemo(() => {
    const set = new Set<string>();
    for (const r of catalog) {
      if (r.rating) set.add(r.rating);
    }
    return Array.from(set).sort();
  }, [catalog]);

  const availablePlatforms = useMemo(() => {
    const set = new Set<string>();
    for (const r of catalog) {
      if (r.platform) set.add(r.platform);
    }
    return Array.from(set).sort();
  }, [catalog]);

  // Realtime titles count
  const realtimeCount = useMemo(
    () => catalog.filter((r) => r.source === 'realtime_api' || r.isLiveDrop).length,
    [catalog]
  );

  // 6. Filter dataset based on current filter state & data source mode
  const filteredDataset = useMemo(() => {
    const baseCohort =
      dataSourceMode === 'realtime' && realtimeCount > 0
        ? catalog.filter((r) => r.source === 'realtime_api' || r.isLiveDrop)
        : catalog;

    return baseCohort.filter((r) => {
      // Search query (title, director, cast, country, genres)
      if (filters.search.trim()) {
        const q = filters.search.toLowerCase();
        const matchesSearch =
          r.title.toLowerCase().includes(q) ||
          r.director.toLowerCase().includes(q) ||
          r.cast.toLowerCase().includes(q) ||
          r.country.toLowerCase().includes(q) ||
          r.genres.some((g) => g.toLowerCase().includes(q));
        if (!matchesSearch) return false;
      }

      // Type
      if (filters.type !== 'All' && r.type !== filters.type) {
        return false;
      }

      // Genre
      if (filters.genre !== 'All' && !r.genres.includes(filters.genre)) {
        return false;
      }

      // Country
      if (filters.country !== 'All' && r.country !== filters.country) {
        return false;
      }

      // Maturity Rating
      if (filters.rating !== 'All' && r.rating !== filters.rating) {
        return false;
      }

      // Platform
      if (filters.platform !== 'All' && r.platform !== filters.platform) {
        return false;
      }

      // Release Year Range
      if (
        r.release_year < filters.yearRange[0] ||
        r.release_year > filters.yearRange[1]
      ) {
        return false;
      }

      return true;
    });
  }, [catalog, filters]);

  // Handlers for real-time controls
  const handleTogglePause = useCallback(() => {
    if (isLivePaused) {
      liveDataService.resume();
      setIsLivePaused(false);
    } else {
      liveDataService.pause();
      setIsLivePaused(true);
    }
  }, [isLivePaused]);

  const handleRefreshLiveApi = useCallback(async () => {
    setIsFetchingApi(true);
    try {
      const live = await liveDataService.fetchLiveShowsFromApi();
      if (live.length > 0) {
        setCatalog((prev) => [...live.slice(0, 10), ...prev]);
        setRecentEvents((prev) => [
          {
            id: `evt-refresh-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString(),
            type: 'SCHEDULE_DROP',
            message: `Synchronized ${live.length} live records from TVMaze OTT streaming API`,
          },
          ...prev,
        ]);
      }
    } finally {
      setIsFetchingApi(false);
    }
  }, []);

  const handleChangeFrequency = useCallback((sec: number) => {
    liveDataService.setFrequency(sec);
    setTelemetry((prev) => ({ ...prev, updateFrequencySec: sec }));
  }, []);

  const handleInjectLiveTitle = useCallback((custom: Partial<ContentRecord>) => {
    const injected = liveDataService.injectManualTitle(custom);
    setCatalog((prev) => [injected, ...prev]);
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
  }, []);

  const handleSelectDirectorByName = useCallback((directorName: string) => {
    const dirRecords = catalog.filter((r) => r.director === directorName);
    if (dirRecords.length > 0) {
      const genresSet = new Set<string>();
      const countriesSet = new Set<string>();
      let ratingSum = 0;
      let minYear = 9999;
      let maxYear = 0;

      for (const r of dirRecords) {
        for (const g of r.genres) genresSet.add(g);
        if (r.country) countriesSet.add(r.country);
        ratingSum += r.viewer_rating;
        if (r.release_year < minYear) minYear = r.release_year;
        if (r.release_year > maxYear) maxYear = r.release_year;
      }

      const stat: DirectorStat = {
        director: directorName,
        titles: dirRecords.length,
        avgRating: Number((ratingSum / dirRecords.length).toFixed(2)),
        genres: Array.from(genresSet),
        countries: Array.from(countriesSet),
        topTitles: dirRecords.slice(0, 5).map((r) => r.title),
        firstYear: minYear === 9999 ? 2018 : minYear,
        latestYear: maxYear === 0 ? 2026 : maxYear,
      };
      setSelectedDirector(stat);
    }
  }, [catalog]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-950 font-sans text-slate-100 antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        activePage={activePage}
        onSelectPage={setActivePage}
        mobileOpen={isMobileSidebarOpen}
        setMobileOpen={setIsMobileSidebarOpen}
      />

      {/* Main View Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <Header
          activePage={activePage}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          filteredRecords={filteredDataset}
          totalCatalogCount={catalog.length}
          dataSourceMode={dataSourceMode}
        />

        {/* Real-time Streaming & Telemetry Control Bar */}
        <RealtimeControlBar
          telemetry={telemetry}
          recentEvents={recentEvents}
          isPaused={isLivePaused}
          onTogglePause={handleTogglePause}
          onRefreshLiveApi={handleRefreshLiveApi}
          onChangeFrequency={handleChangeFrequency}
          onInjectLiveTitle={handleInjectLiveTitle}
          onOpenEventLog={() => setShowEventLogModal(true)}
          isFetchingApi={isFetchingApi}
          dataSourceMode={dataSourceMode}
          onToggleDataSourceMode={setDataSourceMode}
          realtimeCount={realtimeCount}
          totalCount={catalog.length}
        />

        {/* Global Filter Bar (Accessible across analytical pages) */}
        {activePage !== 'business-insights' && activePage !== 'analyst-toolkit' && (
          <div className="px-4 pt-3 md:px-6 md:pt-4 lg:px-8">
            <FilterBar
              filters={filters}
              onFilterChange={setFilters}
              onReset={handleResetFilters}
              availableGenres={availableGenres}
              availableRatings={availableRatings}
              availableCountries={availableCountries}
              availablePlatforms={availablePlatforms}
              totalFilteredCount={filteredDataset.length}
              totalCatalogCount={catalog.length}
            />
          </div>
        )}

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {activePage === 'executive-overview' && (
              <ExecutiveOverview
                records={filteredDataset}
                onResetFilters={handleResetFilters}
                telemetry={telemetry}
                dataSourceMode={dataSourceMode}
              />
            )}

            {activePage === 'content-trends' && (
              <ContentTrends
                records={filteredDataset}
                onResetFilters={handleResetFilters}
              />
            )}

            {activePage === 'genre-analytics' && (
              <GenreAnalytics
                records={filteredDataset}
                onResetFilters={handleResetFilters}
              />
            )}

            {activePage === 'audience-ratings' && (
              <AudienceRatings
                records={filteredDataset}
                onResetFilters={handleResetFilters}
                onSelectTitle={setSelectedTitle}
              />
            )}

            {activePage === 'geography' && (
              <GeographyAnalytics
                records={filteredDataset}
                onResetFilters={handleResetFilters}
              />
            )}

            {activePage === 'directors-creators' && (
              <DirectorsCreators
                records={filteredDataset}
                onResetFilters={handleResetFilters}
                onSelectDirector={setSelectedDirector}
              />
            )}

            {activePage === 'content-explorer' && (
              <ContentExplorer
                records={filteredDataset}
                onResetFilters={handleResetFilters}
                onSelectTitle={setSelectedTitle}
              />
            )}

            {activePage === 'business-insights' && (
              <BusinessInsights records={filteredDataset} />
            )}

            {activePage === 'analyst-toolkit' && (
              <AnalystToolkit records={catalog} />
            )}
          </div>
        </main>
      </div>

      {/* Detail Modals */}
      {selectedTitle && (
        <ContentDetailModal
          content={selectedTitle}
          onClose={() => setSelectedTitle(null)}
        />
      )}

      {selectedDirector && (
        <CreatorDetailModal
          directorStat={selectedDirector}
          titles={catalog.filter((r) => r.director === selectedDirector.director)}
          onClose={() => setSelectedDirector(null)}
          onSelectTitle={(rec) => {
            setSelectedDirector(null);
            setSelectedTitle(rec);
          }}
        />
      )}

      {/* Live Stream Event Log & Simulation Modal */}
      {showEventLogModal && (
        <LiveEventModal
          events={recentEvents}
          telemetry={telemetry}
          onClose={() => setShowEventLogModal(false)}
          onInjectCustomTitle={handleInjectLiveTitle}
        />
      )}
    </div>
  );
}
