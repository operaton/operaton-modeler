# Operaton ad hoc comparison – 15 October 2026

Ad hoc editing is prepared for the contract defined in [Operaton PR #3207](https://github.com/operaton/operaton/pull/3207) and is disabled by default. The reviewed PR is __open and in draft__, with head `a493744eb9c3a21f36de7a13c323c3109c67fc1a`, targeting `main`, and was last updated on 12 October 2026. The `@since 2.2` annotations do not establish availability in a released engine. Execution requires an engine build that includes this PR; the Modeler does not bundle such an engine.

The Fluxnova Modeler extension from `upstream/develop` at `eb719138` was compared with the Operaton [parser](https://github.com/operaton/operaton/blob/a493744eb9c3a21f36de7a13c323c3109c67fc1a/engine/src/main/java/org/operaton/bpm/engine/impl/bpmn/parser/BpmnParse.java), [runtime implementation](https://github.com/operaton/operaton/blob/a493744eb9c3a21f36de7a13c323c3109c67fc1a/engine/src/main/java/org/operaton/bpm/engine/impl/bpmn/behavior/AdHocSubProcessActivityBehavior.java), and [engine documentation](https://github.com/operaton/operaton/blob/a493744eb9c3a21f36de7a13c323c3109c67fc1a/docs/features/ad-hoc-subprocesses.md).

## Enabling the feature

Add the following setting to your personal `<user data directory>/resources/flags.json` file and restart the Modeler:

```json
{
  "enable-ad-hoc": true
}
```

The default user data directory is `~/Library/Application Support/operaton-modeler` on macOS, `%APPDATA%\operaton-modeler` on Windows, and `$XDG_CONFIG_HOME/operaton-modeler` or `~/.config/operaton-modeler` on Linux. A directory selected with `--user-data-dir` replaces this path. Preserve any existing settings in the JSON file.

Alternatively, start the Modeler with `--enable-ad-hoc=true`. The explicit `=true` syntax prevents a subsequent file path from being interpreted as the flag value. `--enable-ad-hoc=false` or the JSON value `false` disables the extension; CLI values override the file. Only the Boolean value `true` and the string `"true"` enable the feature.

Selecting a BPMN ad hoc subprocess shows the __Operaton ad hoc (experimental)__ group. The existing BPMN __Completion__ group remains available. Without the flag, only the additional group is hidden; existing ad hoc attributes and properties are preserved when opening and saving files. The flag does not change the selection of supported engine versions.

## XML contract and Modeler mapping

All Operaton extensions use `http://operaton.org/schema/1.0/bpmn`. Standard BPMN fields remain in the BPMN namespace or use unqualified attributes.

| Field                      | Operaton representation                                                                       | Default and meaning                                                          | Modeler change                                                                      |
| -------------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Subprocess                 | `bpmn:adHocSubProcess`                                                                        | An actual ad hoc activity                                                    | Use the existing BPMN element type                                                  |
| Ordering                   | Unqualified `ordering` attribute                                                              | `Parallel`; alternatively, `Sequential`                                      | Add a selector, which was missing from the original extension                       |
| Completion condition       | BPMN child element `completionCondition`, optionally with `xsi:type="bpmn:tFormalExpression"` | Without a condition, the auto-complete rule applies                          | Reuse the existing standard field                                                   |
| Cancel remaining instances | Unqualified `cancelRemainingInstances` attribute                                              | `true`                                                                       | Reuse the existing standard field                                                   |
| Initial activities         | `operaton:properties` / `operaton:property`, `name="activeTasksCollection"`, `value="…"`      | Missing, empty, or a `null` result: no initial activation                    | Use Operaton properties instead of custom upstream types; preserve other properties |
| Auto complete              | `operaton:autoComplete` attribute directly on the ad hoc subprocess                           | `true`; `false` keeps the scope open when no completion condition is defined | Permanent moddle descriptor, with an additional checkbox enabled by the flag        |

The PR explicitly treats defining `autoComplete` as an extension property as a parse error. It is written only as an attribute. Internally, the descriptor continues to use the platform libraries' existing `camunda` alias; its URI is Operaton, and the existing save operation normalizes the XML prefix to `operaton`. No additional upstream namespaces or restricted variable extensions are registered.

Example of the relevant XML fragment:

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

## Runtime differences relevant to modeling

| Topic                 | Contract of the reviewed Operaton PR                                                                                                                                                                                                                                                                                                                                                                                     |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Initial activation    | `activeTasksCollection` selects eligible direct child activities without incoming sequence flows. `${taskIds}` references a variable or expression; `taskA,taskB` is a literal list of IDs. The expression result may be a string or a Java collection. A bare variable name is interpreted as an activity ID.                                                                                                           |
| Empty selection       | No tasks start automatically. The ad hoc scope remains open for API calls unless a completion condition is already satisfied.                                                                                                                                                                                                                                                                                            |
| Sequential execution  | At most one distinct activity is initially selected; subsequently, at most one direct child activity may be running. An embedded subprocess or a multi-instance activity counts as one outer activity.                                                                                                                                                                                                                   |
| Downstream activities | Incoming sequence flows do not automatically activate the target activity. They make it available for selection; the runtime API must explicitly start it. This applies to both Parallel and Sequential ordering. Gateways and intermediate events continue routing normally.                                                                                                                                            |
| Auto complete         | Without a completion condition, automatic completion occurs only after work has started and no open child executions remain. Activities that are available for selection but have not yet started, as well as waiting routing executions, also prevent completion. "After the initial tasks" would be incomplete as help text.                                                                                           |
| Completion condition  | The condition is evaluated on entry and, among other points, after successful activity completion, before outgoing flows are processed. Once satisfied, it remains effective and prevents further activation. With `cancelRemainingInstances=true`, remaining work is terminated; with `false`, work already in progress may finish. Activities that are available for selection but have not yet started are discarded. |
| Explicit completion   | With `cancelRemainingInstances=false` and work still in progress, the API call is rejected; it does not schedule completion for later. With `true`, running work is canceled.                                                                                                                                                                                                                                            |
| Model constraints     | No direct child start or end events in the ad hoc subprocess; no `triggeredByEvent=true`. Nested regular subprocesses retain their own rules.                                                                                                                                                                                                                                                                            |

The RuntimeService methods are `getStartableAdHocActivities`, `triggerAdHocActivities`, and `completeAdHocSubProcess`. The REST API provides `GET /execution/{id}/ad-hoc-activities`, `POST /execution/{id}/ad-hoc-activities/trigger`, and `POST /execution/{id}/ad-hoc-activities/complete`. The ID identifies the execution of the entered ad hoc scope. The Modeler extension edits the model; runtime control is outside the scope of this change.

The engine provides local context variables such as `nrOfActiveAdHocActivities`, `nrOfCompletedAdHocActivities`, `nrOfEnabledAdHocActivities`, `adHocEnabledActivityIds`, `adHocActiveActivityIds`, `adHocCompletedActivityIds`, `adHocLastCompletedActivityId`, and `adHocCompletionConditionSatisfied`. Business logic and expressions must not overwrite these engine values.

## Validation limits

This comparison checks the XML contract against the recorded PR head. Modeler integration tests cover flag behavior, UI inputs, namespace output, undo/redo, and XML roundtrips, including reopening files with the extension disabled. Overall results are recorded in the [upstream validation report](upstream-sync-2026-10-15.md). No deployment or process execution against a server built with PR [#3207](https://github.com/operaton/operaton/pull/3207) was performed during this session.
