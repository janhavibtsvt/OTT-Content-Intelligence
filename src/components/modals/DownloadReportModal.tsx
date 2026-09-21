import React, { useState } from 'react';
import { X, FileText, Download, CheckCircle2, Sparkles, Sliders, BarChart3, TrendingUp, Layers } from 'lucide-react';
import { ContentRecord, ExecutiveKPIs } from '../../types/content';
import { BusinessInsightItem } from '../common/InsightCard';
import { TrendForecastResult } from '../../calculations/analytics';
import { generateBusinessInsightsPDF, generateBusinessInsightsCSV } from '../../utils/reportExport';

interface DownloadReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: ContentRecord[];
  insights: BusinessInsightItem[];
  kpis: ExecutiveKPIs;
  selectedCategory: string;
  forecastModel: TrendForecastResult | null;
}

export const DownloadReportModal: React.FC<DownloadReportModalProps> = ({
  isOpen,
  onClose,
  records,
  insights,
  kpis,
  selectedCategory,
  forecastModel,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'csv' | 'both'>('pdf');
  const [scopeOption, setScopeOption] = useState<'current' | 'all'>('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const activeInsights = scopeOption === 'all'
    ? insights
    : insights.filter((i) => selectedCategory === 'All' || i.category === selectedCategory);

  const handleDownload = async () => {
    setIsGenerating(true);
    setStatusMessage('Compiling executive data models...');

    try {
      await new Promise((resolve) => setTimeout(resolve, 80));

      const payload = {
        records,
        insights: activeInsights,
        kpis,
        selectedCategory: scopeOption === 'all' ? 'All Strategic Categories' : selectedCategory,
        forecastModel,
      };

      if (selectedFormat === 'pdf' || selectedFormat === 'both') {
        setStatusMessage('Rendering PDF layout and vector typography...');
        generateBusinessInsightsPDF(payload);
      }

      if (selectedFormat === 'csv' || selectedFormat === 'both') {
        setStatusMessage('Exporting CSV datasets...');
        generateBusinessInsightsCSV(payload);
      }

      setStatusMessage('Export completed successfully!');
      setTimeout(() => {
        setIsGenerating(false);
        setStatusMessage(null);
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Failed to export report', err);
      setStatusMessage('Export encountered an error. Please retry.');
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-indigo-950/90 via-slate-900 to-slate-900 p-6 border-b border-slate-800">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-lg bg-slate-800/80 p-1.5 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-indigo-500/40 bg-indigo-500/10 px-2.5 py-0.5 text-xs font-semibold text-indigo-300">
              <Sparkles className="h-3 w-3 text-indigo-400" />
              Executive Reporting Center
            </span>
          </div>

          <h2 className="text-xl font-bold text-white tracking-tight">
            Download Strategic Business Intelligence Report
          </h2>
          <p className="mt-1 text-xs text-slate-400 leading-relaxed">
            Generate board-ready documentation combining portfolio executive KPIs, econometric quality trend forecasts, and strategic commissioning recommendations.
          </p>
        </div>

        <div className="p-6 space-y-5">
          {/* Format Selection Cards */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Select Output Format:
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                onClick={() => setSelectedFormat('pdf')}
                className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedFormat === 'pdf'
                    ? 'border-indigo-500 bg-indigo-950/50 text-white shadow-md'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <FileText className={`h-5 w-5 ${selectedFormat === 'pdf' ? 'text-indigo-400' : 'text-slate-500'}`} />
                  {selectedFormat === 'pdf' && <span className="h-2 w-2 rounded-full bg-indigo-400"></span>}
                </div>
                <span className="text-xs font-bold text-white">PDF Executive Dossier</span>
                <span className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                  Multi-page formatted brief with KPI scorecards & forecast tables
                </span>
              </button>

              <button
                onClick={() => setSelectedFormat('csv')}
                className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedFormat === 'csv'
                    ? 'border-indigo-500 bg-indigo-950/50 text-white shadow-md'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <Download className={`h-5 w-5 ${selectedFormat === 'csv' ? 'text-indigo-400' : 'text-slate-500'}`} />
                  {selectedFormat === 'csv' && <span className="h-2 w-2 rounded-full bg-indigo-400"></span>}
                </div>
                <span className="text-xs font-bold text-white">CSV Data Model</span>
                <span className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                  Spreadsheet-compatible data tables with raw regression points
                </span>
              </button>

              <button
                onClick={() => setSelectedFormat('both')}
                className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedFormat === 'both'
                    ? 'border-emerald-500 bg-emerald-950/50 text-white shadow-md'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <Layers className={`h-5 w-5 ${selectedFormat === 'both' ? 'text-emerald-400' : 'text-slate-500'}`} />
                  {selectedFormat === 'both' && <span className="h-2 w-2 rounded-full bg-emerald-400"></span>}
                </div>
                <span className="text-xs font-bold text-white">Full Package (Both)</span>
                <span className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                  Download both PDF executive brief and raw CSV models simultaneously
                </span>
              </button>
            </div>
          </div>

          {/* Scope Selection */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Report Recommendation Scope:
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setScopeOption('all')}
                className={`flex-1 py-2 px-3 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                  scopeOption === 'all'
                    ? 'border-slate-700 bg-slate-800 text-white font-semibold'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                }`}
              >
                All 5 Strategic Pillars ({insights.length} recommendations)
              </button>
              <button
                onClick={() => setScopeOption('current')}
                className={`flex-1 py-2 px-3 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                  scopeOption === 'current'
                    ? 'border-slate-700 bg-slate-800 text-white font-semibold'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                }`}
              >
                Filtered Category Only ({selectedCategory}: {activeInsights.length} items)
              </button>
            </div>
          </div>

          {/* Report Manifest Summary */}
          <div className="rounded-xl border border-slate-800/80 bg-slate-950/70 p-3.5 space-y-2 text-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Report Manifest Includes:
            </span>
            <div className="grid grid-cols-2 gap-2 text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>{records.length.toLocaleString()} catalog titles analyzed</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>OLS linear quality drift slope</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>{forecastModel ? `${forecastModel.targetForecastYear} target quality horizon` : 'Multi-year forecast model'}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>{activeInsights.length} prioritized recommendations</span>
              </div>
            </div>
          </div>

          {statusMessage && (
            <div className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 p-2.5 text-center text-xs text-indigo-300 animate-pulse">
              {statusMessage}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              disabled={isGenerating}
              className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs font-semibold text-slate-400 hover:bg-slate-900 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              onClick={handleDownload}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:from-indigo-500 hover:to-indigo-600 transition-all cursor-pointer disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              <span>
                {isGenerating
                  ? 'Generating Report...'
                  : selectedFormat === 'both'
                  ? 'Download Both Files'
                  : selectedFormat === 'pdf'
                  ? 'Download PDF Dossier'
                  : 'Export CSV Dataset'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
