// main.js（iOS実機対応・確定版）
console.log("MAIN_JS_LOADED");

document.addEventListener("DOMContentLoaded", () => {
  (async () => {
    // 1. 翻訳CSVを読み込む
    await window.Language.init();

    // 2. UIを描画
    window.UI.render();

    // 3. OS判定
    const noticeKey = window.OSDetect?.getNoticeKey();
    if (!noticeKey) return;

    // 4. 翻訳取得
    const message = window.Language.t(noticeKey);
    if (!message || message === noticeKey) return;

    // 5. フッターに表示
    const footer = document.getElementById("osNotice");
    if (!footer) return;

    footer.textContent = message;
    footer.classList.remove("hidden");
  })();
});


