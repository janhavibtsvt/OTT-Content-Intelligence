# StreamScope — OTT Content Intelligence: Data Dictionary

This document details the metadata schema, field classifications, and business rules governing the StreamScope OTT content intelligence dataset (8,650 catalog records).

---

## 1. Schema Overview

| Field Name | Type | Nullable | Domain / Format | Description |
| :--- | :--- | :---: | :--- | :--- |
| `show_id` | String | No | `s[0-9]+` (e.g., `s1042`) | Unique synthetic surrogate primary key identifying each catalog title entity. |
| `type` | Enum | No | `Movie`, `TV Show` | Format categorization indicating whether content is a standalone feature film or episodic series. |
| `title` | String | No | Text string | Official release name of the content asset. |
| `director` | String | Yes | Person Name | Primary credited film director or principal television showrunner. |
| `cast` | String | Yes | Comma-delimited text | Principal billed actors and ensemble cast members. |
| `country` | String | Yes | ISO Country Name | Primary country of origin or principal financing production territory. |
| `date_added` | Date | Yes | `YYYY-MM-DD` | Date the asset was ingested and made available on the streaming service. |
| `year_added` | Integer | Yes | `2015` – `2024` | Dimensional temporal key: Calendar year content was onboarded to the platform. |
| `release_year` | Integer | No | `1970` – `2024` | Official premiere or theatrical release year. |
| `rating` | Enum | Yes | `TV-MA`, `TV-14`, `R`, `PG-13`, `TV-PG`, `PG`, `TV-G` | Maturity certification (MPAA or TV Parental Guidelines). |
| `duration` | String | No | e.g., `104 min`, `3 Seasons` | Text display duration including measurement unit. |
| `duration_num` | Integer | No | Numeric integer | Parsed duration metric (Minutes for Movies; Total Seasons for TV Shows). |
| `duration_unit` | Enum | No | `min`, `Season` | Unit of duration measurement corresponding to `duration_num`. |
| `listed_in` | String | No | Comma-delimited text | Raw string of assigned genre taxonomies. |
| `genres` | Array | No | String array | Parsed 1NF collection of assigned genres for indexing and multi-tag filtering. |
| `description` | String | No | Narrative text | Synopsis summarizing the primary narrative arc or premise. |
| `language` | String | No | Language Name | Original audio track language (e.g., `English`, `Korean`, `Spanish`, `Hindi`). |
| `platform` | Enum | No | `StreamScope Originals`, `Licensed Partner` | Rights attribution tier (first-party commissioned vs third-party syndicated). |
| `popularity_score` | Integer | No | `1` – `100` | Normalized algorithmic traction index measuring trailing 30-day view velocity. |
| `viewer_rating` | Decimal | No | `1.0` – `10.0` | Weighted IMDb audience critical reception score. |
| `votes` | Integer | No | Numeric count | Total authenticated user reviews submitted. |
| `budget` | Decimal | Yes | Currency ($ USD) | Estimated or simulated production budget (clearly labeled synthetic demo metric). |
| `revenue` | Decimal | Yes | Currency ($ USD) | Estimated platform lifetime gross attribution (clearly labeled synthetic demo metric). |
| `roi_percentage` | Decimal | Yes | Percentage (`%`) | Gross return on production budget: `((revenue - budget) / budget) * 100`. |
| `content_status` | Enum | No | `Active`, `Archived`, `Expiring Soon` | Catalog licensing lifecycle state. |

---

## 2. Business Rules & Integrity Constraints

1. **Primary Key Integrity**: Every `show_id` is unique and sequentially indexed.
2. **Missing Director Semantics**: In syndicated TV series feeds, directors are often uncredited at the series level; these records default to `'Uncredited'`.
3. **Format Duration Distinction**:
   - `type = 'Movie'`: `duration_unit` is strictly `'min'`, with runtimes ranging between 45 and 210 minutes.
   - `type = 'TV Show'`: `duration_unit` is strictly `'Season'`, with series ranging between 1 and 12 seasons.
4. **Maturity Rating Standards**: Titles lacking explicit advisory classifications are flagged as `'Unrated'`.
5. **Synthetic Financial Disclaimer**: Budget, Revenue, and ROI fields are modeled purely for exploratory Data Analyst portfolio demonstrations and reflect synthetic simulation economics.
