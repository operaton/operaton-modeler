# Changelog

All notable changes to the [Operaton Modeler](https://github.com/operaton/operaton-modeler) are documented here. We use [semantic versioning](http://semver.org/) for releases.

## Unreleased

**\_Note:** Yet to be released changes appear here.\_

- Integrated Fluxnova Modeler through upstream `eb719138` (1.3.3), including React 18, Electron 44, Node.js 24 CI, and fixes for clipboard, form properties, and DMN editing.
- Preserved Operaton XML namespaces, branding, deployment endpoints, and Cockpit links.
- Fixed the Operaton engine-version override and selected the released 2.1 engine series by default.
- Fixed XML namespace normalization to preserve scripts, documentation, comments, and attribute values.
- Added Operaton CMMN namespace support, including legacy Camunda imports and save/reopen verification.
- Fixed Electron 44 opening files in an already running application.
- Updated the forum and privacy-policy links to Operaton.
- Replaced inherited application icons with the official Operaton logo for macOS, Windows and Linux, including desktop registration and window icons.
- Prepared Operaton ad-hoc subprocess properties for engine PR #3207 behind the disabled-by-default `enable-operaton-ad-hoc` flag; existing settings survive saves with the flag disabled.
- Omitted restricted-variable extensions and additional Fluxnova compatibility code.

The entries below retain the upstream release history; Fluxnova-specific engine features do not imply Operaton support.


## 1.3.2

- Fixed form properties and form components missing on form import/create (#119)
- Fixed DMN import and decision modification crashing (#120)

## 1.3.1

- Fixed deep links to use correct Fluxnova Monitoring URL path (#108)
- Hardened React 18 tab update-cycle and callback lifecycle behavior (#113)
- Fixed BPMN canvas copy/paste (#114)

## 1.3.0

- Updated react, react-dom, react-test-renderer from 16.14.0 to 18.3.1
- Updated formik from 2.0.4 to 2.4.9
- Updated electron from 37.0.0 to 42.3.3
- Updated electron-extension-installer from 1.2.0 to 2.0.0
- Migrated tests to @testing-library/react and removed enzyme dependency
- Refactored Windows code signing logic to utilize Azure trusted signing
- Fixed DMN tab state that was always marked as dirty
- Added support for 3.0.0 execution platform version
- Added support for restricted variables
- Added support for ad-hoc subprocesses

## 1.2.0

- Added retry time cycle functionality for element templates
- Enabled hybrid model for Karma to Jest to enable running of both suites in parallel
- Add support for 2.0.0 execution platform version

## 1.1.1

- Fixed issue with broken Monitoring link
- Updated puppeteer dependency from 24.0.0 to 24.28.0

## 1.1.0

- Updated the "Learn more" link in the change execution platform pop-up to point to https://docs.operaton.org/docs/documentation/
- Fixed lint errors causing `npm run lint` script to fail
- Fixed issue where running `npm run build` locally multiple times continually appends "-dev" to build artifact names
- Fixed issue where RELEASE workflow creates multiple draft releases with slightly different names
- Updated nodemailer dependency from v6 to v7

## 1.0.0

- Initial Release
