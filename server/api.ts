import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { parsePdfBuffer } from './pdf-util';
import { analyzePaperContent } from './gemini-analyzer';
import {
  getAllPapers,
  addOrReplacePaper,
  updatePaper,
  deletePaper,
  findDuplicatePaper,
  computeFileHash,
  resetToSample,
  clearAllPapers,
  SAMPLE_PAPER,
} from './storage';
import { generateWorkbook } from './excel-generator';
import { AnalyzedPaper, PaperDraft } from '../src/types/paper';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB max
  },
});

export const apiRouter = express.Router();

// Parse JSON & URL-encoded bodies
apiRouter.use(express.json({ limit: '50mb' }));
apiRouter.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 1. Get all confirmed papers
apiRouter.get('/papers', (req: Request, res: Response) => {
  try {
    const papers = getAllPapers();
    res.json({ success: true, papers });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Helper middleware for upload to catch multer errors cleanly as JSON
const handleMulterUpload = (req: Request, res: Response, next: NextFunction) => {
  upload.single('pdfFile')(req, res, (err: any) => {
    if (err) {
      console.error('Multer file upload error:', err);
      return res.status(400).json({
        success: false,
        error: `File upload error: ${err.message || 'Could not process PDF file.'}`,
      });
    }
    next();
  });
};

// 2. Analyze uploaded PDF paper
apiRouter.post('/analyze-paper', handleMulterUpload, async (req: Request, res: Response) => {
  try {
    let pdfBuffer: Buffer | undefined;
    let fileName = 'uploaded_paper.pdf';
    let fileSizeBytes = 0;
    let fileHash: string | undefined;
    let manualText = req.body?.extractedText as string | undefined;

    if (req.file) {
      pdfBuffer = req.file.buffer;
      fileName = req.file.originalname || fileName;
      fileSizeBytes = req.file.size;
      fileHash = computeFileHash(pdfBuffer);
    } else if (req.body?.pdfBase64) {
      pdfBuffer = Buffer.from(req.body.pdfBase64, 'base64');
      fileName = req.body.fileName || fileName;
      fileSizeBytes = pdfBuffer.length;
      fileHash = computeFileHash(pdfBuffer);
    }

    if (!pdfBuffer && (!manualText || manualText.trim().length === 0)) {
      res.status(400).json({
        success: false,
        error: 'No PDF file or text content provided. Please upload an academic paper PDF or paste text.',
      });
      return;
    }

    let parsedPdfText = '';
    let pageCount = 1;

    if (pdfBuffer) {
      const pdfParseResult = await parsePdfBuffer(pdfBuffer);
      parsedPdfText = pdfParseResult.text;
      pageCount = pdfParseResult.numpages;
    }

    const combinedText = manualText || parsedPdfText;

    // Run paper analysis
    const analysis = await analyzePaperContent({
      pdfBuffer,
      pdfBase64: pdfBuffer ? pdfBuffer.toString('base64') : undefined,
      extractedText: combinedText,
      fileName,
    });

    const draft: PaperDraft = {
      title: analysis.title,
      authors: analysis.authors,
      fileName,
      fileHash,
      fileSizeBytes,
      extractedSectors: analysis.extractedSectors,
      pageCount: analysis.pageCount || pageCount,
      rawTextSnippet: combinedText ? combinedText.slice(0, 1000) : '',
    };

    // Check for duplicate against confirmed papers
    const duplicate = findDuplicatePaper(analysis.title, fileHash);

    res.json({
      success: true,
      draft,
      isDuplicate: !!duplicate,
      duplicatePaper: duplicate,
    });
  } catch (err: any) {
    console.error('Error analyzing paper:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'An unexpected error occurred while analyzing the paper.',
    });
  }
});

// 3. Confirm and Add Paper to Excel Workbook
apiRouter.post('/papers/confirm', (req: Request, res: Response) => {
  try {
    const { title, authors, fileName, fileHash, fileSizeBytes, extractedSectors, pageCount, replaceId, notes } = req.body;

    if (!title || !authors || !extractedSectors) {
      res.status(400).json({
        success: false,
        error: 'Title, authors, and sector summaries are required to confirm a paper.',
      });
      return;
    }

    const result = addOrReplacePaper(
      {
        id: replaceId,
        title,
        authors,
        fileName: fileName || 'paper.pdf',
        fileHash,
        fileSizeBytes,
        extractedSectors,
        pageCount: pageCount || 1,
        createdAt: new Date().toISOString(),
        status: 'confirmed',
        notes,
      },
      replaceId
    );

    const allPapers = getAllPapers();

    res.json({
      success: true,
      paper: result.paper,
      isUpdate: result.isUpdate,
      totalPapers: allPapers.length,
      papers: allPapers,
    });
  } catch (err: any) {
    console.error('Error saving paper:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Update an existing paper
apiRouter.put('/papers/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = updatePaper(id, req.body);

    if (!updated) {
      res.status(404).json({ success: false, error: 'Paper not found' });
      return;
    }

    res.json({ success: true, paper: updated, papers: getAllPapers() });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Delete a paper
apiRouter.delete('/papers/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = deletePaper(id);

    if (!deleted) {
      res.status(404).json({ success: false, error: 'Paper not found or already deleted' });
      return;
    }

    res.json({ success: true, papers: getAllPapers() });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Reset to Sample
apiRouter.post('/papers/reset-sample', (req: Request, res: Response) => {
  try {
    const papers = resetToSample();
    res.json({ success: true, papers });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Clear all papers
apiRouter.post('/papers/clear', (req: Request, res: Response) => {
  try {
    clearAllPapers();
    res.json({ success: true, papers: [] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 8. Export Consolidated Excel Workbook
apiRouter.get('/export-excel', async (req: Request, res: Response) => {
  try {
    const papers = getAllPapers();
    const workbook = await generateWorkbook(papers, false);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="Research_Paper_Analysis_Consolidated.xlsx"');

    await workbook.xlsx.write(res);
    res.end();
  } catch (err: any) {
    console.error('Error generating Excel export:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 9. Export Sample Demonstration Excel Workbook
apiRouter.get('/export-sample', async (req: Request, res: Response) => {
  try {
    const workbook = await generateWorkbook([SAMPLE_PAPER], true);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="Sample_Research_Paper_Analysis_Demonstration.xlsx"');

    await workbook.xlsx.write(res);
    res.end();
  } catch (err: any) {
    console.error('Error generating sample Excel export:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Catch-all 404 for API routes so it NEVER falls through to Vite HTML
apiRouter.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: `API endpoint ${req.method} ${req.originalUrl || req.url} not found.`,
  });
});

// Global error handler for API routes
apiRouter.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled API error:', err);
  if (!res.headersSent) {
    res.status(500).json({
      success: false,
      error: err.message || 'Internal server error processing API request.',
    });
  }
});
