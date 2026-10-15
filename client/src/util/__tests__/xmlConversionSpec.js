import {
  toBpmnXml,
  toDmnXml,
  getBpmnDefinitions,
  getBpmnDefinitionsForConversion,
  getDmnDefinitionsForConversion
} from '../xmlConversion';
import BpmnModdle from 'bpmn-moddle';
import DmnModdle from 'dmn-moddle';

describe('util - xmlConversionSpec', function() {

  describe('toBpmnXml', function() {

    const moddle = new BpmnModdle();

    it('should convert from definitions to xml', async function() {

      const expected = '<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"';

      const definitions = moddle.create('bpmn:Definitions');

      const { xml } = await toBpmnXml(definitions);

      expect(xml).to.contains(expected);

    });

  });

  describe('toDmnXml', function() {

    const moddle = new DmnModdle();

    it('should convert from definitions to xml', async function() {

      const expected = '<dmn:definitions xmlns:dmn="https://www.omg.org/spec/DMN/20191111/MODEL/" />';

      const definitions = moddle.create('dmn:Definitions');

      const { xml } = await toDmnXml(definitions);

      expect(xml).to.contain(expected);

    });

  });

  describe('Operaton conversion namespaces', function() {

    it('should preserve mixed Camunda and Operaton BPMN extension attributes', async function() {
      const xml = '<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"' +
        ' xmlns:camunda="http://camunda.org/schema/1.0/bpmn"' +
        ' xmlns:operaton="http://operaton.org/schema/1.0/bpmn" targetNamespace="test">' +
        '<bpmn:process id="Process_1" operaton:historyTimeToLive="30">' +
        '<bpmn:userTask id="Task_1" camunda:assignee="alice" operaton:asyncBefore="true" />' +
        '</bpmn:process></bpmn:definitions>';

      const definitions = await getBpmnDefinitionsForConversion(xml);
      const process = definitions.rootElements[0];
      const task = process.flowElements[0];

      expect(process.get('camunda:historyTimeToLive')).to.equal('30');
      expect(task.get('camunda:assignee')).to.equal('alice');
      expect(task.get('camunda:asyncBefore')).to.be.true;

      const { xml: exported } = await toBpmnXml(definitions);

      expect(exported).to.contain('http://operaton.org/schema/1.0/bpmn');
      expect(exported).not.to.contain('http://camunda.org/schema/1.0/bpmn');
    });

    it('should preserve mixed Camunda and Operaton DMN extension attributes', async function() {
      const xml = '<definitions xmlns="https://www.omg.org/spec/DMN/20191111/MODEL/"' +
        ' xmlns:camunda="http://camunda.org/schema/1.0/dmn"' +
        ' xmlns:operaton="http://operaton.org/schema/1.0/dmn" namespace="test">' +
        '<decision id="Decision_1" camunda:historyTimeToLive="30" operaton:versionTag="release" />' +
        '</definitions>';

      const definitions = await getDmnDefinitionsForConversion(xml);
      const decision = definitions.drgElement[0];

      expect(decision.get('camunda:historyTimeToLive')).to.equal('30');
      expect(decision.get('camunda:versionTag')).to.equal('release');
    });

    it('should not mistake documentation for an Operaton namespace declaration', async function() {
      const xml = '<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"' +
        ' xmlns:camunda="http://camunda.org/schema/1.0/bpmn" targetNamespace="test">' +
        '<bpmn:documentation>http://operaton.org/schema/1.0/bpmn</bpmn:documentation>' +
        '<bpmn:process id="Process_1" camunda:historyTimeToLive="30" />' +
        '</bpmn:definitions>';

      const definitions = await getBpmnDefinitions(xml, 'bpmn');

      expect(definitions.rootElements[0].get('camunda:historyTimeToLive')).to.equal('30');
    });

  });

  describe('BPMN ad-hoc subprocess standard attributes', function() {

    it('should parse completionCondition only', async function() {

      const xmlOnlyCompletionCondition = '<?xml version="1.0" encoding="UTF-8"?>' +
        '<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"' +
        '                   id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">' +
        '  <bpmn:process id="Process_1" isExecutable="true">' +
        '    <bpmn:adHocSubProcess id="AdHocSubProcess_1">' +
        '      <bpmn:completionCondition>${allTasksComplete}</bpmn:completionCondition>' +
        '    </bpmn:adHocSubProcess>' +
        '  </bpmn:process>' +
        '</bpmn:definitions>';

      const definitions = await getBpmnDefinitions(xmlOnlyCompletionCondition, 'bpmn');
      const adHocSubProcess = definitions.rootElements[0].flowElements[0];

      const completionCondition = adHocSubProcess.completionCondition;
      expect(completionCondition).to.exist;
      expect(completionCondition.body).to.equal('${allTasksComplete}');
    });

    it('should parse cancelRemainingInstances attribute', async function() {

      const xmlWithCancelRemainingInstances = '<?xml version="1.0" encoding="UTF-8"?>' +
        '<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"' +
        '                   id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">' +
        '  <bpmn:process id="Process_1" isExecutable="true">' +
        '    <bpmn:adHocSubProcess id="AdHocSubProcess_1" cancelRemainingInstances="false">' +
        '    </bpmn:adHocSubProcess>' +
        '  </bpmn:process>' +
        '</bpmn:definitions>';

      const definitions = await getBpmnDefinitions(xmlWithCancelRemainingInstances, 'bpmn');
      const adHocSubProcess = definitions.rootElements[0].flowElements[0];

      expect(adHocSubProcess.cancelRemainingInstances).to.equal(false);
    });

    it('should handle AdHocSubProcess with no extension properties', async function() {

      const plainAdHocSubProcessXml = '<?xml version="1.0" encoding="UTF-8"?>' +
        '<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"' +
        '                   id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">' +
        '  <bpmn:process id="Process_1" isExecutable="true">' +
        '    <bpmn:adHocSubProcess id="AdHocSubProcess_1" />' +
        '  </bpmn:process>' +
        '</bpmn:definitions>';

      const definitions = await getBpmnDefinitions(plainAdHocSubProcessXml, 'bpmn');
      const adHocSubProcess = definitions.rootElements[0].flowElements[0];

      expect(adHocSubProcess.id).to.equal('AdHocSubProcess_1');
      expect(adHocSubProcess.extensionElements).to.not.exist;
    });

    it('should round-trip completionCondition with complex expressions', async function() {

      const xmlComplexExpression = '<?xml version="1.0" encoding="UTF-8"?>' +
        '<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"' +
        '                   id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">' +
        '  <bpmn:process id="Process_1" isExecutable="true">' +
        '    <bpmn:adHocSubProcess id="AdHocSubProcess_1">' +
        '      <bpmn:completionCondition>${count >= threshold &amp;&amp; approved == true}</bpmn:completionCondition>' +
        '    </bpmn:adHocSubProcess>' +
        '  </bpmn:process>' +
        '</bpmn:definitions>';

      const moddle = new BpmnModdle();
      const { rootElement: definitions } = await moddle.fromXML(xmlComplexExpression);
      const { xml: exportedXml } = await moddle.toXML(definitions, { format: true });

      const adHocSubProcess = definitions.rootElements[0].flowElements[0];
      expect(adHocSubProcess.completionCondition.body).to.include('count >= threshold');
      expect(adHocSubProcess.completionCondition.body).to.include('approved == true');
      expect(exportedXml).to.contain('completionCondition');
    });

  });

});
