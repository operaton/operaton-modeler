/**
 * Copyright 2026 the Operaton contributors.
 *
 * Licensed under the MIT license. See the LICENSE file in the project root.
 */

import { fireEvent, waitFor } from '@testing-library/react';
import { act } from '@bpmn-io/properties-panel/preact/test-utils';

import BpmnModeler from '../../../app/tabs/bpmn/modeler/BpmnModeler';
import { BpmnEditor } from '../../../app/tabs/bpmn/BpmnEditor';
import diagramTemplate from '../../../app/tabs/bpmn/diagram.bpmn';
import Flags, { ENABLE_OPERATON_AD_HOC } from '../../Flags';
import { ENGINES, getLatestStable } from '../../Engines';

const OPERATON_NAMESPACE = 'http://operaton.org/schema/1.0/bpmn';

describe('Operaton ad-hoc subprocess with real modeler', function() {

  this.timeout(10000);

  let instances;
  let container;

  beforeEach(function() {
    Flags.reset();
    instances = [];
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(function() {
    instances.forEach(modeler => modeler.destroy());
    container.remove();
    Flags.reset();
  });

  it('should hide the Operaton ad-hoc properties by default', async function() {
    const { modeler, panel } = await createModeler();

    expect(modeler.get('operatonAdHocProvider', false)).not.to.exist;
    expect(getEntry(panel, 'activeTasksCollection')).not.to.exist;
    expect(getEntry(panel, 'autoComplete')).not.to.exist;
  });

  it('should leave the feature disabled for the CLI string false', async function() {
    Flags.init({ [ ENABLE_OPERATON_AD_HOC ]: 'false' });
    const { modeler, panel } = await createModeler();

    expect(modeler.get('operatonAdHocProvider', false)).not.to.exist;
    expect(getEntry(panel, 'activeTasksCollection')).not.to.exist;
    expect(getEntry(panel, 'autoComplete')).not.to.exist;
  });

  [ true, 'true' ].forEach(enabled => {
    it(`should enable the properties for ${typeof enabled} true and preserve the implicit autoComplete default`, async function() {
      Flags.init({ [ ENABLE_OPERATON_AD_HOC ]: enabled });
      const { modeler, shape, panel } = await createModeler();

      const autoComplete = getInput(panel, 'autoComplete');
      expect(modeler.get('operatonAdHocProvider', false)).to.exist;
      expect(getInput(panel, 'activeTasksCollection')).to.exist;
      expect(autoComplete.checked).to.be.true;
      expect(shape.businessObject.get('camunda:autoComplete')).to.be.true;

      const xml = await saveXML(modeler);
      expect(xml).not.to.contain('operaton:autoComplete=');

      const { warnings } = await modeler.importXML(xml);
      const restored = modeler.get('elementRegistry').get(shape.id).businessObject;

      expect(warnings).to.be.empty;
      expect(restored.get('camunda:autoComplete')).to.be.true;
    });
  });

  [ 'Task_A,Task_B', '${selectedTasks}' ].forEach(collection => {
    it(`should preserve ${collection} and completion settings when saved and reopened with the feature disabled`, async function() {
      Flags.init({ [ ENABLE_OPERATON_AD_HOC ]: true });
      const { modeler, shape, panel } = await createModeler();

      await act(() => fireEvent.input(getInput(panel, 'activeTasksCollection'), { target: { value: collection } }));
      await waitFor(() => expect(getActiveTasksCollection(shape.businessObject)).to.equal(collection));

      await act(() => fireEvent.click(getInput(panel, 'autoComplete')));
      await waitFor(() => expect(shape.businessObject.get('camunda:autoComplete')).to.be.false);

      await act(() => fireEvent.input(getInput(panel, 'completionCondition'), { target: { value: '${completed == true}' } }));
      await waitFor(() => expect(shape.businessObject.completionCondition?.body).to.equal('${completed == true}'));

      await act(() => fireEvent.click(getInput(panel, 'cancelRemainingInstances')));
      await waitFor(() => expect(shape.businessObject.cancelRemainingInstances).to.be.false);

      await act(() => fireEvent.input(getInput(panel, 'operatonAdHocOrdering'), { target: { value: 'Sequential' } }));
      await waitFor(() => expect(shape.businessObject.ordering).to.equal('Sequential'));

      const xml = await saveXML(modeler);
      assertOperatonProperties(xml, collection);

      Flags.reset();
      const reopened = await createModeler(xml, shape.id);
      const restored = reopened.shape.businessObject;

      expect(getEntry(reopened.panel, 'activeTasksCollection')).not.to.exist;
      expect(getEntry(reopened.panel, 'autoComplete')).not.to.exist;
      expect(getActiveTasksCollection(restored)).to.equal(collection);
      expect(restored.get('camunda:autoComplete')).to.be.false;
      expect(restored.completionCondition.body).to.equal('${completed == true}');
      expect(restored.cancelRemainingInstances).to.be.false;
      expect(restored.ordering).to.equal('Sequential');

      // Saving while disabled must retain settings created with the feature enabled.
      const savedWhileDisabled = await saveXML(reopened.modeler);
      assertOperatonProperties(savedWhileDisabled, collection);
      const { warnings } = await reopened.modeler.importXML(savedWhileDisabled);
      expect(warnings).to.be.empty;
      expect(getActiveTasksCollection(reopened.modeler.get('elementRegistry').get(shape.id).businessObject)).to.equal(collection);
    });
  });

  it('should omit autoComplete again after restoring the default in the properties panel', async function() {
    Flags.init({ [ ENABLE_OPERATON_AD_HOC ]: true });
    const { modeler, shape, panel } = await createModeler();

    await act(() => fireEvent.click(getInput(panel, 'autoComplete')));
    await waitFor(() => expect(shape.businessObject.get('camunda:autoComplete')).to.be.false);

    await act(() => fireEvent.click(getInput(panel, 'autoComplete')));
    await waitFor(() => expect(shape.businessObject.get('camunda:autoComplete')).to.be.true);

    const xml = await saveXML(modeler);
    expect(xml).not.to.contain('operaton:autoComplete=');
  });

  it('should undo and redo collection creation, edits and removal as individual commands', async function() {
    Flags.init({ [ ENABLE_OPERATON_AD_HOC ]: true });
    const { modeler, shape, panel } = await createModeler();
    const businessObject = shape.businessObject;
    const commandStack = modeler.get('commandStack');

    await setCollection(panel, businessObject, 'Task_A');
    await act(() => commandStack.undo());
    expect(businessObject.extensionElements).not.to.exist;

    await act(() => commandStack.redo());
    await waitFor(() => expect(getInput(panel, 'activeTasksCollection').value).to.equal('Task_A'));

    await setCollection(panel, businessObject, '${selectedTasks}');
    await act(() => commandStack.undo());
    expect(getActiveTasksCollection(businessObject)).to.equal('Task_A');

    await act(() => commandStack.redo());
    await waitFor(() => expect(getInput(panel, 'activeTasksCollection').value).to.equal('${selectedTasks}'));

    await setCollection(panel, businessObject, '');
    expect(businessObject.extensionElements).not.to.exist;

    await act(() => commandStack.undo());
    expect(getActiveTasksCollection(businessObject)).to.equal('${selectedTasks}');
    await act(() => commandStack.redo());
    expect(businessObject.extensionElements).not.to.exist;
    expect(await saveXML(modeler)).not.to.contain('activeTasksCollection');
  });

  [ false, true ].forEach(withOtherProperty => {
    it(`should preserve unrelated extensions${withOtherProperty ? ' and properties' : ''} when clearing the collection`, async function() {
      Flags.init({ [ ENABLE_OPERATON_AD_HOC ]: true });
      const { modeler, shape, panel } = await createModeler();
      const businessObject = shape.businessObject;
      const moddle = modeler.get('moddle');
      const extensions = moddle.create('bpmn:ExtensionElements');
      const listener = moddle.create('camunda:ExecutionListener', { event: 'start', class: 'org.example.Listener' });
      const values = [ listener ];

      if (withOtherProperty) {
        const properties = moddle.create('camunda:Properties');
        const property = moddle.create('camunda:Property', { name: 'unrelated', value: 'keep me' });
        property.$parent = properties;
        properties.values = [ property ];
        values.push(properties);
      }

      values.forEach(value => { value.$parent = extensions; });
      extensions.values = values;
      extensions.$parent = businessObject;
      await act(() => modeler.get('modeling').updateProperties(shape, { extensionElements: extensions }));

      await setCollection(panel, businessObject, 'Task_A');
      await setCollection(panel, businessObject, 'Task_B');
      expect(businessObject.extensionElements.values.filter(value => value.$type === 'camunda:Properties')).to.have.length(1);
      await setCollection(panel, businessObject, '');

      expect(businessObject.extensionElements.values).to.deep.equal(values);
      const xml = await saveXML(modeler);
      expect(xml).not.to.contain('activeTasksCollection');
      expect(xml).to.contain('class="org.example.Listener"');
      if (withOtherProperty) {
        expect(xml).to.contain('name="unrelated" value="keep me"');
      }

      const { warnings } = await modeler.importXML(xml);
      expect(warnings).to.be.empty;
    });
  });

  async function createModeler(xml = createDiagram(), shapeId) {
    const canvas = document.createElement('div');
    const panel = document.createElement('div');
    container.append(canvas, panel);

    const modeler = new BpmnModeler({
      container: canvas,
      debounceInput: false,
      exporter: { name: 'Operaton Modeler', version: 'test' },
      propertiesPanel: {
        layout: {
          groups: {
            operatonAdHoc: { open: true },
            adHocCompletion: { open: true }
          }
        }
      }
    });
    instances.push(modeler);
    const { warnings } = await modeler.importXML(xml);
    expect(warnings).to.be.empty;

    const shape = shapeId
      ? modeler.get('elementRegistry').get(shapeId)
      : modeler.get('modeling').createShape({ type: 'bpmn:AdHocSubProcess' }, { x: 450, y: 250 },
        modeler.get('canvas').getRootElement());

    await act(() => {
      modeler.get('directEditing').complete();
      modeler.get('propertiesPanel').attachTo(panel);
      modeler.get('selection').select(shape);
    });

    await waitFor(() => expect(getInput(panel, 'id').value).to.equal(shape.id));

    return { modeler, shape, panel };
  }
});

function createDiagram() {
  const values = {
    ID: 'adhoc',
    'ID:process': 'process',
    EXPORTER_NAME: 'Operaton Modeler',
    EXPORTER_VERSION: 'test',
    OPERATON_VERSION: getLatestStable(ENGINES.OPERATON),
    DEFAULT_HTTL: '30'
  };

  return diagramTemplate.replace(/{{ ([^}]+) }}/g, (_, key) => values[key]);
}

function getEntry(panel, id) {
  return panel.querySelector(`[data-entry-id="${id}"]`);
}

function getInput(panel, id) {
  const entry = getEntry(panel, id);
  expect(entry, `${id} entry`).to.exist;
  const input = entry.querySelector('input, textarea, select');
  expect(input, `${id} input`).to.exist;
  return input;
}

function getActiveTasksCollection(businessObject) {
  const properties = businessObject.extensionElements?.values.find(value => value.$type === 'camunda:Properties');
  return properties?.values.find(value => value.name === 'activeTasksCollection')?.value;
}

async function setCollection(panel, businessObject, value) {
  await act(() => fireEvent.input(getInput(panel, 'activeTasksCollection'), { target: { value } }));
  await waitFor(() => expect(getActiveTasksCollection(businessObject)).to.equal(value || undefined));
}

async function saveXML(modeler) {
  return BpmnEditor.prototype.getXML.call({
    getCached: () => ({ modeler }),
    isDirty: () => true,
    setCached: () => {},
    handleError: ({ error }) => { throw error; }
  });
}

function assertOperatonProperties(xml, collection) {
  const document = new DOMParser().parseFromString(xml, 'application/xml');
  expect(document.querySelector('parsererror')).not.to.exist;

  const property = Array.from(document.getElementsByTagNameNS(OPERATON_NAMESPACE, 'property'))
    .find(element => element.getAttribute('name') === 'activeTasksCollection');
  const adHoc = document.getElementsByTagNameNS('http://www.omg.org/spec/BPMN/20100524/MODEL', 'adHocSubProcess')[0];

  expect(property).to.exist;
  expect(property.prefix).to.equal('operaton');
  expect(property.parentElement.localName).to.equal('properties');
  expect(property.parentElement.namespaceURI).to.equal(OPERATON_NAMESPACE);
  expect(property.getAttribute('value')).to.equal(collection);
  expect(adHoc.getAttributeNS(OPERATON_NAMESPACE, 'autoComplete')).to.equal('false');
  expect(adHoc.getAttribute('cancelRemainingInstances')).to.equal('false');
  expect(adHoc.getAttribute('ordering')).to.equal('Sequential');
  expect(xml).to.contain('<bpmn:completionCondition');
  expect(xml).not.to.contain('http://camunda.org/schema/');
  expect(xml).not.to.contain('fluxnova');
}
