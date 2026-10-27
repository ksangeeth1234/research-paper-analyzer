import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Sparkles,
  FileCode,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';

interface UploadSectionProps {
  onAnalyze: (file?: File, manualText?: string, fileName?: string) => Promise<void>;
  isAnalyzing: boolean;
  analyzingStep: string;
  errorMessage: string | null;
  onClearError: () => void;
  nextPaperNumber: number;
}

// Built-in academic samples for one-click testing convenience
const QUICK_TEST_PAPERS = [
  {
    name: 'Deep Residual Learning for Image Recognition (ResNet)',
    fileName: 'resnet_he_et_al_2016.pdf',
    text: `Deep Residual Learning for Image Recognition
Kaiming He, Xiangyu Zhang, Shaoqing Ren, Jian Sun (Microsoft Research)

Abstract:
Deeper neural networks are more difficult to train. We present a residual learning framework to ease the training of networks that are substantially deeper than those used previously. We explicitly reformulate the layers as learning residual functions with reference to the layer inputs, instead of learning unreferenced functions. We provide comprehensive empirical evidence showing that these residual networks are easier to optimize, and can gain accuracy from considerably increased depth.

1. Introduction & Research Problem:
Deep convolutional neural networks have led to a series of breakthroughs for image classification. However, driven by the significance of depth, an obstacle has arisen: the degradation problem. When deeper networks start converging, accuracy gets saturated and then degrades rapidly. Unexpectedly, such degradation is not caused by overfitting; adding more layers to a suitably deep model leads to higher training error, revealing that not all systems are similarly easy to optimize.

2. Research Objectives:
Our primary objective is to address the degradation problem by introducing a deep residual learning framework, enabling the effective training of neural networks with 100 to over 1000 layers, and demonstrating improved accuracy across standard vision benchmarks.

3. Methodology:
Instead of hoping every few stacked layers directly fit a desired underlying mapping H(x), we explicitly let these layers approximate a residual mapping F(x) := H(x) - x. The original mapping is recast into F(x) + x. The formulation F(x) + x can be realized by feedforward neural networks with "shortcut connections" that perform identity mapping. The identity shortcut connections introduce neither extra parameters nor computation complexity. The entire network can still be trained end-to-end by SGD with backpropagation using standard libraries without modifying the solvers. We designed and evaluated network depths of 18, 34, 50, 101, and 152 layers.

4. Dataset and Experimental Setup:
Evaluated on the ImageNet 2012 classification dataset consisting of 1.28 million training images and 50,000 validation images across 1,000 classes, and the CIFAR-10 dataset (50,000 training, 10,000 testing images in 10 categories). Additional localization and detection experiments were performed on MS COCO (80k train, 40k val) and PASCAL VOC 2007/2012.

5. Findings:
On ImageNet, our 152-layer residual network is the deepest network ever presented while having lower computational complexity than VGG-16/19. An ensemble of these residual nets achieved a 3.57% top-5 error on the ImageNet test set, winning 1st place in the ILSVRC 2015 classification competition. On CIFAR-10, we successfully trained networks with over 1000 layers. The identity shortcuts effectively eliminated optimization degradation.

6. Limitations:
The authors noted that when depth was pushed beyond 1000 layers (e.g., 1202 layers), although the training error remained similarly low, the test error was 7.93%, which is higher than the 110-layer network (6.43%), attributable to overfitting on the relatively small CIFAR-10 dataset without aggressive regularization.

7. Future Work:
Future work suggested exploring the residual framework for broader vision tasks including semantic segmentation, instance segmentation, object detection, and adapting residual connections to non-vision sequence domains.`,
  },
  {
    name: 'BERT: Pre-training of Deep Bidirectional Transformers',
    fileName: 'bert_devlin_et_al_2018.pdf',
    text: `BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding
Jacob Devlin, Ming-Wei Chang, Kenton Lee, Kristina Toutanova (Google AI Language)

Abstract:
We introduce a new language representation model called BERT (Bidirectional Encoder Representations from Transformers). Unlike recent language representation models, BERT is designed to pre-train deep bidirectional representations from unlabeled text by jointly conditioning on both left and right context in all layers. As a result, the pre-trained BERT model can be fine-tuned with just one additional output layer to create state-of-the-art models for a wide range of tasks, such as question answering and language inference, without substantial task-specific architecture modifications.

1. Research Problem:
Standard language models are strictly unidirectional (left-to-right or right-to-left), severely limiting the choice of architectures during pre-training. Such restrictions are sub-optimal for sentence-level tasks and catastrophic when applied to token-level tasks such as question answering, where capturing context from both directions simultaneously is crucial.

2. Research Objective:
To eliminate unidirectionality constraints by proposing a masked language model (MLM) pre-training objective that enables pre-trained representations to fuse bidirectional context across all layers, and to prove that a unified pre-trained model can achieve state-of-the-art results across eleven diverse NLP benchmarks with minimal fine-tuning.

3. Methodology:
BERT relies on the multi-layer bidirectional Transformer encoder based on the original Transformer architecture. Pre-training uses two novel unsupervised objectives:
(1) Masked Language Model (MLM): randomly masking 15% of input tokens and predicting only the masked words;
(2) Next Sentence Prediction (NSP): binarized pre-training objective that predicts whether Sentence B is the actual subsequent sentence following Sentence A.
Fine-tuning is straightforward: all parameters of BERT and task-specific classification layers are trained end-to-end.

4. Datasets / Corpus:
Pre-training corpus composed of the BooksCorpus (800M words) and English Wikipedia (2,500M words, text passages only). Evaluated on 11 benchmark tasks: GLUE benchmark (MNLI, QQP, QNLI, SST-2, CoLA, STS-B, MRPC, RTE), SQuAD v1.1 and v2.0 (Stanford Question Answering Dataset with 100,000+ QA pairs), and SWAG (Situations With Adversarial Generations, 113k sentence-pair examples).

5. Findings:
BERT obtains new state-of-the-art results across 11 natural language processing tasks. On GLUE, BERT_LARGE achieves a score of 80.5% (an absolute improvement of 7.7% over previous best). On SQuAD v1.1, BERT achieves 93.2 F1 score, outperforming human performance (91.2 F1). Ablation experiments confirm that bidirectional context and the NSP objective are critical to achieving these high scores.

6. Limitations:
A drawback acknowledged by the authors is the mismatch between pre-training and fine-tuning because the [MASK] token does not appear during fine-tuning. The computational cost is also high (BERT_LARGE pre-training took 4 days on 64 TPU chips), and MLM converges slower than left-to-right models because only 15% of tokens are predicted per batch.

7. Future Works:
The authors suggest investigating broader cross-lingual representations, reducing the computational footprint of pre-training, and exploring joint multi-task fine-tuning paradigms.`,
  },
];

