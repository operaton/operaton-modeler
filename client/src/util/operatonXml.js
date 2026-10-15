/**
 * Copyright 2026 the Operaton contributors.
 *
 * Licensed under the MIT license. See the LICENSE file in the project root.
 */

import { Parser } from 'saxen';

const NAMESPACES = {
  bpmn: {
    camunda: 'http://camunda.org/schema/1.0/bpmn',
    operaton: 'http://operaton.org/schema/1.0/bpmn'
  },
  cmmn: {
    camunda: 'http://camunda.org/schema/1.0/cmmn',
    operaton: 'http://operaton.org/schema/1.0/cmmn'
  },
  dmn: {
    camunda: 'http://camunda.org/schema/1.0/dmn',
    operaton: 'http://operaton.org/schema/1.0/dmn'
  }
};

export function normalizeOperatonXml(xml, type, options = {}) {
  const namespaces = NAMESPACES[ type ];

  if (typeof xml !== 'string' || !namespaces) {
    return xml;
  }

  const tags = getTags(xml);

  if (!tags.length) {
    return xml;
  }

  if (options.metadata && tags.some(tag => Object.entries(tag.attributes).some(([ name, value ]) =>
    ((name === 'xmlns' || name.startsWith('xmlns:')) && value === 'http://camunda.org/schema/zeebe/1.0') ||
    (name.endsWith(':executionPlatform') && value === 'Camunda Cloud')))) {
    return xml;
  }

  // Retain the original prefix if another extension owns "operaton".
  const renamePrefix = !tags.some(tag => tag.attributes['xmlns:operaton'] &&
    tag.attributes['xmlns:operaton'] !== namespaces.operaton);

  // QName-valued attributes (for example xsi:type) still need the old alias.
  const retainCamundaPrefix = tags.some(tag => Object.entries(tag.attributes).some(
    ([ name, value ]) => !name.startsWith('xmlns:') && /^camunda:[\w.-]+$/.test(value.trim())));
  let needsNamespace = options.ensureNamespace && renamePrefix;

  const convertedTags = tags.map(tag => {
    const { attributes, scope } = tag;
    const canRename = renamePrefix && (!scope.camunda ||
      scope.camunda === namespaces.camunda || scope.camunda === namespaces.operaton);

    const rename = name => {
      if (canRename && name.startsWith('camunda:')) {
        needsNamespace = true;
        return 'operaton:' + name.slice('camunda:'.length);
      }

      return name;
    };

    // Work on markup only. Attribute values, scripts, CDATA, comments and
    // documentation must remain byte-for-byte unchanged.
    return tag.raw
      .replace(/^(<\/?)([^\s/>]+)/, (_, opening, name) => opening + rename(name))
      .replace(/(\s+)([^\s=/>]+)(\s*=\s*)(["'])([\s\S]*?)\4/g,
        (attribute, space, name, equals, quote, value) => {
          if (name.startsWith('xmlns:') &&
            (value === namespaces.camunda || value === namespaces.operaton)) {
            if (name === 'xmlns:camunda' && renamePrefix && !retainCamundaPrefix) {
              if (attributes['xmlns:operaton'] === namespaces.operaton) {
                return '';
              }

              name = 'xmlns:operaton';
            }

            return space + name + equals + quote + namespaces.operaton + quote;
          }

          return space + rename(name) + equals + quote + value + quote;
        });
  });

  const root = tags[0];

  if (needsNamespace && root.attributes['xmlns:operaton'] !== namespaces.operaton &&
    !(renamePrefix && !retainCamundaPrefix && [ namespaces.camunda, namespaces.operaton ].includes(root.attributes['xmlns:camunda']))) {
    convertedTags[0] = convertedTags[0].replace(
      /^(<[^\s/>]+)/,
      `$1 xmlns:operaton="${ namespaces.operaton }"`
    );
  }

  if (options.metadata) {
    convertedTags[0] = normalizeMetadata(convertedTags[0], root.attributes, options.metadata);
  }

  let offset = 0;
  let normalized = '';

  tags.forEach((tag, index) => {
    normalized += xml.slice(offset, tag.start) + convertedTags[index];
    offset = tag.start + tag.raw.length;
  });

  return normalized + xml.slice(offset);
}

function normalizeMetadata(markup, attributes, metadata) {
  const namespace = 'http://operaton.org/schema/modeler/1.0';
  const prefixes = Object.keys(attributes).filter(name => name.startsWith('xmlns:') &&
    [ namespace, 'http://camunda.org/schema/modeler/1.0' ].includes(attributes[name]))
    .map(name => name.slice('xmlns:'.length));
  let prefix = prefixes[0] || 'modeler';

  while (!prefixes.includes(prefix) && attributes[`xmlns:${ prefix }`]) {
    prefix = '_' + prefix;
  }

  const operatonPrefix = prefixes.find(prefix => attributes[`${ prefix }:executionPlatform`] === 'Operaton');
  const version = operatonPrefix && attributes[`${ operatonPrefix }:executionPlatformVersion`] ||
    metadata.executionPlatformVersion;

  markup = markup.replace(/(\s+)([^\s=/>]+)(\s*=\s*)(["'])([\s\S]*?)\4/g,
    (attribute, space, name, equals, quote, value) => {
      if (prefixes.some(prefix => name === `${ prefix }:executionPlatform` ||
        name === `${ prefix }:executionPlatformVersion`) ||
        name === 'exporter' || name === 'exporterVersion') {
        return '';
      }

      return name.startsWith('xmlns:') && prefixes.includes(name.slice('xmlns:'.length)) ?
        space + name + equals + quote + namespace + quote : attribute;
    });

  const additions = {
    ...(!prefixes.length && { [`xmlns:${ prefix }`]: namespace }),
    [`${ prefix }:executionPlatform`]: 'Operaton',
    [`${ prefix }:executionPlatformVersion`]: version,
    exporter: metadata.exporter,
    exporterVersion: metadata.exporterVersion
  };
  const serialized = Object.entries(additions).map(([ name, value ]) =>
    ` ${ name }="${ String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;') }"`).join('');

  return markup.replace(/(\/?>)$/, (_, ending) => serialized + ending);
}

export function usesOperatonExtensionNamespace(xml, type) {
  const namespace = NAMESPACES[ type ]?.operaton;

  return typeof xml === 'string' && !!namespace && getTags(xml).some(tag =>
    Object.entries(tag.attributes).some(([ name, value ]) =>
      (name === 'xmlns' || name.startsWith('xmlns:')) && value === namespace));
}

function getTags(xml) {
  const parser = new Parser();
  const tags = [];
  const scopes = [ {} ];
  let offset = 0;
  let invalid = false;

  // Keep source positions while the parser distinguishes markup from text.
  // Reading raw tags avoids reserializing user content or changing its quotes.
  function readTag() {
    const start = xml.indexOf('<', offset);
    const raw = /^<(?:[^>"']|"[^"]*"|'[^']*')*>/.exec(xml.slice(start))[0];
    offset = start + raw.length;
    return { start, raw };
  }

  function skip(raw) {
    offset = xml.indexOf(raw, offset) + raw.length;
  }

  parser.on('comment', value => skip(`<!--${ value }-->`));
  parser.on('cdata', value => skip(`<![CDATA[${ value }]]>`));
  parser.on('question', skip);
  parser.on('attention', skip);
  parser.on('error', () => { invalid = true; });

  parser.on('openTag', (name, getAttributes) => {
    const attributes = getAttributes();
    const scope = { ...scopes[scopes.length - 1] };

    Object.entries(attributes).forEach(([ name, value ]) => {
      if (name.startsWith('xmlns:')) {
        scope[name.slice('xmlns:'.length)] = value;
      }
    });

    scopes.push(scope);
    tags.push({ ...readTag(), attributes, scope });
  });

  parser.on('closeTag', (name, decode, selfClosing) => {
    const scope = scopes.pop();

    if (!selfClosing) {
      tags.push({ ...readTag(), attributes: {}, scope });
    }
  });

  parser.parse(xml);

  return invalid ? [] : tags;
}
