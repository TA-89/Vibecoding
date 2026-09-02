(function () {
  "use strict";

  const VERSION = "4.3.1";
  const DISCOVERY_KEY = "vibecoding-discoveries-v1";
  const PROGRESS_KEY = "vibecoding-learning-progress-v2";
  const HUB_CARD_IDS = ["hub-definition", "hub-cycle", "hub-prompt", "hub-ideas", "hub-tools", "hub-publish", "hub-safety", "hub-examples", "hub-glossary", "hub-sources", "mediathek", "presentation"];
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
  let learningProgress = readLearningProgress();
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

  function readLearningProgress() {
    try {
      const saved = JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}");
      return {
        journey: Array.isArray(saved.journey) ? saved.journey : [],
        cards: Array.isArray(saved.cards) ? saved.cards : [],
        mediaOpened: saved.mediaOpened === true,
        videos: Array.isArray(saved.videos) ? saved.videos : []
      };
    } catch (error) {
      return { journey: [], cards: [], mediaOpened: false, videos: [] };
    }
  }

  function saveLearningProgress() {
    try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(learningProgress)); } catch (error) { /* Storage can be blocked. */ }
  }

  function markLearningProgress(group, value) {
    if (group === "mediaOpened") {
      learningProgress.mediaOpened = true;
    } else if (Array.isArray(learningProgress[group]) && !learningProgress[group].includes(value)) {
      learningProgress[group].push(value);
    }
    saveLearningProgress();
    updateProgress();
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
    const journeyDone = new Set(learningProgress.journey.map(Number).filter((step) => step >= 1 && step <= 7)).size;
    const cardsDone = HUB_CARD_IDS.filter((id) => learningProgress.cards.includes(id)).length;
    const watched = cards.filter((card) => learningProgress.videos.includes(card.dataset.video)).length;
    const mediaDone = learningProgress.mediaOpened ? 1 : 0;
    const total = 7 + HUB_CARD_IDS.length + 1 + cards.length;
    const completed = journeyDone + cardsDone + mediaDone + watched;
    learningProgressPercent.textContent = `${Math.round((completed / total) * 100)}%`;
    if (completed === total) {
      learningProgressSummary.textContent = "100 %: Lernreise, Wissenskarten und Mediathek sind vollständig entdeckt.";
    } else {
      const parts = [];
      if (journeyDone < 7) parts.push(`${7 - journeyDone} Lernschritt${7 - journeyDone === 1 ? "" : "e"}`);
      if (cardsDone < HUB_CARD_IDS.length) parts.push(`${HUB_CARD_IDS.length - cardsDone} Wissenskarte${HUB_CARD_IDS.length - cardsDone === 1 ? "" : "n"}`);
      if (!mediaDone) parts.push("Mediathek öffnen");
      if (watched < cards.length) parts.push(`${cards.length - watched} Video${cards.length - watched === 1 ? "" : "s"}`);
      learningProgressSummary.textContent = `Noch offen: ${parts.join(" · ")}.`;
    }
    cards.forEach((card) => card.classList.toggle("is-visited", learningProgress.videos.includes(card.dataset.video)));
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
    card.addEventListener("click", () => {
      markLearningProgress("videos", card.dataset.video);
      reward(`video:${card.dataset.video}`, "Lernvideo geöffnet");
    });
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

  markLearningProgress("cards", "mediathek");
  markLearningProgress("mediaOpened", true);
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => navigator.serviceWorker.register(`service-worker.js?v=${VERSION}`, { scope: "./" }).catch(() => {}));
  }
})();
