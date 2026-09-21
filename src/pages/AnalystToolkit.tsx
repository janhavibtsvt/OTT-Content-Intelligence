import React, { useState, useMemo } from 'react';
import { ContentRecord } from '../types/content';
import {
  calculateDataQuality,
  calculateSummaryStatistics,
  calculateCorrelationMatrix,
} from '../calculations/dataQuality';
import { KPICard } from '../components/common/KPICard';
import {
  Wrench,
  Database,
  Terminal,
  Code2,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Layers,
  FileSpreadsheet,
  Binary,
} from 'lucide-react';

interface AnalystToolkitProps {
  records: ContentRecord[];
}

type ToolkitTab = 'quality-audit' | 'eda-statistics' | 'sql-queries' | 'python-workflow' | 'star-schema';

export const AnalystToolkit: React.FC<AnalystToolkitProps> = ({ records }) => {
  const [activeTab, setActiveTab] = useState<ToolkitTab>('quality-audit');
  const [copiedQueryId, setCopiedQueryId] = useState<number | null>(null);
  const [copiedPython, setCopiedPython] = useState(false);

  const quality = useMemo(() => calculateDataQuality(records), [records]);
  const summaryStats = useMemo(() => calculateSummaryStatistics(records), [records]);
  const correlationData = useMemo(() => calculateCorrelationMatrix(records), [records]);

  const handleCopySQL = (id: number, sql: string) => {
    navigator.clipboard.writeText(sql);
    setCopiedQueryId(id);
    setTimeout(() => setCopiedQueryId(null), 2000);
  };

  const handleCopyPython = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedPython(true);
    setTimeout(() => setCopiedPython(false), 2000);
  };

  // 12 Production SQL Queries requested in Section 15
  const SQL_QUERIES = [
    {
      id: 1,
      title: 'Count Total Catalog Titles',
      question: 'What is the absolute volume of catalog assets currently held in inventory?',
      sql: `-- 1. Count total titles
SELECT 
    COUNT(*) AS total_catalog_titles,
    COUNT(DISTINCT show_id) AS unique_content_ids
FROM fact_content;`,
      complexity: 'Basic Aggregate'
    },
    {
      id: 2,
      title: 'Movies vs TV Shows Distribution',
      question: 'How is our catalog split between feature films and multi-episode series?',
      sql: `-- 2. Movies vs TV Shows breakdown with percentages
SELECT 
    type,
    COUNT(*) AS title_count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) AS share_percentage
FROM fact_content
GROUP BY type
ORDER BY title_count DESC;`,
      complexity: 'Window Aggregate'
    },
    {
      id: 3,
      title: 'Top 10 Genres by Title Volume',
      question: 'Which content categories have the deepest catalog representation?',
      sql: `-- 3. Top 10 Genres with unnested genre arrays
WITH unnested_genres AS (
    SELECT 
        show_id,
        TRIM(genre.value) AS genre_name
    FROM fact_content,
    JSON_TABLE(genres, '$[*]' COLUMNS (value VARCHAR(100) PATH '$')) AS genre
)
SELECT 
    genre_name,
    COUNT(*) AS total_titles,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM fact_content), 2) AS catalog_penetration_pct
FROM unnested_genres
GROUP BY genre_name
ORDER BY total_titles DESC
LIMIT 10;`,
      complexity: 'CTE + JSON Unnest'
    },
    {
      id: 4,
      title: 'Content Volume by Country of Origin',
      question: 'Which geographic production territories supply the majority of our library?',
      sql: `-- 4. Content by country with international share
SELECT 
    COALESCE(country, 'Unspecified / International') AS production_country,
    COUNT(*) AS titles_count,
    ROUND(AVG(viewer_rating), 2) AS avg_imdb_rating,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) AS global_share_pct
FROM fact_content
GROUP BY country
HAVING COUNT(*) >= 10
ORDER BY titles_count DESC;`,
      complexity: 'HAVING + Window'
    },
    {
      id: 5,
      title: 'Content Ingestion Cadence by Year',
      question: 'What has been the historical annual velocity of content onboarding?',
      sql: `-- 5. Content additions by year
SELECT 
    EXTRACT(YEAR FROM date_added) AS addition_year,
    COUNT(*) AS titles_added,
    COUNT(CASE WHEN type = 'Movie' THEN 1 END) AS movies_added,
    COUNT(CASE WHEN type = 'TV Show' THEN 1 END) AS tv_shows_added
FROM fact_content
WHERE date_added IS NOT NULL
GROUP BY addition_year
ORDER BY addition_year ASC;`,
      complexity: 'Date Extraction + CASE'
    },
    {
      id: 6,
      title: 'Average Viewer Rating by Content Genre',
      question: 'Which categories generate the highest audience appreciation?',
      sql: `-- 6. Average rating by genre (minimum 25 titles)
SELECT 
    g.genre_name,
    COUNT(f.show_id) AS total_titles,
    ROUND(AVG(f.viewer_rating), 2) AS avg_viewer_rating,
    ROUND(AVG(f.popularity_score), 1) AS avg_popularity_score
FROM fact_content f
JOIN dim_genre g ON f.show_id = g.show_id
GROUP BY g.genre_name
HAVING COUNT(f.show_id) >= 25
ORDER BY avg_viewer_rating DESC;`,
      complexity: 'Relational JOIN + HAVING'
    },
    {
      id: 7,
      title: 'Prestige Top-Rated Titles (Engagement Threshold)',
      question: 'What are the highest-rated catalog gems with proven audience critical mass?',
      sql: `-- 7. Top-rated titles with minimum 5,000 votes
SELECT 
    title,
    type,
    release_year,
    director,
    viewer_rating,
    votes,
    popularity_score
FROM fact_content
WHERE votes >= 5000
ORDER BY viewer_rating DESC, votes DESC
LIMIT 10;`,
      complexity: 'Filter & Compound Sort'
    },
    {
      id: 8,
      title: 'Most Prolific Directorial Talent',
      question: 'Which directors have helmed the greatest number of catalog titles?',
      sql: `-- 8. Directors with the most titles and their quality score
SELECT 
    director,
    COUNT(*) AS titles_directed,
    ROUND(AVG(viewer_rating), 2) AS avg_director_rating,
    MIN(release_year) AS earliest_year,
    MAX(release_year) AS latest_year
FROM fact_content
WHERE director IS NOT NULL AND director != ''
GROUP BY director
ORDER BY titles_directed DESC, avg_director_rating DESC
LIMIT 10;`,
      complexity: 'Aggregate Grouping'
    },
    {
      id: 9,
      title: 'Year-over-Year (YoY) Velocity Growth Rate',
      question: 'How fast is content ingestion accelerating year-over-year?',
      sql: `-- 9. Year-over-year content growth using LAG() window function
WITH annual_ingestion AS (
    SELECT 
        EXTRACT(YEAR FROM date_added) AS addition_year,
        COUNT(*) AS annual_volume
    FROM fact_content
    WHERE date_added IS NOT NULL
    GROUP BY addition_year
)
SELECT 
    addition_year,
    annual_volume,
    LAG(annual_volume) OVER (ORDER BY addition_year) AS prior_year_volume,
    ROUND(
        (annual_volume - LAG(annual_volume) OVER (ORDER BY addition_year)) * 100.0 / 
        NULLIF(LAG(annual_volume) OVER (ORDER BY addition_year), 0), 
        2
    ) AS yoy_growth_percentage
FROM annual_ingestion
ORDER BY addition_year ASC;`,
      complexity: 'CTE + LAG() Window Function'
    },
    {
      id: 10,
      title: 'Cumulative Running Total of Catalog Titles',
      question: 'What has been the cumulative progression of catalog expansion over time?',
      sql: `-- 10. Running total of catalog titles over time
WITH additions_timeline AS (
    SELECT 
        EXTRACT(YEAR FROM date_added) AS addition_year,
        COUNT(*) AS yearly_count
    FROM fact_content
    WHERE date_added IS NOT NULL
    GROUP BY addition_year
)
SELECT 
    addition_year,
    yearly_count,
    SUM(yearly_count) OVER (ORDER BY addition_year ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS cumulative_catalog_total
FROM additions_timeline
ORDER BY addition_year ASC;`,
      complexity: 'Running SUM() Window'
    },
    {
      id: 11,
      title: 'Rank Genres by Content Volume via DENSE_RANK',
      question: 'What is the exact ordinal tier of each genre by asset count?',
      sql: `-- 11. Rank genres by content volume using DENSE_RANK()
SELECT 
    g.genre_name,
    COUNT(*) AS title_count,
    DENSE_RANK() OVER (ORDER BY COUNT(*) DESC) AS volume_rank
FROM dim_genre g
GROUP BY g.genre_name
ORDER BY volume_rank ASC;`,
      complexity: 'DENSE_RANK() Window'
    },
    {
      id: 12,
      title: 'Find Genres with Ratings Exceeding Global Average',
      question: 'Which specific genres perform strictly above the platform-wide average rating?',
      sql: `-- 12. Find genres with average rating strictly above catalog benchmark
SELECT 
    g.genre_name,
    COUNT(f.show_id) AS title_count,
    ROUND(AVG(f.viewer_rating), 2) AS genre_avg_rating,
    ROUND((SELECT AVG(viewer_rating) FROM fact_content), 2) AS catalog_global_benchmark
FROM fact_content f
JOIN dim_genre g ON f.show_id = g.show_id
GROUP BY g.genre_name
HAVING AVG(f.viewer_rating) > (SELECT AVG(viewer_rating) FROM fact_content)
ORDER BY genre_avg_rating DESC;`,
      complexity: 'Subquery in HAVING Clause'
    },
  ];

  const PYTHON_CODE = `"""
StreamScope OTT Content Intelligence — Exploratory Data Analysis & Cleaning Pipeline
Author: Lead Data Analyst
Stack: Python 3.10+, Pandas, NumPy, Matplotlib, Seaborn
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import json

# 1. Load the raw OTT content dataset
df_raw = pd.read_csv("streamscope_ott_content_export.csv")
print(f"Loaded raw dataset with shape: {df_raw.shape}")

# 2. Inspect Schema and Column Types
print(df_raw.info())
print("\\nFirst 5 records:\\n", df_raw.head())

# 3. Data Quality & Missing Value Audit
missing_summary = pd.DataFrame({
    'Missing_Count': df_raw.isnull().sum(),
    'Missing_Pct': (df_raw.isnull().sum() / len(df_raw) * 100).round(2)
})
print("\\n--- Missing Values Audit ---\\n", missing_summary[missing_summary['Missing_Count'] > 0])

# 4. Duplicate Check & Deduplication
duplicate_ids = df_raw.duplicated(subset=['show_id']).sum()
duplicate_titles = df_raw.duplicated(subset=['title', 'release_year']).sum()
print(f"Duplicate IDs: {duplicate_ids} | Duplicate Titles: {duplicate_titles}")
df_clean = df_raw.drop_duplicates(subset=['show_id']).copy()

# 5. Data Cleaning: Date Standardization
df_clean['date_added'] = pd.to_datetime(df_clean['date_added'], errors='coerce')
df_clean['year_added'] = df_clean['date_added'].dt.year
df_clean['month_added'] = df_clean['date_added'].dt.month

# 6. Data Cleaning: Handling Missing Categoricals
df_clean['director'] = df_clean['director'].fillna('Uncredited')
df_clean['country'] = df_clean['country'].fillna('International / Unspecified')
df_clean['rating'] = df_clean['rating'].fillna('Unrated')

# 7. Duration Parsing & Feature Engineering
# Extract numerical runtime: minutes for Movies, seasons count for TV Shows
def extract_duration(row):
    val_str = str(row['duration'])
    digits = ''.join(filter(str.isdigit, val_str))
    num = int(digits) if digits else 0
    unit = 'Season' if 'Season' in val_str else 'min'
    return pd.Series([num, unit], index=['duration_num', 'duration_unit'])

df_clean[['duration_num', 'duration_unit']] = df_clean.apply(extract_duration, axis=1)

# 8. Genre Array Splitting & Normalization
df_clean['genres_list'] = df_clean['listed_in'].apply(
    lambda x: [g.strip() for g in str(x).split(',')] if pd.notnull(x) else []
)

# 9. Descriptive Statistics & Five-Number Summary
stats_cols = ['viewer_rating', 'votes', 'release_year', 'popularity_score']
print("\\n--- Continuous Feature Summary Statistics ---")
print(df_clean[stats_cols].describe().T[['mean', 'std', 'min', '25%', '50%', '75%', 'max']])

# 10. Exploratory Data Visualization
plt.style.use('dark_background')
fig, axes = plt.subplots(2, 2, figsize=(14, 10))

# A. Rating Distribution
sns.histplot(df_clean['viewer_rating'], kde=True, ax=axes[0, 0], color='#6366f1', bins=20)
axes[0, 0].set_title('IMDb Viewer Rating Distribution', fontsize=12, fontweight='bold')

# B. Content Format Split
df_clean['type'].value_counts().plot.pie(ax=axes[0, 1], autopct='%1.1f%%', colors=['#6366f1', '#06b6d4'])
axes[0, 1].set_ylabel('')
axes[0, 1].set_title('Catalog Composition (Movie vs TV Show)', fontsize=12, fontweight='bold')

# C. Top 10 Sourcing Countries
top_countries = df_clean['country'].value_counts().head(10)
sns.barplot(x=top_countries.values, y=top_countries.index, ax=axes[1, 0], palette='crest')
axes[1, 0].set_title('Top 10 Content Production Countries', fontsize=12, fontweight='bold')

# D. Content Velocity over Years
yearly_additions = df_clean['year_added'].value_counts().sort_index()
yearly_additions.plot(kind='area', ax=axes[1, 1], color='#10b981', alpha=0.4)
axes[1, 1].set_title('Annual Catalog Ingestion (2015-2024)', fontsize=12, fontweight='bold')

plt.tight_layout()
plt.savefig("streamscope_eda_report.png", dpi=300)
print("Pipeline complete. Cleaned dataset ready for dimensional modeling.")
`;

  return (
    <div className="space-y-6">
      {/* Navigation tabs for toolkit */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-3 shadow-lg backdrop-blur-sm">
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              { id: 'quality-audit', label: 'Data Quality & Audit', icon: CheckCircle2 },
              { id: 'eda-statistics', label: 'EDA & Descriptive Stats', icon: Binary },
              { id: 'sql-queries', label: 'SQL Business Questions', icon: Database, badge: '12 Queries' },
              { id: 'python-workflow', label: 'Python / Pandas Pipeline', icon: Terminal },
              { id: 'star-schema', label: 'Star Schema Data Model', icon: Layers },
            ] as Array<{ id: ToolkitTab; label: string; icon: any; badge?: string }>
          ).map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{t.label}</span>
                {t.badge && (
                  <span className="rounded bg-indigo-900 px-1.5 py-0.2 text-[10px] text-indigo-200">
                    {t.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: Data Quality & Audit */}
      {activeTab === 'quality-audit' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <KPICard
              title="Audit Sample Records"
              value={quality.totalRecords.toLocaleString()}
              subtitle="Full audited cohort"
              icon={FileSpreadsheet}
              accentColor="indigo"
            />
            <KPICard
              title="Completeness Score"
              value={`${quality.completenessScore}%`}
              subtitle="Weighted field check"
              isPositive={quality.completenessScore >= 95}
              icon={CheckCircle2}
              accentColor="emerald"
            />
            <KPICard
              title="Duplicate Primary Keys"
              value={quality.duplicateIds}
              subtitle="Zero key collisions"
              icon={AlertTriangle}
              accentColor="cyan"
            />
            <KPICard
              title="Unique Title Entities"
              value={quality.uniqueTitles.toLocaleString()}
              subtitle="Deduplicated titles"
              icon={Layers}
              accentColor="amber"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Field Nullity Audit Card */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl backdrop-blur-sm">
              <h3 className="text-base font-bold text-white tracking-tight mb-1">
                Field Completeness & Null Value Audit
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Inspection of missing or unrecorded metadata attributes across all audited entities
              </p>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Director / Showrunner:</span>
                    <span className="font-mono text-slate-400">
                      {quality.missingDirectors.toLocaleString()} null ({((quality.missingDirectors / quality.totalRecords) * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-800">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${(quality.missingDirectors / quality.totalRecords) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500">Note: TV shows frequently lack a single credited director in raw catalog feeds.</span>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Country of Origin:</span>
                    <span className="font-mono text-slate-400">
                      {quality.missingCountries.toLocaleString()} null ({((quality.missingCountries / quality.totalRecords) * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-800">
                    <div
                      className="h-full bg-cyan-500 rounded-full"
                      style={{ width: `${(quality.missingCountries / quality.totalRecords) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Maturity Rating:</span>
                    <span className="font-mono text-slate-400">
                      {quality.missingRatings.toLocaleString()} unrated ({((quality.missingRatings / quality.totalRecords) * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-800">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${(quality.missingRatings / quality.totalRecords) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Data Cleaning Methodology */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl backdrop-blur-sm">
              <h3 className="text-base font-bold text-white tracking-tight mb-1">
                Data Cleaning & Normalization Protocol
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Systematic ETL operations applied during catalog pipeline ingestion
              </p>

              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="rounded-lg bg-slate-950/60 p-2.5 border border-slate-800">
                  <div className="font-bold text-indigo-400">1. Missing-Value Imputation</div>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Null directors tagged as 'Uncredited'; null countries standardized to 'International / Unspecified'; null ratings assigned 'Unrated'.
                  </p>
                </div>

                <div className="rounded-lg bg-slate-950/60 p-2.5 border border-slate-800">
                  <div className="font-bold text-cyan-400">2. Date Standardization</div>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Converted diverse datetime formats into ISO 8601 (YYYY-MM-DD), with year_added and month_added dimensional derived keys.
                  </p>
                </div>

                <div className="rounded-lg bg-slate-950/60 p-2.5 border border-slate-800">
                  <div className="font-bold text-emerald-400">3. Multi-Valued Genre Array Extraction</div>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Decomposed delimited comma strings into normalized 1NF relational records in DimGenre.
                  </p>
                </div>

                <div className="rounded-lg bg-slate-950/60 p-2.5 border border-slate-800">
                  <div className="font-bold text-amber-400">4. Duration Regex Parsing</div>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Extracted integer minute runtimes for feature movies and integer season counts for episodic TV series.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Exploratory Data Analysis & Statistics */}
      {activeTab === 'eda-statistics' && (
        <div className="space-y-6">
          {/* Summary Statistics Table */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl backdrop-blur-sm">
            <h3 className="text-base font-bold text-white tracking-tight mb-1">
              Descriptive Statistics & Five-Number Summary
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Parametric and non-parametric dispersion metrics across continuous numeric fields
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="py-3 px-4">Feature Name</th>
                    <th className="py-3 px-3">Count (N)</th>
                    <th className="py-3 px-3">Mean (μ)</th>
                    <th className="py-3 px-3">Std Dev (σ)</th>
                    <th className="py-3 px-3">Min</th>
                    <th className="py-3 px-3">25% (Q1)</th>
                    <th className="py-3 px-3">Median</th>
                    <th className="py-3 px-3">75% (Q3)</th>
                    <th className="py-3 px-3">Max</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {summaryStats.map((s) => (
                    <tr key={s.feature} className="hover:bg-slate-800/30">
                      <td className="py-3 px-4 font-sans font-semibold text-white">{s.feature}</td>
                      <td className="py-3 px-3 text-slate-400">{s.count.toLocaleString()}</td>
                      <td className="py-3 px-3 text-indigo-400 font-bold">{s.mean}</td>
                      <td className="py-3 px-3 text-slate-300">{s.stdDev}</td>
                      <td className="py-3 px-3 text-slate-400">{s.min}</td>
                      <td className="py-3 px-3 text-slate-300">{s.q1}</td>
                      <td className="py-3 px-3 text-amber-400 font-bold">{s.median}</td>
                      <td className="py-3 px-3 text-slate-300">{s.q3}</td>
                      <td className="py-3 px-3 text-slate-400">{s.max}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pearson Correlation Heatmap */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl backdrop-blur-sm">
            <h3 className="text-base font-bold text-white tracking-tight mb-1">
              Pearson Correlation Matrix
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Bivariate correlation coefficients (r) between continuous variables (-1.0 to +1.0)
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-center text-xs">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="py-2.5 px-4 text-left font-bold text-slate-400">Variable</th>
                    {correlationData.variables.map((v) => (
                      <th key={v} className="py-2.5 px-3 font-bold text-slate-400">{v}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {correlationData.variables.map((v1) => (
                    <tr key={v1}>
                      <td className="py-3 px-4 text-left font-sans font-semibold text-white">{v1}</td>
                      {correlationData.variables.map((v2) => {
                        const r = correlationData.matrix[v1]?.[v2] ?? 0;
                        const isDiag = v1 === v2;
                        return (
                          <td key={v2} className="py-3 px-3">
                            <span
                              className={`inline-block w-14 rounded py-1 text-xs font-semibold ${
                                isDiag
                                  ? 'bg-slate-800 text-slate-400'
                                  : r > 0.3
                                  ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                                  : r < -0.2
                                  ? 'bg-rose-500/20 text-rose-300'
                                  : 'bg-slate-900 text-slate-400'
                              }`}
                            >
                              {r > 0 && !isDiag ? `+${r}` : r}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: SQL Analysis Section */}
      {activeTab === 'sql-queries' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-indigo-500/30 bg-slate-900/60 p-4">
            <div className="flex items-center gap-2 text-indigo-400 mb-1">
              <Database className="h-4 w-4" />
              <h3 className="text-xs font-bold uppercase tracking-wider">
                SQL Business Intelligence Library (12 Production Queries)
              </h3>
            </div>
            <p className="text-xs text-slate-300">
              Representative SQL queries demonstrating standard CTEs, Window functions (LAG, DENSE_RANK, SUM OVER), subqueries, and grouping techniques used to answer key OTT stakeholder questions.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {SQL_QUERIES.map((q) => (
              <div
                key={q.id}
                className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2 shadow-md"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded bg-indigo-500/20 text-indigo-400 font-mono text-xs font-bold">
                      {q.id}
                    </span>
                    <h4 className="text-sm font-bold text-white">{q.title}</h4>
                    <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300 border border-slate-700 font-mono">
                      {q.complexity}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopySQL(q.id, q.sql)}
                    className="inline-flex items-center gap-1 rounded bg-slate-900 px-2.5 py-1 text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    {copiedQueryId === q.id ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Copy SQL</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-xs text-slate-400 italic">
                  Business Question: {q.question}
                </p>

                <pre className="rounded-lg bg-slate-900 p-3 text-xs text-indigo-200 overflow-x-auto border border-slate-800 font-mono leading-relaxed">
                  {q.sql}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Python / Pandas EDA Workflow Section */}
      {activeTab === 'python-workflow' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-xl border border-indigo-500/30 bg-slate-900/60 p-4">
            <div>
              <div className="flex items-center gap-2 text-indigo-400 mb-1">
                <Terminal className="h-4 w-4" />
                <h3 className="text-xs font-bold uppercase tracking-wider">
                  Python EDA & Data Cleaning Pipeline
                </h3>
              </div>
              <p className="text-xs text-slate-300">
                Production-grade script demonstrating full end-to-end ingestion, audit, normalization, and Matplotlib plotting.
              </p>
            </div>
            <button
              onClick={() => handleCopyPython(PYTHON_CODE)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors cursor-pointer"
            >
              {copiedPython ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Copied Script</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Python Code</span>
                </>
              )}
            </button>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 overflow-x-auto">
            <pre className="text-xs text-slate-300 font-mono leading-relaxed">
              {PYTHON_CODE}
            </pre>
          </div>
        </div>
      )}

      {/* Tab 5: Star Schema Data Model */}
      {activeTab === 'star-schema' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-indigo-500/30 bg-slate-900/60 p-4">
            <div className="flex items-center gap-2 text-indigo-400 mb-1">
              <Layers className="h-4 w-4" />
              <h3 className="text-xs font-bold uppercase tracking-wider">
                Dimensional Data Architecture (Star Schema)
              </h3>
            </div>
            <p className="text-xs text-slate-300">
              Conceptual Kimball-style dimensional architecture structuring raw OTT records into a centralized Fact table surrounded by Conformed Dimension tables.
            </p>
          </div>

          {/* Schema Diagram Cards */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Fact Table Card (Center) */}
            <div className="lg:col-span-1 rounded-xl border-2 border-indigo-500 bg-slate-950 p-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-indigo-500/30 pb-2 mb-3">
                <span className="rounded bg-indigo-600 px-2 py-0.5 text-xs font-bold text-white">
                  FACT TABLE
                </span>
                <span className="font-mono text-xs text-indigo-300">FactContent</span>
              </div>
              <ul className="space-y-1.5 text-xs font-mono text-slate-300">
                <li className="text-indigo-400 font-bold">PK show_id (VARCHAR)</li>
                <li className="text-cyan-400">FK date_key (INT) → DimDate</li>
                <li className="text-cyan-400">FK country_key (INT) → DimCountry</li>
                <li className="text-cyan-400">FK director_key (INT) → DimDirector</li>
                <li className="text-cyan-400">FK platform_key (INT) → DimPlatform</li>
                <li className="pt-2 text-slate-400 border-t border-slate-800">-- Degenerate & Metrics</li>
                <li>type (VARCHAR)</li>
                <li>title (VARCHAR)</li>
                <li>release_year (INT)</li>
                <li>duration_num (INT)</li>
                <li>viewer_rating (DECIMAL)</li>
                <li>votes (INT)</li>
                <li>popularity_score (INT)</li>
                <li>budget (DECIMAL)</li>
                <li>revenue (DECIMAL)</li>
              </ul>
            </div>

            {/* Dimension Tables */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
                  <span className="text-xs font-bold text-cyan-400">DimDate</span>
                  <span className="text-[10px] text-slate-500 font-mono">Dimension</span>
                </div>
                <ul className="space-y-1 text-xs font-mono text-slate-300">
                  <li className="text-indigo-400">PK date_key (INT)</li>
                  <li>full_date (DATE)</li>
                  <li>year (INT)</li>
                  <li>quarter (TINYINT)</li>
                  <li>month (TINYINT)</li>
                  <li>month_name (VARCHAR)</li>
                </ul>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
                  <span className="text-xs font-bold text-emerald-400">DimGenre (Bridge)</span>
                  <span className="text-[10px] text-slate-500 font-mono">Dimension</span>
                </div>
                <ul className="space-y-1 text-xs font-mono text-slate-300">
                  <li className="text-indigo-400">PK genre_key (INT)</li>
                  <li className="text-cyan-400">FK show_id (VARCHAR)</li>
                  <li>genre_name (VARCHAR)</li>
                  <li>genre_tier (VARCHAR)</li>
                </ul>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
                  <span className="text-xs font-bold text-amber-400">DimCountry</span>
                  <span className="text-[10px] text-slate-500 font-mono">Dimension</span>
                </div>
                <ul className="space-y-1 text-xs font-mono text-slate-300">
                  <li className="text-indigo-400">PK country_key (INT)</li>
                  <li>country_name (VARCHAR)</li>
                  <li>geographic_region (VARCHAR)</li>
                  <li>market_maturity (VARCHAR)</li>
                </ul>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
                  <span className="text-xs font-bold text-violet-400">DimDirector</span>
                  <span className="text-[10px] text-slate-500 font-mono">Dimension</span>
                </div>
                <ul className="space-y-1 text-xs font-mono text-slate-300">
                  <li className="text-indigo-400">PK director_key (INT)</li>
                  <li>director_name (VARCHAR)</li>
                  <li>primary_country (VARCHAR)</li>
                  <li>career_start_year (INT)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
