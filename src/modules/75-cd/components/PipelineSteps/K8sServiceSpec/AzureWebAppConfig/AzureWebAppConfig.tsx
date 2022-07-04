/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { defaultTo, get } from 'lodash-es'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import azureWebAppConfigBaseFactory from '@cd/factory/AzureWebAppConfigFactory/AzureWebAppConfigFactory'
import { useStrings } from 'framework/strings'
import type { GitQueryParams, InputSetPathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import type { StoreConfigWrapper } from 'services/cd-ng'
import { Connectors } from '@connectors/constants'
import { AzureWebAppConfigProps, AzureWebAppConfigType } from '../K8sServiceSpecInterface'
import { isRuntimeMode } from '../K8sServiceSpecHelper'
import css from '../KubernetesManifests/KubernetesManifests.module.scss'

const AzureWebAppConfigInputField = (props: AzureWebAppConfigProps): React.ReactElement | null => {
  const { projectIdentifier, orgIdentifier, accountId, pipelineIdentifier } = useParams<
    PipelineType<InputSetPathProps> & { accountId: string }
  >()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()

  const runtimeMode = isRuntimeMode(props.stepViewType)
  const isAzureWebAppConfigRuntime = runtimeMode && !!get(props.template, props.azureWebAppConfigPath as string, false)

  const azureWebAppConfigSource = azureWebAppConfigBaseFactory.getAzureWebAppConfig(Connectors.GIT)
  const azureWebAppConfigDefaultValue = defaultTo(
    props.azureWebAppConfig,
    props.type === AzureWebAppConfigType.applicationSettings
      ? props.template.applicationSettings
      : props.template.connectionStrings
  ) as StoreConfigWrapper

  if (!azureWebAppConfigSource) {
    return null
  }
  return (
    <div>
      {azureWebAppConfigSource &&
        azureWebAppConfigSource.renderContent({
          ...props,
          isAzureWebAppConfigRuntime,
          projectIdentifier,
          orgIdentifier,
          accountId,
          pipelineIdentifier,
          repoIdentifier,
          branch,
          azureWebAppConfig: azureWebAppConfigDefaultValue
        })}
    </div>
  )
}
export function AzureWebAppConfig(props: AzureWebAppConfigProps): React.ReactElement {
  const { getString } = useStrings()

  const heading =
    props.type === AzureWebAppConfigType.applicationSettings
      ? getString('pipeline.appServiceConfig.applicationSettings.name')
      : getString('pipeline.appServiceConfig.connectionStrings.name')
  return (
    <div
      className={cx(css.nopadLeft, css.accordionSummary)}
      id={`Stage.${props.stageIdentifier}.Service.AzureWebAppConfig`}
    >
      {!props.fromTrigger && <div className={css.subheading}>{heading}</div>}
      <AzureWebAppConfigInputField
        {...props}
        azureWebAppConfig={props.azureWebAppConfig}
        azureWebAppConfigPath={props.type}
        key={props.type}
        type={props.type}
      />
    </div>
  )
}
