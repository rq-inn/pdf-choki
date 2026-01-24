document.addEventListener("DOMContentLoaded", () => {
  const footer = document.getElementById("osNotice");
  if (!footer) return;

  footer.textContent = "【テスト】iPhone実機で表示されるか確認中";
  footer.classList.remove("hidden");
});
