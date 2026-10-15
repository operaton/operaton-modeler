/**
 * Copyright 2026 the Operaton contributors.
 *
 * Licensed under the MIT license. See the LICENSE file in the project root.
 */

import CmmnModeler from '../../../src/app/tabs/cmmn/modeler/CmmnModeler';

import { normalizeOperatonXml } from '../../../src/util/operatonXml';

import diagramXML from '../../../src/app/tabs/cmmn/__tests__/diagram.cmmn';

describe('Operaton CmmnModeler', function() {

  let modeler;

  beforeEach(function() {
    modeler = new CmmnModeler({

      // Legacy canvas timers are not canceled by destroy; finish updates in-test.
      canvas: { deferUpdate: false },
      exporter: { name: 'Operaton Modeler', version: 'test' }
    });
  });

  afterEach(function() {
    modeler.destroy();
  });


  it('should retain Operaton properties through import, edit, save and reopen', async function() {
    const xml = diagramXML
      .replace(/{{ ID }}/g, '1')
      .replace('<cmmn:case id=', '<cmmn:case operaton:historyTimeToLive="30" id=')
      .replace('<cmmn:task id="Task_1" />', '<cmmn:humanTask id="Task_1" operaton:assignee="demo" />');

    const warnings = await importXML(modeler, xml);

    expect(warnings).to.be.empty;

    const task = modeler.get('elementRegistry').get('PlanItem_1');
    const definition = task.businessObject.definitionRef;

    expect(definition.get('camunda:assignee')).to.equal('demo');

    modeler.get('modeling').updateProperties(definition, {
      'camunda:assignee': 'reviewer'
    }, task);

    const savedXML = normalizeOperatonXml(await saveXML(modeler), 'cmmn', { ensureNamespace: true });

    expect(savedXML).to.contain('xmlns:operaton="http://operaton.org/schema/1.0/cmmn"');
    expect(savedXML).to.contain('operaton:historyTimeToLive="30"');
    expect(savedXML).to.contain('operaton:assignee="reviewer"');
    expect(savedXML).not.to.contain('camunda:');
    expect(savedXML).not.to.contain('http://camunda.org/schema/1.0/cmmn');

    expect(await importXML(modeler, savedXML)).to.be.empty;
    expect(modeler.get('elementRegistry').get('PlanItem_1').businessObject.definitionRef.get('camunda:assignee')).to.equal('reviewer');
  });


  it('should preserve legacy Camunda extensions when converting to Operaton', async function() {
    const legacyXML = diagramXML
      .replace(/{{ ID }}/g, '1')
      .replace('xmlns:operaton=', 'xmlns:camunda=')
      .replace('http://operaton.org/schema/1.0/cmmn', 'http://camunda.org/schema/1.0/cmmn')
      .replace('<cmmn:case id=', '<cmmn:case camunda:historyTimeToLive="60" id=')
      .replace('<cmmn:task id="Task_1" />', '<cmmn:humanTask id="Task_1" camunda:assignee="legacy-user" />');

    const warnings = await importXML(modeler, normalizeOperatonXml(legacyXML, 'cmmn'));
    const savedXML = normalizeOperatonXml(await saveXML(modeler), 'cmmn');

    expect(warnings).to.be.empty;
    expect(savedXML).to.contain('operaton:historyTimeToLive="60"');
    expect(savedXML).to.contain('operaton:assignee="legacy-user"');
    expect(savedXML).not.to.contain('http://camunda.org/schema/1.0/cmmn');
  });

});

function importXML(modeler, xml) {
  return new Promise((resolve, reject) => {
    modeler.importXML(xml, (error, warnings) => error ? reject(error) : resolve(warnings));
  });
}

function saveXML(modeler) {
  return new Promise((resolve, reject) => {
    modeler.saveXML({ format: true }, (error, xml) => error ? reject(error) : resolve(xml));
  });
}
