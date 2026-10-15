const getVersion = require('../get-version');

const { expect } = require('chai');
const sinon = require('sinon');

describe('GetVersion', function() {
  let origEnv, clock;

  const Module = require('module');
  const sandbox = sinon.createSandbox();

  this.beforeAll(function() {
    sandbox.stub(Module.prototype, 'require').returns({ version:'1.0.0' });
  });

  this.afterAll(function() {
    sandbox.restore();
  });

  beforeEach(function() {
    origEnv = { ...process.env };

    clock = sinon.useFakeTimers();
  });

  afterEach(function() {
    process.env = { ...origEnv };

    clock.restore();
  });

  it('should retrieve a development version for a "main" branch build', function() {
    process.env.IS_CI = true;
    process.env.BUILD_REF = 'main';
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
    process.env.IS_CI = false;
    process.env.NIGHTLY = false;

    const version = getVersion();
    expect(version).to.eql('1.0.0-dev');
  });

  it('should retrieve version for a nightly build', function() {
    process.env.IS_CI = false;
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
    expect(version).to.eql('v1.0.0');
  });
});
