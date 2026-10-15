import { toSemverMinor } from './helpers';

export const formJSVersions = {
  'Operaton': {
    '1.0': '1.14.0',
    '1.1': '1.14.0',
    '2.0': '1.14.0',
    '2.1': '1.14.0'
  }
};

export function getFormJSVersion(schema) {
  const { executionPlatform, executionPlatformVersion } = schema;

  if (!executionPlatformVersion) return null;

  const executionPlatformVersionMinor = toSemverMinor(executionPlatformVersion);

  if (!formJSVersions[executionPlatform] || !formJSVersions[executionPlatform][executionPlatformVersionMinor]) return null;

  return formJSVersions[executionPlatform][executionPlatformVersionMinor];
}
