import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Search,
  Filter,
  Download,
  Trash2,
  Layers,
  BookOpen,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Table as TableIcon,
  ListFilter,
} from 'lucide-react';
import { AnalyzedPaper } from '../types/paper';
import { SectorTable } from './SectorTable';

interface WorkbookPreviewProps {
  papers: AnalyzedPaper[];
  onEditPaper: (paper: AnalyzedPaper) => void;
  onDeletePaper: (id: string) => void;
  onDownloadExcel: () => void;
  onResetSample: () => void;
  onClearAll: () => void;
  isDownloading: boolean;
}

export const WorkbookPreview: React.FC<WorkbookPreviewProps> = ({
  papers,
  onEditPaper,
  onDeletePaper,
  onDownloadExcel,
  onResetSample,
  onClearAll,
  isDownloading,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSheet, setActiveSheet] = useState<'consolidated' | 'index'>('consolidated');

  // Filter papers based on search query
  const filteredPapers = papers.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const titleMatch = p.title.toLowerCase().includes(q);
    const authorMatch = p.authors.toLowerCase().includes(q);
    const sectorsMatch = Object.values(p.extractedSectors).some((s) => s.toLowerCase().includes(q));
    return titleMatch || authorMatch || sectorsMatch;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Top Header */}
      <div className="p-5 sm:p-6 border-b border-slate-200 bg-slate-50/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-blue-600 text-white rounded-lg shadow-2xs">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Consolidated Excel Workbook Preview
                </h2>
                <p className="text-xs text-slate-500">
                  All confirmed papers are preserved in a single workbook arranged vertically.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onDownloadExcel}
              disabled={isDownloading || papers.length === 0}
              className={`inline-flex items-center px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition ${
                papers.length === 0
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 active:scale-98'
              }`}
            >
              <Download className="w-4 h-4 mr-1.5" />
              <span>Download Excel (.xlsx)</span>
            </button>

            {papers.length > 0 && (
              <button
                onClick={onClearAll}
                className="inline-flex items-center px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition"
                title="Clear all papers from workbook"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                <span>Clear All</span>
              </button>
            )}
          </div>
        </div>

        {/* Search & Tabs Controls */}
        <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200/60">
          {/* Sheet Selector Tabs (Mimicking Excel Tabs) */}
          <div className="flex items-center space-x-1 bg-slate-200/70 p-1 rounded-xl w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setActiveSheet('consolidated')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition flex-1 sm:flex-none ${
                activeSheet === 'consolidated'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Consolidated Analysis Sheet ({papers.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSheet('index')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition flex-1 sm:flex-none ${
                activeSheet === 'index'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Paper Index Sheet</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, author, sector..."
              className="w-full pl-9 pr-3.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 sm:p-6">
        {papers.length === 0 ? (
          /* Empty State */
          <div className="text-center py-12 px-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-500 mx-auto flex items-center justify-center mb-4 border border-blue-100">
              <Layers className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              No Confirmed Research Papers Yet
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1 mb-6">
              Upload your first research paper PDF above or click below to load the demonstration sample paper to see the exact Excel layout.
            </p>
            <button
              onClick={onResetSample}
              className="inline-flex items-center px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-xs transition"
            >
              <RefreshCw className="w-4 h-4 mr-1.5" />
              Load Sample Demonstration Paper
            </button>
          </div>
        ) : filteredPapers.length === 0 ? (
          /* Search No Results */
          <div className="text-center py-10">
            <p className="text-sm text-slate-600 font-medium">
              No papers found matching "{searchQuery}"
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-2 text-xs text-blue-600 hover:underline font-semibold"
            >
              Clear search filter
            </button>
          </div>
        ) : activeSheet === 'consolidated' ? (
          /* TAB 1: Consolidated Analysis (Vertical Stack) */
          <div>
            <div className="mb-4 flex items-center justify-between text-xs text-slate-500">
              <span>
                Showing {filteredPapers.length} of {papers.length} confirmed paper{papers.length !== 1 ? 's' : ''}
              </span>
              <span className="hidden sm:inline italic">
                Separated with 3 blank rows in the exported Excel workbook
              </span>
            </div>

            {filteredPapers.map((paper, idx) => (
              <SectorTable
                key={paper.id}
                paper={paper}
                onEdit={onEditPaper}
                onDelete={onDeletePaper}
                isOnlyPaper={papers.length === 1}
              />
            ))}
          </div>
        ) : (
          /* TAB 2: Paper Index Table */
          <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-2xs">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-blue-900 text-white font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-3 border-r border-blue-800 w-16 text-center">No.</th>
                  <th className="py-2.5 px-4 border-r border-blue-800 w-64">Research Paper Title</th>
                  <th className="py-2.5 px-4 border-r border-blue-800 w-48">Author(s)</th>
                  <th className="py-2.5 px-4 border-r border-blue-800">Methodology Summary</th>
                  <th className="py-2.5 px-4 border-r border-blue-800">Findings Summary</th>
                  <th className="py-2.5 px-3 text-center w-20">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredPapers.map((paper, idx) => {
                  const isEven = idx % 2 === 0;
                  return (
                    <tr
                      key={paper.id}
                      className={`hover:bg-blue-50/40 transition-colors ${
                        isEven ? 'bg-white' : 'bg-slate-50/60'
                      }`}
                    >
                      <td className="py-3 px-3 text-center font-bold text-slate-700 align-top border-r border-slate-200">
                        P{String(paper.paperNumber).padStart(2, '0')}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900 align-top border-r border-slate-200 leading-snug">
                        {paper.title}
                      </td>
                      <td className="py-3 px-4 text-slate-600 align-top border-r border-slate-200 text-xs italic">
                        {paper.authors}
                      </td>
                      <td className="py-3 px-4 text-slate-700 align-top border-r border-slate-200 text-xs line-clamp-3">
                        {paper.extractedSectors.methodology}
                      </td>
                      <td className="py-3 px-4 text-slate-700 align-top border-r border-slate-200 text-xs line-clamp-3">
                        {paper.extractedSectors.findings}
                      </td>
                      <td className="py-3 px-3 text-center align-top space-y-1">
                        <button
                          onClick={() => onEditPaper(paper)}
                          className="px-2 py-1 text-[11px] font-medium text-blue-600 hover:bg-blue-100 rounded block w-full text-center"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDeletePaper(paper.id)}
                          className="px-2 py-1 text-[11px] font-medium text-rose-600 hover:bg-rose-100 rounded block w-full text-center"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
