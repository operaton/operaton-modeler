const getVersion = require('../get-version');

const { expect } = require('chai');
const sinon = require('sinon');
const pkg = require('../../package.json');

describe('GetVersion', function() {
  let origEnv, clock;

  const sandbox = sinon.createSandbox();

  beforeEach(function() {
    origEnv = { ...process.env };

    delete process.env.IS_CI;
    delete process.env.NIGHTLY;

    sandbox.stub(pkg, 'version').value('1.0.0');

    clock = sinon.useFakeTimers();
  });

  afterEach(function() {
    process.env = { ...origEnv };

    clock.restore();
    sandbox.restore();
  });

  it('should retrieve version for a "main" branch build', function() {
    process.env.IS_CI = true;
    process.env.BUILD_REF = 'main';
    process.env.BUILD_NUMBER = '123';

    const version = getVersion();
    expect(version).to.eql('1.0.0');
  });

  it('should retrieve version for a "develop" branch build', function() {
    process.env.IS_CI = true;
    process.env.BUILD_REF = 'develop';
    process.env.BUILD_NUMBER = '123';

    const version = getVersion();
    expect(version).to.eql('1.0.0-b123');
  });

  it('should retrieve version for a "release" branch build', function() {
    process.env.IS_CI = true;
    process.env.BUILD_REF = 'release';
    process.env.BUILD_NUMBER = '123';

    const version = getVersion();
    expect(version).to.eql('1.0.0-rc123');
  });

  it('should retrieve version for a feature branch build', function() {
    process.env.IS_CI = true;
    process.env.BUILD_REF = 'feature/my-first-feature';
    process.env.BUILD_NUMBER = '123';

    const version = getVersion();
    expect(version).to.eql('1.0.0-feature-my-first-feature-b123');
  });

  it('should retrieve default version', function() {
    const version = getVersion();
    expect(version).to.eql('1.0.0-dev');
  });

  it('should retrieve version for a nightly build', function() {
    process.env.NIGHTLY = true;

    const expectedDate = new Date('2025-12-31T12:00:00Z');

    // advance the clock to the expected date
    clock.setSystemTime(expectedDate);

    const version = getVersion();
    expect(version).to.eql('1.0.0-nightly.20251231');
  });

  it('should retrieve version for a tag build', function() {
    process.env.IS_CI = true;
    process.env.BUILD_REF = 'v1.0.0';

    const version = getVersion();
    expect(version).to.eql('1.0.0');
  });

  it('should retain the prerelease version for a tag build', function() {
    pkg.version = '1.0.0-rc.1';
    process.env.IS_CI = true;
    process.env.BUILD_REF = 'v1.0.0-rc.1';

    expect(getVersion()).to.eql('1.0.0-rc.1');
  });

  it('should reject a tag that differs from the application version', function() {
    process.env.IS_CI = true;
    process.env.BUILD_REF = 'v1.3.3';

    expect(getVersion).to.throw('does not match app version 1.0.0');
  });

  it('should reject a stable tag for a prerelease application version', function() {
    pkg.version = '1.0.0-rc.1';
    process.env.IS_CI = true;
    process.env.BUILD_REF = 'v1.0.0';

    expect(getVersion).to.throw('does not match app version 1.0.0-rc.1');
  });

  it('should treat branch names containing a version as branches', function() {
    process.env.IS_CI = true;
    process.env.BUILD_REF = 'feature/v1.0.0';
    process.env.BUILD_NUMBER = '123';

    expect(getVersion()).to.eql('1.0.0-feature-v1-0-0-b123');
  });
});
