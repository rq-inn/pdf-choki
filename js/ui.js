// ui.js

window.UI = {
  isRunning: false,

  render() {
    this.renderLanguageSelect();
    this.renderControls();
    this.renderStatus(); 
  },

  // --- Language Select ---
  renderLanguageSelect() {
    const area = document.getElementById("languageArea");
    area.innerHTML = "";

    const select = document.createElement("select");

    window.Language.languages.forEach(lang => {
      const option = document.createElement("option");
      option.value = lang.number;
      option.textContent = lang.name;
      if (lang.number === window.Language.current) {
        option.selected = true;
      }
      select.appendChild(option);
    });

    select.addEventListener("change", (e) => {
      window.Language.setLanguage(e.target.value);
    });

    area.appendChild(select);
  },

  // --- Controls ---
  renderControls() {
    const area = document.getElementById("controlArea");
    area.innerHTML = "";

    const btnPDF = document.createElement("button");
    btnPDF.textContent = window.Language.t("MB2");
    btnPDF.disabled = this.isRunning;
    btnPDF.addEventListener("click", async () => {
      if (this.isRunning) return;
      try {
        const file = await window.FileSelector.selectPDF();
        if (file) {
          this.renderControls();
          this.renderStatus();
        }
      } catch (e) {
        if (e.name !== "AbortError") console.error(e);
      }
    });

    const btnFolder = document.createElement("button");
    btnFolder.textContent = window.Language.t("MB3");
    btnFolder.disabled = this.isRunning;
    btnFolder.addEventListener("click", async () => {
      if (this.isRunning) return;
      try {
        const dir = await window.FileSelector.selectOutputFolder();
        await window.FolderOutput.setOutputDir(dir);
        this.renderControls();
        this.renderStatus();
      } catch (e) {
        if (e.name !== "AbortError") console.error(e);
      }
    });
    // ===== 読込ファイル枠 =====
    const pdfBox = document.createElement("div");
    pdfBox.className = "box";

    pdfBox.appendChild(btnPDF);

    // --- 読込ファイル名（常に1行確保） ---
    const fileName = document.createElement("div");
    fileName.className = "box-sub";

    if (window.FileSelector?.pdfFile) {
      fileName.textContent = window.FileSelector.pdfFile.name;
    } else {
      fileName.innerHTML = "&nbsp;"; // ← 空行確保
    }

    pdfBox.appendChild(fileName);


    area.appendChild(pdfBox);


    // ===== 保存先枠 =====
    const folderBox = document.createElement("div");
    folderBox.className = "box";

    folderBox.appendChild(btnFolder);

    const folderName = document.createElement("div");
    folderName.className = "box-sub";

    if (window.FileSelector?.outputDir) {
      folderName.textContent =
        `${window.Language.t("MB7")} ${window.FileSelector.outputDir.name}`;
    } else {
      folderName.innerHTML = "&nbsp;"; // ← 空行確保
    }

    folderBox.appendChild(folderName);

    area.appendChild(folderBox);

  },

  // --- Status ---
  renderStatus() {
    const area = document.getElementById("statusArea");
    area.innerHTML = "";

    // 処理中表示
    if (this.isRunning) {
      const p = document.createElement("p");
      p.textContent = window.Language.t("MB5");
      area.appendChild(p);
      return;
    }

      // --- Start ボタン（常設） ---
      const btnRun = document.createElement("button");
      btnRun.textContent = window.Language.t("MB4");

      const canStart =
        window.FileSelector?.pdfFile &&
        window.FileSelector?.outputDir &&
        !this.isRunning;

      btnRun.disabled = !canStart;

      btnRun.addEventListener("click", async () => {
        if (!canStart) return;

        this.isRunning = true;
        this.renderControls();
        UI.renderProgress(0);

        try {
          await window.PDFLogic.buildChunksBySize(
            window.FileSelector.pdfFile
          );
        } finally {
          this.isRunning = false;
          this.renderControls();
        }
      });

      area.appendChild(btnRun);
    }
    };
UI.renderProgress = function (percent) {
  const area = document.getElementById("progressArea");
  area.innerHTML = "";

  // 0〜100 にクランプ
  const p = Math.max(0, Math.min(100, Math.floor(percent)));

  // バーは10マス固定（10%で1マス）
  const filled = Math.floor(p / 10);
  const empty = 10 - filled;

  const bar =
    "[" +
    "■".repeat(filled) +
    "□".repeat(empty) +
    `] ${p}%`;

  const line = document.createElement("div");
  line.textContent = bar;
  line.style.fontFamily = "monospace";

  area.appendChild(line);
};


