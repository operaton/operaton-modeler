/**
 * Copyright Camunda Services GmbH and/or licensed to Camunda Services GmbH
 * under one or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information regarding copyright
 * ownership.
 *
 * Camunda licenses this file to you under the MIT; you may not use this file
 * except in compliance with the MIT License.
 */

export const PRIVACY_TEXT_FIELD = 'To enhance user experience, Operaton Modeler can integrate with 3rd party services, which requires external network requests. Please choose from the settings below.';

export const PRIVACY_POLICY_URL = 'https://operaton.org/privacy';

export const LEARN_MORE_TEXT = 'With any of these options, none of your personal information or stored data will be submitted. Learn more:';

export const PRIVACY_POLICY_TEXT = 'Operaton Privacy Policy';

export const OK_BUTTON_TEXT = 'Save';

export const CANCEL_BUTTON_TEXT = 'Cancel';

export const TITLE = 'Privacy Preferences';

export const DEFAULT_VALUES = {
  ENABLE_CRASH_REPORTS: false,
  ENABLE_USAGE_STATISTICS: false
};

export const PREFERENCES_LIST = [
  {
    title: 'Enable Error Reports',
    explanation: 'Allow Operaton Modeler to send error reports containing stack traces and unhandled exceptions.',
    key: 'ENABLE_CRASH_REPORTS'
  },
  {
    title: 'Enable Usage Statistics',
    explanation: 'Allow Operaton Modeler to send pseudonymised usage statistics.',
    key: 'ENABLE_USAGE_STATISTICS'
  }
];
