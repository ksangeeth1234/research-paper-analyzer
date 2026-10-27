import React from 'react';
import { X, BookOpen, CheckCircle, FileSpreadsheet, ShieldAlert, Terminal, Layers } from 'lucide-react';
import { SECTOR_DEFINITIONS } from '../types/paper';

interface InstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstructionsModal: React.FC<InstructionsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <BookOpen className="w-5 h-5 text-blue-400" />
            <h2 className="text-base sm:text-lg font-bold">
              Research Paper Analysis &amp; Excel Export System Specifications
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs sm:text-sm text-slate-700">
          {/* Section 1: Objective & Sequential Workflow */}
          <section className="space-y-2">
            <h3 className="font-bold text-slate-900 text-sm flex items-center">
              <Layers className="w-4 h-4 mr-1.5 text-blue-600" />
              1. Objective &amp; Workflow (Target: ~15 Papers)
            </h3>
            <p className="leading-relaxed">
              Upload academic research papers one by one (typically PDF format). For every uploaded paper, the system extracts the title, authors, and 8 standardized research sectors.
            </p>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5 font-mono text-[11px] sm:text-xs">
              <div>1. Upload Paper 01 &rarr; Extract Title &amp; Authors &rarr; Generate 8 Sector Summaries.</div>
              <div>2. Review and edit summaries in the interactive modal &rarr; Confirm and add to Excel.</div>
              <div>3. Upload Paper 02 &rarr; Repeats independently without overwriting Paper 01.</div>
              <div>4. Continue through Paper 15 &rarr; Download one consolidated Excel workbook (.xlsx).</div>
            </div>
          </section>

          {/* Section 2: The Eight Sectors */}
          <section className="space-y-2">
            <h3 className="font-bold text-slate-900 text-sm flex items-center">
              <CheckCircle className="w-4 h-4 mr-1.5 text-emerald-600" />
              2. Predefined Sectors (Exact Order Enforced in Excel)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {SECTOR_DEFINITIONS.map((def, idx) => (
                <div key={def.key} className="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
                  <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                    <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 text-[10px] flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                    <span>{def.label}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 leading-snug">{def.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Section 3: Critical Accuracy Rules */}
          <section className="space-y-2">
            <h3 className="font-bold text-slate-900 text-sm flex items-center">
              <ShieldAlert className="w-4 h-4 mr-1.5 text-amber-600" />
              3. Critical Academic Accuracy Rules
            </h3>
            <ul className="list-disc pl-5 space-y-1 leading-relaxed text-xs">
              <li><strong>Zero Hallucination:</strong> Never invent information not supported by the paper.</li>
              <li><strong>Missing Info Handling:</strong> If a sector is not discussed or cannot be reliably identified, write <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">Not explicitly stated in the paper</code>.</li>
              <li><strong>Inferred Questions:</strong> Explicit questions are extracted verbatim; derived questions are clearly labeled as <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">[Inferred]</code>.</li>
              <li><strong>Preserve Quantitative Metrics:</strong> Exact numerical results (accuracy %, BLEU, F1, p-values, sample size N) are retained.</li>
              <li><strong>Strict Separation:</strong> Do not confuse literature review with the paper's own findings, and never mix data across papers.</li>
            </ul>
          </section>

          {/* Section 4: Excel Formatting Specifications */}
          <section className="space-y-2">
            <h3 className="font-bold text-slate-900 text-sm flex items-center">
              <FileSpreadsheet className="w-4 h-4 mr-1.5 text-blue-600" />
              4. Excel Workbook Structure (.xlsx)
            </h3>
            <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/40 space-y-2 text-xs leading-relaxed">
              <p><strong>Main Sheet:</strong> <code className="font-mono font-semibold">Consolidated Analysis</code> keeps all papers vertically stacked with 3 blank rows separating each paper.</p>
              <p><strong>Per Paper Header:</strong> Row 1: Research Paper Title (bold 13pt blue fill). Row 2: Author(s) (italic 11pt).</p>
              <p><strong>Two Columns:</strong> <code className="font-mono">Sector</code> (width 28, bold, gray fill) and <code className="font-mono">Summary</code> (width 88, text wrapping enabled, thin borders).</p>
              <p><strong>Index Sheet:</strong> <code className="font-mono font-semibold">Paper Index</code> provides an overarching directory of paper numbers, titles, authors, and dates.</p>
            </div>
          </section>

          {/* Section 5: Local Setup & Deployment */}
          <section className="space-y-2">
            <h3 className="font-bold text-slate-900 text-sm flex items-center">
              <Terminal className="w-4 h-4 mr-1.5 text-purple-600" />
              5. Local Setup &amp; Deployment Instructions
            </h3>
            <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-[11px] space-y-2 overflow-x-auto">
              <p className="text-slate-400"># 1. Install dependencies</p>
              <p>npm install</p>
              <p className="text-slate-400"># 2. Configure environment variable in .env</p>
              <p>GEMINI_API_KEY="your-gemini-api-key"</p>
              <p className="text-slate-400"># 3. Run development server (Vite + API Middleware on port 3000)</p>
              <p>npm run dev</p>
              <p className="text-slate-400"># 4. Production build &amp; start</p>
              <p>npm run build</p>
              <p>npm start</p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-800 text-white hover:bg-slate-900 transition"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
