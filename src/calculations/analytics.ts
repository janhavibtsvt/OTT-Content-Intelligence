import { ContentRecord, GenreStat, CountryStat, DirectorStat, TrendDataPoint } from '../types/content';

export function calculateTrendAnalytics(records: ContentRecord[]): TrendDataPoint[] {
  const yearMap: Record<number, {
    total: number;
    movies: number;
    tv: number;
    ratingSum: number;
    movieDurationSum: number;
  }> = {};

  for (const r of records) {
    const y = r.year_added || r.release_year;
    if (!yearMap[y]) {
      yearMap[y] = { total: 0, movies: 0, tv: 0, ratingSum: 0, movieDurationSum: 0 };
    }
    yearMap[y].total++;
    if (r.type === 'Movie') {
      yearMap[y].movies++;
      yearMap[y].movieDurationSum += r.duration_num;
    } else {
      yearMap[y].tv++;
    }
    yearMap[y].ratingSum += r.viewer_rating;
  }

  const sortedYears = Object.keys(yearMap)
    .map(Number)
    .filter(y => y >= 2015 && y <= 2024)
    .sort((a, b) => a - b);

  const points: TrendDataPoint[] = [];
  let prevTotal: number | null = null;

  for (const year of sortedYears) {
    const item = yearMap[year];
    let yoyGrowthPct: number | null = null;
    if (prevTotal !== null && prevTotal > 0) {
      yoyGrowthPct = Number((((item.total - prevTotal) / prevTotal) * 100).toFixed(1));
    }
    prevTotal = item.total;

    points.push({
      year,
      totalAdded: item.total,
      moviesAdded: item.movies,
      tvAdded: item.tv,
      avgRating: Number((item.ratingSum / item.total).toFixed(2)),
      yoyGrowthPct,
      avgMovieDuration: item.movies > 0 ? Math.round(item.movieDurationSum / item.movies) : 0,
    });
  }

  return points;
}

export function calculateGenreAnalytics(records: ContentRecord[]): GenreStat[] {
  const total = records.length;
  if (total === 0) return [];

  const genreMap: Record<string, {
    titles: number;
    movies: number;
    tvShows: number;
    ratingSum: number;
    popularitySum: number;
    votesSum: number;
    recentCount: number;
    historicalCount: number;
  }> = {};

  for (const r of records) {
    for (const g of r.genres) {
      if (!genreMap[g]) {
        genreMap[g] = {
          titles: 0,
          movies: 0,
          tvShows: 0,
          ratingSum: 0,
          popularitySum: 0,
          votesSum: 0,
          recentCount: 0,
          historicalCount: 0,
        };
      }
      genreMap[g].titles++;
      if (r.type === 'Movie') genreMap[g].movies++;
      else genreMap[g].tvShows++;

      genreMap[g].ratingSum += r.viewer_rating;
      genreMap[g].popularitySum += r.popularity_score;
      genreMap[g].votesSum += r.votes;

      if (r.release_year >= 2020) {
        genreMap[g].recentCount++;
      } else {
        genreMap[g].historicalCount++;
      }
    }
  }

  return Object.entries(genreMap)
    .map(([genre, data]) => {
      const growthPct = data.historicalCount > 0
        ? Number((((data.recentCount - data.historicalCount) / data.historicalCount) * 100).toFixed(1))
        : 100;
      return {
        genre,
        titles: data.titles,
        movies: data.movies,
        tvShows: data.tvShows,
        avgRating: Number((data.ratingSum / data.titles).toFixed(2)),
        avgPopularity: Math.round(data.popularitySum / data.titles),
        growthPct,
        sharePct: Number(((data.titles / total) * 100).toFixed(1)),
        totalVotes: data.votesSum,
      };
    })
    .sort((a, b) => b.titles - a.titles);
}

export function calculateCountryAnalytics(records: ContentRecord[]): CountryStat[] {
  const total = records.length;
  if (total === 0) return [];

  const countryMap: Record<string, {
    titles: number;
    movies: number;
    tvShows: number;
    ratingSum: number;
  }> = {};

  for (const r of records) {
    const c = r.country || 'Unspecified';
    if (!countryMap[c]) {
      countryMap[c] = { titles: 0, movies: 0, tvShows: 0, ratingSum: 0 };
    }
    countryMap[c].titles++;
    if (r.type === 'Movie') countryMap[c].movies++;
    else countryMap[c].tvShows++;
    countryMap[c].ratingSum += r.viewer_rating;
  }

  return Object.entries(countryMap)
    .map(([country, data]) => ({
      country,
      titles: data.titles,
      movies: data.movies,
      tvShows: data.tvShows,
      avgRating: Number((data.ratingSum / data.titles).toFixed(2)),
      sharePct: Number(((data.titles / total) * 100).toFixed(1)),
    }))
    .sort((a, b) => b.titles - a.titles);
}

