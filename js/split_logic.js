// split_logic.js
// PDFちょき 1.1 最終版
// 10MB以下・24ページ基準・3ページ段階フォールバック方式
// 3ページ失敗時のみ 2 → 1 ページを追加試行

window.PDFLogic = {

  async buildChunksBySize(file) {

    const CHUNK_LIMIT = 10 * 1024 * 1024; // 10MB
    const BASE_PAGES  = 24;
    const STEP        = 3;

    const srcBuffer  = await file.arrayBuffer();
    const srcPdf     = await PDFLib.PDFDocument.load(srcBuffer);
    const totalPages = srcPdf.getPageCount();

    let currentPage = 1;
    let chunkIndex  = 1;
    const results   = [];

    while (currentPage <= totalPages) {

      let success = false;

      // ============================================
      // 24 → 21 → 18 → ... → 3 ページ試行
      // ============================================
      for (let pages = BASE_PAGES; pages >= 3; pages -= STEP) {

        const start = currentPage;
        const end   = Math.min(currentPage + pages - 1, totalPages);

        if (end - start + 1 < 3) continue;

        console.log("TRY", start, end);

        const bytes = await this.buildPdfBytes(srcPdf, start, end);
        console.log("BYTES", start, end, bytes.length);

        if (bytes.length <= CHUNK_LIMIT) {

          await window.FolderOutput.savePdf(bytes, chunkIndex);

          results.push({
            index: chunkIndex,
            start,
            end,
            pages: end - start + 1,
            bytes: bytes.length
          });

          const percent = Math.floor((end / totalPages) * 100);
          window.UI?.renderProgress?.(percent);

          currentPage = end + 1;
          chunkIndex++;
          success = true;
          break;
        }
      }

      // ============================================
      // 最終保険：2ページ → 1ページ
      // ============================================
      if (!success) {

        for (const pages of [2, 1]) {

          const start = currentPage;
          const end   = Math.min(currentPage + pages - 1, totalPages);

          if (end < start) continue;

          console.log("TRY", start, end);

          const bytes = await this.buildPdfBytes(srcPdf, start, end);
          console.log("BYTES", start, end, bytes.length);

          if (bytes.length <= CHUNK_LIMIT) {

            await window.FolderOutput.savePdf(bytes, chunkIndex);

            results.push({
              index: chunkIndex,
              start,
              end,
              pages: end - start + 1,
              bytes: bytes.length
            });

            const percent = Math.floor((end / totalPages) * 100);
            window.UI?.renderProgress?.(percent);

            currentPage = end + 1;
            chunkIndex++;
            success = true;
            break;
          }
        }
      }

      // ============================================
      // 1ページでも10MB超 → 本当に扱えない
      // ============================================
      if (!success) {
        throw new Error("MB8");
      }
    }

    return results;
  },

  // ============================================
  // PDF再生成（pdf-lib 標準）
  // ============================================
  async buildPdfBytes(srcPdf, startPage, endPage) {

    if (!srcPdf || startPage > endPage) {
      throw new Error("INVALID_PAGE_RANGE");
    }

    const newPdf = await PDFLib.PDFDocument.create();

    const indices = [];
    for (let p = startPage; p <= endPage; p++) {
      indices.push(p - 1);
    }

    const pages = await newPdf.copyPages(srcPdf, indices);
    pages.forEach(page => newPdf.addPage(page));

    return await newPdf.save();
  }
};
