/**
 * Copyright 2026 the Operaton contributors.
 *
 * Licensed under the MIT license. See the LICENSE file in the project root.
 */

import {
  normalizeOperatonXml,
  usesOperatonExtensionNamespace
} from '../operatonXml';

describe('util - operatonXml', function() {

  const camunda = 'http://camunda.org/schema/1.0/bpmn';
  const operaton = 'http://operaton.org/schema/1.0/bpmn';

  it('should preserve script, documentation and attribute values', function() {
    const content = '<script>const key = " camunda:foo";</script>' +
      '<documentation>Use camunda:bar here.</documentation>' +
      '<task name="Call camunda:baz" expression="x &gt; camunda:value" camunda:asyncBefore="true" />';
    const xml = `<definitions xmlns:camunda="${ camunda }">${ content }</definitions>`;

    const normalized = normalizeOperatonXml(xml, 'bpmn');

    expect(normalized).to.equal(`<definitions xmlns:operaton="${ operaton }">` +
      content.replace('camunda:asyncBefore=', 'operaton:asyncBefore=') + '</definitions>');
  });

  it('should preserve CDATA, comments and processing instructions', function() {
    const content = '<?example camunda:foo="value"?>' +
      '<!-- <camunda:inputOutput /> camunda:foo -->' +
      '<script><![CDATA[<camunda:inputOutput /> camunda:foo]]></script>';
    const xml = `<definitions xmlns:camunda="${ camunda }">${ content }<camunda:inputOutput /></definitions>`;

    expect(normalizeOperatonXml(xml, 'bpmn')).to.equal(
      `<definitions xmlns:operaton="${ operaton }">${ content }<operaton:inputOutput /></definitions>`);
  });

  it('should normalize single quotes, self-closing tags and closing tags', function() {
    const xml = `<definitions xmlns:camunda='${ camunda }'><camunda:inputOutput><camunda:inputParameter name='key'/></camunda:inputOutput></definitions>`;

    expect(normalizeOperatonXml(xml, 'bpmn')).to.equal(
      `<definitions xmlns:operaton='${ operaton }'><operaton:inputOutput><operaton:inputParameter name='key'/></operaton:inputOutput></definitions>`);
  });

  it('should preserve namespace bindings referenced by QName attribute values', function() {
    const xml = `<definitions xmlns:camunda="${ camunda }" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">` +
      '<camunda:inputOutput xsi:type="camunda:InputOutput" /></definitions>';

    expect(normalizeOperatonXml(xml, 'bpmn')).to.equal(
      `<definitions xmlns:operaton="${ operaton }" xmlns:camunda="${ operaton }" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">` +
      '<operaton:inputOutput xsi:type="camunda:InputOutput" /></definitions>');
  });

  it('should migrate alternative namespace prefixes', function() {
    const xml = `<definitions xmlns:c7="${ camunda }"><task c7:asyncBefore="true" /></definitions>`;

    expect(normalizeOperatonXml(xml, 'bpmn')).to.equal(
      `<definitions xmlns:c7="${ operaton }"><task c7:asyncBefore="true" /></definitions>`);
  });

  it('should repair legacy unbound Camunda prefixes', function() {
    const xml = `<definitions xmlns:operaton="${ operaton }"><task camunda:asyncBefore="true" /></definitions>`;

    expect(normalizeOperatonXml(xml, 'bpmn')).to.equal(xml.replace('camunda:asyncBefore', 'operaton:asyncBefore'));
  });

  it('should keep unrelated namespaces and scoped prefix bindings', function() {
    const content = '<custom xmlns:camunda="urn:custom"><camunda:entry camunda:value="1" /></custom>';
    const xml = `<definitions xmlns:camunda="${ camunda }">${ content }<camunda:inputOutput /></definitions>`;

    expect(normalizeOperatonXml(xml, 'bpmn')).to.equal(
      `<definitions xmlns:operaton="${ operaton }">${ content }<operaton:inputOutput /></definitions>`);
  });

  it('should preserve an existing unrelated operaton prefix', function() {
    const xml = `<definitions xmlns:operaton="urn:custom" xmlns:camunda="${ camunda }"><operaton:entry /><camunda:inputOutput /></definitions>`;

    expect(normalizeOperatonXml(xml, 'bpmn')).to.equal(xml.replace(camunda, operaton));
  });

  it('should not duplicate an existing Operaton declaration', function() {
    const xml = `<definitions xmlns:operaton='${ operaton }' xmlns:camunda='${ camunda }'><camunda:inputOutput /></definitions>`;

    expect(normalizeOperatonXml(xml, 'bpmn')).to.equal(
      `<definitions xmlns:operaton='${ operaton }'><operaton:inputOutput /></definitions>`);
  });

  it('should add the DMN namespace when required', function() {
    const xml = '<definitions><decision camunda:historyTimeToLive="30" /></definitions>';

    expect(normalizeOperatonXml(xml, 'dmn')).to.equal(
      '<definitions xmlns:operaton="http://operaton.org/schema/1.0/dmn"><decision operaton:historyTimeToLive="30" /></definitions>');
  });

  it('should leave existing Operaton XML unchanged', function() {
    const xml = `<definitions xmlns:operaton='${ operaton }'><task operaton:asyncBefore='true' /></definitions>`;

    expect(normalizeOperatonXml(xml, 'bpmn')).to.equal(xml);
  });

  it('should leave malformed XML to the import error handler', function() {
    const xml = '<definitions><task camunda:asyncBefore="true"></definitions>';

    expect(normalizeOperatonXml(xml, 'bpmn')).to.equal(xml);
  });

  it('should detect namespace declarations rather than text content', function() {
    const xml = `<definitions><documentation>${ operaton }</documentation></definitions>`;

    expect(usesOperatonExtensionNamespace(xml, 'bpmn')).to.be.false;
    expect(usesOperatonExtensionNamespace(`<definitions xmlns:op='${ operaton }' />`, 'bpmn')).to.be.true;
    expect(usesOperatonExtensionNamespace(xml, 'unknown')).to.be.false;
  });

  describe('save metadata', function() {

    const options = {
      ensureNamespace: true,
      metadata: {
        executionPlatformVersion: '2.1.0',
        exporter: 'Operaton Modeler',
        exporterVersion: '1.0.0'
      }
    };

    it('should normalize root metadata without changing OMG namespaces or text', function() {
      const content = '<documentation>m:executionPlatform="Camunda Platform"</documentation>' +
        '<!-- xmlns:m="http://camunda.org/schema/modeler/1.0" -->' +
        '<script><![CDATA[<m:executionPlatform>Camunda Platform</m:executionPlatform>]]></script>';
      const xml = '<definitions xmlns="http://www.omg.org/spec/DMN/20191111/MODEL/" ' +
        'xmlns:m="http://camunda.org/schema/modeler/1.0" m:executionPlatform="Camunda Platform" ' +
        'm:executionPlatformVersion="7.23.0" exporter="Camunda Modeler">' + content + '</definitions>';

      const normalized = normalizeOperatonXml(xml, 'dmn', options);

      expect(normalized).to.contain('xmlns="http://www.omg.org/spec/DMN/20191111/MODEL/"');
      expect(normalized).to.contain('xmlns:m="http://operaton.org/schema/modeler/1.0"');
      expect(normalized).to.contain('m:executionPlatform="Operaton"');
      expect(normalized).to.contain('m:executionPlatformVersion="2.1.0"');
      expect(normalized).to.contain('exporter="Operaton Modeler"');
      expect(normalized).to.contain(content);
    });

    it('should retain the selected Operaton engine version', function() {
      const xml = '<definitions xmlns:m="http://operaton.org/schema/modeler/1.0" ' +
        'm:executionPlatform="Operaton" m:executionPlatformVersion="2.0.0" />';

      expect(normalizeOperatonXml(xml, 'bpmn', options)).to.contain('m:executionPlatformVersion="2.0.0"');
    });

    it('should preserve unrelated metadata prefix bindings', function() {
      const xml = '<definitions xmlns:modeler="urn:custom" modeler:executionPlatform="Custom" />';

      const normalized = normalizeOperatonXml(xml, 'bpmn', options);

      expect(normalized).to.contain('xmlns:modeler="urn:custom" modeler:executionPlatform="Custom"');
      expect(normalized).to.contain('xmlns:_modeler="http://operaton.org/schema/modeler/1.0"');
      expect(normalized).to.contain('_modeler:executionPlatform="Operaton"');
    });

    it('should leave Zeebe contents unchanged', function() {
      const xml = `<definitions xmlns:camunda="${ camunda }" xmlns:z="http://camunda.org/schema/zeebe/1.0"><z:taskDefinition /></definitions>`;

      expect(normalizeOperatonXml(xml, 'bpmn', options)).to.equal(xml);
    });

    it('should leave Cloud metadata unchanged', function() {
      const xml = '<definitions xmlns:m="http://camunda.org/schema/modeler/1.0" m:executionPlatform="Camunda Cloud" />';

      expect(normalizeOperatonXml(xml, 'dmn', options)).to.equal(xml);
    });

    it('should preserve malformed source for repair', function() {
      const xml = '<definitions><task></definitions>';

      expect(normalizeOperatonXml(xml, 'bpmn', options)).to.equal(xml);
    });

  });

});
