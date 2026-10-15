# Operaton Modeler Release

Operaton Modeler uses its own [versioning policy](../versioning.md). Its first planned release is __1.0.0__, independently of the inherited upstream version history. This release has not been published.

Create a release issue in the [Operaton Modeler repository](https://github.com/operaton/operaton-modeler/issues/new) and copy the [release template](./RELEASE_TEMPLATE.md). For compatible fixes after the first release, use the [patch release process](./PATCH_RELEASE.md).

## Preparation

1. Choose the explicit Operaton target version. Do not derive it from the latest upstream release or inherited Git tags, or use a release command with an implicit version increment.
2. Use a fresh clone of `https://github.com/operaton/operaton-modeler.git`, without importing upstream tags, and prepare the release from the Operaton development branch. The intended development branch is `main`; until the repository administrator completes the rename, it is `develop`.
3. Install dependencies with `npm ci` and prepare the selected version using the command below. Check that `app/package.json`, `client/package.json`, `lerna.json`, and the workspace entries in `package-lock.json` are synchronized. The private root builder package remains at `0.0.0`.
4. Review the regenerated third-party notices and update the Operaton section of the [changelog](../../CHANGELOG.md) and release information. Preserve upstream release history in its separately labeled section.
5. Run `npm run lint` and `npm test`, review `npm audit` findings, and build and test the release artifacts on the supported platforms. Use the [integration test checklist](./INTEGRATION_TEST.md), verifying the Operaton namespaces, application identity, and supported engine behavior.

Prepare the first stable release version explicitly:

```sh
npm run release -- 1.0.0 --yes
```

For a release candidate, supply its complete version instead:

```sh
npm run release -- 1.0.0-rc.1 --yes
```

The release command prepares version files and third-party notices. It does not create a release tag, push changes, or publish packages or artifacts. For subsequent releases, replace the example version with the explicitly selected Operaton version.

Preview the license summary for the first release:

```sh
node tasks/send-license-book-summary.js --print
```

For later releases, select a previously published Operaton tag explicitly when a comparison is needed, for example:

```sh
node tasks/send-license-book-summary.js --print --previous-version=v1.0.0
```

The preview command does not send a notification and does not infer a baseline from upstream tags.

## Publication

Creating a tag or publishing a GitHub release is a separate step after release preparation and validation. Operaton release tags use `v<version>`; the first release will use `v1.0.0`. Confirm that the chosen tag identifies the intended Operaton commit and version in the clean origin clone; never reuse or overwrite an inherited upstream tag. Review the [release workflow](../../.github/workflows/RELEASE.yml) before triggering it and verify the resulting draft release and artifacts before publication.

Validate the planned tag against the prepared version files before creating or pushing it:

```sh
node app/util/validate-release-version.js refs/tags/v1.0.0
```

Use the matching tag for a different target version, including its full prerelease suffix for a release candidate. After review, commit the prepared files, push the selected commit, and create and push its matching release tag as explicit release steps. The release workflow validates the selected tag and builds that tagged commit.

Publish releases in [operaton/operaton-modeler](https://github.com/operaton/operaton-modeler/releases). Mark the corresponding changelog entry as released only when that Operaton release is published.
