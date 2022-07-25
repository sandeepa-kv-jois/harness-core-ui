/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { defaultTo, isEmpty } from 'lodash-es'
import type { UseStringsReturn } from 'framework/strings'
import type { TemplateSummaryResponse } from 'services/template-ng'
import { FeatureFlag } from '@common/featureFlags'

export enum TemplateType {
  Step = 'Step',
  Stage = 'Stage',
  Pipeline = 'Pipeline',
  Service = 'Service',
  Infrastructure = 'Infrastructure',
  StepGroup = 'StepGroup',
  Execution = 'Execution',
  MonitoredService = 'MonitoredService',
  SecretManager = 'SecretManager'
}

export const getAllowedTemplateTypes = (
  getString: UseStringsReturn['getString'],
  featureFlagBasedTemplates?: { [key: string]: boolean }
): { label: string; value: string; disabled?: boolean }[] => {
  const AllowedTemplateTypes = [
    {
      label: getString('step'),
      value: TemplateType.Step,
      disabled: false
    },
    {
      label: getString('common.stage'),
      value: TemplateType.Stage,
      disabled: false
    },
    {
      label: getString('common.pipeline'),
      value: TemplateType.Pipeline,
      disabled: false
    },
    {
      label: getString('service'),
      value: TemplateType.Service,
      disabled: true
    },
    {
      label: getString('infrastructureText'),
      value: TemplateType.Infrastructure,
      disabled: true
    },
    {
      label: getString('stepGroup'),
      value: TemplateType.StepGroup,
      disabled: true
    },
    {
      label: getString('executionText'),
      value: TemplateType.Execution,
      disabled: true
    }
  ]

  Object.entries(defaultTo(featureFlagBasedTemplates, {})).forEach(flag => {
    const [flagName, flagEnabled] = flag
    switch (flagName) {
      case FeatureFlag.CUSTOM_SECRET_MANAGER_NG:
        AllowedTemplateTypes.push({
          label: getString('script'),
          value: TemplateType.SecretManager,
          disabled: !flagEnabled
        })
        break
      case FeatureFlag.CVNG_TEMPLATE_MONITORED_SERVICE:
        AllowedTemplateTypes.push({
          label: getString('connectors.cdng.monitoredService.label'),
          value: TemplateType.MonitoredService,
          disabled: !flagEnabled
        })
        break
      default:
        break
    }
  })

  return AllowedTemplateTypes
}

export const getVersionLabelText = (template: TemplateSummaryResponse, getString: UseStringsReturn['getString']) => {
  return isEmpty(template.versionLabel)
    ? getString('templatesLibrary.alwaysUseStableVersion')
    : template.stableTemplate
    ? getString('templatesLibrary.stableVersion', { entity: template.versionLabel })
    : template.versionLabel
}

export const getTemplateRuntimeInputsCount = (templateInfo: { [key: string]: any }): number =>
  (JSON.stringify(templateInfo).match(/<\+input>/g) || []).length
