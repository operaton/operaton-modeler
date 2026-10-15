/**
 * Copyright 2026 the Operaton contributors.
 *
 * Adapted from the ad-hoc properties in Fluxnova Modeler.
 * Licensed under the MIT license. See the LICENSE file in the project root.
 */

import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil';

import {
  CheckboxEntry,
  SelectEntry,
  TextFieldEntry,
  isTextFieldEntryEdited
} from '@bpmn-io/properties-panel';

import { useService } from 'bpmn-js-properties-panel';


export function OperatonAdHocProps({ element }) {
  if (!is(element, 'bpmn:AdHocSubProcess')) {
    return [];
  }

  return [
    {
      id: 'operatonAdHocOrdering',
      component: Ordering,
      isEdited: node => node && node.value === 'Sequential'
    },
    {
      id: 'activeTasksCollection',
      component: ActiveTasksCollection,
      isEdited: isTextFieldEntryEdited
    },
    {
      id: 'autoComplete',
      component: AutoComplete,
      isEdited: node => node && !node.checked
    }
  ];
}

function Ordering({ element }) {
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const businessObject = getBusinessObject(element);

  return SelectEntry({
    element,
    id: 'operatonAdHocOrdering',
    label: translate('Ordering'),
    getValue: () => businessObject.get('ordering') || 'Parallel',
    setValue: value => updateProperties(commandStack, element, businessObject, {
      ordering: value
    }),
    getOptions: () => [
      { value: 'Parallel', label: translate('Parallel') },
      { value: 'Sequential', label: translate('Sequential') }
    ],
    description: translate('Sequential allows one running direct activity at a time. In both modes, incoming flows enable later activities; the runtime API must select them to start.')
  });
}

function ActiveTasksCollection({ element }) {
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const bpmnFactory = useService('bpmnFactory');
  const debounce = useService('debounceInput');
  const businessObject = getBusinessObject(element);

  const getValue = () => {
    const property = findActiveTasksProperty(businessObject);
    return property ? property.value : '';
  };

  const setValue = value => {
    const property = findActiveTasksProperty(businessObject);
    const extensionElements = businessObject.get('extensionElements');
    const normalizedValue = value && value.trim();

    if (!normalizedValue) {
      if (!property) {
        return;
      }

      const container = property.$parent;
      const properties = container.get('values').filter(entry => entry !== property);

      if (properties.length) {
        return updateProperties(commandStack, element, container, { values: properties });
      }

      const extensions = extensionElements.get('values').filter(entry => entry !== container);

      if (extensions.length) {
        return updateProperties(commandStack, element, extensionElements, { values: extensions });
      }

      return updateProperties(commandStack, element, businessObject, { extensionElements: undefined });
    }

    if (property) {
      return updateProperties(commandStack, element, property, { value: normalizedValue });
    }

    const extensions = extensionElements || createElement('bpmn:ExtensionElements', {}, businessObject, bpmnFactory);
    const existingContainer = extensions.get('values').find(entry => is(entry, 'camunda:Properties'));
    const container = existingContainer || createElement('camunda:Properties', {}, extensions, bpmnFactory);
    const newProperty = createElement('camunda:Property', {
      name: 'activeTasksCollection',
      value: normalizedValue
    }, container, bpmnFactory);

    if (existingContainer) {
      return updateProperties(commandStack, element, container, {
        values: [ ...container.get('values'), newProperty ]
      });
    }

    container.get('values').push(newProperty);

    if (extensionElements) {
      return updateProperties(commandStack, element, extensions, {
        values: [ ...extensions.get('values'), container ]
      });
    }

    extensions.get('values').push(container);
    return updateProperties(commandStack, element, businessObject, { extensionElements: extensions });
  };

  return TextFieldEntry({
    element,
    id: 'activeTasksCollection',
    label: translate('Initial activities (activeTasksCollection)'),
    getValue,
    setValue,
    debounce,
    description: translate('Requires an engine build with Operaton PR #3207. Use ${taskIds} or comma-separated IDs of direct activities without incoming flows. Empty means no initial activation; Sequential accepts at most one initial activity.')
  });
}

function AutoComplete({ element }) {
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const businessObject = getBusinessObject(element);

  return CheckboxEntry({
    element,
    id: 'autoComplete',
    label: translate('Auto complete'),
    getValue: () => businessObject.get('camunda:autoComplete'),
    setValue: value => updateProperties(commandStack, element, businessObject, {
      'camunda:autoComplete': value === false ? false : undefined
    }),
    description: translate('Without a completion condition, complete after work has started and no open child work remains. Disable to keep the subprocess open for explicit completion through the runtime API.')
  });
}

function findActiveTasksProperty(businessObject) {
  const extensionElements = businessObject.get('extensionElements');

  if (!extensionElements) {
    return;
  }

  for (const container of extensionElements.get('values')) {
    if (is(container, 'camunda:Properties')) {
      const property = container.get('values').find(entry => entry.name === 'activeTasksCollection');

      if (property) {
        return property;
      }
    }
  }
}

function createElement(type, properties, parent, bpmnFactory) {
  const element = bpmnFactory.create(type, properties);
  element.$parent = parent;
  return element;
}

function updateProperties(commandStack, element, moddleElement, properties) {
  return commandStack.execute('element.updateModdleProperties', {
    element,
    moddleElement,
    properties
  });
}