export interface RegionBreakdown {
  region: string;
  titles: number;
  sharePct: number;
  topCountries: string;
  avgRating: number;
}

export function calculateRegionalDistribution(records: ContentRecord[]): RegionBreakdown[] {
  const total = records.length;
  if (total === 0) return [];

  const REGION_MAPPING: Record<string, string> = {
    'United States': 'North America',
    'Canada': 'North America',
    'Mexico': 'Latin America',
    'Brazil': 'Latin America',
    'Argentina': 'Latin America',
    'United Kingdom': 'Europe',
    'France': 'Europe',
    'Germany': 'Europe',
    'Spain': 'Europe',
    'Italy': 'Europe',
    'Sweden': 'Europe',
    'India': 'Asia-Pacific',
    'South Korea': 'Asia-Pacific',
    'Japan': 'Asia-Pacific',
    'Australia': 'Asia-Pacific',
    'Nigeria': 'Middle East & Africa',
    'Turkey': 'Middle East & Africa',
  };

  const groups: Record<string, { count: number; ratingSum: number; countries: Record<string, number> }> = {
    'North America': { count: 0, ratingSum: 0, countries: {} },
    'Asia-Pacific': { count: 0, ratingSum: 0, countries: {} },
    'Europe': { count: 0, ratingSum: 0, countries: {} },
    'Latin America': { count: 0, ratingSum: 0, countries: {} },
    'Middle East & Africa': { count: 0, ratingSum: 0, countries: {} },
    'Other / Unspecified': { count: 0, ratingSum: 0, countries: {} },
  };

  for (const r of records) {
    const reg = REGION_MAPPING[r.country] || 'Other / Unspecified';
    groups[reg].count++;
    groups[reg].ratingSum += r.viewer_rating;
    if (r.country) {
      groups[reg].countries[r.country] = (groups[reg].countries[r.country] || 0) + 1;
    }
  }

  return Object.entries(groups)
    .filter(([_, data]) => data.count > 0)
    .map(([region, data]) => {
      const sortedC = Object.entries(data.countries).sort((a, b) => b[1] - a[1]).slice(0, 3).map(c => c[0]).join(', ');
      return {
        region,
        titles: data.count,
        sharePct: Number(((data.count / total) * 100).toFixed(1)),
        topCountries: sortedC || 'N/A',
        avgRating: Number((data.ratingSum / data.count).toFixed(2)),
      };
    })
    .sort((a, b) => b.titles - a.titles);
}

export function calculateDirectorAnalytics(records: ContentRecord[]): DirectorStat[] {
  const directorMap: Record<string, {
    titles: number;
    ratingSum: number;
    genres: Set<string>;
    countries: Set<string>;
    topTitles: Array<{ title: string; rating: number; year: number }>;
    minYear: number;
    maxYear: number;
  }> = {};

  for (const r of records) {
    if (!r.director) continue;
    const d = r.director;
    if (!directorMap[d]) {
      directorMap[d] = {
        titles: 0,
        ratingSum: 0,
        genres: new Set(),
        countries: new Set(),
        topTitles: [],
        minYear: r.release_year,
        maxYear: r.release_year,
      };
    }

    const entry = directorMap[d];
    entry.titles++;
    entry.ratingSum += r.viewer_rating;
    r.genres.forEach(g => entry.genres.add(g));
    if (r.country) entry.countries.add(r.country);
    entry.topTitles.push({ title: r.title, rating: r.viewer_rating, year: r.release_year });
    if (r.release_year < entry.minYear) entry.minYear = r.release_year;
    if (r.release_year > entry.maxYear) entry.maxYear = r.release_year;
  }

  return Object.entries(directorMap)
    .map(([director, data]) => {
      data.topTitles.sort((a, b) => b.rating - a.rating);
      return {
        director,
        titles: data.titles,
        avgRating: Number((data.ratingSum / data.titles).toFixed(2)),
        genres: Array.from(data.genres).slice(0, 4),
        countries: Array.from(data.countries).slice(0, 3),
        topTitles: data.topTitles.slice(0, 4).map(t => `${t.title} (${t.rating}★)`),
        latestYear: data.maxYear,
        firstYear: data.minYear,
      };
    })
    .sort((a, b) => b.titles - a.titles);
}

export interface RatingBucket {
  range: string;
  min: number;
  max: number;
  count: number;
  pct: number;
}

