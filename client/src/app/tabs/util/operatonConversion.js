/**
 * Copyright 2025 FINOS.
 * Copyright 2026 the Operaton contributors.
 *
 * Licensed under the MIT license. See the LICENSE file in the project root.
 */

import { getBpmnDefinitionsForConversion, getDmnDefinitionsForConversion } from '../../../util/xmlConversion';
import { is } from './namespace';
import Metadata from '../../../util/Metadata';
import { toBpmnXml, toDmnXml } from '../../../util/xmlConversion';
import { ENGINES, getLatestStable } from '../../../util/Engines';
import { Type } from './type';
import { XMLValidator } from 'fast-xml-parser';
import { normalizeOperatonXml } from '../../../util/operatonXml';

const NAMESPACE_URI_BPMN_OPERATON = 'http://operaton.org/schema/1.0/bpmn';
const NAMESPACE_URI_DMN_OPERATON = 'http://operaton.org/schema/1.0/dmn';
const NAMESPACE_URI_MODELER = 'http://operaton.org/schema/modeler/1.0';
const EXECUTION_PLATFORM_OPERATON = 'Operaton';
const NAMESPACE_URI_C8 = 'http://camunda.org/schema/zeebe/1.0';
const EXECUTION_PLATFORM_C8 = 'Camunda Cloud';

export async function convertBpmnToOperatonIfRequired(contents, onAction, onContentUpdated) {
  const entity = await convertToOperatonIfRequired(contents, Type.BPMN, onAction);
  const result = getConvertedResult(entity, onContentUpdated);
  return result || normalizeExistingOperatonXml(contents, Type.BPMN, onContentUpdated);
}

export async function convertDmnToOperatonIfRequired(contents, onAction, onContentUpdated) {
  const entity = await convertToOperatonIfRequired(contents, Type.DMN, onAction);
  const result = getConvertedResult(entity, onContentUpdated);
  return result || normalizeExistingOperatonXml(contents, Type.DMN, onContentUpdated);
}

export async function convertFormToOperatonIfRequired(contents, onAction) {
  const entity = await convertToOperatonIfRequired(contents, Type.FORM, onAction);
  const result = getConvertedResult(entity);
  return result || contents;
}

async function convertToOperatonIfRequired(contents, type, onAction) {
  if (isConversionCandidate(contents, type)) {
    return await handleOperatonConversion(contents, type, onAction);
  }
  return contents;
}

async function handleOperatonConversion(contents, type, onAction) {
  const isC8Model = is(contents, NAMESPACE_URI_C8, EXECUTION_PLATFORM_C8);
  let dialog = isC8Model ? getOperatonUnsupportedDialog() : getOperatonConversionDialog(type);
  const { button } = await onAction('show-dialog', dialog);

  if (button === '0') {
    const result = await convertToOperaton(contents, type);
    return {
      result,
      converted: true
    };
  } else {
    await onAction('close-tab');
    return {
      converted: false
    };
  }
}

function isConversionCandidate(contents, type) {
  const ns = type === Type.BPMN ? NAMESPACE_URI_BPMN_OPERATON : NAMESPACE_URI_DMN_OPERATON;
  return isEntityValid(contents, type) && !is(contents, ns, EXECUTION_PLATFORM_OPERATON);
}

function getOperatonConversionDialog(type) {
  return {
    type: 'error',
    title: `Unsupported ${type} file detected`,
    buttons: [
      { id: '0', label: 'Yes' },
      { id: '1', label: 'Close File' }
    ],
    message: `Would you like to migrate your ${type} file to be Operaton compatible? `,
    detail: [
      'This modeler only supports Operaton files.',
      'Please make sure to have a backup of this file before migrating.',
    ].join('\n')
  };
}

function getOperatonUnsupportedDialog() {
  return {
    type: 'error',
    title: 'Unsupported Camunda 8 file detected',
    buttons: [
      { id: '2', label: 'Close File' }
    ],
    message: 'Camunda 8 files are unsupported in Operaton',
    detail: [
      'This modeler only supports Operaton files.',
    ].join('\n')
  };
}

