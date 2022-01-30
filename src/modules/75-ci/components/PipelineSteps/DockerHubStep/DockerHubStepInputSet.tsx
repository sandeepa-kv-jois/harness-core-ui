/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { connect } from 'formik'
import { Text, getMultiTypeFromValue, MultiTypeInputType, FormikForm } from '@wings-software/uicore'
import { isEmpty } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import MultiTypeListInputSet from '@common/components/MultiTypeListInputSet/MultiTypeListInputSet'
import { MultiTypeTextField } from '@common/components/MultiTypeText/MultiTypeText'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import StepCommonFieldsInputSet from '@pipeline/components/StepCommonFields/StepCommonFieldsInputSet'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import type { DockerHubStepProps } from './DockerHubStep'
import { shouldRenderRunTimeInputView } from '../CIStep/StepUtils'
import { ArtifactoryInputSetCommonField } from '../CIStep/ArtifactoryInputSetCommonField'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const DockerHubStepInputSetBasic: React.FC<DockerHubStepProps> = ({
  template,
  path,
  readonly,
  allowableTypes,
  stepViewType,
  formik
}) => {
  const { getString } = useStrings()

  const { expressions } = useVariablesExpression()

  const { accountId, projectIdentifier, orgIdentifier, repoIdentifier, branch } = useParams<
    {
      projectIdentifier: string
      orgIdentifier: string
      accountId: string
    } & GitQueryParams
  >()

  return (
    <FormikForm className={css.removeBpPopoverWrapperTopMargin} style={{ width: '50%' }}>
      {getMultiTypeFromValue(template?.spec?.connectorRef) === MultiTypeInputType.RUNTIME && (
        <FormMultiTypeConnectorField
          label={
            <Text
              style={{ display: 'flex', alignItems: 'center' }}
              tooltipProps={{ dataTooltipId: 'dockerHubConnector' }}
            >
              {getString('pipelineSteps.dockerHubConnectorLabel')}
            </Text>
          }
          type={'DockerRegistry'}
          setRefValue
          accountIdentifier={accountId}
          projectIdentifier={projectIdentifier}
          orgIdentifier={orgIdentifier}
          width={stepViewType === StepViewType.DeploymentForm ? 391 : 455}
          gitScope={{ branch, repo: repoIdentifier || '', getDefaultFromOtherRepo: true }}
          name={`${isEmpty(path) ? '' : `${path}.`}spec.connectorRef`}
          placeholder={getString('select')}
          multiTypeProps={{
            expressions,
            disabled: readonly,
            allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED]
          }}
        />
      )}
      {getMultiTypeFromValue(template?.spec?.repo) === MultiTypeInputType.RUNTIME && (
        <MultiTypeTextField
          className={css.removeBpLabelMargin}
          name={`${isEmpty(path) ? '' : `${path}.`}spec.repo`}
          label={
            <Text
              style={{ display: 'flex', alignItems: 'center' }}
              tooltipProps={{ dataTooltipId: 'dockerHubRepository' }}
            >
              {getString('dockerRegistry')}
            </Text>
          }
          multiTextInputProps={{
            disabled: readonly,
            multiTextInputProps: {
              expressions,
              allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED]
            }
          }}
          style={{ marginBottom: 'var(--spacing-small)' }}
        />
      )}
      {shouldRenderRunTimeInputView(template?.spec?.tags) && (
        <MultiTypeListInputSet
          name={`${isEmpty(path) ? '' : `${path}.`}spec.tags`}
          multiTextInputProps={{
            allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED],
            expressions
          }}
          multiTypeFieldSelectorProps={{
            label: (
              <Text style={{ display: 'flex', alignItems: 'center' }} tooltipProps={{ dataTooltipId: 'tags' }}>
                {getString('tagsLabel')}
              </Text>
            ),
            allowedTypes: [MultiTypeInputType.FIXED]
          }}
          disabled={readonly}
          style={{ marginBottom: 'var(--spacing-small)' }}
        />
      )}
      <ArtifactoryInputSetCommonField template={template} path={path} readonly={readonly} formik={formik} />
      {getMultiTypeFromValue(template?.spec?.remoteCacheRepo) === MultiTypeInputType.RUNTIME && (
        <MultiTypeTextField
          className={css.removeBpLabelMargin}
          name={`${isEmpty(path) ? '' : `${path}.`}spec.remoteCacheRepo`}
          label={
            <Text
              style={{ display: 'flex', alignItems: 'center' }}
              tooltipProps={{ dataTooltipId: 'dockerHubRemoteCache' }}
            >
              {getString('ci.remoteCacheRepository.label')}
            </Text>
          }
          multiTextInputProps={{
            disabled: readonly,
            multiTextInputProps: {
              expressions,
              allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED]
            }
          }}
          style={{ marginBottom: 'var(--spacing-small)' }}
        />
      )}
      <StepCommonFieldsInputSet
        path={path}
        readonly={readonly}
        template={template}
        allowableTypes={allowableTypes}
        stepViewType={stepViewType}
      />
    </FormikForm>
  )
}

const DockerHubStepInputSet = connect(DockerHubStepInputSetBasic)
export { DockerHubStepInputSet }
