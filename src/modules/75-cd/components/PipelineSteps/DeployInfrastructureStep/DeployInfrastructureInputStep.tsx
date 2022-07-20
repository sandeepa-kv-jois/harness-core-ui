/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Container, Layout, RUNTIME_INPUT_VALUE, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { connect } from 'formik'
import { defaultTo, get } from 'lodash-es'

import { useStrings } from 'framework/strings'
import { useDeepCompareEffect } from '@common/hooks'
import { CustomVariableInputSet } from '@pipeline/components/PipelineSteps/Steps/CustomVariables/CustomVariableInputSet'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'

import DeployInfrastructures from './DeployInfrastructures/DeployInfrastructures'
import DeployEnvironment from './DeployEnvironment/DeployEnvironment'
import DeployEnvironmentGroup from './DeployEnvironmentGroup/DeployEnvironmentGroup'
import DeployClusters from './DeployClusters/DeployClusters'
import type { DeployInfrastructureProps } from './utils'

import css from './DeployInfrastructureStep.module.scss'

function DeployInfrastructureInputStepInternal({
  inputSetData,
  initialValues,
  allowableTypes,
  formik,
  gitOpsEnabled,
  stepViewType
}: DeployInfrastructureProps & { formik?: any }) {
  const { getString } = useStrings()
  const [isInfrastructureDefinitionRuntime, setIsInfrastructureDefinitionRuntime] = useState(false)
  const [isGitopsClusterRuntime, setIsGitopsClusterRuntime] = useState(false)

  useDeepCompareEffect(() => {
    if ((inputSetData?.template?.environment?.infrastructureDefinitions as unknown as string) === RUNTIME_INPUT_VALUE) {
      setIsInfrastructureDefinitionRuntime(true)

      // This will have to be removed once multi infra support is implemented.
      // Current issue is with the mismatch in the structure required and structure that should be used
      if (stepViewType === StepViewType.InputSet) {
        formik.setFieldValue(`${inputSetData?.path}.infrastructureDefinitions[0].identifier`, RUNTIME_INPUT_VALUE)
      }
    }
  }, [inputSetData?.template?.environment?.infrastructureDefinitions])

  useDeepCompareEffect(() => {
    if ((inputSetData?.template?.environment?.gitOpsClusters as unknown as string) === RUNTIME_INPUT_VALUE) {
      setIsGitopsClusterRuntime(true)
    }
  }, [inputSetData?.template?.environment?.gitOpsClusters])

  return (
    <>
      {inputSetData?.template?.environmentGroup?.envGroupRef && (
        <Container margin={{ bottom: 'medium' }}>
          <Text font={{ size: 'normal', weight: 'bold' }} color={Color.BLACK} padding={{ bottom: 'medium' }}>
            {getString('common.environmentGroup.label')}
          </Text>
          <DeployEnvironmentGroup
            initialValues={initialValues}
            allowableTypes={allowableTypes}
            path={inputSetData?.path}
            serviceRef={initialValues.service?.serviceRef}
          />
        </Container>
      )}
      {inputSetData?.template?.environment?.environmentRef && (
        <Container margin={{ bottom: 'medium' }}>
          <Text font={{ size: 'normal', weight: 'bold' }} color={Color.BLACK} padding={{ bottom: 'medium' }}>
            {getString('environment')}
          </Text>
          <DeployEnvironment
            initialValues={initialValues}
            allowableTypes={allowableTypes}
            path={inputSetData?.path}
            serviceRef={initialValues.service?.serviceRef}
            gitOpsEnabled={gitOpsEnabled}
            stepViewType={stepViewType}
          />
        </Container>
      )}
      {inputSetData?.template?.environment?.environmentInputs?.variables && (
        <>
          <Text font={{ size: 'normal', weight: 'bold' }} color={Color.BLACK} padding={{ bottom: 'medium' }}>
            {getString('environmentVariables')}
          </Text>
          <div className={css.sectionContent}>
            <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }}>
              <CustomVariableInputSet
                allowableTypes={allowableTypes}
                // TODO: Change after type is created
                initialValues={initialValues.environment?.environmentInputs as any}
                template={inputSetData.template.environment.environmentInputs as any}
                path={`${inputSetData.path}.environmentInputs`}
                className={css.fullWidth}
              />
            </Layout.Horizontal>
          </div>
        </>
      )}

      {inputSetData?.template?.environment?.serviceOverrideInputs?.variables && (
        <>
          <Text font={{ size: 'normal', weight: 'bold' }} color={Color.BLACK} padding={{ bottom: 'medium' }}>
            {getString('common.serviceOverrides')}
          </Text>
          <div className={css.sectionContent}>
            <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }}>
              <CustomVariableInputSet
                allowableTypes={allowableTypes}
                // TODO: Change after type is created
                initialValues={initialValues.environment?.serviceOverrideInputs as any}
                template={inputSetData.template.environment.serviceOverrideInputs as any}
                path={`${inputSetData.path}.serviceOverrideInputs`}
                className={css.fullWidth}
              />
            </Layout.Horizontal>
          </div>
        </>
      )}

      {!gitOpsEnabled &&
        isInfrastructureDefinitionRuntime &&
        inputSetData?.template?.environment?.infrastructureDefinitions && (
          <>
            {initialValues.environment?.environmentRef !== RUNTIME_INPUT_VALUE && (
              <>
                <Text font={{ size: 'normal', weight: 'bold' }} color={Color.BLACK} padding={{ bottom: 'medium' }}>
                  {getString('infrastructureText')}
                </Text>
                <DeployInfrastructures
                  initialValues={initialValues}
                  allowableTypes={allowableTypes}
                  environmentRef={initialValues.environment?.environmentRef}
                  path={inputSetData?.path}
                />
              </>
            )}

            {initialValues.environment?.environmentRef === RUNTIME_INPUT_VALUE &&
              stepViewType !== StepViewType.InputSet &&
              get(formik.values, `${inputSetData?.path}.environmentRef`) && (
                <>
                  <Text font={{ size: 'normal', weight: 'bold' }} color={Color.BLACK} padding={{ bottom: 'medium' }}>
                    {getString('infrastructureText')}
                  </Text>
                  <DeployInfrastructures
                    initialValues={initialValues}
                    allowableTypes={allowableTypes}
                    environmentRef={get(formik.values, `${inputSetData.path}.environmentRef`)}
                    path={inputSetData?.path}
                  />
                </>
              )}
          </>
        )}

      {gitOpsEnabled && isGitopsClusterRuntime && inputSetData?.template?.environment?.gitOpsClusters && (
        <>
          {initialValues.environment?.environmentRef !== RUNTIME_INPUT_VALUE && (
            <>
              <Text font={{ size: 'normal', weight: 'bold' }} color={Color.BLACK} padding={{ bottom: 'medium' }}>
                {getString('common.clusters')}
              </Text>
              <DeployClusters
                allowableTypes={allowableTypes}
                environmentIdentifier={defaultTo(initialValues.environment?.environmentRef, '')}
                path={inputSetData?.path}
              />
            </>
          )}

          {initialValues.environment?.environmentRef === RUNTIME_INPUT_VALUE &&
            get(formik.values, `${inputSetData?.path}.environmentRef`) && (
              <>
                <Text font={{ size: 'normal', weight: 'bold' }} color={Color.BLACK} padding={{ bottom: 'medium' }}>
                  {getString('common.clusters')}
                </Text>
                <DeployClusters
                  allowableTypes={allowableTypes}
                  environmentIdentifier={get(formik.values, `${inputSetData.path}.environmentRef`)}
                  path={inputSetData?.path}
                />
              </>
            )}
        </>
      )}
    </>
  )
}
const DeployInfrastructureInputStep = connect(DeployInfrastructureInputStepInternal)

export default DeployInfrastructureInputStep
