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

/**
 * Get the semantic version of the application.
 *
 *
 * @return {string} actual app version
 */
function getVersion() {
  const baseVersion = require('../package.json').version.split('-')[0];

  const IS_CI = !!process.env.IS_CI;
  const IS_NIGHTLY = !!process.env.NIGHTLY;

  if (IS_CI) {
    return getBuildArtifactName(baseVersion);
  } else if (IS_NIGHTLY) {
    return `${baseVersion}-nightly.${today()}`;
  } else {
    return `${baseVersion}-dev`;
  }
}

function getBuildArtifactName(baseVersion) {
  const BUILD_REF = process.env.BUILD_REF;
  const BUILD_NUMBER = process.env.BUILD_NUMBER;
  const branchType = BUILD_REF.split('/')[0];

  // Pushed tag (e.g. v1.1.0)
  if (/v(\d\.){2}\d/.test(branchType)) {
    return `v${baseVersion}`;
  }

  switch (branchType) {
  case 'main':
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
