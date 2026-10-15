/**
 * Copyright 2026 the Operaton contributors.
 *
 * Licensed under the MIT license. See the LICENSE file in the project root.
 */

import BpmnModeler from '../../../app/tabs/bpmn/modeler/BpmnModeler';
import DmnModeler from '../../../app/tabs/dmn/modeler/DmnModeler';
import { BpmnEditor } from '../../../app/tabs/bpmn/BpmnEditor';
import { DmnEditor } from '../../../app/tabs/dmn/DmnEditor';
import { FormEditor } from '../../../app/tabs/form/FormEditor';
import { createCamundaFormPlayground } from '@camunda/form-playground';

import bpmnTemplate from '../../../app/tabs/bpmn/diagram.bpmn';
import dmnTemplate from '../../../app/tabs/dmn/diagram.dmn';
import formTemplate from '../../../app/tabs/form/initial.form';
import { ENGINES, getLatestStable } from '../../Engines';

const EXPORTER = { name: 'Operaton Modeler', version: '1.0.0' };
const MODELER_NAMESPACE = 'http://operaton.org/schema/modeler/1.0';

describe('Operaton file export with real modelers', function() {

  this.timeout(10000);

  let instances;
  let container;

  beforeEach(function() {
    instances = [];
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(function() {
    instances.forEach(instance => instance.destroy());
    container.remove();
  });

  it('should save and reopen a new BPMN diagram with Operaton namespaces and script values', async function() {
    const modeler = new BpmnModeler({ container, exporter: EXPORTER });
    instances.push(modeler);
    await modeler.importXML(createContents(bpmnTemplate));

    const modeling = modeler.get('modeling');
    const task = modeling.createShape({ type: 'bpmn:ScriptTask' }, { x: 400, y: 200 },
      modeler.get('canvas').getRootElement());

    modeling.updateProperties(task, {
      name: 'Keep camunda:literal',
      scriptFormat: 'javascript',
      script: 'const value = " camunda:unchanged";',
      'camunda:asyncBefore': true
    });

    const xml = await BpmnEditor.prototype.getXML.call(editorContext({ modeler }));

    assertOperatonXml(xml, 'bpmn');
    expect(xml).to.contain('operaton:asyncBefore="true"');

    const { warnings } = await modeler.importXML(xml);
    const restored = modeler.get('elementRegistry').get(task.id).businessObject;

    expect(warnings).to.be.empty;
    expect(restored.get('camunda:asyncBefore')).to.be.true;
    expect(restored.name).to.equal('Keep camunda:literal');
    expect(restored.script).to.equal('const value = " camunda:unchanged";');
  });

  it('should save and reopen a new DMN diagram with Operaton namespaces and engine properties', async function() {
    const modeler = new DmnModeler({ container, exporter: EXPORTER });
    instances.push(modeler);
    await modeler.importXML(createContents(dmnTemplate));

    const decision = modeler.getDefinitions().drgElement[0];
    decision.set('camunda:historyTimeToLive', '30');
    decision.set('camunda:versionTag', 'release');

    const xml = await DmnEditor.prototype.getXML.call(editorContext({ modeler }));

    assertOperatonXml(xml, 'dmn');
    expect(xml).to.contain('operaton:historyTimeToLive="30"');
    expect(xml).to.contain('namespace="http://operaton.org/schema/1.0/dmn"');

    const { warnings } = await modeler.importXML(xml);
    const restored = modeler.getDefinitions().drgElement[0];

    expect(warnings).to.be.empty;
    expect(restored.get('camunda:historyTimeToLive')).to.equal('30');
    expect(restored.get('camunda:versionTag')).to.equal('release');
  });

  it('should save and reopen a new form with Operaton execution metadata', async function() {
    const schema = JSON.parse(createContents(formTemplate));
    schema.components = [ {
      id: 'Field_1', type: 'textfield', key: 'value', label: 'Keep camunda:literal'
    } ];

    const form = await createCamundaFormPlayground({
      container, schema, data: {}, exporter: EXPORTER
    });
    instances.push(form);

    const contents = FormEditor.prototype.getXML.call(editorContext({ form }));
    const exported = JSON.parse(contents);

    expect(exported.executionPlatform).to.equal(ENGINES.OPERATON);
    expect(exported.executionPlatformVersion).to.equal(getLatestStable(ENGINES.OPERATON));
    expect(exported.exporter).to.eql(EXPORTER);
    expect(contents).not.to.contain('http://camunda.org/schema/');
    expect(contents).not.to.contain('http://fluxnova.finos.org/schema/');

    await form.getEditor().importSchema(exported);
    const restored = form.saveSchema();

    expect(restored.executionPlatform).to.equal(ENGINES.OPERATON);
    expect(restored.components[0].label).to.equal('Keep camunda:literal');
  });

});

function createContents(template) {
  return template.replace(/{{ ([^}]+) }}/g, (_, key) => ({
    ID: 'new',
    'ID:decision': 'decision',
    EXPORTER_NAME: EXPORTER.name,
    EXPORTER_VERSION: EXPORTER.version,
    OPERATON_VERSION: getLatestStable(ENGINES.OPERATON)
  })[key]);
}

function editorContext(state) {
  return {
    getCached: () => state,
    isDirty: () => true,
    setCached: () => {},
    handleError: ({ error }) => { throw error; }
  };
}

function assertOperatonXml(xml, type) {
  const document = new DOMParser().parseFromString(xml, 'application/xml');
  const definitions = document.documentElement;

  expect(document.querySelector('parsererror')).not.to.exist;
  expect(definitions.getAttributeNS(MODELER_NAMESPACE, 'executionPlatform')).to.equal(ENGINES.OPERATON);
  expect(definitions.getAttributeNS(MODELER_NAMESPACE, 'executionPlatformVersion')).to.equal(getLatestStable(ENGINES.OPERATON));
  expect(definitions.getAttribute('exporter')).to.equal(EXPORTER.name);
  expect(definitions.getAttribute('exporterVersion')).to.equal(EXPORTER.version);

  const extensionNamespace = `http://operaton.org/schema/1.0/${ type }`;
  const extensionAttributes = Array.from(document.getElementsByTagName('*'))
    .flatMap(element => Array.from(element.attributes))
    .filter(attribute => attribute.namespaceURI === extensionNamespace);

  expect(extensionAttributes).not.to.be.empty;
  extensionAttributes.forEach(attribute => expect(attribute.prefix).to.equal('operaton'));
  expect(xml).not.to.contain('xmlns:camunda=');
  expect(xml).not.to.contain('xmlns:fluxnova=');
  expect(xml).not.to.contain('http://camunda.org/schema/');
  expect(xml).not.to.contain('http://fluxnova.finos.org/schema/');
}
