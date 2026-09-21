import { ContentRecord, ExecutiveKPIs } from '../types/content';

export function calculateExecutiveKPIs(records: ContentRecord[]): ExecutiveKPIs {
  const totalTitles = records.length;
  if (totalTitles === 0) {
    return {
      totalTitles: 0,
      totalMovies: 0,
      totalTVShows: 0,
      movieRatio: 0,
      tvRatio: 0,
      uniqueCountries: 0,
      uniqueGenres: 0,
      uniqueDirectors: 0,
      avgViewerRating: 0,
      avgReleaseYear: 0,
      avgMovieDuration: 0,
      avgTVSeasons: 0,
      totalSyntheticBudget: 0,
      totalSyntheticRevenue: 0,
      avgSyntheticRevenue: 0,
      syntheticROI: 0,
    };
  }

  let movies = 0;
  let tvShows = 0;
  let ratingSum = 0;
  let releaseYearSum = 0;
  let movieDurationSum = 0;
  let tvSeasonsSum = 0;
  let totalBudget = 0;
  let totalRevenue = 0;

  const countries = new Set<string>();
  const genres = new Set<string>();
  const directors = new Set<string>();

  for (let i = 0; i < totalTitles; i++) {
    const item = records[i];
    if (item.type === 'Movie') {
      movies++;
      movieDurationSum += item.duration_num;
    } else {
      tvShows++;
      tvSeasonsSum += item.duration_num;
    }

    ratingSum += item.viewer_rating;
    releaseYearSum += item.release_year;

    if (item.country) countries.add(item.country);
    if (item.director) directors.add(item.director);
    for (let g = 0; g < item.genres.length; g++) {
      genres.add(item.genres[g]);
    }

    totalBudget += item.budget;
    totalRevenue += item.revenue;
  }

  const movieRatio = Number(((movies / totalTitles) * 100).toFixed(1));
  const tvRatio = Number(((tvShows / totalTitles) * 100).toFixed(1));
  const avgViewerRating = Number((ratingSum / totalTitles).toFixed(2));
  const avgReleaseYear = Math.round(releaseYearSum / totalTitles);
  const avgMovieDuration = movies > 0 ? Math.round(movieDurationSum / movies) : 0;
  const avgTVSeasons = tvShows > 0 ? Number((tvSeasonsSum / tvShows).toFixed(1)) : 0;

  const avgSyntheticRevenue = Math.round(totalRevenue / totalTitles);
  const syntheticROI = totalBudget > 0
    ? Number((((totalRevenue - totalBudget) / totalBudget) * 100).toFixed(1))
    : 0;

  return {
    totalTitles,
    totalMovies: movies,
    totalTVShows: tvShows,
    movieRatio,
    tvRatio,
    uniqueCountries: countries.size,
    uniqueGenres: genres.size,
    uniqueDirectors: directors.size,
    avgViewerRating,
    avgReleaseYear,
    avgMovieDuration,
    avgTVSeasons,
    totalSyntheticBudget: totalBudget,
    totalSyntheticRevenue: totalRevenue,
    avgSyntheticRevenue,
    syntheticROI,
  };
}

export interface DynamicHighlight {
  id: string;
  metric: string;
  finding: string;
  badge: string;
  sentiment: 'positive' | 'neutral' | 'accent' | 'warning';
}