export function calculateRatingBuckets(records: ContentRecord[]): RatingBucket[] {
  const buckets = [
    { range: 'Under 5.0', min: 0, max: 4.9, count: 0 },
    { range: '5.0 – 5.9', min: 5.0, max: 5.9, count: 0 },
    { range: '6.0 – 6.9', min: 6.0, max: 6.9, count: 0 },
    { range: '7.0 – 7.9', min: 7.0, max: 7.9, count: 0 },
    { range: '8.0 – 8.9', min: 8.0, max: 8.9, count: 0 },
    { range: '9.0 – 10.0', min: 9.0, max: 10.0, count: 0 },
  ];

  for (const r of records) {
    for (const b of buckets) {
      if (r.viewer_rating >= b.min && r.viewer_rating <= b.max) {
        b.count++;
        break;
      }
    }
  }

  const total = records.length || 1;
  return buckets.map(b => ({
    ...b,
    pct: Number(((b.count / total) * 100).toFixed(1)),
  }));
}

export interface DurationHistogramBucket {
  range: string;
  count: number;
  type: 'Movie' | 'TV Show';
}

export function calculateDurationDistribution(records: ContentRecord[]): DurationHistogramBucket[] {
  const movieBuckets: Record<string, number> = {
    '< 80m': 0,
    '80-99m': 0,
    '100-119m': 0,
    '120-139m': 0,
    '140-159m': 0,
    '160m+': 0,
  };

  for (const r of records) {
    if (r.type === 'Movie') {
      const m = r.duration_num;
      if (m < 80) movieBuckets['< 80m']++;
      else if (m <= 99) movieBuckets['80-99m']++;
      else if (m <= 119) movieBuckets['100-119m']++;
      else if (m <= 139) movieBuckets['120-139m']++;
      else if (m <= 159) movieBuckets['140-159m']++;
      else movieBuckets['160m+']++;
    }
  }

  return Object.entries(movieBuckets).map(([range, count]) => ({
    range,
    count,
    type: 'Movie',
  }));
}

export interface ScatterPoint {
  id: string;
  title: string;
  votes: number;
  viewer_rating: number;
  popularity: number;
  genre: string;
  type: 'Movie' | 'TV Show';
  country: string;
}

// Sample representative points for high-performance scatter chart
export function sampleScatterData(records: ContentRecord[], sampleSize = 180): ScatterPoint[] {
  if (records.length <= sampleSize) {
    return records.map(r => ({
      id: r.show_id,
      title: r.title,
      votes: r.votes,
      viewer_rating: r.viewer_rating,
      popularity: r.popularity_score,
      genre: r.genres[0] || 'Drama',
      type: r.type,
      country: r.country || 'Global',
    }));
  }

  const step = Math.floor(records.length / sampleSize);
  const sample: ScatterPoint[] = [];
  for (let i = 0; i < records.length && sample.length < sampleSize; i += step) {
    const r = records[i];
    sample.push({
      id: r.show_id,
      title: r.title,
      votes: r.votes,
      viewer_rating: r.viewer_rating,
      popularity: r.popularity_score,
      genre: r.genres[0] || 'Drama',
      type: r.type,
      country: r.country || 'Global',
    });
  }
  return sample;
}

export interface ForecastDataPoint {
  year: number;
  actualRating?: number | null;
  trendLine: number;
  forecastRating?: number | null;
  upperBound?: number | null;
  lowerBound?: number | null;
  corridorRange?: [number, number] | null;
  titleCount?: number | null;
  isForecast: boolean;
}

export interface TrendForecastResult {
  chartData: ForecastDataPoint[];
  historicalPoints: Array<{ year: number; avgRating: number; count: number; trendLine: number }>;
  forecastPoints: Array<{ year: number; forecastRating: number; lowerBound: number; upperBound: number }>;
  slope: number;
  intercept: number;
  rSquared: number;
  standardError: number;
  meanHistoricalRating: number;
  maxHistoricalYear: number;
  targetForecastYear: number;
  targetRating: number;
  targetLower: number;
  targetUpper: number;
  totalTitlesSampled: number;
}

