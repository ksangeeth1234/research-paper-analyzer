import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { UploadSection } from './components/UploadSection';
import { ReviewModal } from './components/ReviewModal';
import { WorkbookPreview } from './components/WorkbookPreview';
import { InstructionsModal } from './components/InstructionsModal';
import { AnalyzedPaper, PaperDraft } from './types/paper';
import { CheckCircle2, AlertCircle, Info, Sparkles, BookOpen, Layers } from 'lucide-react';

export default function App() {
  const [papers, setPapers] = useState<AnalyzedPaper[]>([]);
  const [isLoadingPapers, setIsLoadingPapers] = useState(true);
  const [draft, setDraft] = useState<PaperDraft | null>(null);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [duplicatePaper, setDuplicatePaper] = useState<AnalyzedPaper | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzingStep, setAnalyzingStep] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'info'; message: string } | null>(null);

  // Load existing confirmed papers from server on mount
  useEffect(() => {
    fetchPapers();
  }, []);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 4500);
  };

  const fetchPapers = async () => {
    try {
      setIsLoadingPapers(true);
      const res = await fetch('/api/papers');
      if (!res.ok) {
        console.warn('Papers endpoint returned non-200 status:', res.status);
        return;
      }
      const text = await res.text();
      try {
        const data = JSON.parse(text);
        if (data.success && Array.isArray(data.papers)) {
          setPapers(data.papers);
        }
      } catch {
        console.warn('Could not parse papers response as JSON');
      }
    } catch (err: any) {
      console.error('Error loading papers:', err);
    } finally {
      setIsLoadingPapers(false);
    }
  };

  // Helper to read file as Base64 for resilient fallback transmission
  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.includes(',') ? result.split(',')[1] : result;
        resolve(base64);
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  // Upload & Analyze a research paper with multi-layer resilience
  const handleAnalyze = async (file?: File, manualText?: string, fileName?: string) => {
    try {
      setIsAnalyzing(true);
      setErrorMessage(null);
      setAnalyzingStep('Reading document and preparing extraction payload...');

      let response: Response | null = null;

      if (file) {
        setAnalyzingStep(`Parsing PDF "${file.name}" and extracting document structure...`);
        
        // Attempt 1: Multipart FormData upload
        try {
          const formData = new FormData();
          formData.append('pdfFile', file);
          formData.append('fileName', file.name);

          setAnalyzingStep('Synthesizing research intelligence with Academic Analysis Engine...');
          response = await fetch('/api/analyze-paper', {
            method: 'POST',
            body: formData,
          });
        } catch (uploadErr) {
          console.warn('Multipart upload failed, trying Base64 JSON fallback:', uploadErr);
        }

        // Attempt 2: If multipart failed (e.g. iframe proxy boundary issue), send as base64 JSON
        if (!response || !response.ok) {
          try {
            setAnalyzingStep('Encoding PDF payload for resilient transmission...');
            const base64 = await readFileAsBase64(file);
            response = await fetch('/api/analyze-paper', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                pdfBase64: base64,
                fileName: file.name,
              }),
            });
          } catch (b64Err) {
            console.error('Base64 transmission error:', b64Err);
          }
        }
      } else {
        setAnalyzingStep('Analyzing academic text with Academic Analysis Engine...');
        response = await fetch('/api/analyze-paper', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            extractedText: manualText,
            fileName: fileName || 'paper.txt',
          }),
        });
      }

      if (!response) {
        throw new Error('Could not establish connection with analysis service. Please check your network and retry.');
      }

      setAnalyzingStep('Structuring the 8 predefined sectors and verifying accuracy rules...');
      
      const responseText = await response.text();
      let data: any;
      try {
        data = JSON.parse(responseText);
      } catch (parseErr) {
        console.error('Non-JSON response received:', responseText.slice(0, 300));
        throw new Error(`Server returned an unexpected response (Status ${response.status}). Please retry.`);
      }

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to analyze the research paper.');
      }

      setDraft(data.draft);
      setIsDuplicate(data.isDuplicate);
      setDuplicatePaper(data.duplicatePaper || null);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setErrorMessage(err.message || 'An error occurred during paper extraction.');
    } finally {
      setIsAnalyzing(false);
      setAnalyzingStep('');
    }
  };

  // Confirm and Save Paper to Excel
  const handleConfirmPaper = async (confirmedDraft: PaperDraft, replaceId?: string) => {
    try {
      setIsSaving(true);
      const res = await fetch('/api/papers/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...confirmedDraft,
          replaceId,
        }),
      });

      const text = await res.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`Invalid response saving paper (Status ${res.status}).`);
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save paper to workbook.');
      }

      setPapers(data.papers);
      setDraft(null);
      setIsDuplicate(false);
      setDuplicatePaper(null);

      const paperNum = data.paper?.paperNumber ? `Paper ${String(data.paper.paperNumber).padStart(2, '0')}` : 'Paper';
      if (data.isUpdate) {
        showToast(`${paperNum} updated successfully in the Excel workbook!`, 'success');
      } else {
        showToast(`${paperNum}: "${data.paper?.title}" added to the Excel workbook! (Total: ${data.totalPapers})`, 'success');
      }
    } catch (err: any) {
      console.error('Save error:', err);
      setErrorMessage(err.message || 'Failed to save confirmed paper.');
    } finally {
      setIsSaving(false);
    }
  };

  // Edit existing paper from workbook
  const handleEditPaper = (paper: AnalyzedPaper) => {
    setDraft({
      title: paper.title,
      authors: paper.authors,
      fileName: paper.fileName,
      fileHash: paper.fileHash,
      fileSizeBytes: paper.fileSizeBytes,
      pageCount: paper.pageCount,
      extractedSectors: { ...paper.extractedSectors },
    });
    setIsDuplicate(true);
    setDuplicatePaper(paper);
  };

  // Delete paper from workbook
  const handleDeletePaper = async (id: string) => {
    const target = papers.find((p) => p.id === id);
    const confirmDelete = window.confirm(`Remove "${target?.title || 'this paper'}" from the Excel workbook?`);
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/papers/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setPapers(data.papers);
        showToast('Paper removed from workbook. Remaining papers renumbered.', 'info');
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  // Reset to single sample demo paper
  const handleResetSample = async () => {
    try {
      const res = await fetch('/api/papers/reset-sample', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setPapers(data.papers);
        showToast('Workbook initialized with sample demonstration paper.', 'info');
      }
    } catch (err) {
      console.error('Reset error:', err);
    }
  };

  // Clear all papers
  const handleClearAll = async () => {
    const confirmClear = window.confirm('Are you sure you want to clear all papers from the workbook?');
    if (!confirmClear) return;

    try {
      const res = await fetch('/api/papers/clear', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setPapers([]);
        showToast('All papers cleared from workbook.', 'info');
      }
    } catch (err) {
      console.error('Clear error:', err);
    }
  };

  // Download Consolidated Excel Workbook (.xlsx)
  const handleDownloadExcel = async () => {
    try {
      setIsDownloading(true);
      const res = await fetch('/api/export-excel');
      if (!res.ok) throw new Error('Failed to generate Excel export.');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Research_Paper_Analysis_Consolidated_${papers.length}_Papers.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast('Consolidated Excel workbook downloaded successfully!', 'success');
    } catch (err: any) {
      console.error('Download error:', err);
      alert('Error downloading Excel file: ' + err.message);
    } finally {
      setIsDownloading(false);
    }
  };

  // Download Sample Demonstration Excel
  const handleDownloadSample = async () => {
    try {
      const res = await fetch('/api/export-sample');
      if (!res.ok) throw new Error('Failed to generate sample demonstration Excel.');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Sample_Research_Paper_Analysis_Demonstration.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast('Sample demonstration Excel file downloaded!', 'info');
    } catch (err: any) {
      console.error('Sample download error:', err);
      alert('Error downloading sample Excel: ' + err.message);
    }
  };

  const nextPaperNumber = papers.length > 0 ? Math.max(...papers.map((p) => p.paperNumber || 0)) + 1 : 1;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        papers={papers}
        onDownloadExcel={handleDownloadExcel}
        onDownloadSample={handleDownloadSample}
        onResetSample={handleResetSample}
        onOpenInstructions={() => setIsInstructionsOpen(true)}
        isDownloading={isDownloading}
      />

      {/* Toast Notification Banner */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-40 max-w-md p-4 rounded-xl shadow-xl bg-slate-900 text-white flex items-center space-x-3 border border-slate-700 animate-slideUp">
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          ) : (
            <Info className="w-5 h-5 text-blue-400 flex-shrink-0" />
          )}
          <span className="text-xs sm:text-sm font-medium">{notification.message}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Hero Banner / Instructions Teaser */}
        <div className="mb-6 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 sm:p-7 shadow-md relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-3 border border-blue-400/20">
              <Sparkles className="w-3.5 h-3.5 mr-1 text-blue-300" />
              Consolidated Excel Export System
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight">
              Academic Research Paper Analysis
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
              Upload papers one at a time (up to 15+). The system extracts title, authors, and 8 standardized research sectors into an editable review table. Confirmed papers accumulate into a single consolidated Excel workbook without overwriting previous analyses.
            </p>

            {/* Quick Stats Badges */}
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-white/10 text-slate-200">
                <Layers className="w-3.5 h-3.5 text-blue-300" />
                <span>Confirmed Papers: <strong>{papers.length}</strong></span>
              </div>
              <div className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-white/10 text-slate-200">
                <BookOpen className="w-3.5 h-3.5 text-blue-300" />
                <span>8 Standardized Sectors</span>
              </div>
              <div className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-white/10 text-slate-200">
                <span>Excel Layout: <strong>Consolidated Single Worksheet</strong></span>
              </div>
            </div>
          </div>

          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute right-20 top-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* 1. Upload & Analysis Area */}
        <UploadSection
          onAnalyze={handleAnalyze}
          isAnalyzing={isAnalyzing}
          analyzingStep={analyzingStep}
          errorMessage={errorMessage}
          onClearError={() => setErrorMessage(null)}
          nextPaperNumber={nextPaperNumber}
        />

        {/* 2. Consolidated Excel Workbook Preview */}
        <WorkbookPreview
          papers={papers}
          onEditPaper={handleEditPaper}
          onDeletePaper={handleDeletePaper}
          onDownloadExcel={handleDownloadExcel}
          onResetSample={handleResetSample}
          onClearAll={handleClearAll}
          isDownloading={isDownloading}
        />
      </main>

      {/* Review & Edit Modal */}
      {draft && (
        <ReviewModal
          draft={draft}
          isDuplicate={isDuplicate}
          duplicatePaper={duplicatePaper}
          paperNumber={duplicatePaper?.paperNumber || nextPaperNumber}
          onConfirm={handleConfirmPaper}
          onCancel={() => {
            setDraft(null);
            setIsDuplicate(false);
            setDuplicatePaper(null);
          }}
          isSaving={isSaving}
        />
      )}

      {/* Guide & Technical Specifications Modal */}
      <InstructionsModal
        isOpen={isInstructionsOpen}
        onClose={() => setIsInstructionsOpen(false)}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            Research Paper Analysis &amp; Consolidated Excel Export System • Academic Analysis Engine
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsInstructionsOpen(true)}
              className="text-blue-600 hover:underline"
            >
              System Specs &amp; Rules
            </button>
            <button
              onClick={handleDownloadSample}
              className="text-indigo-600 hover:underline"
            >
              Download Sample .xlsx
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
