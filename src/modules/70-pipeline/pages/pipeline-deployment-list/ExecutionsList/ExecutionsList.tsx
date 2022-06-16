/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { matchPath, useLocation, useParams } from 'react-router-dom'
import type { PipelineExecutionSummary } from 'services/pipeline-ng'

import ExecutionCard from '@pipeline/components/ExecutionCard/ExecutionCard'
import { NavigatedToPage } from '@common/constants/TrackingConstants'
import { useTelemetry } from '@common/hooks/useTelemetry'
import routes from '@common/RouteDefinitions'
import type { PipelineType } from '@common/interfaces/RouteInterfaces'
import css from './ExecutionList.module.scss'

export interface ExecutionsListProps {
  pipelineExecutionSummary: PipelineExecutionSummary[] | undefined
  isPipelineInvalid?: boolean
  onViewCompiledYaml: (pipelineExecutionSummary: PipelineExecutionSummary) => void
}

function ExecutionsList({
  pipelineExecutionSummary,
  isPipelineInvalid,
  onViewCompiledYaml
}: ExecutionsListProps): React.ReactElement {
  const { trackEvent } = useTelemetry()
  const location = useLocation()
  const { orgIdentifier, projectIdentifier, accountId, module } = useParams<
    PipelineType<{
      orgIdentifier: string
      projectIdentifier: string
      pipelineIdentifier: string
      accountId: string
    }>
  >()

  const isDeploymentsPage = !!matchPath(location.pathname, {
    path: routes.toDeployments({ projectIdentifier, orgIdentifier, accountId, module })
  })

  React.useEffect(() => {
    if (isDeploymentsPage) {
      trackEvent(NavigatedToPage.DeploymentsPage, {})
    }
  }, [])

  return (
    <div className={css.main}>
      {pipelineExecutionSummary?.map(pipelineExecution => (
        <ExecutionCard
          pipelineExecution={pipelineExecution}
          key={pipelineExecution.planExecutionId}
          isPipelineInvalid={isPipelineInvalid}
          showGitDetails={isDeploymentsPage}
          onViewCompiledYaml={() => onViewCompiledYaml(pipelineExecution)}
        />
      ))}
    </div>
  )
}

export default React.memo(ExecutionsList, (prevProps, nextProps) => {
  return prevProps.pipelineExecutionSummary?.length === nextProps.pipelineExecutionSummary?.length
})
