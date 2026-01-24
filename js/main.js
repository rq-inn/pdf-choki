// main.js
(async () => {
  await window.Language.init();   // 翻訳CSVを読み終える
  window.UI.render();             // UI描画

  // ★ ここでOS判定＆ダイアログ
  const noticeKey = window.OSDetect?.getNoticeKey();
  if (!noticeKey) return;

  const message = window.Language.t(noticeKey);

  // 翻訳が未ロード・キー未変換なら出さない
  if (!message || message === noticeKey) return;

  alert(message);
})();
