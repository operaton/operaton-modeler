/**
 * Copyright Camunda Services GmbH and/or licensed to Camunda Services GmbH
 * under one or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information regarding copyright
 * ownership.
 *
 * Camunda licenses this file to you under the MIT; you may not use this file
 * except in compliance with the MIT License.
 */

'use strict';

const validateReleaseVersion = require('./validate-release-version');

/**
 * Get the semantic version of the application.
 *
 *
 * @return {string} actual app version
 */
function getVersion() {
  const version = require('../package.json').version;
  const baseVersion = version.split('-')[0];

  const IS_CI = !!process.env.IS_CI;
  const IS_NIGHTLY = !!process.env.NIGHTLY;

  if (IS_CI) {
    return getBuildArtifactName(version);
  } else if (IS_NIGHTLY) {
    return `${baseVersion}-nightly.${today()}`;
  } else {
    return `${baseVersion}-dev`;
  }
}

function getBuildArtifactName(version) {
  const baseVersion = version.split('-')[0];
  const BUILD_REF = process.env.BUILD_REF;
  const BUILD_NUMBER = process.env.BUILD_NUMBER;
  const branchType = BUILD_REF.split('/')[0];

  // Release tags carry the complete application version, including prereleases.
  if (/^v\d+\.\d+\.\d+(?:[-+].*)?$/.test(BUILD_REF)) {
    return validateReleaseVersion(BUILD_REF, { app: version });
  }

  switch (branchType) {
  case 'main':
    return baseVersion;
  case 'develop':
    return `${baseVersion}-b${BUILD_NUMBER}`;
  case 'release':
    return `${baseVersion}-rc${BUILD_NUMBER}`;
  default:
    return `${baseVersion}-${BUILD_REF.replace(/[^0-9A-Za-z-]/g, '-')}-b${BUILD_NUMBER}`;
  }
}

function today() {
  const d = new Date();

  return [
    d.getFullYear(),
    pad(d.getMonth() + 1),
    pad(d.getDate())
  ].join('');
}

function pad(n) {
  if (n < 10) {
    return '0' + n;
  } else {
    return n;
  }
}

if (require.main === module) {
  console.log(getVersion());
}

module.exports = getVersion;
