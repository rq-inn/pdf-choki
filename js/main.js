// main.js（最終・最小・安定版）
document.addEventListener("DOMContentLoaded", () => {
  window.UI.render();

  const noticeKey = window.OSDetect?.getNoticeKey();
  if (!noticeKey) return;

  const footer = document.getElementById("osNotice");
  if (!footer) return;

  footer.textContent = "iOS / Android : Not supported";
  footer.classList.remove("hidden");
});