export function generateDynamicHighlights(records: ContentRecord[], kpis: ExecutiveKPIs): DynamicHighlight[] {
  if (records.length === 0) return [];

  const highlights: DynamicHighlight[] = [];

  // 1. Dominant Content Type
  const dominantType = kpis.totalMovies >= kpis.totalTVShows ? 'Feature Movies' : 'TV Series';
  const dominantShare = Math.max(kpis.movieRatio, kpis.tvRatio);
  highlights.push({
    id: 'content-type-dominance',
    metric: 'Catalog Composition',
    finding: `${dominantType} constitute ${dominantShare}% of the filtered catalog (${dominantType === 'Feature Movies' ? kpis.totalMovies.toLocaleString() : kpis.totalTVShows.toLocaleString()} titles), reflecting a traditional long-form library weighting.`,
    badge: `${dominantShare}% Share`,
    sentiment: 'accent',
  });

  // 2. Top Genre Volume & Comparison
  const genreCounts: Record<string, { count: number; ratingSum: number }> = {};
  for (const r of records) {
    for (const g of r.genres) {
      if (!genreCounts[g]) genreCounts[g] = { count: 0, ratingSum: 0 };
      genreCounts[g].count++;
      genreCounts[g].ratingSum += r.viewer_rating;
    }
  }
  const sortedGenres = Object.entries(genreCounts).sort((a, b) => b[1].count - a[1].count);
  if (sortedGenres.length > 0) {
    const topGenre = sortedGenres[0];
    const topGenreShare = ((topGenre[1].count / kpis.totalTitles) * 100).toFixed(1);
    highlights.push({
      id: 'genre-dominance',
      metric: 'Genre Concentration',
      finding: `"${topGenre[0]}" is the catalog's leading category with ${topGenre[1].count.toLocaleString()} titles (${topGenreShare}% title penetration), demonstrating strong core audience acquisition alignment.`,
      badge: topGenre[0],
      sentiment: 'positive',
    });
  }

  // 3. Geographic Hub
  const countryCounts: Record<string, number> = {};
  for (const r of records) {
    if (r.country) countryCounts[r.country] = (countryCounts[r.country] || 0) + 1;
  }
  const sortedCountries = Object.entries(countryCounts).sort((a, b) => b[1] - a[1]);
  if (sortedCountries.length > 0) {
    const topCountry = sortedCountries[0];
    const countryShare = ((topCountry[1] / kpis.totalTitles) * 100).toFixed(1);
    highlights.push({
      id: 'geo-hub',
      metric: 'Production Origin',
      finding: `${topCountry[0]} generates the largest volume of catalog acquisitions at ${topCountry[1].toLocaleString()} titles (${countryShare}%), supported by ${kpis.uniqueCountries} international production territories.`,
      badge: `${topCountry[0]} (${countryShare}%)`,
      sentiment: 'neutral',
    });
  }

  // 4. Content Maturity / Rating Standard
  const ratingCounts: Record<string, number> = {};
  for (const r of records) {
    ratingCounts[r.rating] = (ratingCounts[r.rating] || 0) + 1;
  }
  const topRating = Object.entries(ratingCounts).sort((a, b) => b[1] - a[1])[0];
  if (topRating) {
    const ratingShare = ((topRating[1] / kpis.totalTitles) * 100).toFixed(1);
    highlights.push({
      id: 'rating-demographic',
      metric: 'Target Demographic',
      finding: `Maturity tier "${topRating[0]}" represents ${ratingShare}% of total content, indicating an editorial preference towards mature teen and adult streaming demographics.`,
      badge: topRating[0],
      sentiment: topRating[0] === 'TV-MA' || topRating[0] === 'R' ? 'warning' : 'accent',
    });
  }

  // 5. Highest Quality Niche Genres
  const ratedGenres = sortedGenres
    .filter(([_, data]) => data.count >= 20)
    .map(([genre, data]) => ({
      genre,
      avg: data.ratingSum / data.count,
      count: data.count,
    }))
    .sort((a, b) => b.avg - a.avg);

  if (ratedGenres.length > 0) {
    const highestRated = ratedGenres[0];
    highlights.push({
      id: 'highest-rated-genre',
      metric: 'Critical Reception',
      finding: `"${highestRated.genre}" achieves the highest average viewer satisfaction at ${highestRated.avg.toFixed(2)}/10 across ${highestRated.count} titles, outperforming catalog benchmark ${kpis.avgViewerRating}/10.`,
      badge: `${highestRated.avg.toFixed(2)} / 10`,
      sentiment: 'positive',
    });
  }

  return highlights;
}
