/**
 * Copyright 2026 the Operaton contributors.
 *
 * Licensed under the MIT license. See the LICENSE file in the project root.
 */

import camundaDescriptor from 'camunda-cmmn-moddle/resources/camunda';

import createOperatonModdleDescriptor from './createOperatonModdleDescriptor';

export default createOperatonModdleDescriptor(
  camundaDescriptor,
  'http://operaton.org/schema/1.0/cmmn'
);
