// main.js
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

  // 翻訳が無い・キーのままなら表示しない
  if (!message || message === noticeKey) return;

  // 5. フッターに表示
  const footer = document.getElementById("osNotice");
  if (!footer) return;

  footer.textContent = message;
  footer.classList.remove("hidden");
})();
