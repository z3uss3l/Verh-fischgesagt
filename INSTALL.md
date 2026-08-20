# Initialer Upload / Commit

Der Ordner ist als vollständiges Update für `Verh-fischgesagt` gedacht.

Empfohlener Branch:

```bash
git checkout -b feat/semantic-translation-runtime
```

Dann den Inhalt dieses Pakets in das Repository übernehmen und testen:

```bash
npm install
npm test
```

Die Browser-Extension liegt unter `extension/` und kann anschließend als „entpackte Erweiterung“ geladen werden.

Die bestehende statische Anwendung liegt unter `web/verhöfischgesagt.html`.
