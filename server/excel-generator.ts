import ExcelJS from 'exceljs';
import { AnalyzedPaper, SECTOR_DEFINITIONS } from '../src/types/paper';

export async function generateWorkbook(papers: AnalyzedPaper[], isSample: boolean = false): Promise<ExcelJS.Workbook> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Research Paper Analysis System';
  workbook.created = new Date();
  workbook.modified = new Date();

  // ---------------------------------------------------------
  // Sheet 1: Consolidated Analysis (Main Worksheet)
  // ---------------------------------------------------------
  const mainSheet = workbook.addWorksheet('Consolidated Analysis', {
    views: [{ showGridLines: true }],
    properties: { tabColor: { argb: 'FF1E3A8A' } }
  });

  // Setup Column Widths
  mainSheet.columns = [
    { key: 'sector', width: 28 },
    { key: 'summary', width: 88 },
  ];

  let currentRow = 1;

  // Title Banner for the entire workbook
  const bannerRow = mainSheet.getRow(currentRow);
  bannerRow.values = ['CONSOLIDATED RESEARCH PAPER ANALYSIS WORKBOOK', ''];
  mainSheet.mergeCells(currentRow, 1, currentRow, 2);
  bannerRow.height = 36;
  bannerRow.getCell(1).font = { name: 'Calibri', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  bannerRow.getCell(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1E293B' }, // Dark slate
  };
  bannerRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
  currentRow++;

  // Subtitle / metadata row
  const metaRow = mainSheet.getRow(currentRow);
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  metaRow.values = [
    `Total Analyzed Papers: ${papers.length} ${isSample ? '(SAMPLE DEMONSTRATION WORKBOOK)' : ''} | Generated: ${dateStr}`,
    ''
  ];
  mainSheet.mergeCells(currentRow, 1, currentRow, 2);
  metaRow.height = 22;
  metaRow.getCell(1).font = { name: 'Calibri', size: 10, italic: true, color: { argb: 'FF475569' } };
  metaRow.getCell(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF1F5F9' },
  };
  metaRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
  currentRow += 2; // Add blank row

  if (papers.length === 0) {
    const emptyRow = mainSheet.getRow(currentRow);
    emptyRow.values = ['No confirmed research papers yet. Upload and confirm papers to populate this workbook.', ''];
    mainSheet.mergeCells(currentRow, 1, currentRow, 2);
    emptyRow.height = 30;
    emptyRow.getCell(1).font = { name: 'Calibri', size: 11, italic: true, color: { argb: 'FF64748B' } };
    emptyRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
  } else {
    // Iterate through all papers
    papers.forEach((paper, index) => {
      const paperNumPadded = String(paper.paperNumber || (index + 1)).padStart(2, '0');
      const paperLabel = `Paper ${paperNumPadded}`;

      // 1. PAPER HEADER ROW 1: Research Paper Title
      const titleRow = mainSheet.getRow(currentRow);
      titleRow.values = [`${paperLabel}: ${paper.title}`, ''];
      mainSheet.mergeCells(currentRow, 1, currentRow, 2);
      titleRow.height = 32;
      const titleCell = titleRow.getCell(1);
      titleCell.font = { name: 'Calibri', size: 13, bold: true, color: { argb: 'FF0F172A' } };
      titleCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFDBEAFE' }, // Soft academic blue
      };
      titleCell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true, indent: 1 };
      titleCell.border = {
        top: { style: 'medium', color: { argb: 'FF2563EB' } },
        left: { style: 'medium', color: { argb: 'FF2563EB' } },
        right: { style: 'medium', color: { argb: 'FF2563EB' } },
        bottom: { style: 'thin', color: { argb: 'FF93C5FD' } },
      };
      currentRow++;

      // 2. PAPER HEADER ROW 2: Author or Authors
      const authorRow = mainSheet.getRow(currentRow);
      authorRow.values = [`Author(s): ${paper.authors}`, ''];
      mainSheet.mergeCells(currentRow, 1, currentRow, 2);
      authorRow.height = 24;
      const authorCell = authorRow.getCell(1);
      authorCell.font = { name: 'Calibri', size: 11, italic: true, bold: true, color: { argb: 'FF1E3A8A' } };
      authorCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFEBF3FB' }, // Lighter blue
      };
      authorCell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true, indent: 1 };
      authorCell.border = {
        left: { style: 'medium', color: { argb: 'FF2563EB' } },
        right: { style: 'medium', color: { argb: 'FF2563EB' } },
        bottom: { style: 'medium', color: { argb: 'FF2563EB' } },
      };
      currentRow++;

      // 3. TABLE COLUMN HEADINGS: Sector | Summary
      const tableHeadRow = mainSheet.getRow(currentRow);
      tableHeadRow.values = ['Sector', 'Summary'];
      tableHeadRow.height = 26;
      
      const headSectorCell = tableHeadRow.getCell(1);
      headSectorCell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
      headSectorCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1E3A8A' }, // Navy blue
      };
      headSectorCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
      headSectorCell.border = {
        top: { style: 'medium', color: { argb: 'FF1E3A8A' } },
        left: { style: 'medium', color: { argb: 'FF2563EB' } },
        right: { style: 'thin', color: { argb: 'FFFFFFFF' } },
        bottom: { style: 'medium', color: { argb: 'FF1E3A8A' } },
      };

      const headSummaryCell = tableHeadRow.getCell(2);
      headSummaryCell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
      headSummaryCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1E3A8A' }, // Navy blue
      };
      headSummaryCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
      headSummaryCell.border = {
        top: { style: 'medium', color: { argb: 'FF1E3A8A' } },
        left: { style: 'thin', color: { argb: 'FFFFFFFF' } },
        right: { style: 'medium', color: { argb: 'FF2563EB' } },
        bottom: { style: 'medium', color: { argb: 'FF1E3A8A' } },
      };
      currentRow++;

      // 4. EIGHT PREDEFINED SECTORS IN EXACT REQUIRED ORDER
      SECTOR_DEFINITIONS.forEach((def, sectorIndex) => {
        const sectorRow = mainSheet.getRow(currentRow);
        const summaryText = paper.extractedSectors[def.key] || 'Not explicitly stated in the paper';
        sectorRow.values = [def.label, summaryText];

        const charCount = summaryText.length;
        const lineEstimate = Math.ceil(charCount / 85);
        sectorRow.height = Math.max(30, Math.min(180, lineEstimate * 18 + 12));

        const isEven = sectorIndex % 2 === 0;
        const sectorBg = isEven ? 'FFF8FAFC' : 'FFF1F5F9';
        const summaryBg = isEven ? 'FFFFFFFF' : 'FFFAFAFA';

        // Sector Cell
        const sCell = sectorRow.getCell(1);
        sCell.font = { name: 'Calibri', size: 10.5, bold: true, color: { argb: 'FF1E293B' } };
        sCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: sectorBg },
        };
        sCell.alignment = { vertical: 'top', horizontal: 'left', wrapText: true, indent: 1 };
        sCell.border = {
          top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          left: { style: 'medium', color: { argb: 'FF2563EB' } },
          right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          bottom: sectorIndex === 7 ? { style: 'medium', color: { argb: 'FF2563EB' } } : { style: 'thin', color: { argb: 'FFE2E8F0' } },
        };

        // Summary Cell
        const sumCell = sectorRow.getCell(2);
        sumCell.font = { name: 'Calibri', size: 10.5, color: { argb: 'FF334155' } };
        sumCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: summaryBg },
        };
        sumCell.alignment = { vertical: 'top', horizontal: 'left', wrapText: true, indent: 1 };
        sumCell.border = {
          top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          right: { style: 'medium', color: { argb: 'FF2563EB' } },
          bottom: sectorIndex === 7 ? { style: 'medium', color: { argb: 'FF2563EB' } } : { style: 'thin', color: { argb: 'FFE2E8F0' } },
        };

        currentRow++;
      });

      // 5. Leave exactly 3 blank spacing rows between different research papers
      currentRow += 3;
    });
  }

  // ---------------------------------------------------------
  // Sheet 2: Index Worksheet (Summary Directory)
  // ---------------------------------------------------------
  const indexSheet = workbook.addWorksheet('Paper Index', {
    views: [{ showGridLines: true }],
    properties: { tabColor: { argb: 'FF3B82F6' } }
  });

  indexSheet.columns = [
    { header: 'No.', key: 'num', width: 12 },
    { header: 'Research Paper Title', key: 'title', width: 44 },
    { header: 'Author(s)', key: 'authors', width: 32 },
    { header: 'Methodology Summary', key: 'methodology', width: 45 },
    { header: 'Key Findings Summary', key: 'findings', width: 50 },
    { header: 'Analysis Date', key: 'date', width: 18 },
  ];

  const indexHeader = indexSheet.getRow(1);
  indexHeader.height = 28;
  indexHeader.eachCell((cell) => {
    cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E3A8A' }
    };
    cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  });

  papers.forEach((paper, index) => {
    const pNum = `Paper ${String(paper.paperNumber || (index + 1)).padStart(2, '0')}`;
    const row = indexSheet.addRow({
      num: pNum,
      title: paper.title,
      authors: paper.authors,
      methodology: paper.extractedSectors.methodology,
      findings: paper.extractedSectors.findings,
      date: new Date(paper.createdAt).toLocaleDateString('en-US'),
    });

    row.height = 40;
    const isEven = index % 2 === 0;
    const rowBg = isEven ? 'FFFFFFFF' : 'FFF8FAFC';

    row.eachCell((cell, colNum) => {
      cell.font = { name: 'Calibri', size: 10, color: { argb: 'FF334155' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: rowBg }
      };
      cell.alignment = { vertical: 'top', horizontal: colNum === 1 ? 'center' : 'left', wrapText: true };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      };
    });
  });

  return workbook;
}
