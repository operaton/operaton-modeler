# Dependency-Audit – 15.10.2026

Die Abhängigkeiten nach dem [Upstream-Abgleich](upstream-sync-2026-10-15.md) wurden aktualisiert und auf Kompatibilität geprüft. Produktionsabhängigkeiten und das separate Plugin-Lockfile melden keine bekannten npm-Audit-Befunde. Im Entwicklungsbereich bleibt eine ungepatchte Schwachstelle mit neun Paketmeldungen bestehen.

## Ergebnis

| Bereich | Vor Bereinigung | Nach Bereinigung |
| --- | --- | --- |
| Haupt-Lockfile, einschließlich Entwicklungswerkzeugen | 102: 3 kritisch, 55 hoch, 41 moderat, 3 niedrig | 9 hoch; alle dieselbe `braces`-Schwachstelle bzw. abhängige Pakete |
| Produktionsabhängigkeiten (`npm audit --omit=dev`) | 34: 13 hoch, 20 moderat, 1 niedrig | 0 |
| Separates Lockfile `resources/plugins` | 6: 1 kritisch, 1 hoch, 3 moderat, 1 niedrig | 0 |

Die Produktionszahlen sind eine Teilmenge des Haupt-Lockfiles und dürfen nicht dazuaddiert werden. Der vollständige `npm audit` endet wegen des dokumentierten Restbefunds weiterhin mit Exit-Code 1; die beiden anderen Audits enden mit Exit-Code 0.

## Änderungen

- Kompatible Sicherheitsupdates im Haupt- und Plugin-Lockfile übernommen.
- Camunda SDK auf 8.8.18 aktualisiert. Die verwendeten Zeebe-APIs bleiben verfügbar; die alte Windows-Zertifikatskette über `win-ca`/`node-forge` entfällt. Das SDK nutzt die System-Zertifikatsfunktionen des aktuellen Node-Runtimes.
- Sentry für Main- und Renderer-Prozess auf 10.76.2 aktualisiert. Die Frame-Normalisierung verwendet die SDK-eigene `rewriteFramesIntegration`; das alte Integrationspaket entfällt. Lokale Unix- und Windows-Dateipfade werden weiterhin anonymisiert. Crashreport-Einwilligung und DSN bleiben Voraussetzung; die neuen Log- und Metrikfunktionen sind ausdrücklich deaktiviert.
- Die produktive Dateisuche von `fast-glob` auf `glob` 13.0.6 umgestellt. Der offizielle ungebündelte Export `glob/raw` ermöglicht die vollständige Erfassung der tatsächlich verwendeten Abhängigkeiten und ihrer Lizenzen. Suchpfad-Priorität, Reihenfolge beim Zusammenführen von Konfigurationen, relative Pfade, Dotfiles, Ausschlüsse, Symlinks und Groß-/Kleinschreibung sind durch Regressionstests abgesichert.
- Den veralteten `react-svg-loader` durch SVGR 8.1.0 ersetzt. React-Default-Exports, `viewBox`, Titel und weitergereichte Eigenschaften bleiben erhalten.
- Puppeteer auf 25.14.0 aktualisiert; Karma wartet auf die nun asynchrone Browserpfad-Ermittlung. Mocha 12, NYC 18, Jest-JUnit 17, Nodemailer 10 und Sentry Webpack Plugin 5 aktualisiert.
- Das ungenutzte `electron-publisher-s3` entfernt. S3-Veröffentlichungen werden bereits durch den aktuellen electron-builder unterstützt; die alte AWS-SDK-/Builder-Abhängigkeitskette entfällt.
- CI-Installation auf `npm ci` vereinheitlicht, zusätzliche ungebundene Puppeteer-Installationen und `NODE_TLS_REJECT_UNAUTHORIZED=0` entfernt.
- Die Drittanbieterhinweise aus den aktualisierten App- und Client-Abhängigkeiten neu erzeugt.

## Gezielt begrenzte Overrides

| Abhängigkeit | Override | Kompatibilitätsnachweis |
| --- | --- | --- |
| `@electron/get` → `global-agent` → `roarr` | exakt 6.0.0 | Echte Downloads mit HTTP-Proxy, HTTPS-CONNECT, eigener vertrauenswürdiger CA, SNI, `NO_PROXY`, SHA256 und aktivem Logging. Unbekannte Zertifikate werden abgelehnt. |
| `@istanbuljs/load-nyc-config` → `js-yaml` | ^4.3.2 | Reales Laden von YAML-Konfigurationen einschließlich Vererbung, Arrays, Alias-/Merge-Keys und Normalisierung von Optionsnamen. |
| `nx` → `undici` | ^7.30.0 | Sicherheitsupdate innerhalb der bereits verwendeten Hauptversion. |
| `unified-args` → `chokidar` | ^4.0.3 | Reales Remark-Watching mit Glob-Eingabe, Leerzeichen im Dateinamen, Dateiänderung, erneuter Ausgabe und sauberem Beenden. |

