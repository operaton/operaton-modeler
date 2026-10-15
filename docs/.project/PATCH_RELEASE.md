# Operaton Modeler Patch Release

A patch release contains compatible fixes to an existing Operaton Modeler release. The first Operaton release is planned as __1.0.0__; the first patch release after it would be __1.0.1__. Upstream Modeler patch versions do not determine the Operaton target version.

Create a release issue in the [Operaton Modeler repository](https://github.com/operaton/operaton-modeler/issues/new) and copy the [patch release template](./PATCH_RELEASE_TEMPLATE.md).

Follow the [release process](./RELEASE.md) and [versioning policy](../versioning.md), with these additional checks:

* Select the explicit Operaton patch version from the Operaton release being maintained.
* Verify that the release contains compatible fixes and document the issues they address.
* Test each affected behavior and run the relevant regression and integration checks on the packaged application.
* Keep all Operaton application version sources synchronized, and publish the artifacts in the Operaton repository after validation.
