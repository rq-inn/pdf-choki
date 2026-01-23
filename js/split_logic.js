// split_logic.js

window.PDFLogic = {

  // ===== Stage 4-2 =====
  async buildChunksBySize(file) {
    const TEN_MB = 10 * 1024 * 1024;
    const MAX_PAGES = 30;
    const STEP = 2;

    const srcBuffer = await file.arrayBuffer();
    const srcPdf = await PDFLib.PDFDocument.load(srcBuffer);
    const totalPages = srcPdf.getPageCount();

    let currentPage = 1;
    let chunkIndex = 1;

    const results = [];

    while (currentPage <= totalPages) {
      let tryPages = MAX_PAGES;

      let remaining = totalPages - currentPage + 1;
      if (remaining < tryPages) {
        tryPages = remaining;
        if (tryPages % 2 !== 0) tryPages -= 1;
      }

      if (tryPages < 2) break;

      let success = false;

      while (tryPages >= 2) {
        const start = currentPage;
        const end = currentPage + tryPages - 1;

        console.log("BUILD", start, end);

        const bytes = await this.buildPdfBytes(file, start, end);

        if (bytes.length <= TEN_MB) {
          // ===== Stage 4-3 : 確定チャンクを保存 =====
          await window.FolderOutput.savePdf(bytes, chunkIndex);

          results.push({
            index: chunkIndex,
            start,
            end,
            pages: tryPages,
            bytes: bytes.length
          });

          const processedPages = end; 
          const percent = Math.floor((processedPages / totalPages) * 100);

          if (window.UI?.renderProgress) {
            window.UI.renderProgress(percent);
          }

          chunkIndex++;
          currentPage = end + 1;
          success = true;
          break;
        }
        else {
          tryPages -= STEP;
        }
      }

      if (!success) {
        throw new Error("UNSPLITTABLE_TOO_LARGE");
      }
    }

    return results;
  },

  // ===== Stage 4-1 =====
  async buildPdfBytes(file, startPage, endPage) {
    if (!file || startPage > endPage) {
      throw new Error("INVALID_PAGE_RANGE");
    }

    const srcBuffer = await file.arrayBuffer();
    const srcPdf = await PDFLib.PDFDocument.load(srcBuffer);

    const newPdf = await PDFLib.PDFDocument.create();

    const pageIndices = [];
    for (let p = startPage; p <= endPage; p++) {
      pageIndices.push(p - 1);
    }

    const copiedPages = await newPdf.copyPages(srcPdf, pageIndices);
    copiedPages.forEach(page => newPdf.addPage(page));

    const bytes = await newPdf.save();
    return bytes;
  }
};

