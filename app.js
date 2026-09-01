(function () {
  "use strict";

  const slides = Array.from(document.querySelectorAll(".slide"));
  const counter = document.querySelector("#counter");
  const progress = document.querySelector("#progress-bar");
  const overview = document.querySelector("#overview");
  const overviewGrid = document.querySelector("#overview-grid");
  const prevButton = document.querySelector("#prev-btn");
  const nextButton = document.querySelector("#next-btn");
  const fullscreenButton = document.querySelector("#fullscreen-toggle");
  const platformDialog = document.querySelector("#platform-dialog");
  const fileDialog = document.querySelector("#file-dialog");
  const platformPreview = document.querySelector("#platform-preview");
  const platformPreviewGallery = document.querySelector("#platform-preview-gallery");
  const presentationCycle = document.querySelector("#presentation-cycle");
  let current = readHash();
  let touchStartX = 0;
  let touchStartY = 0;
  let deckCycleRotation = 0;
  let deckCycleIndex = 0;

  const cycleTexts = [
    "Erkläre das Problem und den kleinsten nützlichen Ablauf.",
    "Die KI erstellt oder verändert die benötigten Dateien.",
    "Öffne die Seite und prüfe sie im echten Ablauf.",
    "Beschreibe eine konkrete Änderung und teste erneut."
  ];

  const platformDetails = {
    1: {
      title: "1 · Tagesprogramm",
      summary: "Der erste Wunsch: Lernende sehen für jeden Schultag ein aktuelles, klares Tagesprogramm.",
      images: [{ src: "images/platform-01-tagesprogramm.png", alt: "Tagesprogramm einer Sanitärklasse", caption: "Aktueller Schultag mit Lektionen, Lernauftrag und Hausaufgaben", frame: "desktop" }]
    },
    2: {
      title: "2 · Editor",
      summary: "Danach brauchte es eine einfache Oberfläche, damit Lehrpersonen Inhalte selbst anpassen können.",
      images: [{ src: "images/platform-02-editor.png", alt: "Lehrer-Editor für einen Schultag", caption: "Editor für Lektionen, Links, Prüfungen und Zusatzmaterial", frame: "desktop" }]
    },
    3: {
      title: "3 · Hausaufgaben",
      summary: "Hausaufgaben werden einmal erfasst und erscheinen danach am richtigen Schultag in der Lernendenansicht.",
      images: [
        { src: "images/platform-03-hausaufgaben-editor.png", alt: "Hausaufgabenbereich im Editor", caption: "Erfassen, fotografieren und speichern", frame: "desktop" },
        { src: "images/platform-03-hausaufgaben-ansicht.png", alt: "Hausaufgaben in der Klassenansicht", caption: "Anzeige am richtigen Schultag", frame: "desktop" }
      ]
    },
    4: {
      title: "4 · Fotos per QR-Code",
      summary: "Ein QR-Code verbindet den Computer der Lehrperson mit der Kamera auf dem Handy.",
      images: [{ src: "images/platform-04-qr-upload.png", alt: "QR-Code für einen Foto-Upload", caption: "Foto direkt aufnehmen und dem ausgewählten Schultag zuordnen", frame: "desktop" }]
    },
    5: {
      title: "5 · WebApp",
      summary: "Die Klassenansicht lässt sich auf dem Startbildschirm installieren und wie eine App öffnen.",
      images: [
        { src: "images/platform-05-webapp-home.jpeg", alt: "Klassen-WebApp auf einem Android-Startbildschirm", caption: "Direkter Einstieg über das Klassenicon", frame: "mobile" },
        { src: "images/platform-05-webapp-view.jpeg", alt: "Tagesprogramm in der mobilen WebApp", caption: "Daumenfreundliche Ansicht für Lernende", frame: "mobile" }
      ]
    },
    6: {
      title: "6 · Praxisaufträge",
      summary: "Aus einer weiteren Idee entstand eine durchsuchbare Übersicht mit Praxisaufträgen und Kompetenzen.",
      images: [{ src: "images/platform-06-praxisauftraege.png", alt: "Interaktive Übersicht der Praxisaufträge", caption: "Kompetenzen, Praxisaufträge und Lernaufträge an einem Ort", frame: "desktop" }]
    }
  };

  const fileDetails = {
    index: {
      title: "index.html",
      summary: "Die Hauptseite enthält die sichtbaren Texte, Bilder, Überschriften und Buttons.",
      list: ["Inhalte", "Reihenfolge", "Links", "Eingabefelder"],
      example: "HTML ist der Rohbau: Es legt fest, was auf der Seite vorhanden ist."
    },
    css: {
      title: "style.css",
      summary: "Diese Datei bestimmt das Aussehen auf Computer, Tablet und Handy.",
      list: ["Farben", "Schriften", "Abstände", "Anordnung"],
      example: "CSS ist die Gestaltung: Es macht aus dem Rohbau eine lesbare Oberfläche."
    },
    js: {
      title: "app.js",
      summary: "JavaScript macht die Seite interaktiv und reagiert auf Klicks oder Eingaben.",
      list: ["Klicks", "Prüfungen", "Berechnungen", "Ansichten"],
      example: "JavaScript entscheidet, was nach einem Klick passieren soll."
    },
    images: {
      title: "images/",
      summary: "In diesem Ordner liegen Fotos, Screenshots und andere Bilddateien.",
      list: ["Fotos", "Screenshots", "Hintergründe", "Grafiken"],
      example: "Die Webseite zeigt Bilder an, indem sie auf die Dateien in diesem Ordner verweist."
    }
  };

  function readHash() {
    const raw = Number((location.hash || "").replace("#", ""));
    return Number.isFinite(raw) && raw >= 1 && raw <= slides.length ? raw - 1 : 0;
  }

  function go(index, replaceHash) {
    current = Math.max(0, Math.min(slides.length - 1, index));
    slides.forEach((slide, i) => slide.classList.toggle("is-active", i === current));
    counter.textContent = `${String(current + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;
    progress.style.width = `${((current + 1) / slides.length) * 100}%`;
    document.title = `${slides[current].dataset.title || "Vibecoding"} - Vibecoding im Unterricht`;
    prevButton.disabled = current === 0;
    nextButton.disabled = current === slides.length - 1;
    if (replaceHash) history.replaceState(null, "", `#${current + 1}`);
    else if (location.hash !== `#${current + 1}`) history.pushState(null, "", `#${current + 1}`);
    overviewGrid.querySelectorAll(".overview-card").forEach((button, i) => button.classList.toggle("is-active", i === current));
    slides[current].scrollTop = 0;
  }

  function next() { if (current < slides.length - 1) go(current + 1); }
  function previous() { if (current > 0) go(current - 1); }
  function anyDialogOpen() { return Array.from(document.querySelectorAll("dialog")).some((dialog) => dialog.open); }

  prevButton.addEventListener("click", previous);
  nextButton.addEventListener("click", next);
  document.querySelector("#overview-open").addEventListener("click", () => overview.showModal());

  document.addEventListener("keydown", (event) => {
    if (anyDialogOpen()) return;
    if (event.key === "ArrowRight" || event.key === " ") { event.preventDefault(); next(); }
    if (event.key === "ArrowLeft") { event.preventDefault(); previous(); }
    if (event.key === "Home") { event.preventDefault(); go(0); }
    if (event.key === "End") { event.preventDefault(); go(slides.length - 1); }
    if (event.key.toLowerCase() === "o") overview.showModal();
    if (event.key.toLowerCase() === "f") toggleFullscreen();
  });

  window.addEventListener("hashchange", () => go(readHash(), true));
  document.addEventListener("touchstart", (event) => {
    if (event.target.closest("a, button, dialog, pre")) return;
    const touch = event.changedTouches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
  }, { passive: true });
  document.addEventListener("touchend", (event) => {
    if (!touchStartX || anyDialogOpen()) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - touchStartX;
    const dy = touch.clientY - touchStartY;
    touchStartX = 0;
    touchStartY = 0;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy)) dx < 0 ? next() : previous();
  }, { passive: true });

  slides.forEach((slide, index) => {
    const button = document.createElement("button");
    button.className = "overview-card";
    button.type = "button";
    button.innerHTML = `<small>${String(index + 1).padStart(2, "0")}</small>${slide.dataset.title || "Folie"}`;
    button.addEventListener("click", () => { overview.close(); go(index); });
    overviewGrid.append(button);
  });

  function activatePresentationCycle(index) {
    const safeIndex = ((Number(index) % 4) + 4) % 4;
    const delta = (safeIndex - deckCycleIndex + 4) % 4;
    deckCycleRotation += delta === 0 ? 360 : delta * 90;
    deckCycleIndex = safeIndex;
    presentationCycle?.style.setProperty("--deck-cycle-turn", `${deckCycleRotation}deg`);
    presentationCycle?.style.setProperty("--deck-cycle-counter", `${-deckCycleRotation}deg`);
    document.querySelectorAll(".presentation-cycle [data-cycle]").forEach((node) => node.classList.toggle("is-active", Number(node.dataset.cycle) === safeIndex));
    document.querySelector("#cycle-text").textContent = cycleTexts[safeIndex] || cycleTexts[0];
  }

  document.querySelectorAll(".presentation-cycle [data-cycle]").forEach((button) => {
    const activate = () => activatePresentationCycle(button.dataset.cycle);
    button.addEventListener("pointerenter", activate);
    button.addEventListener("focus", activate);
    button.addEventListener("click", activate);
  });

  function renderPlatformPreview(key) {
    const detail = platformDetails[key];
    if (!detail || !platformPreview) return;
    platformPreview.hidden = false;
    document.querySelector("#platform-preview-number").textContent = String(key).padStart(2, "0");
    document.querySelector("#platform-preview-title").textContent = detail.title.replace(/^\d+ · /, "");
    document.querySelector("#platform-preview-summary").textContent = detail.summary;
    platformPreviewGallery.classList.toggle("has-two", detail.images.length > 1);
    platformPreviewGallery.innerHTML = detail.images.map((image) => `<figure class="device-frame ${image.frame || "desktop"}"><div><img src="${image.src}" alt="${image.alt}"></div><figcaption>${image.caption}</figcaption></figure>`).join("");
  }

  document.querySelectorAll("[data-platform]").forEach((button) => {
    const preview = () => renderPlatformPreview(button.dataset.platform);
    button.addEventListener("pointerenter", preview);
    button.addEventListener("focus", preview);
    button.addEventListener("click", () => openPlatformDialog(button.dataset.platform));
  });
  document.querySelector("#platform-dialog-close").addEventListener("click", () => platformDialog.close());
  platformDialog.addEventListener("click", (event) => { if (event.target === platformDialog) platformDialog.close(); });

  function openPlatformDialog(key) {
    const detail = platformDetails[key];
    if (!detail) return;
    document.querySelector("#platform-dialog-title").textContent = detail.title;
    document.querySelector("#platform-dialog-summary").textContent = detail.summary;
    const gallery = document.querySelector("#platform-dialog-gallery");
    gallery.classList.toggle("has-two", detail.images.length > 1);
    gallery.innerHTML = detail.images.map((image) => `<figure><img src="${image.src}" alt="${image.alt}"><figcaption>${image.caption}</figcaption></figure>`).join("");
    platformDialog.showModal();
  }

  function renderFilePreview(key) {
    const detail = fileDetails[key];
    const preview = document.querySelector("#file-live-preview");
    if (!detail || !preview) return;
    preview.dataset.fileMode = key;
    document.querySelector("#file-preview-name").textContent = detail.title;
    document.querySelector("#file-preview-title").textContent = detail.summary;
    document.querySelector("#file-preview-text").textContent = detail.example;
  }

  document.querySelectorAll("[data-file]").forEach((button) => {
    const preview = () => renderFilePreview(button.dataset.file);
    button.addEventListener("pointerenter", preview);
    button.addEventListener("focus", preview);
    button.addEventListener("click", () => openFileDialog(button.dataset.file));
  });
  document.querySelector("#file-dialog-close").addEventListener("click", () => fileDialog.close());
  fileDialog.addEventListener("click", (event) => { if (event.target === fileDialog) fileDialog.close(); });

  function openFileDialog(key) {
    const detail = fileDetails[key];
    if (!detail) return;
    document.querySelector("#file-dialog-title").textContent = detail.title;
    document.querySelector("#file-dialog-summary").textContent = detail.summary;
    document.querySelector("#file-dialog-list").innerHTML = detail.list.map((item) => `<li>${item}</li>`).join("");
    document.querySelector("#file-dialog-example").textContent = detail.example;
    fileDialog.showModal();
  }

  function isFullscreen() { return Boolean(document.fullscreenElement || document.webkitFullscreenElement); }
  async function toggleFullscreen() {
    try {
      if (isFullscreen()) {
        if (document.exitFullscreen) await document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      } else if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      } else if (document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen();
      }
    } catch (error) {
      fullscreenButton.title = "Vollbildmodus wurde vom Browser blockiert";
    }
  }

  fullscreenButton.addEventListener("click", toggleFullscreen);
  document.addEventListener("fullscreenchange", updateFullscreenButton);
  document.addEventListener("webkitfullscreenchange", updateFullscreenButton);
  function updateFullscreenButton() {
    const active = isFullscreen();
    fullscreenButton.textContent = active ? "×" : "⛶";
    fullscreenButton.setAttribute("aria-label", active ? "Vollbildmodus verlassen" : "Vollbildmodus einschalten");
    fullscreenButton.title = active ? "Vollbildmodus verlassen" : "Vollbildmodus einschalten";
  }
  if (!document.documentElement.requestFullscreen && !document.documentElement.webkitRequestFullscreen) fullscreenButton.hidden = true;

  document.querySelector("#demo-folder-open")?.addEventListener("click", async () => {
    const folderPath = "C:\\Users\\Tobias.Arnold\\OneDrive - Kt. SG BLD\\Desktop\\VibeCoding GBS Bauabteilung";
    const status = document.querySelector("#demo-folder-status");
    let copied = false;
    try { await navigator.clipboard.writeText(folderPath); copied = true; } catch (error) { /* The path remains visible as fallback. */ }
    if (location.protocol === "file:") window.open("file:///C:/Users/Tobias.Arnold/OneDrive%20-%20Kt.%20SG%20BLD/Desktop/VibeCoding%20GBS%20Bauabteilung", "_blank");
    if (location.protocol === "file:") status.textContent = copied ? "Ordner wird geöffnet. Der Pfad wurde zusätzlich kopiert." : `Ordner wird geöffnet. Pfad: ${folderPath}`;
    else status.textContent = copied ? "Browser schützen lokale Ordner. Der vollständige Pfad wurde kopiert." : `Browser schützen lokale Ordner. Öffne diesen Pfad im Explorer: ${folderPath}`;
  });

  function renderQr() {
    const qrCode = document.querySelector("#qr-code");
    const qrUrl = document.querySelector("#qr-url");
    const url = new URL("wissen.html", location.href).href.split("#")[0];
    qrUrl.textContent = url;
    if (!window.VibeQR) { qrCode.textContent = "QR-Code nicht verfügbar."; return; }
    try {
      window.VibeQR.render(qrCode, url, { cellSize: 11, margin: 4 });
    } catch (error) {
      qrCode.textContent = "QR-Code konnte nicht erzeugt werden.";
    }
  }

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => navigator.serviceWorker.register("service-worker.js?v=4.2.0", { scope: "./" }).catch(() => {}));
  }

  renderQr();
  go(current, true);
})();
