import React, { useState } from 'react';
import {
  Check,
  X,
  AlertTriangle,
  FileCheck2,
  BookOpen,
  Edit3,
  HelpCircle,
  Copy,
  Sparkles,
} from 'lucide-react';
import { PaperDraft, SECTOR_DEFINITIONS, SectorSummary, AnalyzedPaper } from '../types/paper';

interface ReviewModalProps {
  draft: PaperDraft;
  isDuplicate: boolean;
  duplicatePaper: AnalyzedPaper | null;
  paperNumber: number;
  onConfirm: (confirmedDraft: PaperDraft, replaceId?: string) => void;
  onCancel: () => void;
  isSaving: boolean;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  draft,
  isDuplicate,
  duplicatePaper,
  paperNumber,
  onConfirm,
  onCancel,
  isSaving,
}) => {
  const [title, setTitle] = useState(draft.title);
  const [authors, setAuthors] = useState(draft.authors);
  const [sectors, setSectors] = useState<SectorSummary>({ ...draft.extractedSectors });
  const [replaceExisting, setReplaceExisting] = useState(isDuplicate);
  const [activeTab, setActiveTab] = useState<'table' | 'cards'>('table');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleSectorChange = (key: keyof SectorSummary, value: string) => {
    setSectors((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSetNotStated = (key: keyof SectorSummary) => {
    handleSectorChange(key, 'Not explicitly stated in the paper');
  };

  const handleToggleInferred = () => {
    const current = sectors.researchQuestions;
    if (current.includes('[Inferred]')) {
      handleSectorChange('researchQuestions', current.replace(/\[Inferred\]\s*/g, ''));
    } else {
      handleSectorChange('researchQuestions', `[Inferred] ${current}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const confirmedDraft: PaperDraft = {
      ...draft,
      title: title.trim(),
      authors: authors.trim(),
      extractedSectors: sectors,
    };

    const targetReplaceId = isDuplicate && replaceExisting && duplicatePaper ? duplicatePaper.id : undefined;
    onConfirm(confirmedDraft, targetReplaceId);
  };

  const paperNumPadded = String(paperNumber).padStart(2, '0');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
              P{paperNumPadded}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold flex items-center">
                Review &amp; Edit Extracted Information
                <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  Paper {paperNumPadded}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Verify accuracy before adding to the consolidated Excel workbook.
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            disabled={isSaving}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Duplicate Alert Banner */}
        {isDuplicate && duplicatePaper && (
          <div className="px-6 py-3.5 bg-amber-50 border-b border-amber-200 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="flex items-start space-x-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Duplicate Detected:</span> A paper with a matching title or file hash is already in the workbook as{' '}
                <strong className="underline">Paper {String(duplicatePaper.paperNumber).padStart(2, '0')}: "{duplicatePaper.title}"</strong>.
              </div>
            </div>
            <div className="flex items-center space-x-3 text-xs font-semibold self-end sm:self-auto">
              <label className="flex items-center space-x-1.5 cursor-pointer bg-white px-2.5 py-1 rounded-md border border-amber-300">
                <input
                  type="radio"
                  name="duplicateAction"
                  checked={replaceExisting}
                  onChange={() => setReplaceExisting(true)}
                  className="text-blue-600"
                />
                <span>Replace Existing Paper</span>
              </label>
              <label className="flex items-center space-x-1.5 cursor-pointer bg-white px-2.5 py-1 rounded-md border border-amber-300">
                <input
                  type="radio"
                  name="duplicateAction"
                  checked={!replaceExisting}
                  onChange={() => setReplaceExisting(false)}
                  className="text-blue-600"
                />
                <span>Add as New Paper</span>
              </label>
            </div>
          </div>
        )}

        {/* Form Body - Scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Paper Metadata Header Fields */}
          <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200/70 space-y-4">
            <div className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center">
              <BookOpen className="w-4 h-4 mr-1.5 text-blue-600" />
              Paper Header (Displayed directly above Excel Table)
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Research Paper Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Full title of the paper"
                className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Author or Authors <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={authors}
                onChange={(e) => setAuthors(e.target.value)}
                placeholder="Author name or names (e.g. Ashish Vaswani, Noam Shazeer, et al.)"
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span>File: {draft.fileName} ({draft.pageCount || 1} pages)</span>
              <span>All 8 sectors below correspond strictly to the Excel output columns</span>
            </div>
          </div>

          {/* Table vs Card View Toggle */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="font-bold text-slate-900 text-sm flex items-center">
              <FileCheck2 className="w-4 h-4 mr-1.5 text-blue-600" />
              The Eight Predefined Research Sectors
            </h3>
            <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('table')}
                className={`px-2.5 py-1 rounded-md font-medium transition ${
                  activeTab === 'table' ? 'bg-white shadow-2xs text-blue-700' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Excel Table View
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('cards')}
                className={`px-2.5 py-1 rounded-md font-medium transition ${
                  activeTab === 'cards' ? 'bg-white shadow-2xs text-blue-700' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Cards View
              </button>
            </div>
          </div>

          {/* 1. EXCEL TABLE VIEW (Mimicking exact Excel sheet layout) */}
          {activeTab === 'table' ? (
            <div className="border border-slate-300 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-blue-900 text-white text-xs uppercase tracking-wider">
                    <th className="py-2.5 px-4 font-bold w-1/4 sm:w-1/5 border-r border-blue-800">
                      Sector
                    </th>
                    <th className="py-2.5 px-4 font-bold w-3/4 sm:w-4/5">
                      Summary (Editable)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs sm:text-sm">
                  {SECTOR_DEFINITIONS.map((def, idx) => {
                    const value = sectors[def.key] || '';
                    const isEven = idx % 2 === 0;
                    return (
                      <tr key={def.key} className={isEven ? 'bg-white' : 'bg-slate-50/50'}>
                        {/* Sector Name */}
                        <td className="py-3 px-4 align-top font-bold text-slate-900 border-r border-slate-200 bg-slate-100/60">
                          <div className="flex items-center justify-between">
                            <span>{def.label}</span>
                            <span className="text-[10px] text-slate-400 font-normal">#{idx + 1}</span>
                          </div>
                          <p className="text-[11px] font-normal text-slate-500 mt-1 leading-snug">
                            {def.description}
                          </p>
                          {def.key === 'researchQuestions' && (
                            <button
                              type="button"
                              onClick={handleToggleInferred}
                              className="mt-2 text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 font-semibold"
                            >
                              Toggle [Inferred]
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleSetNotStated(def.key)}
                            className="mt-1 text-[10px] text-slate-400 hover:text-slate-600 block"
                          >
                            Set "Not explicitly stated"
                          </button>
                        </td>

                        {/* Summary Editable Area */}
                        <td className="py-2.5 px-3 align-top">
                          <div className="relative">
                            <textarea
                              rows={3}
                              value={value}
                              onChange={(e) => handleSectorChange(def.key, e.target.value)}
                              placeholder={def.placeholder}
                              className="w-full p-2.5 text-xs sm:text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 bg-white"
                            />
                            <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
                              <span>{value.length} characters</span>
                              <button
                                type="button"
                                onClick={() => handleCopy(def.key, value)}
                                className="text-slate-400 hover:text-slate-600 flex items-center space-x-1"
                              >
                                <Copy className="w-3 h-3" />
                                <span>{copiedKey === def.key ? 'Copied' : 'Copy'}</span>
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* 2. CARD VIEW */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SECTOR_DEFINITIONS.map((def, idx) => {
                const value = sectors[def.key] || '';
                return (
                  <div
                    key={def.key}
                    className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs hover:border-blue-300 transition"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900">{def.label}</h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSetNotStated(def.key)}
                        className="text-[11px] text-slate-400 hover:text-slate-600"
                      >
                        Not Stated
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500 mb-2 leading-tight">{def.description}</p>
                    <textarea
                      rows={4}
                      value={value}
                      onChange={(e) => handleSectorChange(def.key, e.target.value)}
                      placeholder={def.placeholder}
                      className="w-full p-2.5 text-xs sm:text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 bg-white"
                    />
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer Actions Inside Form */}
          <div className="pt-4 border-t border-slate-200 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 sticky bottom-0 bg-white py-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSaving}
              className="w-full sm:w-auto px-5 py-2.5 text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              Cancel
            </button>

            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <button
                type="submit"
                disabled={isSaving || !title.trim() || !authors.trim()}
                className={`w-full sm:w-auto inline-flex items-center justify-center px-6 py-2.5 rounded-xl text-sm font-semibold text-white shadow-md transition ${
                  isSaving || !title.trim() || !authors.trim()
                    ? 'bg-slate-300 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20 active:scale-98'
                }`}
              >
                <Check className="w-4 h-4 mr-2" />
                <span>
                  {isSaving
                    ? 'Saving Paper...'
                    : replaceExisting && duplicatePaper
                    ? 'Confirm & Replace in Excel'
                    : `Confirm and Add to Excel (Paper ${paperNumPadded})`}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
