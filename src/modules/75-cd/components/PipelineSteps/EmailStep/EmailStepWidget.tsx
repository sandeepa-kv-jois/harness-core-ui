/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Formik, MultiTypeInputType } from '@wings-software/uicore'
import * as Yup from 'yup'
import type { FormikProps } from 'formik'
import { defaultTo } from 'lodash-es'
import { setFormikRef, StepViewType, StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { useStrings } from 'framework/strings'
import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { getNameAndIdentifierSchema } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import type { EmailStepData, EmailStepFormData } from './emailStepTypes'
import BaseEmailStep from './BaseEmailStep'
import { EmailValidationSchema, EmailValidationSchemaWithoutRequired } from './emailStepUtils'

/**
 * Spec ->
 * https://harness.atlassian.net/wiki/spaces/CDNG/pages/21096826293/Email+Step
 */

interface EmailStepWidgetProps {
  initialValues: EmailStepFormData
  isNewStep?: boolean
  isDisabled?: boolean
  onUpdate?: (data: EmailStepFormData) => void
  onChange?: (data: EmailStepFormData) => void
  stepViewType?: StepViewType
  readonly: boolean
  allowableTypes?: MultiTypeInputType[]
}

export function EmailStepWidget(
  props: EmailStepWidgetProps,
  formikRef: StepFormikFowardRef<EmailStepData>
): React.ReactElement {
  const { initialValues, onUpdate, onChange, isNewStep, isDisabled, stepViewType, allowableTypes } = props
  const { getString } = useStrings()
  const validationSchema = Yup.object().shape({
    timeout: getDurationValidationSchema({ minimum: '1d' }).required(
      getString('cd.steps.emailStep.timeout1DayMinimum')
    ),
    spec: Yup.object().shape({
      to: EmailValidationSchema(),
      cc: EmailValidationSchemaWithoutRequired(),
      subject: Yup.string().required(getString('common.smtp.validationSubject')),
      body: Yup.string().required(getString('common.smtp.validationBody'))
    }),
    ...getNameAndIdentifierSchema(getString, stepViewType)
  })

  return (
    <Formik<EmailStepFormData>
      initialValues={initialValues}
      formName="emailStepForm"
      onSubmit={values => {
        onUpdate?.(values)
      }}
      validate={values => {
        onChange?.(values)
      }}
      validationSchema={validationSchema}
    >
      {(formik: FormikProps<EmailStepFormData>) => {
        setFormikRef(formikRef, formik)

        return (
          <BaseEmailStep
            formik={formik}
            isNewStep={defaultTo(isNewStep, true)}
            stepViewType={stepViewType}
            readonly={isDisabled}
            allowableTypes={allowableTypes}
          />
        )
      }}
    </Formik>
  )
}

export const EmailStepWidgetWithRef = React.forwardRef(EmailStepWidget)
