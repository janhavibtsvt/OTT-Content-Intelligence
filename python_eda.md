# StreamScope — OTT Content Intelligence: Python EDA & Data Cleaning Workflow

This workflow represents the end-to-end Python/Pandas Data Analyst pipeline used to audit, clean, and analyze the StreamScope OTT catalog.

---

## 1. Environment & Dependencies
```python
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

plt.style.use('dark_background')
sns.set_theme(style="darkgrid")
```

---

## 2. Ingestion & Schema Inspection
```python
# Load raw dataset
df = pd.read_csv("streamscope_ott_content.csv")

print(f"Dataset Shape: {df.shape[0]} rows, {df.shape[1]} columns")
print(df.info())
print(df.head(3))
```

---

## 3. Data Quality Audit & Handling Missing Values
```python
# Null value summary
null_summary = pd.DataFrame({
    'Missing_Values': df.isnull().sum(),
    'Percentage': (df.isnull().sum() / len(df) * 100).round(2)
})
print("Missing Data Audit:\n", null_summary[null_summary['Missing_Values'] > 0])

# Imputation Strategy
df['director'] = df['director'].fillna('Uncredited')
df['country'] = df['country'].fillna('International / Unspecified')
df['rating'] = df['rating'].fillna('Unrated')
```

---

## 4. Date Standardization & Feature Engineering
```python
# Convert to datetime and derive temporal keys
df['date_added'] = pd.to_datetime(df['date_added'], errors='coerce')
df['year_added'] = df['date_added'].dt.year
df['month_added'] = df['date_added'].dt.month

# Duration extraction (minutes for movies, seasons for TV shows)
def parse_duration(row):
    text = str(row['duration'])
    digits = ''.join(c for c in text if c.isdigit())
    val = int(digits) if digits else 0
    unit = 'Season' if 'Season' in text else 'min'
    return pd.Series([val, unit], index=['duration_num', 'duration_unit'])

df[['duration_num', 'duration_unit']] = df.apply(parse_duration, axis=1)
```

---

## 5. Genre Array Decomposition
```python
# Splitting comma-separated genres into 1NF lists
df['genres_list'] = df['listed_in'].apply(
    lambda x: [g.strip() for g in str(x).split(',')] if pd.notnull(x) else []
)

# Unnesting for categorical distribution
exploded_genres = df.explode('genres_list')
print("Top 5 Genres by Frequency:\n", exploded_genres['genres_list'].value_counts().head(5))
```

---

## 6. Descriptive Statistics & Five-Number Summary
```python
continuous_vars = ['viewer_rating', 'votes', 'release_year', 'popularity_score', 'duration_num']
stats_df = df[continuous_vars].describe().T[['mean', 'std', 'min', '25%', '50%', '75%', 'max']]
print("Descriptive Statistics:\n", stats_df.round(2))
```

---

## 7. Automated Visualization Output
```python
fig, axes = plt.subplots(2, 2, figsize=(14, 10))

# 1. Rating Distribution
sns.histplot(df['viewer_rating'], kde=True, ax=axes[0, 0], color='#6366f1', bins=25)
axes[0, 0].set_title('IMDb Viewer Rating Distribution', fontweight='bold')

# 2. Content Type Split
df['type'].value_counts().plot.pie(ax=axes[0, 1], autopct='%1.1f%%', colors=['#6366f1', '#06b6d4'])
axes[0, 1].set_ylabel('')
axes[0, 1].set_title('Movies vs TV Shows Catalog Split', fontweight='bold')

# 3. Top Sourcing Territories
top_countries = df['country'].value_counts().head(8)
sns.barplot(x=top_countries.values, y=top_countries.index, ax=axes[1, 0], palette='mako')
axes[1, 0].set_title('Top Content Production Countries', fontweight='bold')

# 4. Ingestion Velocity by Year
annual_counts = df['year_added'].value_counts().sort_index()
axes[1, 1].plot(annual_counts.index, annual_counts.values, marker='o', color='#10b981', linewidth=2.5)
axes[1, 1].set_title('Annual Catalog Growth Cadence', fontweight='bold')

plt.tight_layout()
plt.savefig("streamscope_python_eda.png", dpi=300)
```
