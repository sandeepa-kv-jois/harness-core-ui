/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { Layout, shouldShowError, useToaster } from '@harness/uicore'

import { useParams } from 'react-router-dom'
import { defaultTo, get, isEmpty } from 'lodash-es'
import { useGetConnectorListV2, PageConnectorResponse, ServiceDefinition } from 'services/cd-ng'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'

import type { PipelineType } from '@common/interfaces/RouteInterfaces'
import { getIdentifierFromValue, getScopeFromValue } from '@common/components/EntityReference/EntityReference'
import { isServerlessDeploymentType } from '@pipeline/utils/stageHelpers'

import type { Scope } from '@common/interfaces/SecretsInterface'
import type { DeploymentStageElementConfig } from '@pipeline/utils/pipelineTypes'
import { useDeepCompareEffect } from '@common/hooks'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { useCache } from '@common/hooks/useCache'
import type { ManifestSelectionProps } from './ManifestInterface'
import ManifestListView from './ManifestListView/ManifestListView'
import { getConnectorPath } from './ManifestWizardSteps/ManifestUtils'
import ReleaseRepoListView from './GitOps/ReleaseRepoListView/ReleaseRepoListView'
import type { ReleaseRepoPipeline } from './Manifesthelper'

export default function ManifestSelection({
  isPropagating,
  deploymentType,
  isReadonlyServiceMode,
  readonly
}: ManifestSelectionProps): JSX.Element | null {
  const {
    state: {
      pipeline,
      selectionState: { selectedStageId }
    },
    getStageFromPipeline,
    updateStage,
    allowableTypes
  } = usePipelineContext()

  const { stage } = getStageFromPipeline<DeploymentStageElementConfig>(selectedStageId || '')
  const [fetchedConnectorResponse, setFetchedConnectorResponse] = React.useState<PageConnectorResponse | undefined>()
  const { showError } = useToaster()
  const { getRBACErrorMessage } = useRBACError()
  const getServiceCacheId = `${pipeline.identifier}-${selectedStageId}-service`
  const { getCache } = useCache([getServiceCacheId])
  const serviceInfo = getCache<ServiceDefinition>(getServiceCacheId)

  const { accountId, orgIdentifier, projectIdentifier } = useParams<
    PipelineType<{
      orgIdentifier: string
      projectIdentifier: string
      accountId: string
    }>
  >()
  const defaultQueryParams = {
    pageIndex: 0,
    pageSize: 10,
    searchTerm: '',
    accountIdentifier: accountId,
    orgIdentifier,
    projectIdentifier,
    includeAllConnectorsAvailableAtScope: true
  }
  const { mutate: fetchConnectors } = useGetConnectorListV2({
    queryParams: defaultQueryParams
  })

  const listOfManifests = useMemo(() => {
    /* istanbul ignore next */
    /* istanbul ignore else */
    if (isReadonlyServiceMode && !isEmpty(serviceInfo)) {
      return defaultTo(serviceInfo?.spec.manifests, [])
    }
    if (isPropagating) {
      return get(stage, 'stage.spec.serviceConfig.stageOverrides.manifests', [])
    }

    return get(stage, 'stage.spec.serviceConfig.serviceDefinition.spec.manifests', [])
  }, [isReadonlyServiceMode, serviceInfo, isPropagating, stage])

  useDeepCompareEffect(() => {
    refetchConnectorList()
  }, [listOfManifests])

  const isGitOpsEnabled = useMemo(() => {
    if (isReadonlyServiceMode) {
      return get(stage, 'stage.spec.gitOpsEnabled', false)
    } else {
      return (pipeline as ReleaseRepoPipeline).gitOpsEnabled
    }
  }, [isReadonlyServiceMode, pipeline, stage])

  const getConnectorList = (): Array<{ scope: Scope; identifier: string }> => {
    return defaultTo(listOfManifests, []).length
      ? listOfManifests.map((data: any) => ({
          scope: getScopeFromValue(
            getConnectorPath(get(data, 'manifest.spec.store.type', ''), get(data, 'manifest', null))
          ),
          identifier: getIdentifierFromValue(
            getConnectorPath(get(data, 'manifest.spec.store.type', ''), get(data, 'manifest', null))
          )
        }))
      : []
  }

  const refetchConnectorList = async (): Promise<void> => {
    try {
      const connectorList = getConnectorList()
      const connectorIdentifiers = connectorList.map((item: { scope: string; identifier: string }) => item.identifier)
      const response = await fetchConnectors({ filterType: 'Connector', connectorIdentifiers })
      /* istanbul ignore else */
      if (get(response, 'data', null)) {
        const { data: connectorResponse } = response
        setFetchedConnectorResponse(connectorResponse)
      }
    } catch (e) {
      /* istanbul ignore else */
      if (shouldShowError(e)) {
        showError(getRBACErrorMessage(e))
      }
    }
  }

  const manifestListViewCommonProps = {
    isPropagating,
    stage,
    updateStage,
    connectors: fetchedConnectorResponse,
    refetchConnectors: refetchConnectorList,
    isReadonly: readonly,
    deploymentType,
    listOfManifests,
    allowableTypes
  }
  return (
    <Layout.Vertical>
      {!isGitOpsEnabled ? (
        <ManifestListView
          {...manifestListViewCommonProps}
          pipeline={pipeline}
          allowOnlyOne={isServerlessDeploymentType(deploymentType)}
        />
      ) : (
        <ReleaseRepoListView {...manifestListViewCommonProps} allowOnlyOne={true} />
      )}
    </Layout.Vertical>
  )
}
