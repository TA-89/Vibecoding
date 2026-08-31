# Vibecoding im Unterricht

Statische, interaktive Präsentation für GitHub Pages mit einer zusätzlichen Wissensseite. Die Dramaturgie führt vom konkreten Unterrichtsproblem über die Live-Idee bis zum gemeinsamen Test.

Kein npm, kein Build und keine externen Laufzeit-Abhängigkeiten.

## Seiten

- `index.html`: Präsentation mit 12 Folien, Vollbild-, Tastatur- und Wischsteuerung.
- `wissen.html`: Responsive, installierbare Vertiefung mit Einstieg, Promptvorlage, Tools, Veröffentlichung und Sicherheitsregeln.
- Die letzte Folie erzeugt automatisch einen QR-Code zur Wissensseite.

## Starten

Öffne `index.html` direkt im Browser. Für den Offline-Cache und die installierbare WebApp ist ein lokaler Server erforderlich, weil Service Worker nicht über `file://` laufen.

## GitHub Pages

Das Repository ist unter `https://github.com/TA-89/Vibecoding` erreichbar. Die veröffentlichte Präsentation liegt unter `https://ta-89.github.io/Vibecoding/`.

## Bedienung

- Weiter: Pfeiltaste rechts, Leertaste, Navigationsbutton oder Wischbewegung nach links.
- Zurück: Pfeiltaste links, Navigationsbutton oder Wischbewegung nach rechts.
- Übersicht: Taste `O` oder Rasterbutton.
- Vollbild: Taste `F`.
- Direktlink: `#1` bis `#12`.

## Stand

Version `v3.1`, Stand 31.08.2026.
