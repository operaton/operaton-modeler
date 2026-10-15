# Dependency audit – 15 October 2026

Dependencies were updated and checked for compatibility after the [upstream sync](upstream-sync-2026-10-15.md). Production dependencies and the separate plugin lockfile have no known npm audit findings. One unpatched vulnerability remains in development dependencies, reported against nine packages.

## Results

| Scope                                            | Before remediation                           | After remediation                                                                 |
| ------------------------------------------------ | -------------------------------------------- | --------------------------------------------------------------------------------- |
| Main lockfile, including development tools       | 102: 3 critical, 55 high, 41 moderate, 3 low | 9 high; all concern the same `braces` vulnerability or packages that depend on it |
| Production dependencies (`npm audit --omit=dev`) | 34: 13 high, 20 moderate, 1 low              | 0                                                                                 |
| Separate `resources/plugins` lockfile            | 6: 1 critical, 1 high, 3 moderate, 1 low     | 0                                                                                 |

The production counts are a subset of the main lockfile counts and must not be added to them. The full `npm audit` still exits with code 1 because of the documented remaining finding; the other two audits exit with code 0.

## Changes

* Applied compatible security updates to the main and plugin lockfiles.
* Updated Camunda SDK to 8.8.18. The Zeebe APIs in use remain available; the old Windows certificate dependency chain through `win-ca`/`node-forge` has been removed. The SDK uses the system certificate APIs provided by the current Node runtime.
* Updated Sentry for the main and renderer processes to 10.76.2. Frame normalization uses the SDK's `rewriteFramesIntegration`; the old integration package has been removed. Local Unix and Windows file paths remain anonymized. Crash reporting consent and a DSN are still required; the new logging and metrics features are explicitly disabled.
* Migrated production file searches from `fast-glob` to `glob` 13.0.6. The official unbundled `glob/raw` export allows all dependencies actually used, and their licenses, to be included in the inventory. Regression tests cover search path priority, configuration merge order, relative paths, dotfiles, exclusions, symlinks, and case sensitivity.
* Replaced the obsolete `react-svg-loader` with SVGR 8.1.0. React default exports, `viewBox`, titles, and forwarded properties are preserved.
* Updated Puppeteer to 25.14.0; Karma awaits browser path resolution, which is now asynchronous. Updated to Mocha 12, NYC 18, Jest-JUnit 17, Nodemailer 10, and Sentry Webpack Plugin 5.
* Removed the unused `electron-publisher-s3`. The current electron-builder already supports S3 publishing; the old AWS SDK/builder dependency chain has been removed.
* Standardized CI installation on `npm ci` and removed additional unpinned Puppeteer installations and `NODE_TLS_REJECT_UNAUTHORIZED=0`.
* Regenerated third-party notices from the updated app and client dependencies.

## Scoped overrides

| Dependency                                 | Override      | Compatibility evidence                                                                                                                                       |
| ------------------------------------------ | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `@electron/get` → `global-agent` → `roarr` | exactly 6.0.0 | Actual downloads using an HTTP proxy, HTTPS CONNECT, a custom trusted CA, SNI, `NO_PROXY`, SHA256, and enabled logging. Untrusted certificates are rejected. |
| `@istanbuljs/load-nyc-config` → `js-yaml`  | ^4.3.2        | Actual YAML configuration loading, including inheritance, arrays, alias/merge keys, and option name normalization.                                           |
| `nx` → `undici`                            | ^7.30.0       | Security update within the major version already in use.                                                                                                     |
| `unified-args` → `chokidar`                | ^4.0.3        | Actual Remark watch operation with glob input, a filename containing spaces, file changes, regenerated output, and clean termination.                        |

`global-agent` 4.1.3 was not adopted because the HTTPS proxy test exposed a regression affecting CA/SNI options. Updating only the logger preserves the working proxy behavior of `global-agent` 3 and removes its vulnerable formatting dependency. Roarr is pinned to an exact version because its export API changes between major versions.

## Remaining finding

[GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) affects `braces` up to and including the latest published version, 3.0.3. Extremely deeply nested patterns can cause a stack overflow and terminate the process. No patched version had been published at the time of this audit.

The nine findings concern `braces`, `chokidar`, `del`, `del-cli`, `electron-reloader`, `fast-glob`, `globby`, `karma`, and `micromatch`. All affected entries are development dependencies in the lockfile:

* Karma processes the test patterns defined in the repository.
* `del`/`del-cli` use the fixed local cleanup patterns defined in the build scripts.
* `electron-reloader` disables glob expansion with `disableGlobbing: true`.

Model content from BPMN, DMN, CMMN, or Form files is not passed to these tools as patterns. The finding remains open for development tools; it is neither excluded from the audit nor hidden through incompatible downgrades. Once a compatible fix is published, the affected toolchains and lockfile must be updated again.

## Validation

Tests with Node.js 24.19.0 on macOS/Apple Silicon:

| Suite                             | Passed | Skipped |
| --------------------------------- | -----: | ------: |
| App/Mocha                         |    219 |       7 |
| Client/Karma                      |   1618 |      16 |
| Actual modelers/export roundtrips |     91 |       0 |
| Jest                              |      1 |       0 |
| Total                             |   1929 |      23 |

The full run was supplemented by targeted reruns after the final changes. All 35 React SVGs were also compiled and rendered with the actual loader, and the proxy, YAML, and watch checks described above were performed.

The separate plugin project was installed with `npm ci`; all four plugin builds succeeded. `npm run lint` and `git diff --check` passed.

The final `npm run build -- --mac --linux --no-compress` command succeeded, including preload, client, and distribution builds and archive verification: macOS x64 and arm64 (DMG and ZIP for each), and Linux x64 (tar.gz). The packaged arm64 app was launched natively; a BPMN file was created, named, saved, closed, and reopened. Its name, Operaton namespace, and execution platform were preserved; icons were checked visually.

License notices were successfully regenerated. Verified sources are recorded for Sentry, Formik, and Nodable license texts missing from their npm packages. Two pre-existing warnings remain: `@bpmn-io/semver-compat` and `bpmn-js-copy-as-image` declare MIT but do not include the full license text, even in their corresponding published Git revisions. Some Preact subpackages also lack their own repository metadata.

The macOS test packages are built without signing or notarization. Windows and Linux were not launched natively. Deployment and process start against a running Operaton server were not tested live; the existing API/UI tests use mocks.

Audit JSON files and local validation logs from this session are stored under `/tmp/operaton-modeler-audit-20261015/`.
