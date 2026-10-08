# Operaton Modeler

An integrated modeling solution for BPMN, DMN, and Forms based on [bpmn.io](http://bpmn.io).

Operaton Modeler is ported from [Fluxnova Modeler](https://github.com/finos/fluxnova-modeler) and adapted for the Operaton platform.

![Operaton Modeler](resources/screenshot.png)

## Resources

* [Changelog](./CHANGELOG.md)
* [Report a Bug](https://github.com/operaton/operaton-modeler/issues)

## Installation

Download the artifact for your platform from the [latest release](https://github.com/operaton/operaton-modeler/releases/latest). None of the options below require administrator privileges.

### Windows

Extract `operaton-modeler-<version>-win-x64.zip` into a folder of your choice (e.g. `%LOCALAPPDATA%\Programs\Operaton Modeler`) and run `Operaton Modeler.exe`. To open `.bpmn`, `.dmn` and `.form` files with the modeler, run `support\register_fileassoc.bat` once; it registers the file associations for the current user only.

If the build is not code signed, Microsoft Defender SmartScreen may show a warning. Click _More info > Run anyway_ to continue.

### macOS

Open `operaton-modeler-<version>-mac-<arch>.dmg` (`arm64` for Apple Silicon, `x64` for Intel) and drag __Operaton Modeler__ into the `Applications` folder. Without administrator rights, drag it into `~/Applications` (the `Applications` folder in your home directory) instead.

If the build is not signed and notarized, macOS Gatekeeper blocks the first start. Right-click the application and choose _Open_, or remove the quarantine flag:

```sh
xattr -dr com.apple.quarantine ~/Applications/Operaton\ Modeler.app
```

### Linux

Extract `operaton-modeler-<version>-linux-x64.tar.gz` and run the `operaton-modeler` executable.

## Building the Application

Build the app in a Posix environment. On Windows that is Git Bash or WSL. Make sure you have installed all the [necessary tools](https://github.com/nodejs/node-gyp#installation) to install and compile Node.js C++ addons.

```sh
# checkout a tag
git checkout main

# install dependencies
npm install

# build the application to ./dist
npm run build
```

### Development Setup


Spin up the application for development, all strings attached:

```sh
npm run dev
```

### Development Setup
Please checkout our [troubleshooting guide](./TROUBLESHOOTING.md) if you are experiencing issues when building from source.

## Releasing

Releases are built and published automatically by the [`RELEASE`](./.github/workflows/RELEASE.yml) workflow:

1. Set the version in `app/package.json` (e.g. `1.2.0`) and push a matching tag:

   ```sh
   git tag v1.2.0
   git push origin v1.2.0
   ```

2. The workflow creates a draft GitHub release, builds the Windows, macOS and Linux distributions and uploads them to the release.

3. Once all builds succeed, the release is published and the artifacts are available for [download](https://github.com/operaton/operaton-modeler/releases/latest).

Code signing and macOS notarization are applied when the corresponding secrets are configured and skipped otherwise.



## Contributing

Please checkout our [contributing guidelines](./CONTRIBUTING.md) if you plan to file an issue or pull request.

## License

Copyright 2025 FINOS
Copyright 2026 the Operaton contributors.

MIT

Uses [bpmn-js](https://github.com/bpmn-io/bpmn-js), [dmn-js](https://github.com/bpmn-io/dmn-js), [cmmn-js](https://github.com/bpmn-io/cmmn-js), and [form-js](https://github.com/bpmn-io/form-js) licensed under the [bpmn.io license](http://bpmn.io/license).