`global-agent` 4.1.3 wurde wegen einer im HTTPS-Proxy-Test nachgewiesenen Regression bei CA-/SNI-Optionen nicht übernommen. Die Aktualisierung ausschließlich des Loggers erhält das funktionierende Proxy-Verhalten von `global-agent` 3 und entfernt dessen verwundbare Formatierungsabhängigkeit. Roarr ist wegen seiner zwischen Hauptversionen veränderten Export-API exakt festgelegt.

## Verbleibender Befund

[GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) betrifft `braces` bis einschließlich der aktuell veröffentlichten Version 3.0.3. Extrem tief verschachtelte Muster können einen Stack-Overflow und damit einen Prozessabbruch verursachen. Zum Prüfzeitpunkt existiert keine veröffentlichte korrigierte Version.

Die neun Meldungen betreffen `braces`, `chokidar`, `del`, `del-cli`, `electron-reloader`, `fast-glob`, `globby`, `karma` und `micromatch`. Alle betroffenen Einträge sind im Lockfile Entwicklungsabhängigkeiten:

- Karma verarbeitet die im Repository festgelegten Testmuster.
- `del`/`del-cli` verwenden die festgelegten lokalen Bereinigungsmuster der Build-Skripte.
- `electron-reloader` deaktiviert die Glob-Auswertung mit `disableGlobbing: true`.

Modellinhalte aus BPMN-, DMN-, CMMN- oder Form-Dateien werden diesen Werkzeugen nicht als Muster übergeben. Der Befund bleibt für Entwicklungswerkzeuge offen; er wird weder durch Audit-Ausnahmen ausgeblendet noch durch inkompatible Downgrades verdeckt. Nach Veröffentlichung eines kompatiblen Fixes sind die betroffenen Werkzeugketten und das Lockfile erneut zu aktualisieren.

## Validierung

Tests mit Node.js 24.19.0 auf macOS/Apple Silicon:

| Suite | Bestanden | Ausgelassen |
| --- | ---: | ---: |
| App/Mocha | 219 | 7 |
| Client/Karma | 1618 | 16 |
| Echte Modellierer/Export-Roundtrips | 91 | 0 |
| Jest | 1 | 0 |
| Gesamt | 1929 | 23 |

Der Gesamtlauf wurde durch gezielte Wiederholungen nach den abschließenden Änderungen ergänzt. Zusätzlich wurden alle 35 React-SVGs mit dem tatsächlichen Loader kompiliert und gerendert sowie die oben beschriebenen Proxy-, YAML- und Watch-Prüfungen durchgeführt.

Das separate Plugin-Projekt wurde mit `npm ci` installiert; alle vier Plugin-Builds waren erfolgreich. `npm run lint` und `git diff --check` sind erfolgreich.

Der abschließende Aufruf `npm run build -- --mac --linux --no-compress` war einschließlich Preload-, Client-, Distro-Build und Archivprüfung erfolgreich: macOS x64 und arm64 (je DMG und ZIP) sowie Linux x64 (tar.gz). Die gepackte arm64-App wurde nativ gestartet; eine BPMN-Datei wurde erstellt, benannt, gespeichert, geschlossen und erneut geöffnet. Name, Operaton-Namespace und Ausführungsplattform blieben erhalten; die Symbole wurden visuell geprüft.

Die Lizenzhinweise wurden erfolgreich neu erzeugt. Für im npm-Paket fehlende Sentry-, Formik- und Nodable-Lizenztexte sind belegte Quellen hinterlegt. Zwei bereits vorhandene Warnungen bleiben: `@bpmn-io/semver-compat` und `bpmn-js-copy-as-image` deklarieren MIT, enthalten aber auch in den jeweiligen veröffentlichten Git-Revisionen keinen vollständigen Lizenztext. Einzelne Preact-Unterpakete enthalten außerdem keine eigenen Repository-Angaben.

Die macOS-Testpakete werden ohne Signatur und Notarisierung erstellt. Windows und Linux wurden nicht nativ gestartet. Deployment und Prozessstart gegen einen laufenden Operaton-Server wurden nicht live geprüft; die vorhandenen API-/UI-Tests verwenden Mocks.

Audit-JSONs und lokale Prüfprotokolle dieser Sitzung liegen unter `/tmp/operaton-modeler-audit-20261015/`.
