# Operaton Modeler

An integrated modeling solution for BPMN, DMN, and Forms based on [bpmn.io](http://bpmn.io).

Operaton Modeler is ported from [Fluxnova Modeler](https://github.com/finos/fluxnova-modeler) and adapted for the Operaton platform.

![Operaton Modeler](resources/screenshot.png)

## Resources

* [Changelog](./CHANGELOG.md)
* [Report a Bug](https://github.com/operaton/operaton-modeler/issues)

Experimental Operaton ad-hoc subprocess editing is disabled by default. See the [activation instructions and engine compatibility notes](./docs/operaton-ad-hoc-comparison.md) before enabling it.

## Building the Application

Use Node.js 24.15 or newer within the 24.x release line, matching the CI workflows. Build the app in a Posix environment. On Windows that is Git Bash or WSL. Make sure you have installed all the [necessary tools](https://github.com/nodejs/node-gyp#installation) to install and compile Node.js C++ addons.

```sh
# checkout the main development branch
git checkout main

# install dependencies
npm ci

# build the application to ./dist
npm run build
```

### Development Setup


Spin up the application for development, all strings attached:

```sh
npm run dev
```

Please checkout our [troubleshooting guide](./TROUBLESHOOTING.md) if you are experiencing issues when building from source.



## Contributing

Please checkout our [contributing guidelines](./CONTRIBUTING.md) if you plan to file an issue or pull request.

## License

Copyright 2025 FINOS
Copyright 2026 the Operaton contributors.

MIT

Uses [bpmn-js](https://github.com/bpmn-io/bpmn-js), [dmn-js](https://github.com/bpmn-io/dmn-js), [cmmn-js](https://github.com/bpmn-io/cmmn-js), and [form-js](https://github.com/bpmn-io/form-js) licensed under the [bpmn.io license](http://bpmn.io/license).
