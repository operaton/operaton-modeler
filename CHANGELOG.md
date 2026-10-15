# Changelog

All notable changes to the [Operaton Modeler](https://github.com/operaton/operaton-modeler) are documented here. Operaton Modeler follows its own [semantic versioning policy](docs/versioning.md), independently of upstream releases and Operaton engine versions.

## Operaton 1.0.0 (Unreleased)

The first Operaton Modeler release is being prepared. It has not been published.

* Established Operaton Modeler's independent release lifecycle, starting at 1.0.0.
* Integrated Fluxnova Modeler through upstream `eb719138` (1.3.3), including React 18, Electron 44, Node.js 24 CI, and fixes for clipboard, form properties, and DMN editing.
* Preserved Operaton XML namespaces, branding, deployment endpoints, and Cockpit links.
* Fixed the Operaton engine-version override and selected the released 2.1 engine series by default.
* Fixed XML namespace normalization to preserve scripts, documentation, comments, and attribute values.
* Added Operaton CMMN namespace support, including legacy Camunda imports and save/reopen verification.
* Fixed Electron 44 opening files in an already running application.
* Updated the forum and privacy-policy links to Operaton.
* Replaced inherited application icons with the official Operaton logo for macOS, Windows and Linux, including desktop registration and window icons.
* Prepared Operaton ad-hoc subprocess properties for engine PR [#3207](https://github.com/operaton/operaton/pull/3207) behind the disabled-by-default `enable-ad-hoc` flag; existing settings survive saves with the flag disabled.
* Omitted restricted-variable extensions and additional Fluxnova compatibility code.
* Updated vulnerable dependencies, migrated SVG loading and file discovery, preserved crash-report privacy settings, and removed the CI TLS-validation bypass. Production and plugin audits are clean; the remaining development-only `braces` advisory is documented in the [dependency audit](docs/dependency-audit-2026-10-15.md).

## Upstream release history

The entries below retain the inherited Fluxnova Modeler release history. These are not Operaton Modeler releases. Fluxnova-specific engine features do not imply Operaton support.

### Fluxnova 1.3.2

* Fixed form properties and form components missing on form import/create (upstream `#119`)
* Fixed DMN import and decision modification crashing (upstream `#120`)

### Fluxnova 1.3.1

* Fixed deep links to use correct Fluxnova Monitoring URL path (upstream `#108`)
* Hardened React 18 tab update-cycle and callback lifecycle behavior (upstream `#113`)
* Fixed BPMN canvas copy/paste (upstream `#114`)

### Fluxnova 1.3.0

* Updated react, react-dom, react-test-renderer from 16.14.0 to 18.3.1
* Updated formik from 2.0.4 to 2.4.9
* Updated electron from 37.0.0 to 42.3.3
* Updated electron-extension-installer from 1.2.0 to 2.0.0
* Migrated tests to `@testing-library/react` and removed enzyme dependency
* Refactored Windows code signing logic to utilize Azure trusted signing
* Fixed DMN tab state that was always marked as dirty
* Added support for 3.0.0 execution platform version
* Added support for restricted variables
* Added support for ad-hoc subprocesses

### Fluxnova 1.2.0

* Added retry time cycle functionality for element templates
* Enabled hybrid model for Karma to Jest to enable running of both suites in parallel
* Add support for 2.0.0 execution platform version

### Fluxnova 1.1.1

* Fixed issue with broken Monitoring link
* Updated puppeteer dependency from 24.0.0 to 24.28.0

### Fluxnova 1.1.0

* Updated the "Learn more" link in the change execution platform pop-up to point to <https://docs.operaton.org/docs/documentation/>
* Fixed lint errors causing `npm run lint` script to fail
* Fixed issue where running `npm run build` locally multiple times continually appends "-dev" to build artifact names
* Fixed issue where RELEASE workflow creates multiple draft releases with slightly different names
* Updated nodemailer dependency from v6 to v7

### Fluxnova 1.0.0

* Initial Fluxnova Modeler release
