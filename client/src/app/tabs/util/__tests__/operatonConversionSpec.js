/**
 * Copyright 2025 FINOS.
 * Copyright 2026 the Operaton contributors.
 *
 * Licensed under the MIT license. See the LICENSE file in the project root.
 */

/* global sinon */

import {
  convertBpmnToOperatonIfRequired,
  convertDmnToOperatonIfRequired, convertFormToOperatonIfRequired,
} from '../operatonConversion';
import { spy } from 'sinon';
import { ENGINES, getLatestStable } from '../../../../util/Engines';
import { getBpmnDefinitions } from '../../../../util/xmlConversion';

describe('tabs/bpmn/util - operatonConversion', function() {

  const camundaNsBpmn = `
    <?xml version="1.0" encoding="UTF-8"?>
    <bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" id="Definitions_1ug79wa" targetNamespace="http://bpmn.io/schema/bpmn" xmlns:modeler="http://camunda.org/schema/modeler/1.0" xmlns:camunda="http://camunda.org/schema/1.0/bpmn" exporter="Camunda Modeler" exporterVersion="5.33.0-dev" modeler:executionPlatform="Camunda Platform" modeler:executionPlatformVersion="1.0.0">
      <bpmn:process id="Process_10ga7ii" isExecutable="true" camunda:historyTimeToLive="30">
        <bpmn:startEvent id="StartEvent_1" />
      </bpmn:process>
      <bpmndi:BPMNDiagram id="BPMNDiagram_1">
        <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_10ga7ii">
          <bpmndi:BPMNShape id="StartEvent_1_di" bpmnElement="StartEvent_1">
            <dc:Bounds x="182" y="162" width="36" height="36" />
          </bpmndi:BPMNShape>
        </bpmndi:BPMNPlane>
      </bpmndi:BPMNDiagram>
    </bpmn:definitions>
  `;

  const camunda8Bpmn = `
    <?xml version="1.0" encoding="UTF-8"?>
    <bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" id="Definitions_1ug79wa" targetNamespace="http://bpmn.io/schema/bpmn" xmlns:modeler="http://camunda.org/schema/modeler/1.0" exporter="Camunda Modeler" exporterVersion="5.33.0-dev" modeler:executionPlatform="Camunda Cloud" modeler:executionPlatformVersion="1.0.0">
      <bpmn:process id="Process_10ga7ii" isExecutable="true" >
        <bpmn:startEvent id="StartEvent_1" />
      </bpmn:process>
      <bpmndi:BPMNDiagram id="BPMNDiagram_1">
        <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_10ga7ii">
          <bpmndi:BPMNShape id="StartEvent_1_di" bpmnElement="StartEvent_1">
            <dc:Bounds x="182" y="162" width="36" height="36" />
          </bpmndi:BPMNShape>
        </bpmndi:BPMNPlane>
      </bpmndi:BPMNDiagram>
    </bpmn:definitions>
  `;

  const operatonBpmn = `
    <?xml version="1.0" encoding="UTF-8"?>
    <bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:operaton="http://operaton.org/schema/1.0/bpmn" id="Definitions_1ug79wa" targetNamespace="http://bpmn.io/schema/bpmn" exporter="Operaton Modeler" exporterVersion="5.33.0-dev" xmlns:modeler="http://operaton.org/schema/modeler/1.0" modeler:executionPlatform="Operaton" modeler:executionPlatformVersion="1.0.0">
        <bpmn:process id="Process_10ga7ii" isExecutable="true" >
        <bpmn:startEvent id="StartEvent_1" />
        </bpmn:process>
      <bpmndi:BPMNDiagram id="BPMNDiagram_1">
        <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_10ga7ii">
          <bpmndi:BPMNShape id="StartEvent_1_di" bpmnElement="StartEvent_1">
            <dc:Bounds x="182" y="162" width="36" height="36" />
          </bpmndi:BPMNShape>
        </bpmndi:BPMNPlane>
      </bpmndi:BPMNDiagram>
    </bpmn:definitions>
  `;

  const operatonBpmnWithCamundaExtensions = `
    <?xml version="1.0" encoding="UTF-8"?>
    <bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:operaton="http://operaton.org/schema/1.0/bpmn" id="Definitions_1ug79wa" targetNamespace="http://bpmn.io/schema/bpmn" exporter="Operaton Modeler" exporterVersion="5.33.0-dev" xmlns:modeler="http://operaton.org/schema/modeler/1.0" modeler:executionPlatform="Operaton" modeler:executionPlatformVersion="1.0.0">
        <bpmn:process id="Process_10ga7ii" isExecutable="true" camunda:historyTimeToLive="30">
        <bpmn:startEvent id="StartEvent_1" />
        </bpmn:process>
      <bpmndi:BPMNDiagram id="BPMNDiagram_1">
        <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_10ga7ii">
          <bpmndi:BPMNShape id="StartEvent_1_di" bpmnElement="StartEvent_1">
            <dc:Bounds x="182" y="162" width="36" height="36" />
          </bpmndi:BPMNShape>
        </bpmndi:BPMNPlane>
      </bpmndi:BPMNDiagram>
    </bpmn:definitions>
  `;

  const camundaDmn = `
    <?xml version="1.0" encoding="UTF-8"?>
    <definitions xmlns="https://www.omg.org/spec/DMN/20191111/MODEL/" xmlns:dmndi="https://www.omg.org/spec/DMN/20191111/DMNDI/" xmlns:dc="http://www.omg.org/spec/DMN/20180521/DC/" id="Definitions_1x2v1az" name="DRD" namespace="http://camunda.org/schema/1.0/dmn" xmlns:modeler="http://camunda.org/schema/modeler/1.0" xmlns:camunda="http://camunda.org/schema/1.0/dmn" exporter="Camunda Modeler" exporterVersion="5.33.0-dev" modeler:executionPlatform="Camunda Platform" modeler:executionPlatformVersion="1.0.0">
      <decision id="Decision_0lhr2pc" name="Decision 1" camunda:historyTimeToLive="30">
        <decisionTable id="DecisionTable_0ym4gfa">
          <input id="Input_1">
            <inputExpression id="InputExpression_1" typeRef="string">
              <text></text>
            </inputExpression>
          </input>
          <output id="Output_1" typeRef="string" />
        </decisionTable>
      </decision>
      <dmndi:DMNDI>
        <dmndi:DMNDiagram>
          <dmndi:DMNShape dmnElementRef="Decision_0lhr2pc">
            <dc:Bounds height="80" width="180" x="160" y="100" />
          </dmndi:DMNShape>
        </dmndi:DMNDiagram>
      </dmndi:DMNDI>
    </definitions>
  `;

  const operatonDmnWithCamundaExtensions = `
    <?xml version="1.0" encoding="UTF-8"?>
    <definitions xmlns="https://www.omg.org/spec/DMN/20191111/MODEL/" xmlns:dmndi="https://www.omg.org/spec/DMN/20191111/DMNDI/" xmlns:dc="http://www.omg.org/spec/DMN/20180521/DC/" id="Definitions_1x2v1az" name="DRD" namespace="http://operaton.org/schema/1.0/dmn" xmlns:modeler="http://operaton.org/schema/modeler/1.0" exporter="Operaton Modeler" exporterVersion="5.33.0-dev" modeler:executionPlatform="Operaton" modeler:executionPlatformVersion="1.0.0">
      <decision id="Decision_0lhr2pc" name="Decision 1" camunda:historyTimeToLive="30">
        <decisionTable id="DecisionTable_0ym4gfa">
          <input id="Input_1">
            <inputExpression id="InputExpression_1" typeRef="string">
              <text></text>
            </inputExpression>
          </input>
          <output id="Output_1" typeRef="string" />
        </decisionTable>
      </decision>
      <dmndi:DMNDI>
        <dmndi:DMNDiagram>
          <dmndi:DMNShape dmnElementRef="Decision_0lhr2pc">
            <dc:Bounds height="80" width="180" x="160" y="100" />
          </dmndi:DMNShape>
        </dmndi:DMNDiagram>
      </dmndi:DMNDI>
    </definitions>
  `;

  const camundaForm = {
    type: 'default',
    id: 'Form_0lvnpjd',
    exporter: {
      name: 'Camunda Modeler',
      version: '5.33.0-dev'
    },
    components: [],
    executionPlatform: 'Camunda Platform',
    executionPlatformVersion: '1.0.0'
  };

  const camunda8Form = {
    type: 'default',
    id: 'Form_0lvnpjd',
    exporter: {
      name: 'Camunda Modeler',
      version: '5.33.0-dev'
    },
    components: [],
    executionPlatform: 'Camunda Cloud',
    executionPlatformVersion: '1.0.0'
  };

  const operatonForm = {
    type: 'default',
    id: 'Form_0lvnpjd',
    exporter: {
      name: 'Operaton Modeler',
      version: '5.33.0-dev'
    },
    components: [],
    executionPlatform: 'Operaton',
    executionPlatformVersion: '1.0.0'
  };

  describe('convertBpmnToOperatonIfRequired', function() {

    let onAction;
    let onContentChanged;

    beforeEach(function() {
      onContentChanged = spy();
      onAction = sinon.stub().resolves({
        button: '0'
      });
    });

    describe('should convert', function() {

      const latestStable = getLatestStable(ENGINES.OPERATON);

      it('non operaton bpmn', async function() {

        const conversion = await convertBpmnToOperatonIfRequired(camundaNsBpmn, onAction, onContentChanged);

        expect(onAction).to.have.been.calledWith('show-dialog');

        expect(conversion).to.contain('xmlns:modeler="http://operaton.org/schema/modeler/1.0"');
        expect(conversion).to.contain('xmlns:operaton="http://operaton.org/schema/1.0/bpmn"');
        expect(conversion).to.contain('modeler:executionPlatform="Operaton"');
        expect(conversion).to.contain(`modeler:executionPlatformVersion="${latestStable}"`);
        expect(conversion).to.contain('operaton:historyTimeToLive="30"');

        expect(conversion).not.to.contain('xmlns:modeler="http://camunda.org/schema/modeler/1.0"');
        expect(conversion).not.to.contain('camunda:');
        expect(conversion).not.to.contain('modeler:executionPlatform="Camunda Platform"');

        expect(onAction).not.to.have.been.calledWith('close-tab');
        expect(onContentChanged).to.have.been.called;

      });

      it('should replace metadata bound to an alternative prefix', async function() {
        const source = camundaNsBpmn
          .replace(/xmlns:modeler=/g, 'xmlns:m=')
          .replace(/modeler:executionPlatform/g, 'm:executionPlatform');

        const conversion = await convertBpmnToOperatonIfRequired(source, onAction, onContentChanged);
        const definitions = await getBpmnDefinitions(conversion, 'bpmn');

        expect(conversion).not.to.contain('http://camunda.org/schema/modeler/1.0');
        expect(conversion).not.to.contain('m:executionPlatform="Camunda Platform"');
        expect(definitions.get('modeler:executionPlatform')).to.equal(ENGINES.OPERATON);
        expect(definitions.get('modeler:executionPlatformVersion')).to.equal(latestStable);
      });

      it('should preserve scripts and property values while migrating', async function() {
        const source = camundaNsBpmn.replace('<bpmn:startEvent id="StartEvent_1" />',
          '<bpmn:startEvent id="StartEvent_1" />' +
          '<bpmn:scriptTask id="Script_1" name="Keep camunda:prefix" scriptFormat="javascript">' +
          '<bpmn:script><![CDATA[const text = " camunda:foo <camunda:inputOutput />";]]></bpmn:script>' +
          '<bpmn:extensionElements><camunda:inputOutput>' +
          '<camunda:inputParameter name="parameter">value camunda:unchanged</camunda:inputParameter>' +
          '</camunda:inputOutput></bpmn:extensionElements></bpmn:scriptTask>');

        const conversion = await convertBpmnToOperatonIfRequired(source, onAction, onContentChanged);
        const definitions = await getBpmnDefinitions(conversion, 'bpmn');
        const scriptTask = definitions.rootElements[0].flowElements.find(element => element.id === 'Script_1');

        expect(scriptTask.name).to.equal('Keep camunda:prefix');
        expect(scriptTask.script).to.equal('const text = " camunda:foo <camunda:inputOutput />";');
        expect(scriptTask.extensionElements.values[0].inputParameters[0].value).to.equal('value camunda:unchanged');
        expect(conversion).not.to.contain('http://camunda.org/schema/1.0/bpmn');
      });

      it('non operaton dmn', async function() {

        const conversion = await convertDmnToOperatonIfRequired(camundaDmn, onAction, onContentChanged);

        expect(onAction).to.have.been.calledWith('show-dialog');

        expect(conversion).to.contain('namespace="http://operaton.org/schema/1.0/dmn"');
        expect(conversion).to.contain('xmlns:operaton="http://operaton.org/schema/1.0/dmn"');
        expect(conversion).to.contain('modeler:executionPlatform="Operaton"');
        expect(conversion).to.contain(`modeler:executionPlatformVersion="${latestStable}"`);
        expect(conversion).to.contain('operaton:historyTimeToLive="30"');

        expect(conversion).not.to.contain('namespace="http://camunda.org/schema/1.0/dmn"');
        expect(conversion).not.to.contain('camunda:');
        expect(conversion).not.to.contain('modeler:executionPlatform="Camunda Platform"');

        expect(onAction).not.to.have.been.calledWith('close-tab');
        expect(onContentChanged).to.have.been.called;

      });

      it('non operaton form', async function() {

        const conversion = await convertFormToOperatonIfRequired(camundaForm, onAction);

        expect(onAction).to.have.been.calledWith('show-dialog');

        expect(conversion.executionPlatform).to.be.eql('Operaton');
        expect(conversion.executionPlatformVersion).to.be.eql(latestStable);

        expect(onAction).not.to.have.been.calledWith('close-tab');
        expect(onContentChanged).not.to.have.been.called;

      });

    });

    describe('should not convert', function() {

      it('when model not converted', async function() {

        let onContentChanged = spy();

        onAction = sinon.stub().resolves({
          button: '1'
        });

        await convertBpmnToOperatonIfRequired(camundaNsBpmn, onAction, onContentChanged);

        expect(onAction).to.have.been.calledWith('close-tab');
        expect(onContentChanged).not.to.have.been.called;

      });

      it('when c8 xml detected', async function() {

        let onContentChanged = spy();

        onAction = sinon.stub().resolves({
          button: '2'
        });

        await convertBpmnToOperatonIfRequired(camunda8Bpmn, onAction, onContentChanged);

        expect(onAction).to.have.been.calledWith('close-tab');
        expect(onContentChanged).not.to.have.been.called;

      });

      it('when c8 form detected', async function() {

        onAction = sinon.stub().resolves({
          button: '2'
        });

        await convertFormToOperatonIfRequired(camunda8Form, onAction);

        expect(onAction).to.have.been.calledWith('close-tab');
      });

      it('when xml contains both operaton ns and exe platform', async function() {

        let onContentChanged = spy();

        await convertBpmnToOperatonIfRequired(operatonBpmn, onAction, onContentChanged);

        expect(onAction).not.to.have.been.calledWith('show-dialog');
        expect(onContentChanged).not.to.have.been.called;

      });

      it('when operaton bpmn contains camunda extension prefixes', async function() {

        let onContentChanged = spy();

        const conversion = await convertBpmnToOperatonIfRequired(operatonBpmnWithCamundaExtensions, onAction, onContentChanged);

        expect(onAction).not.to.have.been.calledWith('show-dialog');
        expect(onContentChanged).to.have.been.calledOnce;
        expect(conversion).to.contain('operaton:historyTimeToLive="30"');
        expect(conversion).not.to.contain('camunda:');

      });

      it('when operaton dmn contains camunda extension prefixes', async function() {

        let onContentChanged = spy();

        const conversion = await convertDmnToOperatonIfRequired(operatonDmnWithCamundaExtensions, onAction, onContentChanged);

        expect(onAction).not.to.have.been.calledWith('show-dialog');
        expect(onContentChanged).to.have.been.calledOnce;
        expect(conversion).to.contain('xmlns:operaton="http://operaton.org/schema/1.0/dmn"');
        expect(conversion).to.contain('operaton:historyTimeToLive="30"');
        expect(conversion).not.to.contain('camunda:');

      });

      it('when xml entity invalid', async function() {

        let onContentChanged = spy();

        await convertBpmnToOperatonIfRequired('some-entity', onAction, onContentChanged);

        expect(onAction).not.to.have.been.calledWith('show-dialog');
        expect(onContentChanged).not.to.have.been.called;

      });

      it('when json contains both operaton ns and exe platform', async function() {

        await convertFormToOperatonIfRequired(operatonForm, onAction);

        expect(onAction).not.to.have.been.calledWith('show-dialog');

      });

      it('when json entity invalid', async function() {

        await convertFormToOperatonIfRequired('some-entity', onAction);

        expect(onAction).not.to.have.been.calledWith('show-dialog');
      });

    });

  });

});
