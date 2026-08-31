(function () {
  "use strict";

  const copyButton = document.querySelector("#knowledge-copy-prompt");
  const prompt = document.querySelector("#knowledge-group-prompt");
  const installDialog = document.querySelector("#install-dialog");
  const installTitle = document.querySelector("#install-dialog-title");
  const installSteps = document.querySelector("#install-dialog-steps");
  const nativeInstall = document.querySelector("#native-install");
  const installNudge = document.querySelector("#install-nudge");
  const installButtons = Array.from(document.querySelectorAll("[data-install]"));
  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isAndroid = /android/i.test(navigator.userAgent);
  let deferredInstall = null;

  function isStandalone() {
    return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  }

  copyButton?.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(prompt.textContent.trim());
      copyButton.textContent = "Kopiert";
    } catch (error) {
      copyButton.textContent = "Bitte Text markieren";
    }
    window.setTimeout(() => { copyButton.textContent = "Prompt kopieren"; }, 1800);
  });

  function setInstallSteps(items) {
    installSteps.innerHTML = items.map((item) => `<p>${item}</p>`).join("");
  }

  function showInstallGuide(platform) {
    nativeInstall.hidden = true;
    if (isStandalone()) {
      installTitle.textContent = "Die WebApp ist bereits geöffnet";
      setInstallSteps(["Du nutzt diese Seite bereits vom Home-Bildschirm aus."]);
    } else if (deferredInstall && platform !== "ios") {
      installTitle.textContent = "Vibecoding als WebApp installieren";
      setInstallSteps(["Tippe unten auf «Jetzt installieren».", "Bestätige den Browserdialog. Danach findest du Vibecoding auf deinem Home-Bildschirm."]);
      nativeInstall.hidden = false;
    } else if (platform === "ios") {
      installTitle.textContent = "Auf iPhone oder iPad hinzufügen";
      setInstallSteps(["Öffne diese Seite in Safari.", "Tippe unten auf das Teilen-Symbol.", "Wähle «Zum Home-Bildschirm» und danach «Hinzufügen»."]);
    } else if (platform === "android") {
      installTitle.textContent = "Auf Android hinzufügen";
      setInstallSteps(["Öffne das Browsermenü oben rechts.", "Tippe auf «App installieren» oder «Zum Startbildschirm hinzufügen».", "Bestätige die Installation."]);
    } else {
      installTitle.textContent = "Auf dem Home-Bildschirm speichern";
      setInstallSteps(["Öffne das Menü deines Browsers.", "Wähle «App installieren» oder «Zum Startbildschirm hinzufügen».", "Bestätige den Namen Vibecoding."]);
    }
    installDialog.showModal();
  }

  async function requestInstall() {
    if (isStandalone()) {
      showInstallGuide();
      return;
    }
    if (!deferredInstall) {
      showInstallGuide(isIos ? "ios" : isAndroid ? "android" : "desktop");
      return;
    }
    deferredInstall.prompt();
    await deferredInstall.userChoice;
    deferredInstall = null;
    installNudge.hidden = true;
  }

  installButtons.forEach((button) => button.addEventListener("click", requestInstall));
  document.querySelectorAll("[data-platform-help]").forEach((button) => button.addEventListener("click", () => showInstallGuide(button.dataset.platformHelp)));
  document.querySelector("#install-dialog-close")?.addEventListener("click", () => installDialog.close());
  installDialog?.addEventListener("click", (event) => { if (event.target === installDialog) installDialog.close(); });
  nativeInstall?.addEventListener("click", async () => { installDialog.close(); await requestInstall(); });
  document.querySelector("#install-nudge-close")?.addEventListener("click", () => {
    installNudge.hidden = true;
    window.sessionStorage.setItem("vibecoding-install-dismissed", "1");
  });

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstall = event;
  });

  window.addEventListener("appinstalled", () => {
    deferredInstall = null;
    installNudge.hidden = true;
    installButtons.forEach((button) => {
      button.textContent = "WebApp installiert";
      button.disabled = true;
    });
  });

  if (isStandalone()) {
    installButtons.forEach((button) => {
      button.textContent = "Als WebApp geöffnet";
      button.disabled = true;
    });
  } else if (!window.sessionStorage.getItem("vibecoding-install-dismissed")) {
    window.setTimeout(() => { installNudge.hidden = false; }, 1400);
  }

  const progress = document.querySelector("#knowledge-progress-bar");
  function updateProgress() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = `${max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0}%`;
  }
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);
  updateProgress();

  document.body.classList.add("reveal-ready");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => navigator.serviceWorker.register("service-worker.js?v=3.1.0", { scope: "./" }).catch(() => {}));
  }
})();
