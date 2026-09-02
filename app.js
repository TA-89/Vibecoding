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
  const qrDialog = document.querySelector("#qr-dialog");
  const presentationCycle = document.querySelector("#presentation-cycle");
  let current = readHash();
  let touchStartX = 0;
  let touchStartY = 0;
  let deckCycleRotation = 0;
  let deckCycleStep = 0;
  let ideaBurstTimer = 0;
  let storyTimer = 0;

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
    window.clearTimeout(storyTimer);
    const storyPrompt = document.querySelector("#story-live-prompt");
    storyPrompt?.classList.remove("is-visible");
    if (current === 3) storyTimer = window.setTimeout(() => storyPrompt?.classList.add("is-visible"), 10000);
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

  function resetPresentationCycle() {
    deckCycleStep = 0;
    deckCycleRotation = 0;
    presentationCycle?.style.setProperty("--deck-cycle-turn", `${deckCycleRotation}deg`);
    presentationCycle?.style.setProperty("--deck-cycle-counter", `${-deckCycleRotation}deg`);
    document.querySelectorAll(".presentation-cycle [data-cycle]").forEach((node) => node.classList.remove("is-active", "is-visited"));
    document.querySelector("#cycle-text").textContent = "Ein Klick startet den ersten Schritt.";
    document.querySelector("#cycle-auto-label").textContent = "Start";
  }

  document.querySelector("#cycle-auto")?.addEventListener("click", (event) => {
    if (deckCycleStep >= 4) {
      resetPresentationCycle();
      return;
    }
    const completedIndex = deckCycleStep;
    deckCycleStep += 1;
    deckCycleRotation = deckCycleStep * -90;
    presentationCycle?.style.setProperty("--deck-cycle-turn", `${deckCycleRotation}deg`);
    presentationCycle?.style.setProperty("--deck-cycle-counter", `${-deckCycleRotation}deg`);
    document.querySelectorAll(".presentation-cycle [data-cycle]").forEach((node) => {
      const index = Number(node.dataset.cycle);
      node.classList.toggle("is-visited", index < deckCycleStep);
      node.classList.toggle("is-active", index === completedIndex);
    });
    document.querySelector("#cycle-text").textContent = cycleTexts[completedIndex];
    document.querySelector("#cycle-auto-label").textContent = deckCycleStep === 4 ? "Neue Runde" : "Weiter";
    event.currentTarget.title = deckCycleStep === 4 ? "Kreislauf zurücksetzen" : "Nächsten Schritt zeigen";
  });

  document.querySelectorAll("[data-platform]").forEach((button) => {
    button.addEventListener("click", () => openPlatformDialog(button.dataset.platform));
  });
  platformDialog.addEventListener("click", (event) => { if (event.target === platformDialog) platformDialog.close(); });
  document.querySelector("#platform-dialog-gallery")?.addEventListener("click", (event) => {
    if (event.target.closest(".dialog-device-screen")) platformDialog.close();
  });

  function openPlatformDialog(key) {
    const detail = platformDetails[key];
    if (!detail) return;
    const gallery = document.querySelector("#platform-dialog-gallery");
    gallery.classList.toggle("has-two", detail.images.length > 1);
    gallery.innerHTML = detail.images.map((image) => {
      const frame = image.frame || "desktop";
      const filename = image.src.split("/").pop().replace(/\.[^.]+$/, "");
      const mockup = `images/mockup-${filename}.png`;
      return `<figure class="dialog-device ${frame}"><div class="dialog-device-screen"><img class="dialog-device-render" src="${mockup}" alt="${image.alt}"></div></figure>`;
    }).join("");
    platformDialog.showModal();
  }

  function renderFilePreview(key) {
    const detail = fileDetails[key];
    const preview = document.querySelector("#file-live-preview");
    if (!detail || !preview) return;
    preview.dataset.fileMode = key;
    preview.classList.remove("is-demo-running");
    const demoButton = document.querySelector("#mini-demo-start");
    if (demoButton) demoButton.textContent = "Start";
    document.querySelector("#file-preview-name").textContent = detail.title;
    document.querySelector("#file-preview-title").textContent = detail.summary;
    document.querySelector("#file-preview-text").textContent = detail.example;
  }

  document.querySelectorAll("[data-file]").forEach((button) => {
    button.addEventListener("click", () => {
      renderFilePreview(button.dataset.file);
      document.querySelectorAll("[data-file]").forEach((item) => item.classList.toggle("is-selected", item === button));
    });
  });
  document.querySelector("#mini-demo-start")?.addEventListener("click", (event) => {
    const preview = document.querySelector("#file-live-preview");
    if (!preview || preview.dataset.fileMode === "images") return;
    const running = preview.classList.toggle("is-demo-running");
    event.currentTarget.textContent = running ? "Noch einmal" : "Start";
  });
  document.querySelector("#file-dialog-close").addEventListener("click", () => fileDialog.close());
  fileDialog.addEventListener("click", (event) => { if (event.target === fileDialog) fileDialog.close(); });

  qrDialog?.addEventListener("click", (event) => { if (event.target === qrDialog) qrDialog.close(); });

  function openFileDialog(key) {
    const detail = fileDetails[key];
    if (!detail) return;
    document.querySelector("#file-dialog-title").textContent = detail.title;
    document.querySelector("#file-dialog-summary").textContent = detail.summary;
    document.querySelector("#file-dialog-list").innerHTML = detail.list.map((item) => `<li>${item}</li>`).join("");
    document.querySelector("#file-dialog-example").textContent = detail.example;
    fileDialog.showModal();
  }

  const ideaLabels = [
    "Lernkarten", "Werkstattplan", "Materialcheck", "Zufallsfragen", "Fotolernweg", "Peerfeedback",
    "Sicherheitsquiz", "QR-Posten", "Kompetenzrad", "Mini-Simulation", "Wochenplan", "Absenzenhilfe",
    "Lernzielcheck", "Begriffsduell", "Praxisjournal", "Fehlersuche", "Klassenspiel", "Messwerthelfer",
    "Projektboard", "Berichtscoach", "Reflexionsrad", "Bildvergleich", "Auftragscheck", "Ideenlabor"
  ];

  function launchIdeaBurst() {
    const layer = document.querySelector("#idea-burst-layer");
    if (!layer) return;
    window.clearTimeout(ideaBurstTimer);
    layer.innerHTML = ideaLabels.map((label, index) => {
      const angle = (index / ideaLabels.length) * Math.PI * 2;
      const radius = 36 + ((index * 17) % 42);
      const x = 50 + Math.cos(angle) * radius;
      const y = 50 + Math.sin(angle) * radius;
      const size = 70 + ((index * 13) % 48);
      return `<span class="floating-idea" style="--idea-x:${x.toFixed(1)}%;--idea-y:${y.toFixed(1)}%;--idea-size:${size}px;--idea-delay:${(index % 8) * 45}ms"><i aria-hidden="true"><b></b><b></b><b></b></i><em>${label}</em></span>`;
    }).join("");
    layer.classList.remove("is-active");
    void layer.offsetWidth;
    layer.classList.add("is-active");
    ideaBurstTimer = window.setTimeout(() => layer.classList.remove("is-active"), 7000);
  }

  document.querySelector("#idea-burst")?.addEventListener("click", launchIdeaBurst);

  document.querySelector("#ftp-info-button")?.addEventListener("click", (event) => {
    const info = document.querySelector("#ftp-info");
    if (!info) return;
    const willOpen = info.hidden;
    info.hidden = !willOpen;
    event.currentTarget.setAttribute("aria-expanded", String(willOpen));
  });

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

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => navigator.serviceWorker.register("service-worker.js?v=4.3.1", { scope: "./" }).catch(() => {}));
  }

  go(current, true);
})();
