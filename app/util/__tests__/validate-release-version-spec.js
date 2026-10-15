const { expect } = require('chai');
const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const validateReleaseVersion = require('../validate-release-version');

describe('ValidateReleaseVersion', function() {

  it('should accept synchronized versions for the initial Operaton release', function() {
    expect(validateReleaseVersion('v1.0.0', {
      app: '1.0.0', client: '1.0.0', lerna: '1.0.0'
    })).to.equal('1.0.0');
  });

  it('should preserve prerelease and build metadata', function() {
    expect(validateReleaseVersion('v1.0.0-rc.1+build.2', {
      app: '1.0.0-rc.1+build.2'
    })).to.equal('1.0.0-rc.1+build.2');
  });

  [ 'app', 'client', 'lerna' ].forEach(name => {
    it(`should reject a mismatched ${name} version`, function() {
      const versions = { app: '1.0.0', client: '1.0.0', lerna: '1.0.0' };

      versions[name] = '1.3.3';

      expect(() => validateReleaseVersion('v1.0.0', versions))
        .to.throw(`does not match ${name} version 1.3.3`);
    });
  });

  [ 'main', '1.0.0', 'v01.0.0', 'v1.0', 'v1.0.0-rc.01', 'v1.0.0-rc..1' ].forEach(tag => {
    it(`should reject invalid release tag ${tag}`, function() {
      expect(() => validateReleaseVersion(tag, {})).to.throw('Invalid Operaton release tag');
    });
  });

  it('should reject branch refs when invoked by the release workflow', function() {
    const result = spawnSync(process.execPath, [
      require.resolve('../validate-release-version'), 'refs/heads/main'
    ], { encoding: 'utf8' });

    expect(result.status).to.equal(1);
    expect(result.stderr).to.contain('require an explicit refs/tags/v<version> ref');
  });

  it('should validate checked-out manifests when invoked by the release workflow', function() {
    const version = require('../../package.json').version;
    const result = spawnSync(process.execPath, [
      require.resolve('../validate-release-version'), `refs/tags/v${version}`
    ], { encoding: 'utf8' });

    expect(result.stderr).to.equal('');
    expect(result.status).to.equal(0);
    expect(result.stdout.trim()).to.equal(version);
  });

  [ 'app', 'client' ].forEach(workspace => {
    it(`should reject stale ${workspace} workspace metadata in the package lock`, function() {
      const root = fs.mkdtempSync(path.join(os.tmpdir(), 'operaton-release-version-'));

      try {
        fs.mkdirSync(path.join(root, 'app/util'), { recursive: true });
        fs.mkdirSync(path.join(root, 'client'));
        fs.copyFileSync(require.resolve('../validate-release-version'), path.join(root, 'app/util/validate-release-version.js'));

        for (const manifest of [ 'app/package.json', 'client/package.json', 'lerna.json' ]) {
          fs.writeFileSync(path.join(root, manifest), JSON.stringify({ version: '1.0.0' }));
        }

        const packages = { app: { version: '1.0.0' }, client: { version: '1.0.0' } };

        packages[workspace].version = '1.3.3';

        fs.writeFileSync(path.join(root, 'package-lock.json'), JSON.stringify({ packages }));

        const result = spawnSync(process.execPath, [
          path.join(root, 'app/util/validate-release-version.js'), 'refs/tags/v1.0.0'
        ], { encoding: 'utf8' });

        expect(result.status).to.equal(1);
        expect(result.stderr).to.contain(`does not match package-lock ${workspace} version 1.3.3`);
      } finally {
        fs.rmSync(root, { recursive: true, force: true });
      }
    });
  });
});
