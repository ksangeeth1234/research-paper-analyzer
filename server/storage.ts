import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { AnalyzedPaper } from '../src/types/paper';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'papers.json');

export const SAMPLE_PAPER: AnalyzedPaper = {
  id: 'paper-sample-01',
  paperNumber: 1,
  title: 'Attention Is All You Need',
  authors: 'Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan N. Gomez, Łukasz Kaiser, Illia Polosukhin',
  fileName: 'attention-is-all-you-need-sample.pdf',
  fileHash: 'sha256-sample-attention-hash-01',
  fileSizeBytes: 2214300,
  pageCount: 15,
  createdAt: new Date().toISOString(),
  status: 'confirmed',
  notes: 'Demonstration paper showing exact 8-sector extraction layout',
  extractedSectors: {
    researchProblem:
      'Dominant sequence transduction models (RNNs, LSTMs, and GRUs) inherently compute sequentially along the symbol positions of input and output sequences. This inherent sequential nature precludes parallelization within training examples, becoming critical at longer sequence lengths where memory constraints limit batching across examples.',
    researchObjective:
      'To eschew recurrence and convolutions entirely and propose a novel network architecture called the Transformer, based solely on attention mechanisms to draw global dependencies between input and output representations.',
    researchQuestions:
      '[Inferred] Can sequence transduction models achieve state-of-the-art translation quality without recurrent or convolutional neural network layers? [Inferred] Does relying entirely on multi-head self-attention significantly improve training parallelization and reduce training time?',
    methodology:
      'The authors designed the Transformer model using stacked self-attention and point-wise, fully connected layers for both encoder and decoder. Key components include Scaled Dot-Product Attention, Multi-Head Attention (with 8 parallel attention heads), Sinusoidal Positional Encodings to preserve token order, and residual connections with layer normalization around each sub-layer. Training used the Adam optimizer with scheduled learning rate warmup and label smoothing (0.1).',
    datasetParticipants:
      'Evaluated on two benchmark machine translation datasets: WMT 2014 English-to-German (consisting of about 4.5 million sentence pairs) and WMT 2014 English-to-French (consisting of 36 million sentence pairs). Byte-Pair Encoding (BPE) was used with shared vocabularies of approximately 37,000 and 32,000 tokens respectively.',
    findings:
      'On the WMT 2014 English-to-German task, the Transformer (big) established a new state-of-the-art BLEU score of 28.4, improving by over 2.0 BLEU points over previous leading models including ensembles. On WMT 2014 English-to-French, it achieved 41.8 BLEU with a training cost of 3.5 days on 8 P100 GPUs (a fraction of prior computational costs).',
    limitations:
      'Authors acknowledged that computational complexity of self-attention per layer is O(n² · d) with respect to sequence length n, which becomes memory-intensive for extremely long sequence contexts. The model also requires fixed positional encodings rather than learned dynamic recurrence.',
    futureWorks:
      'Authors planned to extend the Transformer to problems involving input and output modalities other than text (such as images, audio, and video), investigate local, restricted attention mechanisms to handle very large inputs efficiently, and explore less sequential generation schemes for the decoder.',
  },
};

function ensureDataFile(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify([SAMPLE_PAPER], null, 2), 'utf-8');
    }
  } catch (err) {
    console.error('Error ensuring data file:', err);
  }
}

export function getAllPapers(): AnalyzedPaper[] {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read papers.json:', err);
    return [];
  }
}

export function saveAllPapers(papers: AnalyzedPaper[]): void {
  ensureDataFile();
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(papers, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write papers.json:', err);
  }
}

export function findDuplicatePaper(title: string, fileHash?: string): AnalyzedPaper | null {
  const papers = getAllPapers();
  const normalizedTitle = title.trim().toLowerCase();

  return (
    papers.find((p) => {
      if (fileHash && p.fileHash && p.fileHash === fileHash) {
        return true;
      }
      return p.title.trim().toLowerCase() === normalizedTitle;
    }) || null
  );
}

export function addOrReplacePaper(
  paper: Omit<AnalyzedPaper, 'paperNumber'> & { paperNumber?: number },
  replaceId?: string
): { paper: AnalyzedPaper; isUpdate: boolean } {
  let papers = getAllPapers();
  let targetIndex = -1;

  if (replaceId) {
    targetIndex = papers.findIndex((p) => p.id === replaceId);
  } else {
    targetIndex = papers.findIndex(
      (p) =>
        p.id === paper.id ||
        (paper.fileHash && p.fileHash === paper.fileHash) ||
        p.title.trim().toLowerCase() === paper.title.trim().toLowerCase()
    );
  }

  if (targetIndex >= 0) {
    const existing = papers[targetIndex];
    const updatedPaper: AnalyzedPaper = {
      ...paper,
      id: existing.id,
      paperNumber: existing.paperNumber,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
      status: 'confirmed',
    };
    papers[targetIndex] = updatedPaper;
    saveAllPapers(papers);
    return { paper: updatedPaper, isUpdate: true };
  } else {
    const nextNumber = papers.length > 0 ? Math.max(...papers.map((p) => p.paperNumber || 0)) + 1 : 1;
    const newPaper: AnalyzedPaper = {
      ...paper,
      id: paper.id || `paper-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      paperNumber: nextNumber,
      createdAt: new Date().toISOString(),
      status: 'confirmed',
    };
    papers.push(newPaper);
    saveAllPapers(papers);
    return { paper: newPaper, isUpdate: false };
  }
}

export function updatePaper(id: string, updates: Partial<AnalyzedPaper>): AnalyzedPaper | null {
  const papers = getAllPapers();
  const index = papers.findIndex((p) => p.id === id);
  if (index === -1) return null;

  papers[index] = {
    ...papers[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  saveAllPapers(papers);
  return papers[index];
}

export function deletePaper(id: string): boolean {
  let papers = getAllPapers();
  const initialLength = papers.length;
  papers = papers.filter((p) => p.id !== id);

  if (papers.length !== initialLength) {
    papers.forEach((p, idx) => {
      p.paperNumber = idx + 1;
    });
    saveAllPapers(papers);
    return true;
  }
  return false;
}

export function resetToSample(): AnalyzedPaper[] {
  ensureDataFile();
  const sampleList = [SAMPLE_PAPER];
  saveAllPapers(sampleList);
  return sampleList;
}

export function clearAllPapers(): void {
  ensureDataFile();
  saveAllPapers([]);
}

export function computeFileHash(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}
