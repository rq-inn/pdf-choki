window.OSDetect = {
  getOS() {
    const ua = navigator.userAgent || "";

    if (/iPhone|iPad|iPod/i.test(ua)) return "iOS";
    if (/Android/i.test(ua)) return "Android";
    return "PC";
  },

  showNoticeIfNeeded() {
    const os = this.getOS();

    if (os === "iOS") {
      alert(window.Language.t("OS_IOS_NOTICE"));
    }

    if (os === "Android") {
      alert(window.Language.t("OS_ANDROID_NOTICE"));
    }
  }
};
