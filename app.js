(function () {
  "use strict";

  const slides = Array.from(document.querySelectorAll(".slide"));
  const counter = document.querySelector("#counter");
  const progress = document.querySelector("#progress-bar");
  const overview = document.querySelector("#overview");
  const overviewGrid = document.querySelector("#overview-grid");
  const installBtn = document.querySelector("#install-btn");
  const qrUrl = document.querySelector("#qr-url");
  const qrCode = document.querySelector("#qr-code");
  let current = readHash();
  let deferredInstall = null;
  let touchStartX = 0;
  let touchStartY = 0;

  function readHash() {
    const raw = Number((location.hash || "").replace("#", ""));
    if (Number.isFinite(raw) && raw >= 1 && raw <= slides.length) return raw - 1;
    return 0;
  }

  function go(index, replaceHash) {
    current = Math.max(0, Math.min(slides.length - 1, index));
    slides.forEach((slide, i) => slide.classList.toggle("is-active", i === current));
    counter.textContent = `${String(current + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;
    progress.style.width = `${((current + 1) / slides.length) * 100}%`;
  document.title = `${slides[current].dataset.title || "Vibecoding"} - Vibecoding im Unterricht`;
    if (replaceHash) history.replaceState(null, "", `#${current + 1}`);
    else if (location.hash !== `#${current + 1}`) history.pushState(null, "", `#${current + 1}`);
    syncOverview();
    slides[current].scrollTop = 0;
  }

  function next() { go(current + 1); }
  function prev() { go(current - 1); }

  document.querySelector("#next-btn").addEventListener("click", next);
  document.querySelector("#prev-btn").addEventListener("click", prev);
  document.querySelector("#next-zone").addEventListener("click", next);
  document.querySelector("#prev-zone").addEventListener("click", prev);
  document.querySelector("#overview-open").addEventListener("click", () => overview.showModal());
  document.querySelector("#help-close").addEventListener("click", () => {
    document.querySelector("#keyboard-help").classList.add("is-hidden");
    localStorage.setItem("vibecoding-help-hidden", "1");
  });
  if (localStorage.getItem("vibecoding-help-hidden") === "1") {
    document.querySelector("#keyboard-help").classList.add("is-hidden");
  }

  document.addEventListener("keydown", (event) => {
    if (event.target.matches("textarea, input, button, a")) return;
    if (event.key === "ArrowRight" || event.key === " ") { event.preventDefault(); next(); }
    if (event.key === "ArrowLeft") { event.preventDefault(); prev(); }
    if (event.key === "Home") { event.preventDefault(); go(0); }
    if (event.key === "End") { event.preventDefault(); go(slides.length - 1); }
    if (event.key.toLowerCase() === "o") overview.showModal();
    if (event.key.toLowerCase() === "f") toggleFullscreen();
  });

  window.addEventListener("hashchange", () => go(readHash(), true));
  document.addEventListener("touchstart", (event) => {
    const t = event.changedTouches[0];
    touchStartX = t.clientX;
    touchStartY = t.clientY;
  }, { passive: true });
  document.addEventListener("touchend", (event) => {
    const t = event.changedTouches[0];
    const dx = t.clientX - touchStartX;
    const dy = t.clientY - touchStartY;
    if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      dx < 0 ? next() : prev();
    }
  }, { passive: true });

  function toggleFullscreen() {
    if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else if (document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
  }

  function syncOverview() {
    overviewGrid.querySelectorAll(".overview-card").forEach((button, i) => {
      button.classList.toggle("is-active", i === current);
    });
  }

  slides.forEach((slide, i) => {
    const button = document.createElement("button");
    button.className = "overview-card";
    button.type = "button";
    button.innerHTML = `<small>${String(i + 1).padStart(2, "0")}</small>${slide.dataset.title || "Folie"}`;
    button.addEventListener("click", () => {
      overview.close();
      go(i);
    });
    overviewGrid.append(button);
  });

  const cycleTexts = [
    "Starte mit einem Satz: \"Ich brauche ein Tool, das ...\"",
    "Codex erstellt Dateien und meldet zurueck, was geaendert wurde.",
    "Oeffnen, klicken, ausprobieren: Passt das fuer den Unterricht?",
    "Rueckmelden: \"mach den QR groesser\" oder \"zeige die Galerie anders\"."
  ];
  document.querySelectorAll("[data-cycle]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-cycle]").forEach((b) => b.classList.remove("is-active"));
      button.classList.add("is-active");
      document.querySelector("#cycle-text").textContent = cycleTexts[Number(button.dataset.cycle)] || cycleTexts[0];
    });
  });

  const fileTexts = {
    "index.html": "HTML ist der Inhalt: Ueberschriften, Texte, Buttons und die Reihenfolge.",
    "style.css": "CSS ist das Aussehen: Farben, Abstaende, Schriftgroessen und Layout.",
    "app.js": "JavaScript ist Verhalten: Klicks, Berechnungen, Speichern und Anzeigen.",
    "images/": "Der Bilderordner sammelt Fotos, Screenshots, Icons und Grafiken.",
    "manifest.json": "Das Manifest sagt dem Handy, wie die Webseite als App heisst.",
    "README.md": "Die README ist die kurze menschliche Anleitung zum Projekt."
  };
  document.querySelectorAll("[data-file]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelector("#file-explain").textContent = fileTexts[button.dataset.file];
    });
  });

  document.querySelectorAll("[data-tip]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelector("#tooltip").textContent = button.dataset.tip;
    });
  });

  const tabs = document.querySelectorAll(".tab");
  const areas = {
    html: document.querySelector("#code-html"),
    css: document.querySelector("#code-css"),
    js: document.querySelector("#code-js")
  };
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.toggle("is-active", t === tab));
      Object.entries(areas).forEach(([key, area]) => area.classList.toggle("is-active", key === tab.dataset.tab));
    });
  });
  Object.values(areas).forEach((area) => area.addEventListener("input", renderPreview));
  function renderPreview() {
    const html = areas.html.value;
    const css = `<style>${areas.css.value}</style>`;
    const js = `<script>${areas.js.value.replace(/<\/script/gi, "<\\/script")}<\/script>`;
    document.querySelector("#preview").srcdoc = `<!doctype html><html lang="de"><head><meta charset="utf-8">${css}</head><body>${html}${js}</body></html>`;
  }

  function loadImageSlots() {
    document.querySelectorAll("[data-img-src]").forEach((slot) => {
      const img = new Image();
      img.alt = slot.dataset.imgLabel || "Bild";
      img.onload = () => {
        slot.classList.add("has-image");
        slot.textContent = "";
        slot.append(img);
      };
      img.onerror = () => {};
      img.src = slot.dataset.imgSrc;
    });
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstall = event;
    installBtn.hidden = false;
  });
  installBtn.addEventListener("click", async () => {
    if (!deferredInstall) return;
    deferredInstall.prompt();
    await deferredInstall.userChoice.catch(() => null);
    deferredInstall = null;
    installBtn.hidden = true;
  });

  function renderQr() {
    const url = location.href.split("#")[0];
    qrUrl.textContent = url;
    if (!window.VibeQR || !qrCode) {
      qrCode.textContent = "QR-Code nicht verfuegbar.";
      return;
    }
    try {
      window.VibeQR.render(qrCode, url, { cellSize: 8, margin: 4 });
    } catch (error) {
      qrCode.innerHTML = `<p>QR-Code konnte fuer diese lokale URL nicht erzeugt werden. Nutze die URL darunter.</p>`;
    }
  }

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("service-worker.js", { scope: "./" }).catch(() => {});
    });
  }

  loadImageSlots();
  renderPreview();
  renderQr();
  go(current, true);
})();
