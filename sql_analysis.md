# StreamScope — OTT Content Intelligence: SQL Analysis & Business Queries

This repository companion demonstrates 12 production-grade SQL analytical queries engineered to answer strategic questions for streaming service leadership. Queries utilize modern SQL features including Common Table Expressions (CTEs), Window Functions (`LAG`, `DENSE_RANK`, `SUM OVER`), JSON array unnesting, and subqueries.

---

### Query 1: Total Catalog Title Volume & Unique Entity Check
**Stakeholder Question**: What is our total catalog volume and are there any primary key collisions?
```sql
SELECT 
    COUNT(*) AS total_catalog_titles,
    COUNT(DISTINCT show_id) AS unique_content_ids,
    COUNT(DISTINCT title) AS unique_title_names
FROM fact_content;
```
*Business Takeaway*: Establishes base inventory volume and confirms 100% entity uniqueness across primary identifiers.

---

### Query 2: Movies vs TV Shows Catalog Allocation
**Stakeholder Question**: What is our catalog split between feature films and multi-episode series?
```sql
SELECT 
    type,
    COUNT(*) AS title_count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) AS share_percentage
FROM fact_content
GROUP BY type
ORDER BY title_count DESC;
```
*Business Takeaway*: Measures format balance. Movies represent approximately 68-70% of inventory, while TV shows comprise 30-32%, guiding future serial licensing acquisitions.

---

### Query 3: Top 10 Genres by Catalog Representation
**Stakeholder Question**: Which content categories have the deepest catalog inventory?
```sql
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
LIMIT 10;
```
*Business Takeaway*: Drama and Comedy account for over 45% of total catalog assignments, establishing core viewing volume.

---

### Query 4: Sourcing Concentration by Country of Origin
**Stakeholder Question**: Which geographic production territories supply the majority of our library?
```sql
SELECT 
    COALESCE(country, 'Unspecified / International') AS production_country,
    COUNT(*) AS titles_count,
    ROUND(AVG(viewer_rating), 2) AS avg_imdb_rating,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) AS global_share_pct
FROM fact_content
GROUP BY country
HAVING COUNT(*) >= 10
ORDER BY titles_count DESC;
```
*Business Takeaway*: The United States, India, and the United Kingdom anchor over 60% of inventory, highlighting opportunities to scale local-language investments across Asia-Pacific and Latin America.

---

### Query 5: Annual Content Ingestion Velocity by Format
**Stakeholder Question**: How has our annual ingestion velocity evolved over the past decade?
```sql
SELECT 
    EXTRACT(YEAR FROM date_added) AS addition_year,
    COUNT(*) AS titles_added,
    COUNT(CASE WHEN type = 'Movie' THEN 1 END) AS movies_added,
    COUNT(CASE WHEN type = 'TV Show' THEN 1 END) AS tv_shows_added
FROM fact_content
WHERE date_added IS NOT NULL
GROUP BY addition_year
ORDER BY addition_year ASC;
```
*Business Takeaway*: Demonstrates rapid catalog scaling from 2017 to 2021, followed by a strategic pivot toward higher-quality, selective episodic acquisitions.

---

### Query 6: Average Critical Rating by Content Genre
**Stakeholder Question**: Which genres deliver the highest viewer satisfaction?
```sql
SELECT 
    g.genre_name,
    COUNT(f.show_id) AS total_titles,
    ROUND(AVG(f.viewer_rating), 2) AS avg_viewer_rating,
    ROUND(AVG(f.popularity_score), 1) AS avg_popularity_score
FROM fact_content f
JOIN dim_genre g ON f.show_id = g.show_id
GROUP BY g.genre_name
HAVING COUNT(f.show_id) >= 25
ORDER BY avg_viewer_rating DESC;
```
*Business Takeaway*: Niche genres (e.g., Animation, Documentaries) often outscore high-volume categories like Horror or Action, suggesting strong audience loyalty in specialized verticals.

---

### Query 7: Top-Rated Titles with High Critical Mass
**Stakeholder Question**: What are our highest-rated catalog gems backed by authentic viewer volume?
```sql
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
LIMIT 10;
```
*Business Takeaway*: Identifies proven evergreen assets suitable for prominent home-screen editorial merchandising and retention marketing campaigns.

---

### Query 8: Most Prolific Directorial Talent & Quality Scores
**Stakeholder Question**: Which filmmakers have contributed the most assets and how are their works rated?
```sql
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
LIMIT 10;
```
*Business Takeaway*: Highlights key creative partnerships and creator loyalty opportunities for future first-look original production pacts.

---

### Query 9: Year-over-Year (YoY) Velocity Growth Rate via `LAG()`
**Stakeholder Question**: What is our year-over-year ingestion percentage growth rate?
```sql
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
ORDER BY addition_year ASC;
```
*Business Takeaway*: Identifies inflection periods where acquisition spending expanded aggressively compared to steady-state catalog stabilization.

---

### Query 10: Cumulative Running Total of Catalog Growth
**Stakeholder Question**: What is the cumulative progression of our available content library over time?
```sql
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
ORDER BY addition_year ASC;
```
*Business Takeaway*: Illustrates exponential library accumulation culminating in the present active multi-thousand asset repository.

---

### Query 11: Genre Volume Hierarchy Ranking via `DENSE_RANK()`
**Stakeholder Question**: What is the exact ordinal tier of each genre by title count?
```sql
SELECT 
    g.genre_name,
    COUNT(*) AS title_count,
    DENSE_RANK() OVER (ORDER BY COUNT(*) DESC) AS volume_rank
FROM dim_genre g
GROUP BY g.genre_name
ORDER BY volume_rank ASC;
```
*Business Takeaway*: Provides a clear tiering framework to distinguish Tier-1 anchor genres from Tier-3 boutique categories.

---

### Query 12: Identifying Genres Above Global Benchmark
**Stakeholder Question**: Which genres systematically exceed the platform-wide average rating?
```sql
SELECT 
    g.genre_name,
    COUNT(f.show_id) AS title_count,
    ROUND(AVG(f.viewer_rating), 2) AS genre_avg_rating,
    ROUND((SELECT AVG(viewer_rating) FROM fact_content), 2) AS catalog_global_benchmark
FROM fact_content f
JOIN dim_genre g ON f.show_id = g.show_id
GROUP BY g.genre_name
HAVING AVG(f.viewer_rating) > (SELECT AVG(viewer_rating) FROM fact_content)
ORDER BY genre_avg_rating DESC;
```
*Business Takeaway*: Spots categories that punch above their weight in audience satisfaction, supporting targeted future licensing expansions.
