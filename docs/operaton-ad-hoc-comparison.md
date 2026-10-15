# Operaton-Ad-hoc-Abgleich – 15.10.2026

Die Ad-hoc-Bearbeitung ist für den Vertrag aus [Operaton PR #3207](https://github.com/operaton/operaton/pull/3207) vorbereitet und standardmäßig ausgeschaltet. Der geprüfte PR ist **offen und Draft**, Head `a493744eb9c3a21f36de7a13c323c3109c67fc1a`, Zielbranch `main`, zuletzt aktualisiert am 12.10.2026. Die `@since 2.2`-Annotationen belegen keine Verfügbarkeit in einer veröffentlichten Engine. Zur Ausführung ist ein Engine-Build mit diesem PR erforderlich; der Modeler liefert keine entsprechende Engine mit.

Verglichen wurde die Fluxnova-Modeler-Erweiterung aus `upstream/develop` bei `eb719138` mit dem Operaton-[Parser](https://github.com/operaton/operaton/blob/a493744eb9c3a21f36de7a13c323c3109c67fc1a/engine/src/main/java/org/operaton/bpm/engine/impl/bpmn/parser/BpmnParse.java), der [Laufzeitimplementierung](https://github.com/operaton/operaton/blob/a493744eb9c3a21f36de7a13c323c3109c67fc1a/engine/src/main/java/org/operaton/bpm/engine/impl/bpmn/behavior/AdHocSubProcessActivityBehavior.java) und der [Engine-Dokumentation](https://github.com/operaton/operaton/blob/a493744eb9c3a21f36de7a13c323c3109c67fc1a/docs/features/ad-hoc-subprocesses.md).

## Aktivieren

In der persönlichen Datei `<Benutzerverzeichnis>/resources/flags.json` ergänzen und den Modeler neu starten:

```json
{
  "enable-operaton-ad-hoc": true
}
```

Das Benutzerverzeichnis ist standardmäßig unter macOS `~/Library/Application Support/operaton-modeler`, unter Windows `%APPDATA%\operaton-modeler` und unter Linux `$XDG_CONFIG_HOME/operaton-modeler` beziehungsweise `~/.config/operaton-modeler`. Ein mit `--user-data-dir` gewähltes Verzeichnis ersetzt diesen Pfad. Vorhandene Einstellungen in der JSON-Datei bleiben bestehen.

Alternativ den Modeler mit `--enable-operaton-ad-hoc=true` starten. Die explizite Schreibweise mit `=true` verhindert, dass ein folgender Dateipfad als Flag-Wert gelesen wird. `--enable-operaton-ad-hoc=false` oder der JSON-Wert `false` deaktiviert die Erweiterung; CLI-Werte überschreiben die Datei. Akzeptiert werden ausschließlich Boolean `true` und die Zeichenfolge `"true"`.

Bei einem ausgewählten BPMN-Ad-hoc-Subprozess erscheint die Gruppe **Operaton ad hoc (experimental)**. Die vorhandene BPMN-Gruppe **Completion** bleibt erhalten. Ohne Flag fehlt nur die zusätzliche Gruppe; vorhandene Ad-hoc-Attribute und Properties bleiben beim Öffnen und Speichern erhalten. Das Flag ändert die unterstützte Engine-Versionsauswahl nicht.

## XML-Vertrag und Modeler-Abbildung

Alle Operaton-Erweiterungen verwenden `http://operaton.org/schema/1.0/bpmn`. Standard-BPMN-Felder bleiben im BPMN-Namensraum beziehungsweise unqualifizierte Attribute.

| Feld | Darstellung für Operaton | Default und Bedeutung | Modeler-Anpassung |
| --- | --- | --- | --- |
| Subprozess | `bpmn:adHocSubProcess` | Echte Ad-hoc-Aktivität | Vorhandenen BPMN-Elementtyp verwenden |
| Ordering | Unqualifiziertes Attribut `ordering` | `Parallel`; alternativ `Sequential` | Auswahl ergänzt; in der ursprünglichen Erweiterung fehlte sie |
| Completion condition | BPMN-Kindelement `completionCondition`, gegebenenfalls `xsi:type="bpmn:tFormalExpression"` | Ohne Bedingung gilt die Auto-Complete-Regel | Vorhandenes Standardfeld wiederverwenden |
| Cancel remaining instances | Unqualifiziertes Attribut `cancelRemainingInstances` | `true` | Vorhandenes Standardfeld wiederverwenden |
| Initial activities | `operaton:properties` / `operaton:property`, `name="activeTasksCollection"`, `value="…"` | Fehlend, leer oder Ergebnis `null`: keine initiale Aktivierung | Operaton-Properties statt eigener Upstream-Typen; übrige Properties erhalten |
| Auto complete | Attribut `operaton:autoComplete` direkt am Ad-hoc-Subprozess | `true`; `false` hält ohne Completion Condition den Scope offen | Permanenter Moddle-Descriptor, zusätzliches Checkbox-Feld hinter Flag |

`autoComplete` als Extension-Property ist im PR ausdrücklich ein Parsefehler. Es wird ausschließlich als Attribut geschrieben. Der Descriptor verwendet intern weiterhin den bestehenden `camunda`-Alias der Plattformbibliotheken; die URI ist Operaton und der vorhandene Speichervorgang normalisiert das XML-Präfix auf `operaton`. Es werden keine zusätzlichen Upstream-Namensräume oder Restricted-Variable-Erweiterungen registriert.

Beispiel für den relevanten XML-Ausschnitt:

```xml
<bpmn:adHocSubProcess id="review" ordering="Sequential"
    operaton:autoComplete="false"
    xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
    xmlns:operaton="http://operaton.org/schema/1.0/bpmn">
  <bpmn:extensionElements>
    <operaton:properties>
      <operaton:property name="activeTasksCollection" value="reviewTask" />
    </operaton:properties>
  </bpmn:extensionElements>
  <bpmn:userTask id="reviewTask" />
</bpmn:adHocSubProcess>
```

## Laufzeitunterschiede, die beim Modellieren relevant sind

| Thema | Vertrag des geprüften Operaton-PRs |
| --- | --- |
| Initiale Aktivierung | `activeTasksCollection` wählt direkte geeignete Aktivitäten ohne eingehende Sequenzflüsse. `${taskIds}` referenziert eine Variable beziehungsweise Expression; `taskA,taskB` ist eine literale ID-Liste. Das Expression-Ergebnis darf ein String oder eine Java-Collection sein. Ein bloßer Variablenname wird als Aktivitäts-ID gelesen. |
| Leere Auswahl | Keine Aufgaben starten automatisch. Der Ad-hoc-Scope bleibt für API-Aufrufe offen, sofern keine Completion Condition bereits erfüllt ist. |
| Sequenziell | Initial höchstens eine unterschiedliche Aktivität; später höchstens eine laufende direkte Aktivität. Ein eingebetteter Subprozess oder eine Multi-Instance-Aktivität zählt dabei als eine äußere Aktivität. |
| Nachgelagerte Aktivitäten | Eingehende Sequenzflüsse aktivieren die Zielaktivität nicht automatisch. Sie machen sie auswählbar; die Laufzeit-API muss sie explizit starten. Das gilt für Parallel und Sequential. Gateways und Zwischenereignisse routen regulär weiter. |
| Auto complete | Ohne Completion Condition: Erst nachdem Arbeit begonnen hat und keine offenen Kind-Ausführungen verbleiben, wird automatisch abgeschlossen. Auch auswählbare, noch nicht gestartete Arbeit und wartende Routing-Ausführungen verhindern diesen Abschluss. „Nach den initialen Aufgaben“ wäre als Hilfetext unvollständig. |
| Completion condition | Wird unter anderem beim Eintritt sowie nach erfolgreichem Aktivitätsabschluss vor den ausgehenden Flüssen geprüft. Einmal erfüllt, bleibt die Bedingung wirksam und verhindert weitere Aktivierung. Bei `cancelRemainingInstances=true` wird übrige Arbeit beendet; bei `false` darf bereits laufende Arbeit auslaufen. Noch nicht gestartete, auswählbare Arbeit wird verworfen. |
| Expliziter Abschluss | Bei `cancelRemainingInstances=false` und noch laufender Arbeit wird der API-Aufruf abgewiesen; er startet keinen späteren Abschluss. Bei `true` wird laufende Arbeit abgebrochen. |
| Modellgrenzen | Keine direkten Start-/Endereignisse im Ad-hoc-Subprozess; kein `triggeredByEvent=true`. Verschachtelte reguläre Subprozesse behalten ihre eigenen Regeln. |

Die RuntimeService-Methoden heißen `getStartableAdHocActivities`, `triggerAdHocActivities` und `completeAdHocSubProcess`. REST bietet `GET /execution/{id}/ad-hoc-activities`, `POST /execution/{id}/ad-hoc-activities/trigger` und `POST /execution/{id}/ad-hoc-activities/complete`. Die ID bezeichnet die Ausführung des eingetretenen Ad-hoc-Scopes. Die Modeler-Erweiterung bearbeitet das Modell; eine Laufzeitsteuerung gehört nicht zu dieser Änderung.

Die Engine stellt lokale Kontextvariablen wie `nrOfActiveAdHocActivities`, `nrOfCompletedAdHocActivities`, `nrOfEnabledAdHocActivities`, `adHocEnabledActivityIds`, `adHocActiveActivityIds`, `adHocCompletedActivityIds`, `adHocLastCompletedActivityId` und `adHocCompletionConditionSatisfied` bereit. Diese Engine-Werte dürfen Geschäftslogik und Expressions nicht überschreiben.

## Prüfgrenzen

Der Abgleich prüft den XML-Vertrag anhand des festgehaltenen PR-Heads. Modeler-Integrationstests prüfen Flag-Verhalten, UI-Eingaben, Namespace-Ausgabe, Undo/Redo und XML-Roundtrips einschließlich erneutem Öffnen mit deaktivierter Erweiterung. Die Gesamtergebnisse stehen im [Upstream-Prüfbericht](upstream-sync-2026-10-15.md). Ein Deployment oder eine Prozessausführung gegen einen mit PR #3207 gebauten Server wurde in dieser Sitzung nicht durchgeführt.
