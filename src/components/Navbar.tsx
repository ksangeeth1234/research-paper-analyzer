import React from 'react';
import { FileSpreadsheet, Download, RefreshCw, BookOpen, Layers, Sparkles } from 'lucide-react';
import { AnalyzedPaper } from '../types/paper';

interface NavbarProps {
  papers: AnalyzedPaper[];
  onDownloadExcel: () => void;
  onDownloadSample: () => void;
  onResetSample: () => void;
  onOpenInstructions: () => void;
  isDownloading: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  papers,
  onDownloadExcel,
  onDownloadSample,
  onResetSample,
  onOpenInstructions,
  isDownloading,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & App Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">ScholarExcel</span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                  <Sparkles className="w-3 h-3 mr-1 text-blue-600" /> Academic Analyzer
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden md:block">
                8-Sector Research Paper Analysis &amp; Single Consolidated Excel Export
              </p>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Paper Count Pill */}
            <div className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>Workbook:</span>
              <span className="font-semibold text-slate-900">{papers.length}</span>
              <span className="text-slate-400">/ 15 target</span>
            </div>

            {/* Guide Button */}
            <button
              onClick={onOpenInstructions}
              className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
              title="View analysis rules and Excel structure instructions"
            >
              <BookOpen className="w-4 h-4 mr-1 text-slate-500" />
              <span className="hidden sm:inline">Guide &amp; Specs</span>
            </button>

            {/* Reset to Sample Demo */}
            <button
              onClick={onResetSample}
              className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
              title="Reset workbook or load sample paper demonstration"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1 text-slate-500" />
              <span className="hidden sm:inline">Sample Demo</span>
            </button>

            {/* Download Sample Excel */}
            <button
              onClick={onDownloadSample}
              className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition"
              title="Download standard demonstration Excel file"
            >
              <Download className="w-3.5 h-3.5 mr-1" />
              <span className="hidden md:inline">Sample .xlsx</span>
            </button>

            {/* Primary Download Consolidated Excel */}
            <button
              onClick={onDownloadExcel}
              disabled={isDownloading || papers.length === 0}
              className={`inline-flex items-center px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold shadow-xs transition ${
                papers.length === 0
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20 active:scale-98'
              }`}
            >
              <Download className={`w-4 h-4 mr-1.5 ${isDownloading ? 'animate-bounce' : ''}`} />
              <span>
                {isDownloading ? 'Generating...' : `Export Excel (${papers.length})`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
