'use strict';

const RELEASE_TAG = /^v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;

/**
 * Validate an Operaton release tag against each application version manifest.
 *
 * @param {string} tag
 * @param {Object<string, string>} versions
 * @return {string} semantic version without the Git tag prefix
 */
function validateReleaseVersion(tag, versions) {
  const match = RELEASE_TAG.exec(tag);

  if (!match || match[4]?.split('.').some(part => /^0\d+$/.test(part))) {
    throw new Error(`Invalid Operaton release tag: ${tag}`);
  }

  const version = tag.slice(1);

  for (const [ name, manifestVersion ] of Object.entries(versions)) {
    if (manifestVersion !== version) {
      throw new Error(`Release tag ${tag} does not match ${name} version ${manifestVersion}`);
    }
  }

  return version;
}

if (require.main === module) {
  try {
    const ref = process.argv[2] || '';

    if (!ref.startsWith('refs/tags/')) {
      throw new Error('Release builds require an explicit refs/tags/v<version> ref');
    }

    const version = validateReleaseVersion(ref.slice('refs/tags/'.length), {
      app: require('../package.json').version,
      client: require('../../client/package.json').version,
      lerna: require('../../lerna.json').version,
      'package-lock app': require('../../package-lock.json').packages.app?.version,
      'package-lock client': require('../../package-lock.json').packages.client?.version
    });

    console.log(version);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = validateReleaseVersion;
