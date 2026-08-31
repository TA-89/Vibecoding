# AGENTS.md - Vibecoding-Präsentationsseite

## Projektregeln

- Vanilla HTML, CSS und JavaScript.
- Kein npm, kein Build, kein Framework und kein CDN zur Laufzeit.
- Ziel ist GitHub Pages, deshalb bleiben alle Pfade relativ.
- Deutsch mit Schweizer Rechtschreibung: Umlaute verwenden, immer `ss`, kein deutsches Eszett.
- Keine Fakten, Funktionen, Preise oder URLs erfinden.
- Präsentationsfolien müssen ohne Zoom auf einem Projektor lesbar sein.
- Interaktive Elemente dürfen nicht durch unsichtbare Navigationsflächen überdeckt werden.

## Design-Tokens

- `--paper: #F7F8F4`
- `--ink: #111C20`
- `--lime: #C6D300`
- `--blue: #167EA4`
- `--coral: #E96548`
- `--panel: #FFFFFF`

Stil: klare Flächen, starke Typografie, harte Schatten, keine Farbverläufe.

## Seitenstruktur

- `index.html`: 12-teilige Präsentation.
- `wissen.html`: Geführte Lernreise mit sieben Schritten und abschliessender Wissenskarte.
- `app.js`: Foliennavigation, Datei-Dialog, Kreislauf und QR-Code.
- `wissen.js`: Lernreise, Auswahl- und Promptlogik, Sicherheitscheck, Detaildialoge, einmaliger PWA-Hinweis und Offline-Registrierung.

## Mini-Changelog

- `v4.0`: Wissensseite als geführte, interaktive Lernreise mit echten Praxisbeispielen, Quellen und klickbarer Schlussübersicht neu gebaut.
- `v3.1`: Präsentation gestrafft, Kernvorteil ergänzt und Wissensseite für Mobilgeräte sowie PWA-Installation überarbeitet.
- `v3.0`: Präsentation auf 12 Folien gestrafft, Vollbildmodus, Bildstrecke und neue Wissensseite ergänzt.
- `v2.0`: Dramaturgie, Umlaute, Typografie, Dateidialog, Promptbeispiel, Tool-Links und Wissensseite überarbeitet.
- `v1.1`: Dramaturgie auf Unterrichtsproblem, Plattformgeschichte, Live-Prompt und Live-Test umgebaut.
- `v1.0`: Erstes statisches Foliendeck mit Navigation, Übersicht, QR-Code, PWA und Offline-Cache.
