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
      let tryPages = Math.min(MAX_PAGES, totalPages - currentPage + 1);
      if (tryPages % 2 !== 0) tryPages -= 1;

      let success = false;

      while (tryPages >= 1) {
        const start = currentPage;
        const end = currentPage + tryPages - 1;

        console.log("BUILD", start, end);

        const bytes = await this.buildPdfBytes(srcPdf, start, end);

        if (bytes.length <= TEN_MB) {
          await window.FolderOutput.savePdf(bytes, chunkIndex);

          results.push({
            index: chunkIndex,
            start,
            end,
            pages: tryPages,
            bytes: bytes.length
          });

          const percent = Math.floor((end / totalPages) * 100);
          window.UI?.renderProgress?.(percent);

          chunkIndex++;
          currentPage = end + 1;
          success = true;
          break;
        }

        // ★ ページ数を減らして再試行
        tryPages -= STEP;
      }

      if (!success) {
        throw new Error("MB8");
      }
    }

    return results;
  },

  // ===== Stage 4-1 =====
  async buildPdfBytes(srcPdf, startPage, endPage) {
    if (!srcPdf || startPage > endPage) {
      throw new Error("INVALID_PAGE_RANGE");
    }

    const newPdf = await PDFLib.PDFDocument.create();

    const pageIndices = [];
    for (let p = startPage; p <= endPage; p++) {
      pageIndices.push(p - 1);
    }

    const copiedPages = await newPdf.copyPages(srcPdf, pageIndices);
    copiedPages.forEach(page => newPdf.addPage(page));

    return await newPdf.save();
  }

};
