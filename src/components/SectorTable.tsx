import React, { useState } from 'react';
import {
  Edit3,
  Trash2,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  Share2,
} from 'lucide-react';
import { AnalyzedPaper, SECTOR_DEFINITIONS } from '../types/paper';

interface SectorTableProps {
  paper: AnalyzedPaper;
  onEdit: (paper: AnalyzedPaper) => void;
  onDelete: (id: string) => void;
  isOnlyPaper?: boolean;
}

export const SectorTable: React.FC<SectorTableProps> = ({
  paper,
  onEdit,
  onDelete,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [copied, setCopied] = useState(false);

  const paperNumPadded = String(paper.paperNumber).padStart(2, '0');

  const handleCopyPaper = () => {
    let text = `Paper ${paperNumPadded}: ${paper.title}\nAuthor(s): ${paper.authors}\n\n`;
    SECTOR_DEFINITIONS.forEach((def) => {
      text += `[${def.label}]\n${paper.extractedSectors[def.key]}\n\n`;
    });
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden transition-all duration-200 hover:shadow-md mb-8">
      {/* 1. PAPER HEADER (First row: Title, Second row: Authors) */}
      <div className="border-b border-blue-200 bg-gradient-to-r from-blue-50/80 via-slate-50 to-white p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-600 text-white shadow-2xs">
                Paper {paperNumPadded}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                {paper.fileName} {paper.pageCount ? `• ${paper.pageCount} pages` : ''}
              </span>
            </div>

            {/* Row 1: Research Paper Title */}
            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              {paper.title}
            </h3>

            {/* Row 2: Author or Authors */}
            <p className="text-xs sm:text-sm font-medium text-blue-900 italic">
              <span className="font-semibold text-slate-700 not-italic">Author(s): </span>
              {paper.authors}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-1.5 self-end sm:self-start">
            <button
              type="button"
              onClick={handleCopyPaper}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
              title="Copy analysis text to clipboard"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={() => onEdit(paper)}
              className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition"
              title="Edit paper information"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(paper.id)}
              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
              title="Remove paper from workbook"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
              title={isCollapsed ? 'Expand table' : 'Collapse table'}
            >
              {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* 2. RESEARCH ANALYSIS TABLE (Exactly 2 columns: Sector | Summary) */}
      {!isCollapsed && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-blue-900 text-white text-xs font-bold uppercase tracking-wider">
                <th className="py-2.5 px-4 w-1/4 sm:w-[240px] border-r border-blue-800">
                  Sector
                </th>
                <th className="py-2.5 px-4 w-3/4 sm:w-auto">
                  Summary
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs sm:text-sm">
              {SECTOR_DEFINITIONS.map((def, idx) => {
                const summaryText = paper.extractedSectors[def.key] || 'Not explicitly stated in the paper';
                const isEven = idx % 2 === 0;
                const isMissing = summaryText.includes('Not explicitly stated');

                return (
                  <tr
                    key={def.key}
                    className={`transition-colors hover:bg-blue-50/30 ${
                      isEven ? 'bg-white' : 'bg-slate-50/60'
                    }`}
                  >
                    {/* Column 1: Sector */}
                    <td className="py-3 px-4 align-top font-semibold text-slate-900 border-r border-slate-200 bg-slate-50/40">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-[10px] font-mono text-slate-400">0{idx + 1}</span>
                        <span className="font-bold text-slate-900">{def.label}</span>
                      </div>
                    </td>

                    {/* Column 2: Summary */}
                    <td className="py-3 px-4 align-top text-slate-700 leading-relaxed whitespace-pre-line">
                      {isMissing ? (
                        <span className="italic text-slate-400">{summaryText}</span>
                      ) : (
                        <span>{summaryText}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
