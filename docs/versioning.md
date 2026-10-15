# Versioning

Operaton Modeler has its own release lifecycle. The first planned Operaton Modeler release is __1.0.0__; setting that version in the repository does not publish a release.

## Independent versions

Operaton Modeler follows [Semantic Versioning](https://semver.org/): patch releases contain compatible fixes, minor releases add compatible functionality, and major releases introduce incompatible changes. Release decisions reflect changes and compatibility in Operaton Modeler.

Modeler versions are independent of both the Operaton engine and upstream Modeler projects. For example, importing changes from Fluxnova Modeler 1.3.3 does not turn Operaton Modeler into version 1.3.3. Upstream versions and commit IDs belong in integration reports and the separate upstream history in the [changelog](../CHANGELOG.md).

## Version sources

Keep the Operaton release version synchronized in:

* `app/package.json`
* `client/package.json`
* `lerna.json`
* The matching workspace entries in the root `package-lock.json`

The private root build package keeps its own placeholder version, `0.0.0`; it is not the application release version. Engine compatibility versions, dependency versions, and XML namespace identifiers are separate concerns and must not be changed to match the Modeler version.

## Upstream integrations

When integrating upstream changes, retain the Operaton version in the files above. Review version-related merge changes explicitly, including build metadata and release automation. Record the upstream source version and commit in the integration notes, then choose any subsequent Operaton release increment based on the resulting Operaton changes.

Inherited upstream Git tags and changelog entries are historical provenance. They must not be presented as Operaton releases or used to select an Operaton release automatically. Do not overwrite inherited tags to create an Operaton release.

## Preparing a release

Operaton releases use tags of the form `v<version>`, starting with `v1.0.0`. Prepare releases in a fresh clone of `https://github.com/operaton/operaton-modeler.git`, without importing upstream tags. This avoids collisions with local tags such as an inherited upstream `v1.0.0` in integration checkouts. Keep those historical tags unchanged.

Choose the target version explicitly. Do not run a release command with an implicit version increment based on the inherited release history.

`npm run release -- 1.0.0 --yes` prepares the first stable version; `npm run release -- 1.0.0-rc.1 --yes` prepares that exact release candidate. The command updates version files and third-party notices without creating release tags, pushing changes, or publishing artifacts. Commit, tag, and publication are separate steps. Replace these examples with the explicitly selected Operaton version for later releases.

Use the [release checklist](.project/RELEASE.md) or [patch release checklist](.project/PATCH_RELEASE.md). Keep upcoming changes marked as unreleased until the actual Operaton release is published. Creating or changing a version in the manifests is preparation; creating a release tag and publishing artifacts are separate release actions.