export const UploadSection: React.FC<UploadSectionProps> = ({
  onAnalyze,
  isAnalyzing,
  analyzingStep,
  errorMessage,
  onClearError,
  nextPaperNumber,
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [textMode, setTextMode] = useState(false);
  const [manualTitle, setManualTitle] = useState('');
  const [manualText, setManualText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        setSelectedFile(file);
        onClearError();
      } else {
        alert('Please select an academic research paper in PDF format.');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      onClearError();
    }
  };

  const handleStartAnalysis = async () => {
    if (textMode) {
      if (!manualText.trim()) return;
      await onAnalyze(undefined, manualText, manualTitle || 'pasted_research_paper.txt');
    } else {
      if (!selectedFile) return;
      await onAnalyze(selectedFile);
    }
  };

  const handleLoadSamplePaper = (paper: (typeof QUICK_TEST_PAPERS)[0]) => {
    setTextMode(true);
    setManualTitle(paper.name);
    setManualText(paper.text);
    onClearError();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 mb-8 transition">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-slate-100 gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
            {String(nextPaperNumber).padStart(2, '0')}
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center">
              Upload Next Research Paper
              <span className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                Paper {String(nextPaperNumber).padStart(2, '0')}
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Each paper is analyzed independently and extracted across 8 standardized research sectors.
            </p>
          </div>
        </div>

        {/* Mode Toggle & Sample helper */}
        <div className="flex items-center space-x-2 text-xs">
          <button
            type="button"
            onClick={() => {
              setTextMode(false);
              onClearError();
            }}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              !textMode ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            PDF Upload
          </button>
          <button
            type="button"
            onClick={() => {
              setTextMode(true);
              onClearError();
            }}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              textMode ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Paste Text
          </button>
        </div>
      </div>

      {/* Error Alert with Retry */}
      {errorMessage && (
        <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start space-x-3 text-red-700 animate-fadeIn">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
          <div className="flex-1 text-xs sm:text-sm">
            <span className="font-semibold block mb-0.5">Extraction Issue:</span>
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={handleStartAnalysis}
            className="px-3 py-1 bg-red-600 text-white hover:bg-red-700 rounded-lg text-xs font-medium transition"
          >
            Retry
          </button>
        </div>
      )}

      {/* Upload Box: Drag and Drop */}
      {!textMode ? (
        <div>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-xl p-8 sm:p-10 text-center cursor-pointer transition-all duration-200 ${
              dragOver
                ? 'border-blue-500 bg-blue-50/70 scale-[1.01]'
                : selectedFile
                ? 'border-emerald-400 bg-emerald-50/30'
                : 'border-slate-300 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/20'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />

            {selectedFile ? (
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm sm:text-base break-all">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to analyze
                  </p>
                </div>
                <p className="text-xs text-blue-600 font-medium">Click to select a different paper</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm sm:text-base">
                    Drag and drop your research paper PDF here
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    or click to browse from your computer (PDF up to 45 MB)
                  </p>
                </div>
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-white border border-slate-200 text-xs text-slate-600 shadow-2xs">
                  <FileText className="w-3.5 h-3.5 mr-1.5 text-blue-500" /> Supports multi-page &amp; scanned academic papers
                </div>
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-500 flex items-center">
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
              <span>Analyzing Paper {String(nextPaperNumber).padStart(2, '0')} independently</span>
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto">
              {selectedFile && (
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  disabled={isAnalyzing}
                  className="px-3.5 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 border border-slate-200 transition"
                >
                  Clear File
                </button>
              )}
              <button
                type="button"
                onClick={handleStartAnalysis}
                disabled={!selectedFile || isAnalyzing}
                className={`w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-xs transition ${
                  !selectedFile || isAnalyzing
                    ? 'bg-slate-300 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/25 active:scale-98'
                }`}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span>Analyzing Paper...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    <span>Analyze Paper {String(nextPaperNumber).padStart(2, '0')}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Text Paste Alternative Mode */
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Research Paper Title (Optional, AI will also extract from text)
            </label>
            <input
              type="text"
              value={manualTitle}
              onChange={(e) => setManualTitle(e.target.value)}
              placeholder="e.g. Deep Residual Learning for Image Recognition"
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Paper Content (Abstract, Introduction, Methodology, Results, Discussion)
            </label>
            <textarea
              rows={8}
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              placeholder="Paste research paper full text or main sections here..."
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono text-slate-800 bg-white"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <span className="text-xs text-slate-500">
              {manualText.length > 0 ? `${manualText.length} characters entered` : 'Supports long academic texts'}
            </span>

            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleStartAnalysis}
                disabled={!manualText.trim() || isAnalyzing}
                className={`w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-xs transition ${
                  !manualText.trim() || isAnalyzing
                    ? 'bg-slate-300 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/25 active:scale-98'
                }`}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span>Analyzing Text...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    <span>Analyze Paper Content</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Test Demo Papers Picker (Super convenient for testing without manual PDF upload) */}
      <div className="mt-6 pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2.5">
          <span className="font-semibold text-slate-700 flex items-center">
            <FileCode className="w-3.5 h-3.5 mr-1 text-indigo-600" />
            Quick Test Academic Papers (Click to load sample):
          </span>
          <span className="text-[11px] text-slate-400">Convenient for fast verification</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {QUICK_TEST_PAPERS.map((paper, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleLoadSamplePaper(paper)}
              className="text-left p-2.5 rounded-lg border border-slate-200 hover:border-indigo-300 bg-slate-50/50 hover:bg-indigo-50/40 text-xs transition group"
            >
              <div className="font-medium text-slate-800 group-hover:text-indigo-700 truncate">
                {paper.name}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5 flex items-center">
                <span>{paper.fileName}</span>
                <ArrowRight className="w-3 h-3 ml-1 text-slate-400 group-hover:text-indigo-600 inline opacity-0 group-hover:opacity-100 transition" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Animated Analyzing Status Overlay */}
      {isAnalyzing && (
        <div className="mt-6 p-5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 animate-pulse">
          <div className="flex items-center space-x-3 mb-2">
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            <h3 className="font-bold text-sm text-slate-900">
              Analyzing Research Paper with Gemini AI...
            </h3>
          </div>
          <p className="text-xs text-slate-600 ml-8 mb-3">
            {analyzingStep || 'Reading multi-page layout and extracting research intelligence...'}
          </p>

          <div className="ml-8 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-500">
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
              <span>Title &amp; Authors</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
              <span>8 Predefined Sectors</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
              <span>Accuracy &amp; Inferences</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
              <span>Review Table Prep</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
