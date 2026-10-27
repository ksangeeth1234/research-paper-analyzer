export async function parsePdfBuffer(buffer: Buffer): Promise<{ text: string; numpages: number; info?: any }> {
  try {
    const pdfModule: any = await import('pdf-parse');
    const PDFParse = pdfModule.PDFParse || pdfModule.default?.PDFParse || (typeof pdfModule === 'function' ? pdfModule : null);

    if (PDFParse && typeof PDFParse === 'function') {
      try {
        const parser = new PDFParse({ data: new Uint8Array(buffer) });
        const textResult = await parser.getText();
        const numpages = textResult?.total || 1;
        const text = textResult?.text || '';
        await parser.destroy();

        if (text.trim().length > 0) {
          return { text, numpages };
        }
      } catch (classErr) {
        console.warn('PDFParse class extraction notice, trying fallback parsing:', classErr);
      }
    }

    // Secondary fallback: extract readable text streams directly from PDF buffer
    const rawContent = buffer.toString('binary');
    const matches = rawContent.match(/\(([^()]{2,})\)\s*Tj/g) || [];
    let extractedWords: string[] = [];
    if (matches.length > 0) {
      extractedWords = matches.map((m) => m.replace(/^\(/, '').replace(/\)\s*Tj$/, '').trim());
    }

    // Estimate page count by counting "/Type /Page" tokens
    const pageMatches = rawContent.match(/\/Type\s*\/Page\b/g);
    const numpages = pageMatches ? pageMatches.length : 1;
    const fallbackText = extractedWords.length > 0 ? extractedWords.join(' ') : '';

    return {
      text: fallbackText,
      numpages: Math.max(1, numpages),
      info: {},
    };
  } catch (error: any) {
    console.error('PDF parsing error caught:', error);
    return {
      text: '',
      numpages: 1,
      info: {},
    };
  }
}