export function calculateTrendForecast(
  records: ContentRecord[],
  formatFilter: 'All' | 'Movie' | 'TV Show' = 'All',
  minYearBaseline: number = 2000,
  horizonYears: number = 4
): TrendForecastResult | null {
  const filtered = records.filter((r) => {
    if (formatFilter !== 'All' && r.type !== formatFilter) return false;
    return true;
  });

  const yearMap: Record<number, { sum: number; count: number; ratings: number[] }> = {};

  for (const r of filtered) {
    const year = r.release_year;
    if (!year || isNaN(year)) continue;
    if (!yearMap[year]) {
      yearMap[year] = { sum: 0, count: 0, ratings: [] };
    }
    yearMap[year].sum += r.viewer_rating;
    yearMap[year].count += 1;
    yearMap[year].ratings.push(r.viewer_rating);
  }

  const allYears = Object.keys(yearMap)
    .map(Number)
    .sort((a, b) => a - b);

  if (allYears.length < 3) return null;

  const historicalYears = allYears.filter((y) => y >= minYearBaseline && yearMap[y].count >= 3);
  if (historicalYears.length < 3) return null;

  const maxHistoricalYear = historicalYears[historicalYears.length - 1];

  const points = historicalYears.map((year) => {
    const { sum, count } = yearMap[year];
    const avg = sum / count;
    return { year, avgRating: avg, count };
  });

  const N = points.length;
  let sumX = 0;
  let sumY = 0;
  for (const p of points) {
    sumX += p.year;
    sumY += p.avgRating;
  }
  const meanX = sumX / N;
  const meanY = sumY / N;

  let ssXX = 0;
  let ssYY = 0;
  let ssXY = 0;

  for (const p of points) {
    const dx = p.year - meanX;
    const dy = p.avgRating - meanY;
    ssXX += dx * dx;
    ssYY += dy * dy;
    ssXY += dx * dy;
  }

  const slope = ssXX !== 0 ? ssXY / ssXX : 0;
  const intercept = meanY - slope * meanX;
  const rSquared = ssXX * ssYY > 0 ? (ssXY * ssXY) / (ssXX * ssYY) : 0;

  let sumResidualSq = 0;
  for (const p of points) {
    const yHat = slope * p.year + intercept;
    const res = p.avgRating - yHat;
    sumResidualSq += res * res;
  }
  const standardError = N > 2 ? Math.sqrt(sumResidualSq / (N - 2)) : 0.15;

  const chartData: ForecastDataPoint[] = [];
  const historicalPoints: Array<{ year: number; avgRating: number; count: number; trendLine: number }> = [];

  for (const p of points) {
    const trendVal = Number((slope * p.year + intercept).toFixed(2));
    const isAnchorYear = p.year === maxHistoricalYear;
    const roundedAvg = Number(p.avgRating.toFixed(2));

    historicalPoints.push({
      year: p.year,
      avgRating: roundedAvg,
      count: p.count,
      trendLine: trendVal,
    });

    chartData.push({
      year: p.year,
      actualRating: roundedAvg,
      trendLine: trendVal,
      forecastRating: isAnchorYear ? roundedAvg : null,
      upperBound: isAnchorYear ? roundedAvg : null,
      lowerBound: isAnchorYear ? roundedAvg : null,
      corridorRange: isAnchorYear ? [roundedAvg, roundedAvg] : null,
      titleCount: p.count,
      isForecast: false,
    });
  }

  const forecastPoints: Array<{ year: number; forecastRating: number; lowerBound: number; upperBound: number }> = [];

  for (let offset = 1; offset <= horizonYears; offset++) {
    const forecastYear = maxHistoricalYear + offset;
    const projected = slope * forecastYear + intercept;
    const margin = 1.28 * standardError * Math.sqrt(1 + 1 / N + Math.pow(forecastYear - meanX, 2) / (ssXX || 1));
    const upper = Math.min(9.8, projected + margin);
    const lower = Math.max(4.0, projected - margin);
    const roundedProjected = Number(projected.toFixed(2));
    const roundedUpper = Number(upper.toFixed(2));
    const roundedLower = Number(lower.toFixed(2));

    forecastPoints.push({
      year: forecastYear,
      forecastRating: roundedProjected,
      lowerBound: roundedLower,
      upperBound: roundedUpper,
    });

    chartData.push({
      year: forecastYear,
      actualRating: null,
      trendLine: roundedProjected,
      forecastRating: roundedProjected,
      upperBound: roundedUpper,
      lowerBound: roundedLower,
      corridorRange: [roundedLower, roundedUpper],
      titleCount: null,
      isForecast: true,
    });
  }

  const targetForecastYear = maxHistoricalYear + horizonYears;
  const targetForecastPoint = chartData.find((d) => d.year === targetForecastYear);

  return {
    chartData,
    historicalPoints,
    forecastPoints,
    slope,
    intercept,
    rSquared,
    standardError,
    meanHistoricalRating: meanY,
    maxHistoricalYear,
    targetForecastYear,
    targetRating: targetForecastPoint?.forecastRating || 0,
    targetLower: targetForecastPoint?.lowerBound || 0,
    targetUpper: targetForecastPoint?.upperBound || 0,
    totalTitlesSampled: points.reduce((acc, p) => acc + p.count, 0),
  };
}
