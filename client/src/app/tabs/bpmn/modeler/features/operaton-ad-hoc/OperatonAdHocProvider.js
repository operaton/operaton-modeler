/**
 * Copyright 2026 the Operaton contributors.
 *
 * Licensed under the MIT license. See the LICENSE file in the project root.
 */

import { is } from 'bpmn-js/lib/util/ModelUtil';

import { OperatonAdHocProps } from './OperatonAdHocProps';

export default class OperatonAdHocProvider {

  constructor(propertiesPanel, translate) {
    propertiesPanel.registerProvider(100, this);
    this._translate = translate;
  }

  getGroups(element) {
    return groups => {
      if (!is(element, 'bpmn:AdHocSubProcess') || groups.some(group => group.id === 'operatonAdHoc')) {
        return groups;
      }

      const group = {
        id: 'operatonAdHoc',
        label: this._translate('Operaton ad hoc (experimental)'),
        entries: OperatonAdHocProps({ element })
      };

      const completionIndex = groups.findIndex(group => group.id === 'adHocCompletion');
      const index = completionIndex === -1 ? groups.length : completionIndex;

      // Preserve the existing BPMN completion condition and cancellation entries.
      return [ ...groups.slice(0, index), group, ...groups.slice(index) ];
    };
  }
}

OperatonAdHocProvider.$inject = [ 'propertiesPanel', 'translate' ];
