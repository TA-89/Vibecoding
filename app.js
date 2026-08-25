(function () {
  "use strict";

  const slides = Array.from(document.querySelectorAll(".slide"));
  const counter = document.querySelector("#counter");
  const progress = document.querySelector("#progress-bar");
  const overview = document.querySelector("#overview");
  const overviewGrid = document.querySelector("#overview-grid");
  const prevButton = document.querySelector("#prev-btn");
  const nextButton = document.querySelector("#next-btn");
  const fileDialog = document.querySelector("#file-dialog");
  let current = readHash();
  let touchStartX = 0;
  let touchStartY = 0;

  const cycleTexts = [
    "Beschreibe zuerst das Problem, die Zielgruppe und den kleinsten nützlichen Ablauf.",
    "Die KI erstellt oder verändert die benötigten Dateien und erklärt, was sie gemacht hat.",
    "Öffnen, klicken und ehrlich prüfen: Ist die Lösung verständlich und im Unterricht brauchbar?",
    "Eine konkrete Rückmeldung geben, erneut testen und die nächste Verbesserung anstossen."
  ];

  const fileDetails = {
    index: {
      title: "index.html",
      summary: "Die Hauptseite legt fest, welche Inhalte auf der Webseite stehen und in welcher Reihenfolge sie erscheinen.",
      list: ["Überschriften und Texte", "Buttons und Eingabefelder", "Bilder und Links", "Bereiche und Reihenfolge"],
      example: "HTML ist wie der Rohbau eines Hauses: Räume, Türen und Fenster sind vorhanden, aber das Aussehen kommt erst später."
    },
    css: {
      title: "style.css",
      summary: "Diese Datei bestimmt das gesamte Erscheinungsbild und sorgt dafür, dass die Seite auf Handy und Computer funktioniert.",
      list: ["Farben und Schriften", "Abstände und Grössen", "Anordnung der Inhalte", "Darstellung auf kleinen Bildschirmen"],
      example: "CSS ist die Gestaltung: Es legt fest, ob ein Button limegrün, gross, linksbündig oder auf dem Handy untereinander erscheint."
    },
    js: {
      title: "app.js",
      summary: "JavaScript macht die Seite interaktiv und reagiert auf das Verhalten der Benutzerinnen und Benutzer.",
      list: ["Klicks auswerten", "Ansichten öffnen", "Daten prüfen", "Inhalte aktualisieren"],
      example: "JavaScript entscheidet zum Beispiel, was nach dem Klick auf «Bild hochladen» oder «Freigeben» passiert."
    },
    php: {
      title: "bild-der-woche.php",
      summary: "Die Serverdatei verarbeitet Uploads und entscheidet, welche Bilder gespeichert, freigegeben oder gelöscht werden.",
      list: ["Dateien sicher entgegennehmen", "Klasse und Status speichern", "Freigaben verarbeiten", "Alte Bilder automatisch löschen"],
      example: "Diese Datei arbeitet auf dem Webserver. Sie ist die Verbindung zwischen dem Upload auf dem Handy und der Galerie der Klasse."
    },
    images: {
      title: "images/",
      summary: "Im Bilderordner liegen die visuellen Inhalte, welche die Webseite direkt anzeigen darf.",
      list: ["Fotos", "Hintergrundbilder", "Screenshots", "Grafiken"],
      example: "Die Webseite merkt sich nicht das Bild selbst im HTML, sondern den Weg zu einer Bilddatei in diesem Ordner."
    },
    readme: {
      title: "README.md",
      summary: "Die README erklärt Menschen, was das Projekt macht und wie es verwendet, getestet oder veröffentlicht wird.",
      list: ["Zweck des Projekts", "Installation und Start", "Wichtige Dateien", "Hinweise für spätere Änderungen"],
      example: "Sie ist der Beipackzettel des Projekts. Der eigentliche Code funktioniert auch ohne sie, Menschen finden sich mit ihr aber schneller zurecht."
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

  prevButton.addEventListener("click", previous);
  nextButton.addEventListener("click", next);
  document.querySelector("#overview-open").addEventListener("click", () => overview.showModal());

  document.addEventListener("keydown", (event) => {
    if (overview.open || fileDialog.open || event.target.matches("textarea, input, button, a")) return;
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
    if (!touchStartX || event.target.closest("a, button, dialog, pre")) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - touchStartX;
    const dy = touch.clientY - touchStartY;
    touchStartX = 0;
    touchStartY = 0;
    if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.2) dx < 0 ? next() : previous();
  }, { passive: true });

  function toggleFullscreen() {
    if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else if (document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
  }

  slides.forEach((slide, index) => {
    const button = document.createElement("button");
    button.className = "overview-card";
    button.type = "button";
    button.innerHTML = `<small>${String(index + 1).padStart(2, "0")}</small>${slide.dataset.title || "Folie"}`;
    button.addEventListener("click", () => { overview.close(); go(index); });
    overviewGrid.append(button);
  });

  document.querySelectorAll("[data-cycle]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-cycle]").forEach((node) => node.classList.toggle("is-active", node === button));
      document.querySelector("#cycle-text").textContent = cycleTexts[Number(button.dataset.cycle)] || cycleTexts[0];
    });
  });

  document.querySelectorAll("[data-file]").forEach((button) => {
    button.addEventListener("click", () => openFileDialog(button.dataset.file));
  });

  function openFileDialog(key) {
    const detail = fileDetails[key];
    if (!detail) return;
    document.querySelector("#file-dialog-title").textContent = detail.title;
    document.querySelector("#file-dialog-summary").textContent = detail.summary;
    document.querySelector("#file-dialog-list").innerHTML = detail.list.map((item) => `<li>${item}</li>`).join("");
    document.querySelector("#file-dialog-example").textContent = detail.example;
    fileDialog.showModal();
  }

  document.querySelector("#file-dialog-close").addEventListener("click", () => fileDialog.close());
  fileDialog.addEventListener("click", (event) => {
    if (event.target === fileDialog) fileDialog.close();
  });

  document.querySelector("#copy-prompt").addEventListener("click", async (event) => {
    const button = event.currentTarget;
    const text = document.querySelector("#group-prompt").textContent.trim();
    try {
      await navigator.clipboard.writeText(text);
      button.textContent = "Kopiert";
    } catch (error) {
      button.textContent = "Bitte Text markieren";
    }
    window.setTimeout(() => { button.textContent = "Prompt kopieren"; }, 1800);
  });

  function renderQr() {
    const qrCode = document.querySelector("#qr-code");
    const qrUrl = document.querySelector("#qr-url");
    if (!qrCode || !qrUrl) return;
    const url = new URL("wissen.html", location.href).href.split("#")[0];
    qrUrl.textContent = url;
    if (!window.VibeQR) { qrCode.textContent = "QR-Code nicht verfügbar."; return; }
    try {
      window.VibeQR.render(qrCode, url, { cellSize: 8, margin: 4 });
    } catch (error) {
      qrCode.textContent = "QR-Code konnte für diese Adresse nicht erzeugt werden.";
    }
  }

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => navigator.serviceWorker.register("service-worker.js?v=2.0.1", { scope: "./" }).catch(() => {}));
  }

  renderQr();
  go(current, true);
})();
