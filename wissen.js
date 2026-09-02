(function () {
  "use strict";

  const VERSION = "4.4.2";
  const FIRST_VISIT_KEY = "vibecoding-install-info-v1";
  const DISCOVERY_KEY = "vibecoding-discoveries-v1";
  const PROGRESS_KEY = "vibecoding-learning-progress-v2";
  const HUB_CARD_IDS = ["hub-definition", "hub-cycle", "hub-prompt", "hub-ideas", "hub-tools", "hub-publish", "hub-safety", "hub-examples", "hub-glossary", "hub-sources", "mediathek", "presentation"];
  const REQUIRED_VIDEO_COUNT = 5;
  const stepElements = Array.from(document.querySelectorAll(".journey-step"));
  const backButton = document.querySelector("#journey-back");
  const nextButton = document.querySelector("#journey-next");
  const navHint = document.querySelector("#journey-nav-hint");
  const stepLabel = document.querySelector("#journey-step-label");
  const progressBar = document.querySelector("#journey-progress-bar");
  const journeyNav = document.querySelector(".journey-nav");
  const generatedPrompt = document.querySelector("#generated-prompt-text");
  const detailDialog = document.querySelector("#detail-dialog");
  const detailContent = document.querySelector("#detail-dialog-content");
  const installDialog = document.querySelector("#install-dialog");
  const installTitle = document.querySelector("#install-dialog-title");
  const installIntro = document.querySelector("#install-dialog-intro");
  const installSteps = document.querySelector("#install-dialog-steps");
  const nativeInstall = document.querySelector("#native-install");
  const learningProgressButton = document.querySelector("#learning-progress-button");
  const learningProgressPercent = document.querySelector("#learning-progress-percent");
  const learningProgressPopover = document.querySelector("#learning-progress-popover");
  const learningProgressSummary = document.querySelector("#learning-progress-summary");
  const discoveryToast = document.querySelector("#discovery-toast");
  const cycleOrbit = document.querySelector("#cycle-orbit");
  const cycleFeedback = document.querySelector("#cycle-feedback");
  const cycleCount = document.querySelector("#cycle-count");
  const cycleDialog = document.querySelector("#cycle-dialog");
  const cycleDialogNumber = document.querySelector("#cycle-dialog-number");
  const cycleDialogTitle = document.querySelector("#cycle-dialog-title");
  const cycleDialogText = document.querySelector("#cycle-dialog-text");
  const cycleDialogProgress = document.querySelector("#cycle-dialog-progress");
  const promptLiveStatus = document.querySelector("#prompt-live-status");
  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isAndroid = /android/i.test(navigator.userAgent);
  const cycleVisited = new Set();
  const quizAnswered = new Set();
  const discoveries = readDiscoveries();
  let currentStep = 1;
  let deferredInstall = null;
  let orbitRotation = 0;
  let activeCycleIndex = -1;
  let toastTimer = 0;
  let learningProgress = readLearningProgress();

  const state = {
    project: null,
    audience: "lernende",
    device: "handy",
    rule: ""
  };

  const projects = {
    gruppen: {
      title: "Gruppengenerator",
      promptNoun: "einen einfachen Gruppengenerator",
      speech: "«Ich brauche einen Gruppengenerator, der auf dem Handy funktioniert.»",
      aiAction: "Erstellt Eingabefelder für Namen, eine Gruppenauswahl und einen Knopf zum fairen Verteilen.",
      resultAction: "Probierst Fantasienamen aus und meldest zurück, wenn eine Person allein bleibt oder die Bedienung auf dem Handy noch hakt.",
      goal: "Namen zufällig und möglichst gleichmässig auf Gruppen verteilen",
      features: "Ich füge Namen ein und wähle die Anzahl Gruppen. Niemand soll am Schluss allein in einer Gruppe sein.",
      description: "Ein überschaubares Werkzeug, das Namen fair verteilt.",
      test: "Mit fünf Fantasienamen und zwei Gruppen ausprobieren"
    },
    quiz: {
      title: "Lernquiz oder H5P-Idee",
      promptNoun: "eine einfache digitale Lernübung",
      speech: "«Ich brauche eine kurze Übung mit sofortiger Rückmeldung.»",
      aiAction: "Baut drei erste Fragen, Antwortknöpfe und eine verständliche Rückmeldung nach jeder Auswahl.",
      resultAction: "Beantwortest jede Frage richtig und falsch und sagst, welche Rückmeldung fachlich noch klarer werden muss.",
      goal: "eine kurze Übung zu einem klaren Lernziel erstellen",
      features: "Nach jeder Antwort soll eine verständliche Rückmeldung erscheinen. Am Schluss wird gezeigt, was bereits sitzt und was noch geübt werden sollte.",
      description: "Eine kurze Lernaktivität mit direkter Rückmeldung.",
      test: "Mit drei Fragen und zwei möglichen Antworten starten"
    },
    checkliste: {
      title: "Interaktive Checkliste",
      promptNoun: "eine einfache interaktive Checkliste",
      speech: "«Ich brauche eine einfache Checkliste für einen wiederkehrenden Ablauf.»",
      aiAction: "Erstellt vier abhakbare Schritte, eine Fortschrittsanzeige und einen Knopf für den Neustart.",
      resultAction: "Gehst den echten Ablauf durch und ergänzt genau den Schritt, der im Alltag noch fehlt.",
      goal: "einen wiederkehrenden Unterrichtsablauf als klare Checkliste darstellen",
      features: "Punkte können abgehakt werden. Der Fortschritt ist sichtbar und die Liste kann neu gestartet werden.",
      description: "Ein klarer Ablauf, der Schritt für Schritt abgearbeitet wird.",
      test: "Zuerst nur vier Schritte und den Neustart prüfen"
    },
    eigene: {
      title: "Eigene Unterrichtsidee",
      promptNoun: "ein kleines digitales Werkzeug",
      speech: "«Ich habe eine Unterrichtsidee, für die es noch kein passendes Werkzeug gibt.»",
      aiAction: "Fragt Ziel, Nutzende und Kernfunktion ab und baut daraus eine kleine, sichtbare erste Version.",
      resultAction: "Prüfst den wichtigsten Weg und beschreibst nur die nächste konkrete Verbesserung.",
      goal: "meine Unterrichtsidee als kleines digitales Werkzeug umsetzen",
      features: "Frage mich zuerst nach Ziel, Nutzenden und den drei wichtigsten Funktionen. Erstelle danach eine kleine erste Version.",
      description: "Eine massgeschneiderte Lösung für ein konkretes Problem.",
      test: "Mit einer einzigen Kernfunktion beginnen"
    }
  };

  const audienceLabels = { lernende: "Lernende", lehrperson: "Lehrperson", beide: "Lernende und Lehrpersonen" };
  const audiencePrompt = { lernende: "Die Seite wird von Lernenden genutzt.", lehrperson: "Die Seite wird von einer Lehrperson genutzt.", beide: "Die Seite wird von Lernenden und Lehrpersonen genutzt." };
  const deviceLabels = { handy: "Handy", computer: "Computer", beides: "Handy und Computer" };
  const devicePrompt = { handy: "Sie muss auf dem Handy sehr einfach bedienbar sein.", computer: "Sie soll auf einem Computer übersichtlich funktionieren.", beides: "Sie muss auf Handy und Computer gut funktionieren." };

  const cycleMessages = [
    ["Beschreiben", "Nenne das Problem, die Nutzenden und das gewünschte Ergebnis. Gute Ausgangslage: «Ich verliere jede Woche Zeit beim Bilden fairer Gruppen.»"],
    ["Bauen lassen", "Bitte zuerst um eine kleine Version mit nur der wichtigsten Funktion. So findest du schneller heraus, ob die Idee trägt."],
    ["Testen", "Klicke selbst durch alle Wege. Prüfe auch falsche Eingaben, leere Felder, Mobilansicht und den Neustart."],
    ["Verbessern", "Beschreibe genau eine Änderung: Was passiert jetzt, was soll stattdessen passieren und woran erkennst du, dass es stimmt?"]
  ];

  const quizSolutions = {
    data: { correct: "no", right: "Richtig. Öffentliche Tests dürfen keine Noten, Namen oder vertraulichen Daten enthalten.", wrong: "Noch nicht. Nutze Fantasiedaten und kläre den Datenschutz, bevor echte Personendaten verarbeitet werden." },
    backup: { correct: "yes", right: "Richtig. Eine funktionierende Version ist dein Rückweg, falls eine Änderung etwas kaputt macht.", wrong: "Das wäre riskant. Sichere einen funktionierenden Stand, bevor du grössere Änderungen machst." },
    test: { correct: "yes", right: "Richtig. KI-Code kann Fehler enthalten. Du bleibst für das Ergebnis und die Prüfung verantwortlich.", wrong: "Doch. Prüfe jede wichtige Funktion selbst, besonders Daten, Zugänge, Uploads und Löschen." }
  };

  const detailPages = {
    "example-nursa": {
      kicker: "Praxisbeispiel · Bildung",
      title: "Nursa Study: ein Portal für Pflegeschulen",
      body: `<p>Ein Produktverantwortlicher baute laut Lovable in einem Wochenende eine erste funktionierende Version für Pflegeschulen. Darin enthalten waren ein Einsatzplan, ein Portal für Studierende und Hochschulen sowie eine Übersicht zu Qualifikationen.</p><p><b>Was daran spannend ist:</b> Aus einer konkreten Anfrage von Schulen entstand zuerst ein kleiner Test und später ein bezahltes Produkt.</p><p class="detail-note">Quelle und Zahlen stammen aus einer Fallstudie von Lovable. Der Ersteller hatte bereits Erfahrung in Produktdesign und Softwarearchitektur.</p><a href="https://lovable.dev/customers/nursa" target="_blank" rel="noopener">Original-Fallstudie öffnen ↗</a>`
    },
    "example-helix": {
      kicker: "Praxisbeispiel · Bau",
      title: "Helix Electric: Werkzeuge für spezielle Bauabläufe",
      body: `<p>Der US-Elektroinstallateur Helix Electric baute eine Reihe eigener Anwendungen für Arbeitsabläufe, die Standardsoftware nicht passend abdeckte.</p><p>Die Replit-Fallstudie nennt unter anderem Prüfungen zur Einhaltung von Arbeitsvorgaben und die Verarbeitung von mehr als 500'000 Terminplan-Aufgaben.</p><p><b>Was daran spannend ist:</b> Nicht «eine App für alles», sondern kleine Werkzeuge für sehr konkrete Lücken.</p><p class="detail-note">Die Kennzahlen sind Angaben aus einer Replit-Kundenfallstudie und wurden hier nicht unabhängig geprüft.</p><a href="https://replit.com/customers/helix-electric" target="_blank" rel="noopener">Original-Fallstudie öffnen ↗</a>`
    },
    "example-health": {
      kicker: "Praxisbeispiel · Gesundheit",
      title: "My Doctor: von null Code zur Gesundheitsplattform",
      body: `<p>Ein britischer Arzt ohne vorherige Programmiererfahrung erstellte laut Replit in vier Tagen eine Plattform mit Terminbuchung, Rezeptanfragen, Anmeldung und weiteren Funktionen.</p><p><b>Was daran spannend ist:</b> Fachwissen aus dem Beruf wurde direkt in ein digitales Werkzeug übersetzt.</p><p class="detail-note">Gesundheitssoftware ist besonders sensibel. Die Angaben stammen aus einer Replit-Fallstudie; für reale Patientendaten braucht es professionelle Sicherheits-, Datenschutz- und Qualitätsprüfungen.</p><a href="https://ld.replit.com/customers/northern-health" target="_blank" rel="noopener">Original-Fallstudie öffnen ↗</a>`
    },
    "example-saastr": {
      kicker: "Praxisbeispiel · Organisation",
      title: "SaaStr: sieben kleine Anwendungen statt einer grossen",
      body: `<p>SaaStr erstellte laut Replit in drei Monaten sieben produktive Anwendungen. Dazu gehörten ein Bewertungswerkzeug für Tausende Einreichungen, ein Rechner und eine Veranstaltungsseite.</p><p><b>Was daran spannend ist:</b> Einige der wertvollsten Lösungen waren kleine Spezialwerkzeuge, die genau für den eigenen Ablauf gebaut wurden.</p><p class="detail-note">Nutzungs- und Einsparungszahlen sind Angaben aus einer Replit-Kundenfallstudie und keine allgemeine Prognose.</p><a href="https://replit.com/customers/saastr" target="_blank" rel="noopener">Original-Fallstudie öffnen ↗</a>`
    },
    "hub-definition": {
      kicker: "Grundlage",
      title: "Was ist Vibecoding?",
      body: `<p><b>Kurz:</b> Du beschreibst eine gewünschte Software in normaler Sprache. Eine KI erzeugt Code und Dateien. Du testest die Lösung und verbesserst sie zusammen mit der KI.</p><p>Der Begriff wurde im Februar 2025 von Andrej Karpathy geprägt. Der spielerische Ursprung bezog sich auf kleine Projekte. Sobald eine Anwendung echte Menschen, Daten oder wichtige Abläufe betrifft, gehören Tests, Datenschutz und Wartung dazu.</p><a href="https://www.ibm.com/think/topics/vibe-coding" target="_blank" rel="noopener">IBM-Erklärung ↗</a><a href="https://www.cloudflare.com/learning/ai/ai-vibe-coding/" target="_blank" rel="noopener">Cloudflare-Erklärung ↗</a>`
    },
    "hub-cycle": {
      kicker: "Arbeitsweise",
      title: "Der Vier-Schritte-Kreislauf",
      body: `<ol><li><b>Beschreiben:</b> Problem, Nutzende, Ziel und Grenzen nennen.</li><li><b>Bauen lassen:</b> Zuerst eine kleine, funktionierende Version verlangen.</li><li><b>Testen:</b> Selbst klicken, falsche Eingaben probieren und auf dem Zielgerät prüfen.</li><li><b>Verbessern:</b> Eine konkrete Änderung erklären und erneut testen.</li></ol><p>Dann beginnt die nächste Runde. Gute Software entsteht selten mit einem einzigen Prompt.</p>`
    },
    "hub-prompt": {
      kicker: "Prompt-Formel",
      title: "So wird aus einer Idee ein guter Auftrag",
      body: `<div class="prompt-formula"><p><b>1. Ziel</b><span>Welches Problem soll einfacher werden?</span></p><p><b>2. Personen</b><span>Wer nutzt die Lösung?</span></p><p><b>3. Ablauf</b><span>Was wird eingegeben, angeklickt und angezeigt?</span></p><p><b>4. Regeln</b><span>Was darf nicht passieren?</span></p><p><b>5. Start</b><span>Zuerst eine kleine Version verlangen.</span></p></div><p>Dein persönlicher Prompt aus der Werkstatt ist bereits fertig und kann direkt kopiert werden.</p><div class="dialog-actions"><button type="button" data-copy-current>Meinen Prompt kopieren</button></div>`
    },
    "hub-ideas": {
      kicker: "Unterrichtsideen",
      title: "Kleine Projekte mit echtem Nutzen",
      body: `<ul><li>Gruppengenerator mit fairer Verteilung</li><li>Anonymes Feedbackformular ohne Personendaten</li><li>Quiz mit direkter Rückmeldung</li><li>Checkliste für Werkstatt- oder Sicherheitsabläufe</li><li>Zufallsfragen für Repetition und Prüfungsvorbereitung</li><li>Fotodokumentation mit Freigabe durch die Lehrperson</li><li>H5P-Lernpfad, interaktives Video oder Verzweigungsszenario</li><li>Kleines Dashboard für Lernziele oder Material</li></ul><a href="https://h5p.org/content-types-and-applications" target="_blank" rel="noopener">Offizielle H5P-Beispiele öffnen ↗</a>`
    },
    "hub-tools": {
      kicker: "Werkzeuge",
      title: "Wo kann ich starten?",
      body: `<div class="detail-link-list"><a href="https://chatgpt.com/codex" target="_blank" rel="noopener"><b>OpenAI Codex</b><span>Arbeitet mit Projektdateien, verändert Code und führt Prüfungen aus.</span></a><a href="https://github.com/features/copilot" target="_blank" rel="noopener"><b>GitHub Copilot</b><span>Hilft im Editor, auf GitHub, im Terminal und mit Coding-Agenten.</span></a><a href="https://aistudio.google.com/" target="_blank" rel="noopener"><b>Google AI Studio</b><span>Erstellt Web- und Android-Prototypen aus natürlicher Sprache.</span></a><a href="https://lovable.dev/" target="_blank" rel="noopener"><b>Lovable</b><span>Erstellt WebApps aus einer Beschreibung.</span></a><a href="https://replit.com/" target="_blank" rel="noopener"><b>Replit</b><span>Verbindet Erstellen, Daten und Veröffentlichung in einer Umgebung.</span></a><a href="https://bolt.new/" target="_blank" rel="noopener"><b>Bolt</b><span>Erstellt Prototypen direkt im Browser.</span></a></div><p class="detail-note">Funktionen, Preise und Datenschutzbedingungen ändern sich. Prüfe vor der Nutzung die aktuellen Bedingungen deiner Schule und des Anbieters.</p>`
    },
    "hub-publish": {
      kicker: "Veröffentlichen",
      title: "Wie wird aus Dateien eine Webseite?",
      body: `<p>Eine einfache Seite besteht oft aus <code>index.html</code>, <code>style.css</code>, <code>app.js</code> und Bildern.</p><p><b>GitHub Pages:</b> eignet sich für öffentliche, statische Seiten. Repository anlegen, Dateien hochladen und unter «Settings → Pages» veröffentlichen.</p><p><b>Netlify Drop:</b> Ein Projektordner mit HTML-Dateien lässt sich für einen schnellen Test per Drag-and-drop veröffentlichen.</p><p><b>Eigener Webserver:</b> ist nötig für PHP, Datenbanken, geschützte Logins oder Uploads. Solche Funktionen brauchen zusätzliche Sicherheitsprüfungen.</p><p class="detail-note">Öffentliche Testseiten dürfen keine vertraulichen Daten oder privaten Bilder enthalten.</p><a href="https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site" target="_blank" rel="noopener">GitHub-Pages-Anleitung ↗</a><a href="https://docs.netlify.com/deploy/create-deploys/#drag-and-drop" target="_blank" rel="noopener">Netlify Drag-and-drop ↗</a>`
    },
    "hub-safety": {
      kicker: "Sicher arbeiten",
      title: "Fünf Regeln, die immer gelten",
      body: `<ol><li>Mit Fantasiedaten testen.</li><li>Keine Passwörter oder Schlüssel in öffentliche Dateien schreiben.</li><li>Vor Änderungen einen funktionierenden Stand sichern.</li><li>Alle wichtigen Wege und Geräte selbst prüfen.</li><li>Bei Personendaten, Zahlungen, Medizin oder Zugängen Fachpersonen beiziehen.</li></ol><p>KI-generierter Code kann falsch oder unsicher sein. Du musst nicht jede Codezeile auswendig verstehen, aber du musst wissen, was die Anwendung tun soll und ob sie das zuverlässig tut.</p><a href="https://docs.github.com/en/copilot/responsible-use/agents" target="_blank" rel="noopener">GitHub: verantwortungsvolle Nutzung ↗</a>`
    },
    "hub-examples": {
      kicker: "Praxis",
      title: "Vier dokumentierte Beispiele",
      body: `<div class="detail-link-list"><button type="button" data-detail="example-nursa"><b>Nursa Study</b><span>Portal für Pflegeschulen</span></button><button type="button" data-detail="example-helix"><b>Helix Electric</b><span>Spezialwerkzeuge für Bauabläufe</span></button><button type="button" data-detail="example-health"><b>My Doctor</b><span>Gesundheitsplattform</span></button><button type="button" data-detail="example-saastr"><b>SaaStr</b><span>Sieben kleine Produktionswerkzeuge</span></button></div><p class="detail-note">Alle Zahlen und Resultate stammen aus Anbieter-Fallstudien. Sie zeigen Möglichkeiten, nicht typische oder garantierte Ergebnisse.</p>`
    },
    "hub-glossary": {
      kicker: "Wörterbuch",
      title: "Die wichtigsten Begriffe ohne Fachchinesisch",
      body: `<dl class="glossary"><div><dt>Prompt</dt><dd>Dein Auftrag an die KI.</dd></div><div><dt>Code</dt><dd>Text mit genauen Anweisungen für den Computer.</dd></div><div><dt>HTML</dt><dd>Der Inhalt und Aufbau einer Webseite.</dd></div><div><dt>CSS</dt><dd>Das Aussehen einer Webseite.</dd></div><div><dt>JavaScript</dt><dd>Die Interaktion und Logik im Browser.</dd></div><div><dt>Repository</dt><dd>Ein Projektordner mit Versionsgeschichte, zum Beispiel auf GitHub.</dd></div><div><dt>Deployment</dt><dd>Die Dateien werden so veröffentlicht, dass andere die Anwendung öffnen können.</dd></div><div><dt>PWA / WebApp</dt><dd>Eine Webseite, die sich auf dem Home-Bildschirm wie eine App öffnen lässt.</dd></div></dl>`
    },
    "hub-sources": {
      kicker: "Quellen",
      title: "Worauf diese Lernreise basiert",
      body: `<p>Definitionen und Sicherheitsregeln wurden mit aktuellen, möglichst offiziellen Quellen geprüft. Praxiszahlen sind als Anbieterangaben gekennzeichnet.</p><div class="detail-link-list"><a href="https://www.ibm.com/de-de/think/topics/vibe-coding" target="_blank" rel="noopener"><b>IBM Deutschland: Was ist Vibe Coding?</b><span>Deutschsprachige Einführung, aktualisiert im Juli 2026.</span></a><a href="https://www.ihk.de/ulm/hauptnavigation/online-magazin/im-fokus/vibe-coding-7075996" target="_blank" rel="noopener"><b>IHK Ulm: Vibe-Coding strategisch einsetzen</b><span>Deutschsprachiger Fachartikel zu Nutzen, Grenzen und Erfolgsfaktoren, Juni 2026.</span></a><a href="https://www.cloudflare.com/de-de/learning/ai/ai-vibe-coding/" target="_blank" rel="noopener">Cloudflare: Was ist Vibe-Coding? ↗</a><a href="https://docs.github.com/en/copilot/responsible-use/agents" target="_blank" rel="noopener">GitHub: Responsible use of coding agents ↗</a><a href="https://github.com/features/copilot" target="_blank" rel="noopener">GitHub Copilot: Funktionen ↗</a><a href="https://ai.google.dev/gemini-api/docs/aistudio-build-mode" target="_blank" rel="noopener">Google AI Studio: Apps bauen ↗</a><a href="https://www.w3.org/WAI/WCAG2/supplemental/objectives/o3-clear-content/" target="_blank" rel="noopener">W3C: klare und verständliche Inhalte ↗</a><a href="https://docs.github.com/de/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site" target="_blank" rel="noopener">GitHub Pages: Veröffentlichung ↗</a><a href="https://docs.netlify.com/deploy/create-deploys/#drag-and-drop" target="_blank" rel="noopener">Netlify: Drag-and-drop-Veröffentlichung ↗</a><a href="https://h5p.org/content-types-and-applications" target="_blank" rel="noopener">H5P: Inhaltstypen und Beispiele ↗</a></div>`
    }
  };

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
    } else {
      return;
    }
    saveLearningProgress();
    updateLearningProgress();
  }

  function updateLearningProgress() {
    const journeyDone = new Set(learningProgress.journey.map(Number).filter((step) => step >= 1 && step <= 7)).size;
    const cardsDone = HUB_CARD_IDS.filter((id) => learningProgress.cards.includes(id)).length;
    const videosDone = Math.min(REQUIRED_VIDEO_COUNT, new Set(learningProgress.videos).size);
    const mediaDone = learningProgress.mediaOpened ? 1 : 0;
    const total = 7 + HUB_CARD_IDS.length + 1 + REQUIRED_VIDEO_COUNT;
    const completed = journeyDone + cardsDone + mediaDone + videosDone;
    const percentage = Math.round((completed / total) * 100);
    if (learningProgressPercent) learningProgressPercent.textContent = `${percentage}%`;
    if (!learningProgressSummary) return;
    if (completed === total) {
      learningProgressSummary.textContent = "100 %: Lernreise, Wissenskarten und Mediathek sind vollständig entdeckt.";
      return;
    }
    const parts = [];
    if (journeyDone < 7) parts.push(`${7 - journeyDone} Lernschritt${7 - journeyDone === 1 ? "" : "e"}`);
    if (cardsDone < HUB_CARD_IDS.length) parts.push(`${HUB_CARD_IDS.length - cardsDone} Wissenskarte${HUB_CARD_IDS.length - cardsDone === 1 ? "" : "n"}`);
    if (!mediaDone) parts.push("Mediathek öffnen");
    if (videosDone < REQUIRED_VIDEO_COUNT) parts.push(`${REQUIRED_VIDEO_COUNT - videosDone} Video${REQUIRED_VIDEO_COUNT - videosDone === 1 ? "" : "s"}`);
    learningProgressSummary.textContent = `Noch offen: ${parts.join(" · ")}.`;
  }

  function updateDiscoveryUi() {
    document.querySelectorAll("[data-detail]").forEach((element) => {
      element.classList.toggle("is-discovered", discoveries.has(`detail:${element.dataset.detail}`) || learningProgress.cards.includes(element.dataset.detail));
    });
    document.querySelectorAll("[data-progress-card]").forEach((element) => element.classList.toggle("is-discovered", learningProgress.cards.includes(element.dataset.progressCard)));
  }

  function reward(key, label) {
    if (discoveries.has(key)) return;
    discoveries.add(key);
    saveDiscoveries();
    updateDiscoveryUi();
    if (!discoveryToast) return;
    window.clearTimeout(toastTimer);
    discoveryToast.hidden = false;
    discoveryToast.textContent = `Entdeckt · ${label}`;
    discoveryToast.classList.remove("is-showing");
    void discoveryToast.offsetWidth;
    discoveryToast.classList.add("is-showing");
    toastTimer = window.setTimeout(() => { discoveryToast.hidden = true; }, 1900);
  }

  function isStandalone() {
    return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  }

  function readFirstVisitState() {
    try { return localStorage.getItem(FIRST_VISIT_KEY); } catch (error) { return null; }
  }

  function writeFirstVisitState(value) {
    try { localStorage.setItem(FIRST_VISIT_KEY, value); } catch (error) { /* Storage can be blocked. */ }
  }

  function buildPrompt() {
    const project = projects[state.project || "gruppen"];
    const rule = state.rule.trim();
    return `Erstelle mir ${project.promptNoun} für meinen Unterricht.\n\nZiel: ${project.goal}.\n${audiencePrompt[state.audience]} ${devicePrompt[state.device]}\n\nAblauf: ${project.features}${rule ? `\n\nWichtige Regel: ${rule}.` : ""}\n\nErstelle zuerst eine kleine funktionierende Version. Erkläre mir danach kurz, welche Dateien du erstellt hast und wie ich alles selbst testen kann.`;
  }

  function updatePersonalContent() {
    const project = projects[state.project || "gruppen"];
    document.querySelector("#idea-speech").textContent = project.speech;
    document.querySelector("#idea-ai-action").textContent = project.aiAction;
    document.querySelector("#idea-result-action").textContent = project.resultAction;
    generatedPrompt.textContent = buildPrompt();
    document.querySelector("#route-project-title").textContent = project.title;
    document.querySelector("#route-project-description").textContent = project.description;
    document.querySelector("#route-audience").textContent = audienceLabels[state.audience];
    document.querySelector("#route-device").textContent = deviceLabels[state.device];
    document.querySelector("#route-test").textContent = project.test;
  }

  function updateSelectedButtons(type, value) {
    document.querySelectorAll(`[data-choice="${type}"]`).forEach((button) => {
      const selected = button.dataset.value === value;
      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
  }

  function stepIsReady(step) {
    if (step === 1) return Boolean(state.project);
    if (step === 3) return cycleVisited.size === 4;
    if (step === 6) return quizAnswered.size === 3;
    return true;
  }

  function updateNavigation() {
    const hub = currentStep === 8;
    backButton.hidden = currentStep === 1;
    journeyNav.classList.toggle("no-back", currentStep === 1);
    nextButton.hidden = hub;
    nextButton.disabled = !stepIsReady(currentStep);
    if (currentStep === 1 && !state.project) navHint.textContent = "Wähle zuerst eine Idee aus.";
    else if (currentStep === 3 && cycleVisited.size < 4) navHint.textContent = `Noch ${4 - cycleVisited.size} Station${4 - cycleVisited.size === 1 ? "" : "en"} antippen.`;
    else if (currentStep === 6 && quizAnswered.size < 3) navHint.textContent = `Noch ${3 - quizAnswered.size} Frage${3 - quizAnswered.size === 1 ? "" : "n"} beantworten.`;
    else if (hub) navHint.textContent = "Tippe auf ein Thema, um es zu öffnen.";
    else if (currentStep === 7) navHint.textContent = "Dein Startpunkt ist bereit.";
    else navHint.textContent = "Du kannst weitergehen.";
  }

  function showStep(step, addHistory) {
    const safeStep = Math.max(1, Math.min(8, Number(step) || 1));
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    currentStep = safeStep;
    let activeSection = null;
    stepElements.forEach((element) => {
      const active = Number(element.dataset.step) === safeStep;
      element.classList.toggle("is-active", active);
      element.hidden = !active;
      if (active) activeSection = element;
    });
    const hub = safeStep === 8;
    stepLabel.textContent = hub ? "Wissenskarte" : `Schritt ${safeStep} von 7`;
    progressBar.style.width = `${hub ? 100 : ((safeStep - 1) / 7) * 100}%`;
    updateLearningProgress();
    document.body.classList.toggle("is-hub", hub);
    updatePersonalContent();
    updateNavigation();
    if (addHistory) {
      history.pushState({ step: safeStep }, "", hub ? "#uebersicht" : `#schritt-${safeStep}`);
      reward(`step:${safeStep}`, hub ? "Wissenskarte geöffnet" : `Schritt ${safeStep} erreicht`);
      if (safeStep <= 7) markLearningProgress("journey", safeStep);
    }
    window.setTimeout(() => { if (activeSection) activeSection.scrollTop = 0; }, 60);
  }

  function stepFromHash() {
    if (location.hash === "#uebersicht") return 8;
    const match = location.hash.match(/^#schritt-(\d)$/);
    return match ? Number(match[1]) : 1;
  }

  async function copyText(text, button) {
    const original = button.textContent;
    try {
      await navigator.clipboard.writeText(text);
      button.textContent = "Kopiert";
      reward("action:prompt-copied", "Eigener Prompt kopiert");
    } catch (error) {
      button.textContent = "Bitte Text markieren";
    }
    window.setTimeout(() => { button.textContent = original; }, 1700);
  }

  function openDetail(key) {
    const detail = detailPages[key];
    if (!detail) return;
    detailContent.innerHTML = `<p class="journey-kicker">${detail.kicker}</p><h2>${detail.title}</h2><div class="detail-body">${detail.body}</div>`;
    const promptTarget = detailContent.querySelector("#detail-current-prompt");
    if (promptTarget) promptTarget.textContent = buildPrompt();
    if (!detailDialog.open) detailDialog.showModal();
    detailDialog.scrollTop = 0;
    if (HUB_CARD_IDS.includes(key)) markLearningProgress("cards", key);
    reward(`detail:${key}`, "Neues Thema entdeckt");
  }

  document.addEventListener("click", (event) => {
    if (learningProgressPopover && !event.target.closest(".learning-progress-control")) {
      learningProgressPopover.hidden = true;
      learningProgressButton?.setAttribute("aria-expanded", "false");
    }
    const progressCard = event.target.closest("[data-progress-card]");
    if (progressCard) markLearningProgress("cards", progressCard.dataset.progressCard);

    const mediaLink = event.target.closest('a[href="mediathek.html"]');
    if (mediaLink) reward("page:mediathek", "Mediathek freigeschaltet");

    const resetJourney = event.target.closest("[data-reset-journey]");
    if (resetJourney) {
      try {
        localStorage.removeItem(PROGRESS_KEY);
        localStorage.removeItem(DISCOVERY_KEY);
      } catch (error) { /* Storage can be blocked. */ }
      history.replaceState({ step: 1 }, "", "#schritt-1");
      location.reload();
      return;
    }

    const stepButton = event.target.closest("[data-go-step]");
    if (stepButton) {
      event.preventDefault();
      showStep(stepButton.dataset.goStep, true);
      return;
    }
    const choice = event.target.closest("[data-choice]");
    if (choice) {
      const type = choice.dataset.choice;
      const value = choice.dataset.value;
      state[type] = value;
      updateSelectedButtons(type, value);
      updatePersonalContent();
      updateNavigation();
      reward(`choice:${type}:${value}`, "Auswahl übernommen");
      if (type === "project") markLearningProgress("journey", 1);
      return;
    }
    const detailButton = event.target.closest("[data-detail]");
    if (detailButton) {
      openDetail(detailButton.dataset.detail);
      return;
    }
    const copyCurrent = event.target.closest("[data-copy-current]");
    if (copyCurrent) copyText(buildPrompt(), copyCurrent);

    const externalLink = event.target.closest('a[target="_blank"]');
    if (externalLink) reward(`link:${externalLink.href}`, "Quelle geöffnet");
  });

  function openCycleDialog(index) {
    const [title, message] = cycleMessages[index];
    cycleDialogNumber.textContent = String(index + 1).padStart(2, "0");
    cycleDialogTitle.textContent = title;
    cycleDialogText.textContent = message;
    cycleDialogProgress.textContent = `${index + 1} von 4 · weiter in Drehrichtung →`;
    if (!cycleDialog.open) cycleDialog.showModal();
  }

  function activateCycle(index, showExplanation = true) {
    const safeIndex = ((Number(index) % 4) + 4) % 4;
    const buttons = Array.from(document.querySelectorAll(".cycle-stop"));
    const button = buttons.find((item) => Number(item.dataset.cycle) === safeIndex);
    if (!button) return;
    activeCycleIndex = safeIndex;
    orbitRotation = safeIndex * -90;
    cycleOrbit?.style.setProperty("--orbit-turn", `${orbitRotation}deg`);
    cycleOrbit?.style.setProperty("--orbit-counter-turn", `${-orbitRotation}deg`);
    cycleVisited.add(safeIndex);
    buttons.forEach((item) => item.classList.toggle("is-active", item === button));
    button.classList.add("is-visited");
    const [title, message] = cycleMessages[safeIndex];
    cycleFeedback.innerHTML = `<span class="panel-label">Aktuelle Station</span><b>${String(safeIndex + 1).padStart(2, "0")} · ${title}</b><p>${message}</p>`;
    cycleFeedback.classList.remove("is-changing");
    void cycleFeedback.offsetWidth;
    cycleFeedback.classList.add("is-changing");
    cycleCount.textContent = `${cycleVisited.size} von 4 entdeckt`;
    reward(`cycle:${safeIndex}`, `${title} verstanden`);
    updateNavigation();
    if (showExplanation) openCycleDialog(safeIndex);
  }

  document.querySelectorAll(".cycle-stop").forEach((button) => {
    button.addEventListener("click", () => activateCycle(Number(button.dataset.cycle)));
  });

  document.querySelector("#cycle-spin")?.addEventListener("click", () => {
    activateCycle(activeCycleIndex < 0 ? 0 : (activeCycleIndex + 1) % 4);
  });

  document.querySelector("#cycle-dialog-close")?.addEventListener("click", () => cycleDialog.close());
  document.querySelector("#cycle-dialog-prev")?.addEventListener("click", () => activateCycle(activeCycleIndex - 1));
  document.querySelector("#cycle-dialog-next")?.addEventListener("click", () => activateCycle(activeCycleIndex + 1));
  cycleDialog?.addEventListener("click", (event) => { if (event.target === cycleDialog) cycleDialog.close(); });

  document.querySelectorAll("#safety-quiz article").forEach((question) => {
    question.querySelectorAll("[data-answer]").forEach((button) => {
      button.addEventListener("click", () => {
        const key = question.dataset.question;
        const solution = quizSolutions[key];
        const correct = button.dataset.answer === solution.correct;
        quizAnswered.add(key);
        question.classList.toggle("is-correct", correct);
        question.classList.toggle("is-wrong", !correct);
        question.querySelectorAll("button").forEach((item) => item.classList.toggle("is-selected", item === button));
        question.querySelector("p").textContent = correct ? solution.right : solution.wrong;
        reward(`quiz:${key}`, correct ? "Sicherheitsfrage gelöst" : "Aus der Rückmeldung gelernt");
        updateNavigation();
      });
    });
  });

  document.querySelector("#prompt-rule")?.addEventListener("input", (event) => {
    state.rule = event.target.value;
    updatePersonalContent();
    promptLiveStatus.textContent = state.rule.trim() ? `Sichtbar übernommen: ${state.rule.length} Zeichen.` : "Deine Eingabe erscheint sofort rechts im Prompt.";
    const promptPanel = document.querySelector(".generated-prompt");
    promptPanel?.classList.remove("is-updating");
    void promptPanel?.offsetWidth;
    promptPanel?.classList.add("is-updating");
    if (state.rule.trim().length >= 5) reward("action:custom-rule", "Eigene Regel ergänzt");
  });

  document.querySelector("#knowledge-copy-prompt")?.addEventListener("click", (event) => copyText(buildPrompt(), event.currentTarget));
  document.querySelector("#route-copy-prompt")?.addEventListener("click", (event) => copyText(buildPrompt(), event.currentTarget));
  nextButton.addEventListener("click", () => { if (stepIsReady(currentStep)) showStep(Math.min(8, currentStep + 1), true); });
  backButton.addEventListener("click", () => showStep(currentStep === 8 ? 7 : Math.max(1, currentStep - 1), true));
  learningProgressButton?.addEventListener("click", () => {
    const willOpen = learningProgressPopover.hidden;
    learningProgressPopover.hidden = !willOpen;
    learningProgressButton.setAttribute("aria-expanded", String(willOpen));
  });

  document.querySelector("#detail-dialog-close")?.addEventListener("click", () => detailDialog.close());
  detailDialog?.addEventListener("click", (event) => { if (event.target === detailDialog) detailDialog.close(); });
  window.addEventListener("popstate", () => showStep(stepFromHash(), false));
  window.addEventListener("hashchange", () => showStep(stepFromHash(), false));
  window.addEventListener("keydown", (event) => {
    if (detailDialog.open || installDialog.open || cycleDialog.open || /input|textarea/i.test(document.activeElement?.tagName)) return;
    if (event.key === "ArrowRight" && !nextButton.hidden && !nextButton.disabled) showStep(currentStep + 1, true);
    if (event.key === "ArrowLeft" && currentStep > 1) showStep(currentStep === 8 ? 7 : currentStep - 1, true);
  });

  function setInstallSteps(items) {
    installSteps.innerHTML = items.map((item) => `<p>${item}</p>`).join("");
  }

  function prepareInstallDialog() {
    nativeInstall.hidden = true;
    if (deferredInstall && !isIos) {
      installTitle.textContent = "Vibecoding auf dem Home-Bildschirm speichern?";
      installIntro.textContent = "So öffnest du die Lernreise später direkt wie eine App. Dieser Hinweis erscheint nur einmal.";
      setInstallSteps(["Tippe auf «Jetzt installieren».", "Bestätige den Browserdialog.", "Öffne Vibecoding künftig über das neue Symbol."]);
      nativeInstall.hidden = false;
    } else if (isIos) {
      installTitle.textContent = "Vibecoding auf iPhone oder iPad speichern?";
      installIntro.textContent = "Dieser Hinweis erscheint nur einmal. Du kannst die Lernreise auch einfach im Browser nutzen.";
      setInstallSteps(["Öffne diese Seite in Safari.", "Tippe auf das Teilen-Symbol.", "Wähle «Zum Home-Bildschirm» und danach «Hinzufügen»."]);
    } else if (isAndroid) {
      installTitle.textContent = "Vibecoding auf Android speichern?";
      installIntro.textContent = "Dieser Hinweis erscheint nur einmal. Du kannst die Lernreise auch einfach im Browser nutzen.";
      setInstallSteps(["Öffne das Browsermenü oben rechts.", "Wähle «App installieren» oder «Zum Startbildschirm hinzufügen».", "Bestätige die Installation."]);
    } else {
      installTitle.textContent = "Diese Lernreise kann wie eine App geöffnet werden.";
      installIntro.textContent = "Du kannst sie über das Browsermenü installieren. Dieser Hinweis erscheint nur einmal.";
      setInstallSteps(["Öffne das Menü deines Browsers.", "Wähle «App installieren» oder «Zum Startbildschirm hinzufügen».", "Du kannst die Lernreise auch ohne Installation vollständig nutzen."]);
    }
  }

  function showFirstVisitInfo() {
    if (isStandalone() || readFirstVisitState()) return;
    writeFirstVisitState("shown");
    prepareInstallDialog();
    installDialog.showModal();
  }

  document.querySelector("#install-dialog-close")?.addEventListener("click", () => installDialog.close());
  document.querySelector("#install-dialog-confirm")?.addEventListener("click", () => installDialog.close());
  installDialog?.addEventListener("click", (event) => { if (event.target === installDialog) installDialog.close(); });
  nativeInstall?.addEventListener("click", async () => {
    if (!deferredInstall) return;
    installDialog.close();
    deferredInstall.prompt();
    await deferredInstall.userChoice;
    deferredInstall = null;
  });

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstall = event;
    if (installDialog.open) prepareInstallDialog();
  });
  window.addEventListener("appinstalled", () => {
    deferredInstall = null;
    writeFirstVisitState("installed");
    if (installDialog.open) installDialog.close();
  });

  updateSelectedButtons("audience", state.audience);
  updateSelectedButtons("device", state.device);
  updateDiscoveryUi();
  updatePersonalContent();
  showStep(stepFromHash(), false);
  window.setTimeout(showFirstVisitInfo, 1300);

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => navigator.serviceWorker.register(`service-worker.js?v=${VERSION}`, { scope: "./" }).catch(() => {}));
  }
})();
