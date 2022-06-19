/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { defaultTo, get, isEmpty, isNil } from 'lodash-es'
import type { FormikProps } from 'formik'

import { FormInput, getMultiTypeFromValue, MultiTypeInputType, SelectOption } from '@harness/uicore'

import { useStrings } from 'framework/strings'
import type { EnvironmentResponse, EnvironmentResponseDTO } from 'services/cd-ng'

import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import type { DeployInfrastructureStepConfig } from '../DeployInfrastructureStep'

interface DeployEnvironmentInEnvGroupProps {
  formikRef: React.MutableRefObject<FormikProps<DeployInfrastructureStepConfig> | null>
  readonly: boolean
  initialValues?: DeployInfrastructureStepConfig
  selectedEnvironmentGroup: any
  allowableTypes: MultiTypeInputType[]
  setSelectedEnvironment: any
}

export default function DeployEnvironmentInEnvGroup({
  formikRef,
  readonly,
  // initialValues,
  selectedEnvironmentGroup,
  allowableTypes,
  setSelectedEnvironment
}: DeployEnvironmentInEnvGroupProps) {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  const [environments, setEnvironments] = useState<EnvironmentResponseDTO[]>()
  const [environmentsSelectOptions, setEnvironmentsSelectOptions] = useState<SelectOption[]>()

  useEffect(() => {
    if (get(selectedEnvironmentGroup, 'envResponse')) {
      setEnvironments(
        defaultTo(
          get(selectedEnvironmentGroup, 'envResponse', [])?.map((environmentObj: EnvironmentResponse) => ({
            ...environmentObj.environment
          })),
          []
        )
      )
    }
  }, [selectedEnvironmentGroup])

  useEffect(() => {
    if (!isNil(environments)) {
      setEnvironmentsSelectOptions(
        environments.map(environment => {
          return { label: defaultTo(environment.name, ''), value: defaultTo(environment.identifier, '') }
        })
      )
    }
  }, [environments])

  useEffect(() => {
    if (
      !isEmpty(environmentsSelectOptions) &&
      !isNil(environmentsSelectOptions) &&
      formikRef.current?.values?.environmentInEnvGroupRef
    ) {
      if (getMultiTypeFromValue(formikRef.current?.values?.environmentInEnvGroupRef) === MultiTypeInputType.FIXED) {
        const existingEnvironment = environments?.find(
          environment => environment.identifier === formikRef.current?.values?.environmentInEnvGroupRef
        )
        if (!existingEnvironment) {
          if (!readonly) {
            formikRef.current?.setFieldValue('environmentInEnvGroupRef', '')
          } else {
            const options = [...environmentsSelectOptions]
            options.push({
              label: formikRef.current?.values?.environmentInEnvGroupRef as string,
              value: formikRef.current?.values?.environmentInEnvGroupRef as string
            })
            setEnvironmentsSelectOptions(options)
          }
        } else {
          formikRef.current?.setFieldValue('environmentInEnvGroupRef', {
            label: existingEnvironment.name,
            value: existingEnvironment.identifier
          })
          setSelectedEnvironment(existingEnvironment)
        }
      }
    }
  }, [environmentsSelectOptions])

  return (
    <FormInput.MultiTypeInput
      label={getString('cd.pipelineSteps.environmentTab.specifyYourEnvironment')}
      tooltipProps={{ dataTooltipId: 'specifyYourEnvironment' }}
      name="environmentInEnvGroupRef"
      disabled={readonly}
      placeholder={getString('cd.pipelineSteps.environmentTab.specifyYourEnvironment')}
      multiTypeInputProps={{
        width: 280,
        onChange: item => {
          if ((item as SelectOption).value !== formikRef.current?.values?.environmentInEnvGroupRef) {
            formikRef.current?.setValues({
              ...formikRef.current.values,
              environmentInEnvGroupRef: item as SelectOption,
              clusterRef: []
            })
            setSelectedEnvironment(
              environments?.find(environment => environment.identifier === (item as SelectOption).value)
            )
          }
        },
        selectProps: {
          addClearBtn: !readonly,
          items: defaultTo(environmentsSelectOptions, [])
        },
        expressions,
        allowableTypes
      }}
      selectItems={defaultTo(environmentsSelectOptions, [])}
    />
  )
}
