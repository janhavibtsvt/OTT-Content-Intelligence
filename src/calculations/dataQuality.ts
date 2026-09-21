import { ContentRecord, DataQualitySummary } from '../types/content';

export function calculateDataQuality(records: ContentRecord[]): DataQualitySummary {
  const total = records.length;
  if (total === 0) {
    return {
      totalRecords: 0,
      duplicateIds: 0,
      duplicateTitles: 0,
      uniqueTitles: 0,
      missingDirectors: 0,
      missingCountries: 0,
      missingRatings: 0,
      missingDates: 0,
      invalidDurations: 0,
      completenessScore: 100,
    };
  }

  const seenIds = new Set<string>();
  const seenTitles = new Set<string>();
  let duplicateIds = 0;
  let duplicateTitles = 0;
  let missingDirectors = 0;
  let missingCountries = 0;
  let missingRatings = 0;
  let missingDates = 0;
  let invalidDurations = 0;

  for (const r of records) {
    if (seenIds.has(r.show_id)) duplicateIds++;
    else seenIds.add(r.show_id);

    const normTitle = r.title.toLowerCase().trim();
    if (seenTitles.has(normTitle)) duplicateTitles++;
    else seenTitles.add(normTitle);

    if (!r.director || r.director.trim() === '') missingDirectors++;
    if (!r.country || r.country.trim() === '') missingCountries++;
    if (!r.rating || r.rating === 'Unrated' || r.rating.trim() === '') missingRatings++;
    if (!r.date_added) missingDates++;
    if (!r.duration_num || r.duration_num <= 0) invalidDurations++;
  }

  // Calculate completeness: weighted score across key critical fields
  const totalFieldsChecked = total * 5;
  const missingTotal = missingDirectors * 0.4 + missingCountries * 0.8 + missingRatings + missingDates + invalidDurations;
  const completenessScore = Number((Math.max(0, 100 - (missingTotal / totalFieldsChecked) * 100)).toFixed(1));

  return {
    totalRecords: total,
    duplicateIds,
    duplicateTitles,
    uniqueTitles: seenTitles.size,
    missingDirectors,
    missingCountries,
    missingRatings,
    missingDates,
    invalidDurations,
    completenessScore,
  };
}

export interface DescriptiveStats {
  feature: string;
  count: number;
  mean: number;
  stdDev: number;
  median: number;
  min: number;
  q1: number;
  q3: number;
  max: number;
}

export function calculateSummaryStatistics(records: ContentRecord[]): DescriptiveStats[] {
  if (records.length === 0) return [];

  const extractStats = (values: number[], feature: string): DescriptiveStats => {
    if (values.length === 0) {
      return { feature, count: 0, mean: 0, stdDev: 0, median: 0, min: 0, q1: 0, q3: 0, max: 0 };
    }
    values.sort((a, b) => a - b);
    const count = values.length;
    const sum = values.reduce((a, b) => a + b, 0);
    const mean = Number((sum / count).toFixed(2));
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / count;
    const stdDev = Number(Math.sqrt(variance).toFixed(2));

    const min = values[0];
    const max = values[count - 1];
    const median = count % 2 === 0
      ? Number(((values[count / 2 - 1] + values[count / 2]) / 2).toFixed(2))
      : values[Math.floor(count / 2)];
    const q1 = values[Math.floor(count * 0.25)];
    const q3 = values[Math.floor(count * 0.75)];

    return { feature, count, mean, stdDev, median, min, q1, q3, max };
  };

  const ratings = records.map(r => r.viewer_rating);
  const votes = records.map(r => r.votes);
  const releaseYears = records.map(r => r.release_year);
  const movieDurations = records.filter(r => r.type === 'Movie').map(r => r.duration_num);
  const popularities = records.map(r => r.popularity_score);

  return [
    extractStats(ratings, 'Viewer Rating (1.0 - 10.0)'),
    extractStats(votes, 'Audience Votes Count'),
    extractStats(releaseYears, 'Release Year'),
    extractStats(movieDurations, 'Movie Duration (Minutes)'),
    extractStats(popularities, 'Popularity Score (0 - 100)'),
  ];
}

export interface CorrelationCell {
  var1: string;
  var2: string;
  correlation: number;
}

export function calculateCorrelationMatrix(records: ContentRecord[]): {
  variables: string[];
  matrix: Record<string, Record<string, number>>;
} {
  const variables = ['Release Year', 'Viewer Rating', 'Votes', 'Duration (Mins)', 'Popularity'];
  const n = records.length;
  if (n < 2) {
    return { variables, matrix: {} };
  }

  const vectors: Record<string, number[]> = {
    'Release Year': records.map(r => r.release_year),
    'Viewer Rating': records.map(r => r.viewer_rating),
    'Votes': records.map(r => r.votes),
    'Duration (Mins)': records.map(r => r.duration_num),
    'Popularity': records.map(r => r.popularity_score),
  };

  // Pearson correlation calculation helper
  const pearson = (x: number[], y: number[]) => {
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
    for (let i = 0; i < n; i++) {
      sumX += x[i];
      sumY += y[i];
      sumXY += x[i] * y[i];
      sumX2 += x[i] * x[i];
      sumY2 += y[i] * y[i];
    }
    const num = n * sumXY - sumX * sumY;
    const den = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    if (den === 0) return 0;
    return Number((num / den).toFixed(2));
  };

  const matrix: Record<string, Record<string, number>> = {};
  for (const v1 of variables) {
    matrix[v1] = {};
    for (const v2 of variables) {
      matrix[v1][v2] = v1 === v2 ? 1.0 : pearson(vectors[v1], vectors[v2]);
    }
  }

  return { variables, matrix };
}
