/**
 * Generates a clean, valid PDF 1.4 Binary Blob from text pages.
 * Used to provide authentic native PDF viewer files for preloaded academic study materials.
 */

export function createValidPdfBlob(title: string, pages: string[]): Blob {
  // Normalize pages
  const pageList = pages.length > 0 ? pages : [title];

  let objIndex = 1;
  const catalogObjNum = objIndex++;
  const pagesObjNum = objIndex++;

  const pageObjNums: number[] = [];
  const contentObjNums: number[] = [];

  pageList.forEach(() => {
    pageObjNums.push(objIndex++);
    contentObjNums.push(objIndex++);
  });

  const fontObjNum = objIndex++;

  const objects: { num: number; body: string }[] = [];

  // 1. Catalog
  objects.push({
    num: catalogObjNum,
    body: `<< /Type /Catalog /Pages ${pagesObjNum} 0 R >>`,
  });

  // 2. Pages
  const kidsStr = pageObjNums.map((n) => `${n} 0 R`).join(' ');
  objects.push({
    num: pagesObjNum,
    body: `<< /Type /Pages /Kids [${kidsStr}] /Count ${pageList.length} >>`,
  });

  // Font
  objects.push({
    num: fontObjNum,
    body: `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>`,
  });

  // Each page and its content stream
  pageList.forEach((pageContent, idx) => {
    const pageNum = pageObjNums[idx];
    const contentNum = contentObjNums[idx];

    objects.push({
      num: pageNum,
      body: `<< /Type /Page /Parent ${pagesObjNum} 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${fontObjNum} 0 R >> >> /Contents ${contentNum} 0 R >>`,
    });

    // Clean text lines (escape parentheses and backslashes)
    const rawLines = pageContent.split('\n');
    let streamText = `BT /F1 16 Tf 50 740 Td (${escapePdfText(title)}) Tj ET\n`;
    streamText += `BT /F1 10 Tf 50 722 Td (Page ${idx + 1} of ${pageList.length} - Academic Study Document) Tj ET\n`;

    let currentY = 690;
    rawLines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) {
        currentY -= 14;
        return;
      }

      // Wrap lines longer than 80 characters
      const words = trimmed.split(/\s+/);
      let currentLine = '';

      words.forEach((w) => {
        if ((currentLine + ' ' + w).length > 75) {
          if (currentY > 60) {
            streamText += `BT /F1 11 Tf 50 ${currentY} Td (${escapePdfText(currentLine)}) Tj ET\n`;
            currentY -= 16;
          }
          currentLine = w;
        } else {
          currentLine = currentLine ? currentLine + ' ' + w : w;
        }
      });

      if (currentLine && currentY > 60) {
        streamText += `BT /F1 11 Tf 50 ${currentY} Td (${escapePdfText(currentLine)}) Tj ET\n`;
        currentY -= 18;
      }
    });

    const streamLength = new TextEncoder().encode(streamText).length;

    objects.push({
      num: contentNum,
      body: `<< /Length ${streamLength} >>\nstream\n${streamText}endstream`,
    });
  });

  // Sort objects by number
  objects.sort((a, b) => a.num - b.num);

  // Build PDF buffer and xref table
  let pdfContent = '%PDF-1.4\n';
  const offsets: number[] = [0];

  objects.forEach((obj) => {
    offsets.push(new TextEncoder().encode(pdfContent).length);
    pdfContent += `${obj.num} 0 obj\n${obj.body}\nendobj\n`;
  });

  const xrefOffset = new TextEncoder().encode(pdfContent).length;
  pdfContent += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;

  for (let i = 1; i <= objects.length; i++) {
    const offsetStr = String(offsets[i]).padStart(10, '0');
    pdfContent += `${offsetStr} 00000 n \n`;
  }

  pdfContent += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogObjNum} 0 R >>\n`;
  pdfContent += `startxref\n${xrefOffset}\n%%EOF`;

  return new Blob([pdfContent], { type: 'application/pdf' });
}

function escapePdfText(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/[^\x20-\x7E]/g, ' '); // Only printable ASCII in Type1
}
