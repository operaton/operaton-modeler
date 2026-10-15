---
name: Release
about: Create an Operaton Modeler release checklist.
labels:
- release
---

# Operaton Modeler Release

## Release scope

<!--
Choose an explicit Operaton Modeler target version. The first release is 1.0.0.
Link the Operaton changelog entry and the issues included in this release.
Upstream Modeler versions and tags are provenance, not Operaton release versions.
-->

* Target version:
* Included changes:
* Compatibility changes and limitations:

## Preparation

* [ ] confirm the explicit Operaton version using the [versioning policy](https://github.com/operaton/operaton-modeler/blob/HEAD/docs/versioning.md)
* [ ] use a fresh clone of `https://github.com/operaton/operaton-modeler.git` and check out the Operaton development branch; do not import upstream tags into the release clone
* [ ] ensure the selected release commit includes the intended changes
* [ ] prepare the explicit target version with `npm run release -- <version> --yes`; this does not create a tag, push, or publish a release
* [ ] synchronize the version in `app/package.json`, `client/package.json`, `lerna.json`, and the workspace entries in `package-lock.json`; retain the root builder version `0.0.0`
* [ ] update the Operaton changelog, release information, and third-party notices
* [ ] preview the license summary with `node tasks/send-license-book-summary.js --print`; select an explicit previous Operaton tag for later-release comparisons
* [ ] run `npm ci`, `npm run lint`, and `npm test`
* [ ] review dependency audit findings and document any unresolved findings and their exposure
* [ ] build and test the packaged application on Linux, macOS, and Windows
* [ ] verify BPMN, DMN, and Form creation, save/reopen behavior, Operaton namespaces, and the supported engine integration
* [ ] document feature flags, engine compatibility, and known limitations in the release notes

## Release

Follow the [release process](https://github.com/operaton/operaton-modeler/blob/HEAD/docs/.project/RELEASE.md). Preparing the version does not publish a release.

* [ ] confirm the explicit tag `v<version>` matches the selected Operaton version and tested commit; the first release tag is `v1.0.0`
* [ ] validate the tag against the version files with `node app/util/validate-release-version.js refs/tags/v<version>` and commit the reviewed release preparation
* [ ] create the release tag in the clean origin clone without reusing or overwriting inherited upstream tags
* [ ] verify the [release workflow](https://github.com/operaton/operaton-modeler/actions/workflows/RELEASE.yml) created the intended draft release and all expected artifacts
* [ ] test the release artifacts on the supported platforms and verify their displayed version
* [ ] publish the validated draft in [Operaton Modeler releases](https://github.com/operaton/operaton-modeler/releases)
* [ ] mark the Operaton changelog entry as released and close the related release issue or milestone
