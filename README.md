# Vibecoding im Unterricht

Statisches Folien-Deck fuer GitHub Pages. Dramaturgie: Unterrichtsproblem -> kurze Plattformgeschichte -> Live-Prompt -> Vibecoding erklaeren -> Demo-Test -> QR zur Vertiefung.

Kein npm, kein Build, keine externen Laufzeit-Abhaengigkeiten.

## Starten

Oeffne `index.html` direkt im Browser. Fuer PWA und Offline-Test ist ein kleiner lokaler Server besser, weil Service Worker nicht sauber ueber `file://` laufen.

## Auf GitHub Pages hochladen

1. Einen GitHub-Repository-Ordner oeffnen oder neu erstellen.
2. Alle Dateien aus diesem Ordner hochladen.
3. In GitHub unter `Settings -> Pages` die Quelle aktivieren.
4. Nach der Veroeffentlichung die GitHub-Pages-URL oeffnen.
5. Der QR-Code auf der letzten Folie zeigt automatisch auf diese veroeffentlichte URL.

## Bilder ersetzen

Lege eigene Bilder in den Ordner `images/`:

- `hero-bg.jpg` - Titel-Hintergrund, Querformat 16:9 oder 3:2.
- `screenshot-claude.png` - Screenshot Claude.
- `screenshot-codex.png` - Screenshot OpenAI Codex.
- `screenshot-google.png` - Screenshot Google AI Studio oder Antigravity.
- `screenshot-beispiel.png` - optionaler Screenshot fuer ein Beispiel.

Fehlt ein Bild, bleibt das Layout heil und zeigt einen Platzhalter.

## Bedienung

- Weiter: rechte Bildschirmhaelfte, Button, Pfeiltaste rechts oder Leertaste.
- Zurueck: linke Bildschirmhaelfte, Button oder Pfeiltaste links.
- Uebersicht: Taste `O` oder Grid-Button.
- Vollbild: Taste `F`.
- Direktlink: `#1` bis `#15`.

## Stand

Version `v1.1`, Stand 24.08.2026.
