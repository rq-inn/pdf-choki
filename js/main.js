// main.js

(async () => {
  // ① 言語CSVを完全ロード
  await window.Language.init();

  // ② UIを描画
  window.UI.render();

  // ③ ここで OS 判定 → 表示
  const noticeKey = window.OSDetect?.getNoticeKey();
  if (!noticeKey) return;

  const message = window.Language.t(noticeKey);

  // 翻訳が取れているときだけ表示
  if (message && message !== noticeKey) {
    alert(message);
  }
})();
