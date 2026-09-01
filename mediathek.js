(function () {
  "use strict";

  const VERSION = "4.2.3";
  const DISCOVERY_KEY = "vibecoding-discoveries-v1";
  const PROGRESS_KEY = "vibecoding-learning-progress-v1";
  const cards = Array.from(document.querySelectorAll(".video-card"));
  const filters = Array.from(document.querySelectorAll(".media-filter[data-filter]"));
  const learningProgressButton = document.querySelector("#learning-progress-button");
  const learningProgressPercent = document.querySelector("#learning-progress-percent");
  const learningProgressPopover = document.querySelector("#learning-progress-popover");
  const learningProgressSummary = document.querySelector("#learning-progress-summary");
  const progressTitle = document.querySelector("#media-progress-title");
  const progressCopy = document.querySelector("#media-progress-copy");
  const progressBar = document.querySelector("#media-progress-bar");
  const toast = document.querySelector("#discovery-toast");
  const discoveries = readDiscoveries();
  let activeFilter = "all";
  let toastTimer = 0;

  function readDiscoveries() {
    try {
      const saved = JSON.parse(localStorage.getItem(DISCOVERY_KEY) || "[]");
      return new Set(Array.isArray(saved) ? saved : []);
    } catch (error) {
      return new Set();
    }
  }

  function saveDiscoveries() {
    try { localStorage.setItem(DISCOVERY_KEY, JSON.stringify(Array.from(discoveries))); } catch (error) { /* Storage can be blocked. */ }
  }

  function showToast(message) {
    window.clearTimeout(toastTimer);
    toast.hidden = false;
    toast.textContent = message;
    toast.classList.remove("is-showing");
    void toast.offsetWidth;
    toast.classList.add("is-showing");
    toastTimer = window.setTimeout(() => { toast.hidden = true; }, 1900);
  }

  function reward(key, label) {
    if (discoveries.has(key)) return false;
    discoveries.add(key);
    saveDiscoveries();
    updateProgress();
    showToast(`Entdeckt · ${label}`);
    return true;
  }

  function updateProgress() {
    let highestStep = 0;
    try { highestStep = Math.max(0, Math.min(7, Number(localStorage.getItem(PROGRESS_KEY)) || 0)); } catch (error) { /* Storage can be blocked. */ }
    learningProgressPercent.textContent = `${Math.round((highestStep / 7) * 100)}%`;
    const missing = 7 - highestStep;
    learningProgressSummary.textContent = missing === 0 ? "Alle 7 Schritte sind abgeschlossen." : `Es fehlen noch ${missing} von 7 Schritten.`;
    const watched = cards.filter((card) => discoveries.has(`video:${card.dataset.video}`)).length;
    cards.forEach((card) => card.classList.toggle("is-visited", discoveries.has(`video:${card.dataset.video}`)));
    document.querySelectorAll("[data-resource]").forEach((link) => link.classList.toggle("is-visited", discoveries.has(`resource:${link.dataset.resource}`)));
    progressTitle.textContent = `${watched} von ${cards.length} Videos entdeckt`;
    progressBar.style.width = `${(watched / cards.length) * 100}%`;
    progressCopy.textContent = watched === cards.length
      ? "Mediathek vollständig entdeckt. Jetzt ist deine eigene kleine Idee dran."
      : watched > 0
        ? "Gut unterwegs. Wähle selbst weiter oder lass dich überraschen."
        : "Starte mit dem Thema, das dich am meisten interessiert.";
  }

  function applyFilter(filter) {
    activeFilter = filter;
    filters.forEach((button) => {
      const active = button.dataset.filter === filter;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    cards.forEach((card) => { card.hidden = filter !== "all" && !card.dataset.topic.split(" ").includes(filter); });
    reward(`media-filter:${filter}`, `${filters.find((button) => button.dataset.filter === filter)?.textContent || "Thema"} gewählt`);
  }

  filters.forEach((button) => button.addEventListener("click", () => applyFilter(button.dataset.filter)));

  cards.forEach((card) => {
    card.addEventListener("click", () => reward(`video:${card.dataset.video}`, "Lernvideo geöffnet"));
  });

  document.querySelectorAll("[data-resource]").forEach((link) => {
    link.addEventListener("click", () => reward(`resource:${link.dataset.resource}`, "Lesetipp geöffnet"));
  });

  document.querySelector("#surprise-video")?.addEventListener("click", () => {
    const visible = cards.filter((card) => !card.hidden);
    const unvisited = visible.filter((card) => !discoveries.has(`video:${card.dataset.video}`));
    const pool = unvisited.length ? unvisited : visible;
    const target = pool[Math.floor(Math.random() * pool.length)];
    if (!target) return;
    cards.forEach((card) => card.classList.remove("is-highlighted"));
    target.classList.add("is-highlighted");
    target.scrollIntoView({ behavior: "smooth", block: "center" });
    showToast("Dieser Inhalt könnte zu dir passen.");
    window.setTimeout(() => target.classList.remove("is-highlighted"), 2200);
  });

  learningProgressButton?.addEventListener("click", () => {
    const willOpen = learningProgressPopover.hidden;
    learningProgressPopover.hidden = !willOpen;
    learningProgressButton.setAttribute("aria-expanded", String(willOpen));
  });
  document.addEventListener("click", (event) => {
    if (learningProgressPopover && !event.target.closest(".learning-progress-control")) {
      learningProgressPopover.hidden = true;
      learningProgressButton?.setAttribute("aria-expanded", "false");
    }
  });

  updateProgress();
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => navigator.serviceWorker.register(`service-worker.js?v=${VERSION}`, { scope: "./" }).catch(() => {}));
  }
})();
