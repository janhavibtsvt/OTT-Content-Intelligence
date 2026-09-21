# StreamScope — OTT Content Intelligence

> **A Portfolio-Grade Business Intelligence & Data Analytics Web Application**  
> Built for entertainment and streaming executives to explore catalog composition, content velocity, audience reception, and geographic sourcing across 8,650 titles.

[![React](https://img.shields.io/badge/React-18.3-61dafb.svg?style=flat&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178c6.svg?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38bdf8.svg?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646cff.svg?style=flat&logo=vite)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📌 Executive Summary

**StreamScope** is a fictional Over-The-Top (OTT) content intelligence platform engineered to demonstrate the real-world analytical skills of a **Data Analyst / BI Specialist**.

Unlike basic demo dashboards that display static placeholder mockups, StreamScope is powered by an in-memory synthetic dataset of **8,650 realistic catalog records** that accurately mirror standard streaming metadata schemas (e.g., Netflix, Disney+, Amazon Prime Video). Every KPI, chart, summary statistic, correlation coefficient, and tabular record recalculates dynamically in real time as filters are toggled.

---

## 🚀 Key Functional Modules & Pages

1. **Executive Overview**: High-level KPI scorecard (Total Titles, Format Ratios, Average Rating, Vintage, Runtimes, Synthetic Budget & Revenue ROI), automated strategic highlights, and multi-dimensional catalog composition charts.
2. **Content Trends**: Longitudinal analysis of catalog growth (2015–2024), YoY percentage change, format expansion trajectories, and average feature movie runtime trends over time.
3. **Genre Analytics**: Volume breakdown across 14 genres, catalog penetration shares, critical ratings benchmarked against global platform medians, and a volume vs. reception positioning matrix.
4. **Audience & Ratings**: IMDb score distributions, audience votes vs. critical reception vs. popularity 3-axis scatter analysis, rating trends across release years, and prestige benchmark assets.
5. **Geography & Sourcing**: Territorial distribution across 50+ sovereign hubs, domestic (US) vs. international split, regional clustering, and country-level genre affinity.
6. **Directors & Creators**: Profile directory of leading filmmakers and showrunners, career timeline spans, prolificacy rankings, and individual director filmography dossiers.
7. **Content Explorer**: Production data grid featuring full-text search, multi-column sorting, column visibility toggles, pagination, dynamic filtering, and raw CSV export.
8. **Strategic Business Insights**: Data-informed recommendations organized into 5 core strategy categories (*Content, Genre, Geographic, Audience, Portfolio*), structured using the **Finding → Impact → Recommendation** methodology.
9. **Analyst Toolkit**:
   - **Data Quality Audit**: Nullity tracking, duplicate detection, and ETL cleaning protocol.
   - **EDA & Summary Statistics**: Five-number summary (Mean, StdDev, Min, Q1, Median, Q3, Max) and Pearson Correlation Matrix.
   - **SQL Business Questions**: 12 production-grade queries featuring CTEs, Window functions (`LAG`, `DENSE_RANK`, `SUM OVER`), JSON unnesting, and subqueries with one-click copy.
   - **Python/Pandas Workflow**: Complete runnable script for ingestion, cleaning, feature engineering, and Matplotlib/Seaborn visualization.
   - **Star Schema Data Model**: Formal Kimball-style dimensional architecture diagram (FactContent surrounded by DimDate, DimGenre, DimCountry, DimDirector, DimPlatform).

---

## 🛠️ Technology Stack

- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom design system tokens
- **Data Visualization**: Recharts (Area, Bar, Line, Scatter, Pie/Donut)
- **Icons**: Lucide React
- **Build Tool**: Vite 6
- **Architecture**: 100% Client-Side Analytics Engine (Zero external paid APIs, zero backend database costs, fully deployable to free static hosts like Vercel, Netlify, or GitHub Pages)

---

## 📊 Dataset Specification

- **Total Records**: 8,650 titles
- **Attributes per Record**: 25 fields including `show_id`, `type`, `title`, `director`, `cast`, `country`, `date_added`, `release_year`, `rating`, `duration`, `duration_num`, `genres`, `language`, `popularity_score`, `viewer_rating`, `votes`, `budget`, `revenue`, `roi_percentage`, `content_status`.
- **Financial Metric Disclaimer**: Budget, revenue, and ROI metrics are modeled for business analytics demonstration and clearly tagged as synthetic.

---

## 🏃 Local Setup & Development

```bash
# 1. Clone the repository
git clone https://github.com/your-username/streamscope-ott-analytics.git
cd streamscope-ott-analytics

# 2. Install dependencies
npm install

# 3. Run development server
npm run dev

# 4. Build production distribution
npm run build
```

Open `http://localhost:3000` to interact with the application.

---

## 📁 Repository Documentation

- [`data_dictionary.md`](./data_dictionary.md): Comprehensive schema dictionary, data types, domains, and business definitions.
- [`sql_analysis.md`](./sql_analysis.md): 12 business queries with problem statements, SQL code, and business takeaways.
- [`python_eda.md`](./python_eda.md): End-to-end Python/Pandas exploratory data analysis and visualization pipeline.
- [`business_insights.md`](./business_insights.md): Strategic recommendations for streaming executives formatted in Finding / Impact / Recommendation structure.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
