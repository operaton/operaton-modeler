'use strict';

const proxyquire = require('proxyquire');
const sinon = require('sinon');

describe('license book summary', function() {

  let exec, writeFile, createTransport, log, sendSummary;

  beforeEach(function() {
    exec = sinon.stub();
    writeFile = sinon.stub();
    createTransport = sinon.stub();
    log = sinon.stub(console, 'log');

    sendSummary = proxyquire('../../../tasks/send-license-book-summary', {
      execa: { sync: exec },
      fs: { writeFileSync: writeFile },
      nodemailer: { createTransport },
      '../app/package.json': { version: '1.0.0' },
      './license-book-handlers': {
        collectLicenses: sinon.stub().resolves([]),
        processLicenses: sinon.stub().returns({ processedLicenses: [] }),
        generateSummary: sinon.stub().returns('License summary')
      }
    });
  });

  afterEach(function() {
    log.restore();
  });

  it('should generate the first release draft without looking up inherited tags', async function() {
    await sendSummary({ print: true, output: 'changes.html' });

    expect(exec).not.to.have.been.called;
    expect(writeFile).not.to.have.been.called;
    expect(createTransport).not.to.have.been.called;
    expect(log).to.have.been.calledWith(sinon.match('Operaton Modeler v1.0.0 Third Party Summary'));
    expect(log).to.have.been.calledWith(sinon.match('License summary'));
  });

  it('should render changes against an explicitly selected Operaton release tag', async function() {
    exec.onFirstCall().returns({ stdout: 'Old license\n' });
    exec.onSecondCall().throws(Object.assign(new Error('diff found changes'), {
      code: 1,
      stdout: '--- old\n+++ THIRD_PARTY_NOTICES\n@@ -1 +1 @@\n-Old license\n+New license\n'
    }));

    await sendSummary({
      file: 'THIRD_PARTY_NOTICES',
      output: 'changes.html',
      'previous-version': 'v1.0.0'
    });

    expect(exec).to.have.been.calledWith('git', [ 'show', 'refs/tags/v1.0.0:THIRD_PARTY_NOTICES' ]);
    expect(writeFile).to.have.been.calledOnce;

    const [ filename, html ] = writeFile.firstCall.args;

    expect(filename).to.equal('changes.html');
    expect(html).to.contain('<title>Operaton Modeler v1.0.0 Third Party Notices Changes Summary</title>');
    expect(html).to.contain('<ins>New</ins> license');
    expect(createTransport).not.to.have.been.called;
  });
});
