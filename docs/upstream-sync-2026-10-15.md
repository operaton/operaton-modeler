# Upstream-Abgleich und Prüfbericht – 15.10.2026

Der Operaton-Fork wurde von `ce5b0da0` (gemeinsame Basis `23c58005`, Version 1.2.0) auf Fluxnova Modeler `upstream/develop` bei `eb719138` (Version 1.3.3, 12.10.2026) abgeglichen. Der Upstream enthielt 48 zusätzliche Commits beziehungsweise 21 Änderungen entlang der Hauptlinie. Der lokale Arbeitsbranch ist `codex/upstream-sync-20261015`.

## Übernommene Änderungen

- React 18.3.1, Electron 44.0.0 und Node.js 24 für CI; aktualisierte Bibliotheken und Build-Werkzeuge.
- Korrekturen für BPMN Copy & Paste, React-Tab-Lebenszyklus, fehlende Formular-Panels, DMN-Bearbeitung und Engine-Versionsüberschreibung.
- Operaton-Branding, Deployment-Endpunkte, Cockpit-Verweise und Paketnamen erhalten.
- Engine-Auswahl auf die veröffentlichten Reihen 1.0, 1.1, 2.0 und 2.1 korrigiert; Standard 2.1. Die Remote-Tags zeigen 2.2 bislang nur als Vorabversion.
- Ad-hoc-Eigenschaften mit Operaton-Engine-PR [#3207](https://github.com/operaton/operaton/pull/3207) abgeglichen und hinter dem standardmäßig deaktivierten Featureflag `enable-ad-hoc` vorbereitet. Details und Aktivierung stehen im [Ad-hoc-Abgleich](operaton-ad-hoc-comparison.md).
- Restricted Variables und zusätzliche Fluxnova-Kompatibilität bewusst ausgelassen. Upstream-Attribution und Lizenzhinweise bleiben erhalten.

## Zusätzlich behobene Fehler

- Die bisherige globale XML-Ersetzung konnte Scripts, Dokumentation und Attributwerte verändern. Der neue Parser berücksichtigt XML-Markup und lässt fachliche Inhalte unverändert.
- Metadaten mit alternativen XML-Präfixen werden bei der Camunda-Migration korrekt auf Operaton umgestellt. Auch direkt aus XML-/JSON-Tabs gespeicherte Dateien erhalten Operaton-Metadaten; gewählte Operaton-Versionen, standardisierte Namespaces und Fachinhalte bleiben erhalten.
- CMMN verwendet jetzt Operaton-Erweiterungen, einschließlich Import älterer Camunda-Dateien und erneutem Speichern.
- Electron 44 ergänzt bei einer zweiten Instanz `--enable-avfoundation`. Der CLI-Parser ignoriert diesen Chromium-Schalter nun, damit der folgende Dateipfad nicht als Schalterwert verschwindet.
- „Ask in Forum“ verweist auf <https://forum.operaton.org>; die Datenschutzerklärung auf <https://operaton.org/privacy>.

## Namespace-Prüfung

| Format | Erwartete Operaton-Kennung | Prüfung |
| --- | --- | --- |
| BPMN | `http://operaton.org/schema/1.0/bpmn` | Reales Erzeugen, Bearbeiten, Exportieren und Wiederöffnen |
| DMN | `http://operaton.org/schema/1.0/dmn` | Reales Erzeugen, Bearbeiten, Exportieren und Wiederöffnen |
| CMMN | `http://operaton.org/schema/1.0/cmmn` | Reales Importieren, Bearbeiten, Exportieren und Wiederöffnen; Legacy-Camunda-Import |
| Form | JSON mit `executionPlatform: "Operaton"` | Reales Exportieren und Wiederöffnen |

Der interne CMMN-Editor ist im Fork derzeit nicht als öffentlicher Dateityp registriert; seine Namespace-Pfade wurden mit echten Modeler-Tests geprüft. Der reguläre Desktop-Smoke-Test umfasst BPMN, DMN und Form.

BPMN und DMN verwenden außerdem `http://operaton.org/schema/modeler/1.0` für die Modeler-Metadaten. Die standardisierten OMG-/W3C-Namensräume bleiben bestehen. Camunda-Präfixe innerhalb fachlicher Strings bleiben unverändert; ein für QName-Werte benötigter Alias kann erhalten bleiben, seine Engine-Namespace-URI wird auf Operaton umgestellt.

## Validierung

Abschließender Gesamtlauf einschließlich Ad-hoc-Vorbereitung erfolgreich (`npm run test`):

| Suite | Bestanden | Ausgelassen |
| --- | ---: | ---: |
| App/Mocha | 212 | 7 |
| Client/Karma | 1617 | 16 |
| Echte Modellierer/Export-Roundtrips | 91 | 0 |
| Jest | 1 | 0 |
| Gesamt | 1921 | 23 |

`npm run lint` und `git diff --check` erfolgreich. Die zehn zusätzlichen Ad-hoc-Integrationstests prüfen die tatsächlichen Properties-Panel-Felder, Boolean- und CLI-Flags, Standardwerte, Undo/Redo, den Erhalt anderer Properties und Speichern/Wiederöffnen bei deaktiviertem Flag.

`npm run build -- --mac --no-compress` inklusive Preload-, Client-, Distro-Build und Archivprüfung erfolgreich: je ein DMG und ZIP für x64 und arm64. Die Warnungen betreffen Bundle-Größe, bestehende LESS-Deprecations sowie Build-Werkzeug-Deprecations.

Manueller Desktop-Smoke-Test mit isoliertem Profil: BPMN-, DMN- und Formular-Editor geöffnet; BPMN-Element beschriftet, über das native Menü gespeichert, geschlossen und erneut geöffnet. Beschriftung und Operaton-Namespace blieben erhalten. Zusätzlich wurde das Öffnen über eine zweite Electron-Instanz geprüft.

Nach der Ad-hoc-Ergänzung erneut gebaut und in der gepackten arm64-App geprüft: Aktivierung per CLI, sichtbare Zusatzgruppe, Standardwert `autoComplete=true`, Änderung auf `Sequential`, initiale Aktivität und `autoComplete=false`. Nach nativem Speichern enthielt das XML die erwarteten Operaton-Attribute/Properties. Deaktivierung per CLI beim Neustart blendete die Zusatzgruppe aus; nach einer Namensänderung und erneutem Speichern waren sämtliche Ad-hoc-Einstellungen weiterhin vorhanden.

Die Tests liefen mit Node.js 24.19.0 auf macOS/Apple Silicon. Windows und Linux wurden in dieser Sitzung nicht ausgeführt. Deployment und Prozessstart gegen einen laufenden Operaton-Server wurden nicht live geprüft; die vorhandenen API-/UI-Tests verwenden Mocks. macOS-Testpakete werden ohne Signatur und Notarisierung erstellt.

## Dependency-Audit

Die folgenden Zahlen dokumentieren den Stand unmittelbar nach dem Upstream-Abgleich. Die anschließende Bereinigung ist im [Dependency-Audit vom 15.10.2026](dependency-audit-2026-10-15.md) dokumentiert: Produktions- und Plugin-Abhängigkeiten jetzt ohne Befunde, neun verbleibende Paketmeldungen im Entwicklungsbereich zu einer noch ungepatchten `braces`-Schwachstelle.

`npm audit` meldet für den übernommenen Dependency-Stand 102 Paketbefunde: 3 kritisch, 55 hoch, 41 moderat und 3 niedrig. Die kritisch eingestuften Pakete `handlebars`, `lerna` und `shell-quote` gehören ausschließlich zum Entwicklungs-/Build-Bereich; Lerna erbt die Einstufung seiner Abhängigkeit.

`npm audit --omit=dev` meldet 34 Befunde: 0 kritisch, 13 hoch, 20 moderat und 1 niedrig. Betroffen sind unter anderem Abhängigkeitsketten von Camunda SDK/gRPC, Sentry, Dateisuche und UI-Bibliotheken. Ein Audit-Treffer allein belegt keine erreichbare Ausnutzung. Eine vollständige Sicherheitsbereinigung ist durch den Upstream-Abgleich nicht erreicht; es wurden keine pauschalen Major-Upgrades per `npm audit fix --force` vorgenommen.

Rohlogs und Audit-JSONs dieser Sitzung liegen unter `/tmp/operaton-modeler-check-20261015/`.
