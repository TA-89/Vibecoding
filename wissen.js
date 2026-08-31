(function () {
  "use strict";

  const copyButton = document.querySelector("#knowledge-copy-prompt");
  const prompt = document.querySelector("#knowledge-group-prompt");

  copyButton?.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(prompt.textContent.trim());
      copyButton.textContent = "Kopiert";
    } catch (error) {
      copyButton.textContent = "Bitte Text markieren";
    }
    window.setTimeout(() => { copyButton.textContent = "Prompt kopieren"; }, 1800);
  });

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => navigator.serviceWorker.register("service-worker.js?v=3.0.0", { scope: "./" }).catch(() => {}));
  }
})();
