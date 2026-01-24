// main.js

(async () => {
  await window.Language.init();
  window.UI.render();
  window.OSDetect.showNoticeIfNeeded();
})();
