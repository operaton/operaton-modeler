/**
 * Copyright 2026 the Operaton contributors.
 *
 * Licensed under the MIT license. See the LICENSE file in the project root.
 */

import camundaDescriptor from 'camunda-bpmn-moddle/resources/camunda';

import createOperatonModdleDescriptor from './createOperatonModdleDescriptor';

const operatonDescriptor = createOperatonModdleDescriptor(
  camundaDescriptor,
  'http://operaton.org/schema/1.0/bpmn'
);

// Always register the attribute, including when the experimental editor is off,
// so existing Operaton models retain their settings on import and export.
operatonDescriptor.types.push({
  name: 'AdHocSubProcess',
  isAbstract: true,
  extends: [ 'bpmn:AdHocSubProcess' ],
  properties: [ {
    name: 'autoComplete',
    isAttr: true,
    type: 'Boolean',
    default: true
  } ]
});

export default operatonDescriptor;