function getConvertedResult(entity, onContentUpdated) {
  if (entity.converted) {
    const result = entity.result;
    if (onContentUpdated) {
      onContentUpdated(result);
    }
    return result;
  }
  return null;
}

async function convertToOperaton(contents, type) {
  const latestStable = getLatestStable(ENGINES.OPERATON);
  if ([ Type.BPMN, Type.DMN ].includes(type)) {
    return await handleConversionForXml(contents, type, latestStable);
  } else {
    return handleConversionForJson(contents, latestStable);
  }
}

async function handleConversionForXml(contents, type, latestStable) {
  let convertedXml;
  try {
    if (type === Type.BPMN) {
      const definitions = await getBpmnDefinitionsForConversion(contents);
      definitions.$attrs['xmlns:operaton'] = NAMESPACE_URI_BPMN_OPERATON;
      const updatedDefinitions = updateCommonAttributesForXml(definitions, latestStable);
      convertedXml = await toBpmnXml(updatedDefinitions);
    } else {
      const definitions = await getDmnDefinitionsForConversion(contents);
      definitions.namespace = NAMESPACE_URI_DMN_OPERATON;
      const updatedDefinitions = updateCommonAttributesForXml(definitions, latestStable);
      convertedXml = await toDmnXml(updatedDefinitions);
    }
    return normalizeOperatonXml(convertedXml.xml, type, {
      ensureNamespace: true
    });
  } catch (error) {
    throw new Error('Error converting model to Operaton');
  }
}

function handleConversionForJson(contents, latestStable) {
  if (!contents.exporter) {
    contents.exporter = {};
  }
  contents.exporter.name = Metadata.name;
  contents.exporter.version = Metadata.version;
  return updateCommonAttributes(contents, latestStable);
}

function updateCommonAttributesForXml(definitions, latestStable) {

  // Imported files may bind modeler metadata to any prefix. Replace the old
  // platform fields and preserve other metadata under the Operaton URI.
  Object.entries(definitions.$attrs).forEach(([ name, value ]) => {
    if (name.startsWith('xmlns:') && [
      'http://camunda.org/schema/modeler/1.0',
      NAMESPACE_URI_MODELER
    ].includes(value)) {
      const prefix = name.slice('xmlns:'.length);
      definitions.$attrs[name] = NAMESPACE_URI_MODELER;
      delete definitions.$attrs[`${ prefix }:executionPlatform`];
      delete definitions.$attrs[`${ prefix }:executionPlatformVersion`];
    }
  });

  const updatedAttributes = updateCommonAttributes(definitions, latestStable);
  updatedAttributes.exporter = Metadata.name;
  updatedAttributes.exporterVersion = Metadata.version;
  updatedAttributes.$attrs['xmlns:modeler'] = NAMESPACE_URI_MODELER;
  updatedAttributes.$attrs['modeler:executionPlatform'] = ENGINES.OPERATON;
  updatedAttributes.$attrs['modeler:executionPlatformVersion'] = latestStable;
  return updatedAttributes;
}

function updateCommonAttributes(definitions, latestStable) {
  definitions.executionPlatform = ENGINES.OPERATON;
  definitions.executionPlatformVersion = latestStable;
  return definitions;
}

function normalizeExistingOperatonXml(contents, type, onContentUpdated) {
  if (!is(contents, getOperatonNamespace(type), EXECUTION_PLATFORM_OPERATON)) {
    return contents;
  }

  const normalized = normalizeOperatonXml(contents, type);

  if (normalized !== contents && onContentUpdated) {
    onContentUpdated(normalized);
  }

  return normalized;
}

function getOperatonNamespace(type) {
  return type === Type.BPMN ? NAMESPACE_URI_BPMN_OPERATON : NAMESPACE_URI_DMN_OPERATON;
}

function isEntityValid(contents, type) {
  if ([ Type.BPMN, Type.DMN ].includes(type)) {
    return isXml(contents);
  } else {
    return isJson(contents);
  }
}

function isXml(contents) {
  return XMLValidator.validate(contents.trim()) === true;
}

function isJson(contents) {
  return typeof contents === 'object';
}
