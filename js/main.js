// main.js

(async () => {
  await window.Language.init();
  window.UI.render();
  const noticeKey = window.OSDetect?.getNoticeKey();
  if (noticeKey) {
    const message = window.Language.t(noticeKey);
    alert(message);
  }
})();
