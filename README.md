# Verh-fischgesagt

## Semantic Translation / Transformation Engine v3

Verh-fischgesagt ist eine lokal ausführbare semantische und grammatikalische Texttransformationsengine. Die ursprüngliche regelbasierte Stärke bleibt erhalten; davor liegt eine Analyseebene aus Tokenisierung, Morphologie, Syntax und Semantic IR.

### Architektur

```text
Input
  -> Tokenisierung
  -> Morphologie
  -> Syntax / Satzakt
  -> Semantic IR
  -> Translation Memory / Terminologie
  -> Stilprofil
  -> grammatikalische Realisierung
  -> Output
```

### Offline-first

Der Browser-Unterbau benötigt keine Netzwerkverbindung. Die Extension enthält die Engine direkt. Die Node/Express-API ist optional und dient nur für Integrationen, Tests oder externe lokale Clients.

### Browser Extension

`extension/` ist eine Manifest-V3-Extension für Chromium-basierte Browser.

Funktionen:

- markierten Text transformieren
- ganze Seite transformieren
- Original wiederherstellen
- Kontextmenü mit Stilprofilen
- Tastenkürzel `Alt+Shift+V` für markierten Text
- lokale Translation Memory / Terminologie
- Import: VFT, TMX, TBX, XLIFF
- Export: VFT
- keine Remote-Skripte / keine Übersetzungs-API

### Standards

Der Unterbau orientiert sich an etablierten Übersetzungsstandards:

- Unicode / UTF-8
- BCP 47 für Sprachkennungen
- ICU MessageFormat als späterer Template-Anschluss
- TMX für Translation Memory
- TBX für Terminologie
- XLIFF für Übersetzungsaustausch
- gettext/PO kann als nächster Adapter ergänzt werden

VFT ist das projektspezifische native Austauschformat für semantische Transformationen.

### Installation der Extension

1. Browser öffnen: Erweiterungen / `chrome://extensions`
2. Entwicklermodus aktivieren
3. „Entpackte Erweiterung laden“
4. Ordner `extension/` auswählen
5. Auf einer normalen Webseite Text markieren und über das Kontextmenü transformieren.

Für lokale `file://`-Seiten muss im Browser zusätzlich „Datei-URLs zulassen“ für die Extension aktiviert werden.

### Node API

```bash
npm install
npm test
npm run api
```

Die API ist optional. Endpunkte:

- `GET /transmute?text=...&style=barock&analysis=true`
- `POST /transmute`
- `POST /analyze`
- `GET /styles`
- `GET /health`

### VFT

Schema: `formats/vft.schema.json`

Beispiele: `samples/`
