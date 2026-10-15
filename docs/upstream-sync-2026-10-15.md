# Upstream synchronization and verification report — 15 October 2026

The Operaton fork was updated from `ce5b0da0` (shared base `23c58005`, version 1.2.0) to Fluxnova Modeler `upstream/develop` at `eb719138` (version 1.3.3, 12 October 2026). Upstream contained 48 additional commits, representing 21 changes along the main line of development. The working branch for this integration was `codex/upstream-sync-20261015`.

## Changes incorporated

* React 18.3.1, Electron 44.0.0, and Node.js 24 for CI; updated libraries and build tools.
* Fixes for BPMN copy and paste, the React tab lifecycle, missing form panels, DMN editing, and engine version overrides.
* Preserved Operaton branding, deployment endpoints, Cockpit links, and package names.
* Corrected the engine selection to the released 1.0, 1.1, 2.0, and 2.1 series, with 2.1 as the default. At the time of review, remote tags only listed prereleases for 2.2.
* Aligned ad hoc properties with Operaton engine PR [#3207](https://github.com/operaton/operaton/pull/3207) and prepared them behind the disabled-by-default `enable-ad-hoc` feature flag. See the [ad hoc comparison](operaton-ad-hoc-comparison.md) for details and activation instructions.
* Intentionally omitted Restricted Variables and additional Fluxnova compatibility. Upstream attribution and license notices remain intact.

## Additional fixes

* The previous global XML replacement could modify scripts, documentation, and attribute values. The new parser recognizes XML markup and preserves business content.
* Metadata using alternative XML prefixes is correctly converted to Operaton during Camunda migration. Files saved directly from XML or JSON tabs also receive Operaton metadata, while selected Operaton versions, standard namespaces, and business content are preserved.
* CMMN now uses Operaton extensions, including when importing and saving older Camunda files.
* Electron 44 adds `--enable-avfoundation` when launching a second instance. The CLI parser now ignores this Chromium switch so that the following file path is not consumed as its value.
* "Ask in Forum" links to <https://forum.operaton.org>; the privacy policy links to <https://operaton.org/privacy>.

## Namespace verification

| Format | Expected Operaton identifier              | Verification                                                                     |
| ------ | ----------------------------------------- | -------------------------------------------------------------------------------- |
| BPMN   | `http://operaton.org/schema/1.0/bpmn`     | Create, edit, export, and reopen using the actual modeler                        |
| DMN    | `http://operaton.org/schema/1.0/dmn`      | Create, edit, export, and reopen using the actual modeler                        |
| CMMN   | `http://operaton.org/schema/1.0/cmmn`     | Import, edit, export, and reopen using the actual modeler; legacy Camunda import |
| Form   | JSON with `executionPlatform: "Operaton"` | Export and reopen using the actual modeler                                       |

The internal CMMN editor is not currently registered as a public file type in the fork. Its namespace handling was verified with tests using the actual modeler. The regular desktop smoke test covers BPMN, DMN, and Form.

BPMN and DMN also use `http://operaton.org/schema/modeler/1.0` for modeler metadata. Standard OMG and W3C namespaces are preserved. Camunda prefixes within business strings remain unchanged. An alias required by QName values may be retained, with its engine namespace URI changed to Operaton.

## Validation

The final full test run, including the ad hoc preparation, passed (`npm run test`):

| Suite                             | Passed | Skipped |
| --------------------------------- | -----: | ------: |
| App/Mocha                         |    212 |       7 |
| Client/Karma                      |   1617 |      16 |
| Actual modelers/export roundtrips |     91 |       0 |
| Jest                              |      1 |       0 |
| Total                             |   1921 |      23 |

`npm run lint` and `git diff --check` passed. The ten additional ad hoc integration tests cover actual properties panel fields, Boolean and CLI flags, defaults, undo/redo, preservation of other properties, and saving and reopening with the flag disabled.

`npm run build -- --mac --no-compress` passed, including the preload, client, distribution, and archive checks, producing a DMG and ZIP for each of x64 and arm64. Warnings concern bundle size, existing LESS deprecations, and build tool deprecations.

A manual desktop smoke test used an isolated profile: the BPMN, DMN, and Form editors were opened; a BPMN element was labeled, saved through the native menu, closed, and reopened. The label and Operaton namespace were preserved. Opening a file through a second Electron instance was also verified.

After adding ad hoc support, the application was rebuilt and checked in the packaged arm64 app: activation through the CLI, visibility of the additional group, the `autoComplete=true` default, changing ordering to `Sequential`, setting an initial activity, and setting `autoComplete=false`. After saving through the native dialog, the XML contained the expected Operaton attributes and properties. Disabling the flag through the CLI on restart hid the additional group; all ad hoc settings survived a subsequent name change and save.

Tests ran with Node.js 24.19.0 on macOS/Apple Silicon. Windows and Linux were not run during this verification stage. Deployment and process start against a running Operaton server were not tested live; the existing API and UI tests use mocks. macOS test packages are built without signing or notarization.

## Dependency audit

The following figures describe the state immediately after the upstream integration. The subsequent remediation is documented in the [dependency audit dated 15 October 2026](dependency-audit-2026-10-15.md): production and plugin dependencies now have no findings, while nine development package findings remain for a single unpatched `braces` vulnerability.

`npm audit` reported 102 package findings for the integrated dependency versions: 3 critical, 55 high, 41 moderate, and 3 low. The packages rated critical, `handlebars`, `lerna`, and `shell-quote`, are used exclusively for development and builds; Lerna inherits the severity of its dependency.

`npm audit --omit=dev` reported 34 findings: 0 critical, 13 high, 20 moderate, and 1 low. Affected dependency chains included Camunda SDK/gRPC, Sentry, file discovery, and UI libraries. An audit finding alone does not establish an exploitable path. The upstream integration did not resolve every security finding; no blanket major upgrades were applied through `npm audit fix --force`.

Raw logs and audit JSON files from this session are stored in `/tmp/operaton-modeler-check-20261015/`.
