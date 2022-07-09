/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { getMultiTypeFromValue, MultiTypeInputType, FormInput } from '@wings-software/uicore'
import { isEmpty } from 'lodash-es'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { FormMultiTypeDurationField } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { FormMultiTypeTextAreaField } from '@common/components/MultiTypeTextArea/MultiTypeTextArea'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import type { EmailStepData, EmailStepFormData } from './emailStepTypes'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export interface EmailStepInputSetProps {
  initialValues: EmailStepFormData
  stepViewType?: StepViewType
  readonly?: boolean
  template?: EmailStepData
  onUpdate?: (data: EmailStepFormData) => void
  path: string
  allowableTypes: MultiTypeInputType[]
}

export default function EmailStepInputSet(props: EmailStepInputSetProps): React.ReactElement {
  const { template, path, readonly, allowableTypes } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { NG_EXECUTION_INPUT } = useFeatureFlags()
  const prefix = isEmpty(path) ? '' : `${path}.`

  return (
    <React.Fragment>
      {getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME ? (
        <div className={cx(stepCss.formGroup, stepCss.sm)}>
          <FormMultiTypeDurationField
            label={getString('pipelineSteps.timeoutLabel')}
            name={`${prefix}timeout`}
            multiTypeDurationProps={{
              enableConfigureOptions: false,
              expressions,
              disabled: readonly,
              allowableTypes,
              useExecutionTimeInput: NG_EXECUTION_INPUT
            }}
            disabled={readonly}
          />
        </div>
      ) : null}
      {getMultiTypeFromValue(template?.spec?.to) === MultiTypeInputType.RUNTIME ? (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormInput.MultiTextInput
            placeholder={getString('pipeline.utilitiesStep.to')}
            label={getString('common.smtp.labelTo')}
            name={`${prefix}spec.to`}
            multiTextInputProps={{
              expressions,
              disabled: readonly,
              allowableTypes,
              useExecutionTimeInput: NG_EXECUTION_INPUT
            }}
            disabled={readonly}
          />
        </div>
      ) : null}
      {getMultiTypeFromValue(template?.spec?.cc) === MultiTypeInputType.RUNTIME ? (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormInput.MultiTextInput
            placeholder={getString('pipeline.utilitiesStep.cc')}
            label={getString('cd.steps.emailStep.ccOptionalLabel')}
            name={`${prefix}spec.cc`}
            multiTextInputProps={{
              expressions,
              disabled: readonly,
              allowableTypes,
              useExecutionTimeInput: NG_EXECUTION_INPUT
            }}
            disabled={readonly}
          />
        </div>
      ) : null}
      {getMultiTypeFromValue(template?.spec?.subject) === MultiTypeInputType.RUNTIME ? (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormMultiTypeTextAreaField
            placeholder={getString('pipeline.utilitiesStep.subject')}
            label={getString('common.smtp.labelSubject')}
            name={`${prefix}spec.subject`}
            multiTypeTextArea={{
              enableConfigureOptions: false,
              expressions,
              disabled: readonly,
              allowableTypes,
              useExecutionTimeInput: NG_EXECUTION_INPUT
            }}
            disabled={readonly}
          />
        </div>
      ) : null}
      {getMultiTypeFromValue(template?.spec?.body) === MultiTypeInputType.RUNTIME ? (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormMultiTypeTextAreaField
            placeholder={getString('pipeline.utilitiesStep.requestBody')}
            label={getString('common.smtp.labelBody')}
            name={`${prefix}spec.body`}
            multiTypeTextArea={{
              enableConfigureOptions: false,
              expressions,
              disabled: readonly,
              allowableTypes,
              useExecutionTimeInput: NG_EXECUTION_INPUT
            }}
            disabled={readonly}
          />
        </div>
      ) : null}
    </React.Fragment>
  )
}
