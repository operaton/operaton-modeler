# Operaton Modeler Patch Release

## Patch release scope

<!--
Choose the next patch version of a published Operaton Modeler release.
The first patch after Operaton Modeler 1.0.0 would be 1.0.1.
Link the fixes and relevant changelog entry.
-->

* Target version:
* Operaton release being maintained:
* Included fixes:

## Preparation

* [ ] confirm the explicit patch version using the [versioning policy](https://github.com/operaton/operaton-modeler/blob/HEAD/docs/versioning.md); do not derive it from upstream versions or tags
* [ ] use a fresh clone of `https://github.com/operaton/operaton-modeler.git` and select the intended release commit; do not import upstream tags into the release clone
* [ ] verify that the included changes are compatible fixes to the Operaton release being maintained
* [ ] prepare the explicit target version with `npm run release -- <version> --yes`; this does not create a tag, push, or publish a release
* [ ] synchronize `app/package.json`, `client/package.json`, `lerna.json`, and the workspace entries in `package-lock.json`; retain the root builder version `0.0.0`
* [ ] update the Operaton changelog, release information, and third-party notices as appropriate
* [ ] preview the license summary with `node tasks/send-license-book-summary.js --print --previous-version=<previous-operaton-tag>`
* [ ] run `npm ci`, `npm run lint`, and `npm test`, and review dependency audit findings
* [ ] build the application and test each fix and relevant regression behavior in the packaged application
* [ ] test the release artifacts on Linux, macOS, and Windows

## Release

Follow the [patch release process](https://github.com/operaton/operaton-modeler/blob/HEAD/docs/.project/PATCH_RELEASE.md).

* [ ] confirm that the explicit `v<version>` tag matches the intended Operaton version and tested commit
* [ ] validate the tag against the version files with `node app/util/validate-release-version.js refs/tags/v<version>` and commit the reviewed release preparation
* [ ] create the release tag in the clean origin clone without reusing or overwriting inherited upstream tags
* [ ] verify the [release workflow](https://github.com/operaton/operaton-modeler/actions/workflows/RELEASE.yml) produced the expected draft and artifacts
* [ ] validate the packaged fixes and displayed version before publication
* [ ] publish the validated draft in [Operaton Modeler releases](https://github.com/operaton/operaton-modeler/releases)
* [ ] mark the Operaton changelog entry as released and close the related release issue or milestone
