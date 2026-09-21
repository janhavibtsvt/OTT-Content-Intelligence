import { ContentRecord } from '../types/content';

export function exportToCSV(records: ContentRecord[], filename = 'streamscope_ott_content_export.csv') {
  if (records.length === 0) return;

  const headers = [
    'show_id',
    'type',
    'title',
    'director',
    'cast',
    'country',
    'date_added',
    'release_year',
    'rating',
    'duration',
    'listed_in',
    'language',
    'platform',
    'popularity_score',
    'viewer_rating',
    'votes',
    'budget_synthetic_usd',
    'revenue_synthetic_usd',
    'roi_synthetic_pct',
    'content_status',
  ];

  const escapeCSV = (val: string | number | undefined | null) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const csvRows = [headers.join(',')];

  for (const r of records) {
    const row = [
      escapeCSV(r.show_id),
      escapeCSV(r.type),
      escapeCSV(r.title),
      escapeCSV(r.director),
      escapeCSV(r.cast),
      escapeCSV(r.country),
      escapeCSV(r.date_added),
      escapeCSV(r.release_year),
      escapeCSV(r.rating),
      escapeCSV(r.duration),
      escapeCSV(r.listed_in),
      escapeCSV(r.language),
      escapeCSV(r.platform),
      escapeCSV(r.popularity_score),
      escapeCSV(r.viewer_rating),
      escapeCSV(r.votes),
      escapeCSV(r.budget),
      escapeCSV(r.revenue),
      escapeCSV(r.roi_percentage),
      escapeCSV(r.content_status),
    ];
    csvRows.push(row.join(','));
  }

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
