# Verh-fischgesagt Browser Extension v3

## Chrome / Chromium / Edge / Brave

1. ZIP entpacken.
2. Browser öffnen.
3. `chrome://extensions` öffnen (bei Chromium/Brave/Edge entsprechend die jeweilige Erweiterungsseite).
4. Entwicklermodus aktivieren.
5. **Entpackte Erweiterung laden** wählen.
6. Den Ordner `extension` auswählen – also den Ordner, in dem direkt `manifest.json` liegt.
7. Erweiterung anpinnen.

Chrome dokumentiert das Laden einer entpackten Manifest-V3-Erweiterung über die Erweiterungsseite und den Button „Load unpacked“. 

## Firefox Desktop

1. ZIP entpacken.
2. `about:debugging#/runtime/this-firefox` öffnen.
3. **Temporäres Add-on laden** wählen.
4. `manifest.json` im entpackten `extension`-Ordner auswählen.

Die Engine arbeitet vollständig lokal. Es wird keine Übersetzungs-API benötigt.

## Funktionen

- Auswahl transformieren
- ganze Seite transformieren
- Original wiederherstellen
- Kontextmenü
- drei Stilprofile
- lokale Semantic Engine v2
- Translation Memory / Terminologie-Unterbau
- TMX / TBX / XLIFF / VFT-Datenformate
- kein Server erforderlich

## Einschränkung

Browser-interne Seiten wie `chrome://...`, `edge://...` oder Erweiterungsseiten sind aus Sicherheitsgründen nicht normal durch Content Scripts bearbeitbar.

## Teststatus

- Core tests: OK
- Extension smoke tests: OK
- Manifest JSON: OK
- keine externe API-Abhängigkeit in der Extension
