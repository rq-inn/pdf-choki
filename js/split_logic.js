// split_logic.js

window.PDFLogic = {

  // ===== Stage 4-2 =====
  async buildChunksBySize(file) {
    const PAGE_LIMIT  = 10 * 1024 * 1024;   // 1ページ上限（10MB）
    const CHUNK_LIMIT = 30 * 1024 * 1024;   // 分割PDF上限（30MB）

    const MAX_PAGES = 50;

    const STEP = 1; // ★ 重要：必ず 1

    const srcBuffer = await file.arrayBuffer();
    const srcPdf = await PDFLib.PDFDocument.load(srcBuffer);
    const totalPages = srcPdf.getPageCount();

    let currentPage = 1;
    let chunkIndex = 1;
    const results = [];

    while (currentPage <= totalPages) {

      // 初期は「できるだけ大きい偶数ページ」
      let tryPages = Math.min(MAX_PAGES, totalPages - currentPage + 1);
      if (tryPages % 2 !== 0) tryPages -= 1;

      let success = false;

      while (tryPages >= 1) {
        const start = currentPage;
        const end   = currentPage + tryPages - 1;

        // ===== 1ページ単体チェック（最終防衛線）=====
        if (tryPages === 1) {
          const singleBytes = await this.buildPdfBytes(srcPdf, start, start);
          if (singleBytes.length > PAGE_LIMIT) {
            throw new Error("MB8");
          }
        }

        console.log("BUILD", start, end);

        const bytes = await this.buildPdfBytes(srcPdf, start, end);

        if (bytes.length <= CHUNK_LIMIT) {
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

        // ★ サイズ超過 → ページ数を 1 減らして再試行
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
