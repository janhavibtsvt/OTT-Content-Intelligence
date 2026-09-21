import React, { useState, useMemo } from 'react';
import { ContentRecord } from '../../types/content';
import { ChartCard } from '../common/ChartCard';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle,
  Download,
} from 'lucide-react';

interface ContentPerformanceForecastProps {
  records: ContentRecord[];
}

type FormatFilter = 'All' | 'Movie' | 'TV Show';
type WindowFilter = '2000' | '2010' | 'all';

export const ContentPerformanceForecast: React.FC<ContentPerformanceForecastProps> = ({ records }) => {
  const [formatFilter, setFormatFilter] = useState<FormatFilter>('All');
  const [windowFilter, setWindowFilter] = useState<WindowFilter>('2000');
  const [horizonYears, setHorizonYears] = useState<number>(4);

  // 1. Group records by release year and compute yearly aggregates
  const forecastModel = useMemo(() => {
    // Filter by format
    const filteredRecords = records.filter((r) => {
      if (formatFilter !== 'All' && r.type !== formatFilter) return false;
      return true;
    });

    const yearMap: Record<number, { sum: number; count: number; ratings: number[] }> = {};

    for (const r of filteredRecords) {
      const year = r.release_year;
      if (!year || isNaN(year)) continue;
      if (!yearMap[year]) {
        yearMap[year] = { sum: 0, count: 0, ratings: [] };
      }
      yearMap[year].sum += r.viewer_rating;
      yearMap[year].count += 1;
      yearMap[year].ratings.push(r.viewer_rating);
    }

    // Determine historical window
    const allYears = Object.keys(yearMap)
      .map(Number)
      .sort((a, b) => a - b);

    if (allYears.length < 3) {
      return null;
    }

    const minYearAllowed =
      windowFilter === '2010' ? 2010 : windowFilter === '2000' ? 2000 : allYears[0];

    // Select valid historical years with adequate sample size (>= 3 titles)
    const historicalYears = allYears.filter((y) => y >= minYearAllowed && yearMap[y].count >= 3);

    if (historicalYears.length < 3) {
      return null;
    }

    const maxHistoricalYear = historicalYears[historicalYears.length - 1];

    // Prepare (x, y) coordinates for Ordinary Least Squares (OLS) Linear Regression
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

    // OLS Slope (m) and Intercept (b): y = m*x + b
    const slope = ssXX !== 0 ? ssXY / ssXX : 0;
    const intercept = meanY - slope * meanX;

    // R-squared (Coefficient of Determination)
    const rSquared = ssXX * ssYY > 0 ? (ssXY * ssXY) / (ssXX * ssYY) : 0;

    // Standard Error of Estimate (Se)
    let sumResidualSq = 0;
    for (const p of points) {
      const yHat = slope * p.year + intercept;
      const res = p.avgRating - yHat;
      sumResidualSq += res * res;
    }
    const standardError = N > 2 ? Math.sqrt(sumResidualSq / (N - 2)) : 0.15;

    // Generate continuous dataset for chart (Historical + Future Projection)
    const chartData: Array<{
      year: number;
      actualRating?: number | null;
      trendLine: number;
      forecastRating?: number | null;
      upperBound?: number | null;
      lowerBound?: number | null;
      corridorRange?: [number, number] | null;
      titleCount?: number | null;
      isForecast: boolean;
    }> = [];

    // Historical Points
    for (const p of points) {
      const trendVal = Number((slope * p.year + intercept).toFixed(2));
      const isAnchorYear = p.year === maxHistoricalYear;

      chartData.push({
        year: p.year,
        actualRating: Number(p.avgRating.toFixed(2)),
        trendLine: trendVal,
        // Anchor the forecast line to the latest historical point so there is no disjoint gap
        forecastRating: isAnchorYear ? Number(p.avgRating.toFixed(2)) : null,
        upperBound: isAnchorYear ? Number(p.avgRating.toFixed(2)) : null,
        lowerBound: isAnchorYear ? Number(p.avgRating.toFixed(2)) : null,
        corridorRange: isAnchorYear ? [Number(p.avgRating.toFixed(2)), Number(p.avgRating.toFixed(2))] : null,
        titleCount: p.count,
        isForecast: false,
      });
    }

    // Extrapolate Forecast Points into Future Years
    for (let offset = 1; offset <= horizonYears; offset++) {
      const forecastYear = maxHistoricalYear + offset;
      const projected = slope * forecastYear + intercept;

      // Expanding standard error prediction interval
      const margin = 1.28 * standardError * Math.sqrt(1 + 1 / N + Math.pow(forecastYear - meanX, 2) / (ssXX || 1));
      const upper = Math.min(9.8, projected + margin);
      const lower = Math.max(4.0, projected - margin);

      chartData.push({
        year: forecastYear,
        actualRating: null,
        trendLine: Number(projected.toFixed(2)),
        forecastRating: Number(projected.toFixed(2)),
        upperBound: Number(upper.toFixed(2)),
        lowerBound: Number(lower.toFixed(2)),
        corridorRange: [Number(lower.toFixed(2)), Number(upper.toFixed(2))],
        titleCount: null,
        isForecast: true,
      });
    }

    const targetForecastYear = maxHistoricalYear + horizonYears;
    const targetForecastPoint = chartData.find((d) => d.year === targetForecastYear);

    return {
      chartData,
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
  }, [records, formatFilter, windowFilter, horizonYears]);

  if (!forecastModel) {
    return null;
  }

  const {
    chartData,
    slope,
    rSquared,
    meanHistoricalRating,
    maxHistoricalYear,
    targetForecastYear,
    targetRating,
    targetLower,
    targetUpper,
    totalTitlesSampled,
  } = forecastModel;

  const isPositiveDrift = slope >= 0;
  const annualizedDelta = slope; // delta per year

  const handleExportTrendData = () => {
    if (!forecastModel) return;
    const now = new Date().toISOString().split('T')[0];
    const filename = `streamscope_trendline_forecast_${formatFilter.toLowerCase()}_${now}.csv`;

    const rows = [
      `"================================================================================"`,
      `"STREAMSCOPE QUALITY TRENDLINE & PREDICTIVE FORECAST MODEL"`,
      `"================================================================================"`,
      `"Format Scope",${formatFilter}`,
      `"Baseline Window",${windowFilter === 'all' ? 'Full Archive' : windowFilter + '+'}`,
      `"Projection Horizon",+${horizonYears} Years (Target Vintage: ${forecastModel.targetForecastYear})`,
      `"Regression Slope (Annual Drift)",${forecastModel.slope >= 0 ? '+' : ''}${forecastModel.slope.toFixed(4)} stars/year`,
      `"R-Squared Fit",${(forecastModel.rSquared * 100).toFixed(2)}%`,
      `"Standard Error",${forecastModel.standardError.toFixed(3)} stars`,
      `"Target Predicted Rating",${forecastModel.targetRating.toFixed(2)} stars (Range: ${forecastModel.targetLower.toFixed(2)} - ${forecastModel.targetUpper.toFixed(2)})`,
      `""`,
      `"Year","Data Type","Observed Rating","OLS Trendline","80% Confidence Lower","80% Confidence Upper","Sample Titles"`,
      ...forecastModel.chartData.map((d) => {
        const type = d.isForecast ? 'Forecast Projection' : 'Historical Actual';
        const actual = d.actualRating !== null && d.actualRating !== undefined ? d.actualRating : '';
        const trend = d.trendLine !== null && d.trendLine !== undefined ? d.trendLine : '';
        const lower = d.lowerBound !== null && d.lowerBound !== undefined ? d.lowerBound : '';
        const upper = d.upperBound !== null && d.upperBound !== undefined ? d.upperBound : '';
        const count = d.titleCount !== null && d.titleCount !== undefined ? d.titleCount : '';
        return `${d.year},"${type}",${actual},${trend},${lower},${upper},${count}`;
      }),
    ];

    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <ChartCard
      id="content-performance-forecast-chart"
      title="Content Performance & Quality Trendline Forecast"
      subtitle="Historical release_year vs viewer_rating ordinary least squares (OLS) regression modeling with multi-year performance projection corridors"
      badge="Predictive Intelligence"
      actions={
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Export Trend CSV */}
          <button
            onClick={handleExportTrendData}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition-colors cursor-pointer"
            title="Export trendline data table to CSV"
          >
            <Download className="h-3.5 w-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Export Trend Data</span>
          </button>

          {/* Format Toggle */}
          <div className="flex items-center rounded-lg border border-slate-800 bg-slate-950 p-0.5">
            {(['All', 'Movie', 'TV Show'] as FormatFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFormatFilter(f)}
                className={`rounded-md px-2.5 py-1 font-medium transition-colors cursor-pointer ${
                  formatFilter === f
                    ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {f === 'All' ? 'All Formats' : f === 'Movie' ? 'Movies' : 'TV Shows'}
              </button>
            ))}
          </div>

          {/* Historical Window */}
          <div className="hidden sm:flex items-center rounded-lg border border-slate-800 bg-slate-950 p-0.5">
            <span className="px-2 text-[10px] text-slate-500 font-mono">Baseline:</span>
            {[
              { id: '2010', label: '2010+' },
              { id: '2000', label: '2000+' },
              { id: 'all', label: 'Full Archive' },
            ].map((w) => (
              <button
                key={w.id}
                onClick={() => setWindowFilter(w.id as WindowFilter)}
                className={`rounded-md px-2 py-1 text-[11px] transition-colors cursor-pointer ${
                  windowFilter === w.id
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {w.label}
              </button>
            ))}
          </div>

          {/* Horizon Selector */}
          <div className="flex items-center rounded-lg border border-slate-800 bg-slate-950 p-0.5">
            <span className="px-2 text-[10px] text-slate-500 font-mono">Horizon:</span>
            {[3, 4, 5].map((h) => (
              <button
                key={h}
                onClick={() => setHorizonYears(h)}
                className={`rounded-md px-2 py-1 text-[11px] font-mono transition-colors cursor-pointer ${
                  horizonYears === h
                    ? 'bg-emerald-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                +{h}y
              </button>
            ))}
          </div>
        </div>
      }
      footer={
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-200">Historical Quality Velocity:</span>
              <p className="text-slate-400 mt-0.5 leading-relaxed">
                Catalog content exhibits a {isPositiveDrift ? 'steady upward' : 'slight downward'} drift of{' '}
                <span className={`font-semibold ${isPositiveDrift ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {isPositiveDrift ? '+' : ''}
                  {(annualizedDelta * 10).toFixed(2)}★ per decade
                </span>
                . Recent acquisitions prioritize critical acclaim over sheer volumetric library padding.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-200">Target Commissioning Hurdle:</span>
              <p className="text-slate-400 mt-0.5 leading-relaxed">
                To maintain competitive catalog trajectory into {targetForecastYear}, greenlight commissions must target a minimum quality threshold of{' '}
                <span className="font-semibold text-emerald-300 font-mono">
                  {targetRating.toFixed(2)}★
                </span>{' '}
                (Expected band: {targetLower.toFixed(2)}★ – {targetUpper.toFixed(2)}★).
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-200">Portfolio Governance Takeaway:</span>
              <p className="text-slate-400 mt-0.5 leading-relaxed">
                High-volume licensing from 2018–2022 produced rating variance. The predictive trendline suggests prioritizing curated flagship IP rather than speculative tier-3 aggregations.
              </p>
            </div>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Statistical KPI Scorecards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
            <span className="text-[11px] font-medium text-slate-400 block">Historical Baseline</span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-white font-mono">
                {meanHistoricalRating.toFixed(2)}★
              </span>
              <span className="text-[10px] text-slate-500">
                ({totalTitlesSampled.toLocaleString()} titles)
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
            <span className="text-[11px] font-medium text-slate-400 block">Annualized Trend Velocity</span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span
                className={`text-xl font-bold font-mono ${
                  isPositiveDrift ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {isPositiveDrift ? '+' : ''}
                {(slope * 1).toFixed(3)}★
              </span>
              <span className="text-[10px] text-slate-500">/ year</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
            <span className="text-[11px] font-medium text-slate-400 block">Model Fit (R² Score)</span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-indigo-400 font-mono">
                {(rSquared * 100).toFixed(1)}%
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                (R²={rSquared.toFixed(2)})
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-emerald-900/40 bg-emerald-950/20 p-3">
            <span className="text-[11px] font-medium text-emerald-400 block">
              {targetForecastYear} Projected Rating
            </span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-emerald-300 font-mono">
                {targetRating.toFixed(2)}★
              </span>
              <span className="text-[10px] text-emerald-500/80 font-mono">
                [{targetLower.toFixed(1)}–{targetUpper.toFixed(1)}]
              </span>
            </div>
          </div>
        </div>

        {/* Chart Visualization */}
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 15, right: 25, left: -10, bottom: 5 }}
            >
              <defs>
                {/* Gradient for forecast confidence corridor */}
                <linearGradient id="forecastCorridorGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#34d399" stopOpacity={0.02} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />

              <XAxis
                dataKey="year"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickLine={{ stroke: '#334155' }}
              />

              <YAxis
                stroke="#64748b"
                domain={['auto', 'auto']}
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickLine={{ stroke: '#334155' }}
                tickFormatter={(val) => `${val.toFixed(1)}★`}
              />

              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload || !payload.length) return null;
                  const data = payload[0].payload;
                  const isF = data.isForecast;

                  return (
                    <div className="rounded-xl border border-slate-700 bg-slate-900/95 p-3.5 shadow-2xl backdrop-blur-md text-xs font-sans">
                      <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-2 mb-2">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                          <span className="font-bold text-white text-sm">{label} Vintage</span>
                        </div>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                            isF
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                              : 'bg-indigo-950 text-indigo-300 border border-indigo-800/60'
                          }`}
                        >
                          {isF ? 'Forecast Projection' : 'Historical Actual'}
                        </span>
                      </div>

                      <div className="space-y-1.5 font-mono">
                        {data.actualRating !== null && data.actualRating !== undefined && (
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-slate-400">Actual Avg Rating:</span>
                            <span className="font-bold text-indigo-300 text-sm">
                              {data.actualRating}★
                            </span>
                          </div>
                        )}

                        <div className="flex items-center justify-between gap-4">
                          <span className="text-slate-400">OLS Regression Fit:</span>
                          <span className="font-semibold text-slate-300">
                            {data.trendLine}★
                          </span>
                        </div>

                        {isF && data.forecastRating !== null && (
                          <>
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-emerald-400 font-semibold">Forecasted Score:</span>
                              <span className="font-bold text-emerald-300 text-sm">
                                {data.forecastRating}★
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-4 text-[11px] text-slate-400">
                              <span>80% Confidence Band:</span>
                              <span className="text-slate-300">
                                {data.lowerBound}★ – {data.upperBound}★
                              </span>
                            </div>
                          </>
                        )}

                        {data.titleCount && (
                          <div className="flex items-center justify-between gap-4 text-[11px] pt-1 border-t border-slate-800 text-slate-400">
                            <span>Sample Size:</span>
                            <span className="text-white font-sans">{data.titleCount} titles</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }}
              />

              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: '12px', fontSize: '11px' }}
                iconType="circle"
              />

              {/* Dividing vertical reference line between historical data and forecast projection */}
              <ReferenceLine
                x={maxHistoricalYear}
                stroke="#6366f1"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: 'Forecast Boundary',
                  fill: '#818cf8',
                  fontSize: 10,
                  position: 'insideTopLeft',
                }}
              />

              {/* Prestige benchmark horizontal line at 7.0★ */}
              <ReferenceLine
                y={7.0}
                stroke="#eab308"
                strokeDasharray="3 3"
                strokeOpacity={0.6}
                label={{
                  value: 'Prestige Hurdle 7.0★',
                  fill: '#eab308',
                  fontSize: 10,
                  position: 'insideBottomRight',
                }}
              />

              {/* Area corridor for forecast range */}
              <Area
                type="monotone"
                dataKey="upperBound"
                stroke="none"
                fill="url(#forecastCorridorGrad)"
                name="Confidence Corridor"
              />

              {/* Historical actual ratings line */}
              <Line
                type="monotone"
                dataKey="actualRating"
                name="Historical Actual Rating"
                stroke="#818cf8"
                strokeWidth={2.5}
                dot={{ r: 3.5, fill: '#818cf8', strokeWidth: 1, stroke: '#1e1b4b' }}
                activeDot={{ r: 6, fill: '#a5b4fc', stroke: '#312e81', strokeWidth: 2 }}
                connectNulls={false}
              />

              {/* Linear Regression Trendline */}
              <Line
                type="linear"
                dataKey="trendLine"
                name="Linear OLS Trendline"
                stroke="#64748b"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
                activeDot={false}
              />

              {/* Forecast Projection Line */}
              <Line
                type="linear"
                dataKey="forecastRating"
                name="Predictive Forecast"
                stroke="#34d399"
                strokeWidth={2.5}
                strokeDasharray="5 5"
                dot={{ r: 4, fill: '#34d399', strokeWidth: 1.5, stroke: '#064e3b' }}
                activeDot={{ r: 6, fill: '#6ee7b7', stroke: '#064e3b', strokeWidth: 2 }}
                connectNulls={true}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </ChartCard>
  );
};
